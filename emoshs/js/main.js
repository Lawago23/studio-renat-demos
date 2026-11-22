/**
 * Emosh's Late-Night Pizza & Döner - Main Application Script
 * Berlin-Friedrichshain · Warschauer Str. 42
 */
(function () {
  'use strict';

  // --- 1. Top Announcement Bar ---
  var demoBar = document.getElementById('demo-announcement-bar');
  var closeDemoBarBtn = document.getElementById('close-demo-bar');
  if (demoBar && closeDemoBarBtn) {
    if (sessionStorage.getItem('emoshs_demo_bar_closed') === 'true') {
      demoBar.style.display = 'none';
    }
    closeDemoBarBtn.addEventListener('click', function () {
      demoBar.style.display = 'none';
      sessionStorage.setItem('emoshs_demo_bar_closed', 'true');
    });
  }

  // --- 2. Mobile Navigation Toggle ---
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');
  var header = document.getElementById('site-header');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active', !isExpanded);
      mainNav.classList.toggle('open', !isExpanded);
      document.body.classList.toggle('nav-open', !isExpanded);
    });

    // Close menu when clicking nav links
    var navLinks = mainNav.querySelectorAll('a[href^="#"]');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
        mainNav.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  // Header background on scroll
  window.addEventListener('scroll', function () {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // --- 3. "Nach Mitternacht" Countdown & Berlin Time Engine ---
  var simulatedTime = null; // null for live Berlin time, or Date object for simulation

  function getBerlinDate() {
    if (simulatedTime) {
      return new Date(simulatedTime.getTime());
    }
    // Get live Europe/Berlin time accurately
    var now = new Date();
    try {
      var berlinString = now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
      return new Date(berlinString);
    } catch (e) {
      return now;
    }
  }

  var clockHoursEl = document.getElementById('clock-hours');
  var clockMinsEl = document.getElementById('clock-mins');
  var clockSecsEl = document.getElementById('clock-secs');
  var clockStatusPill = document.getElementById('clock-status-pill');
  var clockHeadlineEl = document.getElementById('clock-headline');
  var clockSublineEl = document.getElementById('clock-subline');
  var clockRingEl = document.getElementById('clock-progress-ring');
  var phaseBadgeEl = document.getElementById('night-phase-badge');

  function updateLateNightClock() {
    var now = getBerlinDate();
    var day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var totalMins = hours * 60 + minutes;

    // Opening Hours:
    // Regular days (Sun-Thu nights): 18:00 to 05:00 next day
    // Weekend (Fri-Sat nights): 18:00 to 06:00 next day
    // Overnight definition:
    // If hours < 5 (or 6 on Sat/Sun morning), we belong to yesterday's night shift!
    var isWeekendMorning = (day === 6 || day === 0); // Saturday morning or Sunday morning
    var closingHour = isWeekendMorning ? 6 : 5;
    var closingMins = closingHour * 60;
    var openingHour = 18;
    var openingMins = openingHour * 60;

    var isOpen = false;
    var diffMs = 0;
    var shiftProgress = 0;
    var phaseName = '';

    if (totalMins >= openingMins) {
      // It is evening (between 18:00 and 23:59)
      isOpen = true;
      var remainingToday = (24 * 60 - totalMins) * 60 - seconds;
      var remainingTomorrow = closingHour * 3600;
      diffMs = (remainingToday + remainingTomorrow) * 1000;

      var totalShiftMinutes = (24 - openingHour + closingHour) * 60;
      var elapsedShiftMinutes = totalMins - openingMins;
      shiftProgress = Math.min(1, Math.max(0, elapsedShiftMinutes / totalShiftMinutes));

      if (hours < 22) {
        phaseName = 'Warmup & Abendhunger (18:00 – 22:00)';
      } else {
        phaseName = 'Bar Rush & Kiez-Energie (22:00 – 02:00)';
      }
    } else if (totalMins < closingMins) {
      // It is early morning after midnight (between 00:00 and 05:00 / 06:00)
      isOpen = true;
      var remainingSeconds = (closingMins - totalMins) * 60 - seconds;
      diffMs = Math.max(0, remainingSeconds * 1000);

      var prevOpeningHour = 18;
      var totalShiftMinutes = (24 - prevOpeningHour + closingHour) * 60;
      var elapsedShiftMinutes = (24 - prevOpeningHour) * 60 + totalMins;
      shiftProgress = Math.min(1, Math.max(0, elapsedShiftMinutes / totalShiftMinutes));

      if (hours < 2) {
        phaseName = 'Bar Rush & Kiez-Energie (22:00 – 02:00)';
      } else if (hours < 4 || (hours === 4 && minutes < 30)) {
        phaseName = 'High Peak · Club Exit & Hunger (02:00 – 04:30)';
      } else {
        phaseName = 'Last Call · Die letzten Slices der Nacht (04:30 – 05:00)';
      }
    } else {
      // Daytime: between 05:00/06:00 and 18:00 (Closed)
      isOpen = false;
      var secsUntilOpen = (openingMins - totalMins) * 60 - seconds;
      diffMs = Math.max(0, secsUntilOpen * 1000);
      phaseName = 'Vorbereitung · Frische Zutaten & Teigruhe';
      shiftProgress = 0;
    }

    // Format remaining time
    var remSecsTotal = Math.floor(diffMs / 1000);
    var h = Math.floor(remSecsTotal / 3600);
    var m = Math.floor((remSecsTotal % 3600) / 60);
    var s = remSecsTotal % 60;

    var hStr = (h < 10 ? '0' : '') + h;
    var mStr = (m < 10 ? '0' : '') + m;
    var sStr = (s < 10 ? '0' : '') + s;

    if (clockHoursEl) clockHoursEl.textContent = hStr;
    if (clockMinsEl) clockMinsEl.textContent = mStr;
    if (clockSecsEl) clockSecsEl.textContent = sStr;

    if (clockStatusPill) {
      if (isOpen) {
        clockStatusPill.textContent = 'JETZT GEÖFFNET BIS 0' + closingHour + ':00 UHR';
        clockStatusPill.className = 'status-pill open';
      } else {
        clockStatusPill.textContent = 'AKTUELL GESCHLOSSEN · ÖFFNET UM 18:00 UHR';
        clockStatusPill.className = 'status-pill closed';
      }
    }

    if (clockHeadlineEl) {
      if (isOpen) {
        clockHeadlineEl.textContent = 'Noch ' + hStr + ' Std : ' + mStr + ' Min geöffnet';
      } else {
        clockHeadlineEl.textContent = 'Noch ' + hStr + ' Std : ' + mStr + ' Min bis zum Ofenstart';
      }
    }

    if (clockSublineEl) {
      var liveTimeFmt = (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ' Uhr';
      if (isOpen) {
        clockSublineEl.textContent = 'Berlin-Zeit: ' + liveTimeFmt + ' · Heiße Pizza & Kalb-Döner direkt an der Warschauer Brücke.';
      } else {
        clockSublineEl.textContent = 'Berlin-Zeit: ' + liveTimeFmt + ' · Der Teig geht, die Spieße werden frisch geschichtet. Ab 18:00 Uhr heiß.';
      }
    }

    if (phaseBadgeEl) {
      phaseBadgeEl.textContent = phaseName;
    }

    if (clockRingEl) {
      var circumference = 2 * Math.PI * 46; // r=46
      var offset = circumference * (1 - shiftProgress);
      clockRingEl.style.strokeDashoffset = offset;
    }
  }

  setInterval(updateLateNightClock, 1000);
  updateLateNightClock();

  // Time Simulator Controls
  var simButtons = document.querySelectorAll('.time-sim-btn');
  simButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      simButtons.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      var targetHour = this.getAttribute('data-hour');
      if (targetHour === 'live') {
        simulatedTime = null;
      } else {
        var d = new Date();
        var parts = targetHour.split(':');
        d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
        simulatedTime = d;
      }
      updateLateNightClock();
    });
  });

  // --- 4. Menu Horizontal Scroll-Snap & Category Filter ---
  var menuTrack = document.getElementById('menu-cards-track');
  var prevMenuBtn = document.getElementById('menu-prev-btn');
  var nextMenuBtn = document.getElementById('menu-next-btn');
  var trackPrevBtn = document.getElementById('menu-track-prev-btn');
  var trackNextBtn = document.getElementById('menu-track-next-btn');
  var fadeRight = document.getElementById('menu-track-fade-right');
  var fadeLeft = document.getElementById('menu-track-fade-left');
  var menuProgressBar = document.getElementById('menu-progress-bar');
  var filterChips = document.querySelectorAll('.menu-filter-chip');
  var menuCards = document.querySelectorAll('.menu-card');

  if (menuTrack) {
    function getCardStep() {
      for (var i = 0; i < menuCards.length; i++) {
        if (menuCards[i].style.display !== 'none' && menuCards[i].offsetWidth > 0) {
          return menuCards[i].offsetWidth + 24;
        }
      }
      return 360;
    }

    function updateMenuIndicators() {
      var maxScroll = menuTrack.scrollWidth - menuTrack.clientWidth;
      if (menuProgressBar) {
        if (maxScroll > 0) {
          var pct = (menuTrack.scrollLeft / maxScroll) * 100;
          menuProgressBar.style.width = Math.min(100, Math.max(5, pct)) + '%';
        } else {
          menuProgressBar.style.width = '100%';
        }
      }

      // Edge fade hint: show right fade when more cards exist to the right
      if (fadeRight) {
        fadeRight.style.opacity = (maxScroll > 12 && menuTrack.scrollLeft < maxScroll - 16) ? '1' : '0';
      }
      // Edge fade hint: show left fade when user scrolled right
      if (fadeLeft) {
        fadeLeft.style.opacity = (menuTrack.scrollLeft > 16) ? '1' : '0';
      }
    }

    menuTrack.addEventListener('scroll', updateMenuIndicators, { passive: true });
    window.addEventListener('resize', updateMenuIndicators, { passive: true });
    setTimeout(updateMenuIndicators, 100);

    // Arrow navigation (both top controls and prominent on-track carousel arrows)
    function scrollMenuLeft() {
      menuTrack.scrollBy({ left: -getCardStep(), behavior: 'smooth' });
    }
    function scrollMenuRight() {
      menuTrack.scrollBy({ left: getCardStep(), behavior: 'smooth' });
    }

    if (prevMenuBtn) prevMenuBtn.addEventListener('click', scrollMenuLeft);
    if (nextMenuBtn) nextMenuBtn.addEventListener('click', scrollMenuRight);
    if (trackPrevBtn) trackPrevBtn.addEventListener('click', scrollMenuLeft);
    if (trackNextBtn) trackNextBtn.addEventListener('click', scrollMenuRight);

    // Category filter chips
    filterChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        filterChips.forEach(function (c) { c.classList.remove('active'); });
        this.classList.add('active');

        var cat = this.getAttribute('data-category');
        menuCards.forEach(function (card) {
          var cardCat = card.getAttribute('data-category');
          if (cat === 'all' || cardCat === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });

        // Scroll track back to start
        menuTrack.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(updateMenuIndicators, 80);
      });
    });
  }

  // --- 5. Combo Deals: Perforated Ticket Tear-Off Animation ---
  function playTearSound() {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      var ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var now = ctx.currentTime;

      // Realistic paper rip / click synthesizer
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // Audio not permitted or supported; silent fallback
    }
  }

  var ticketCards = document.querySelectorAll('.deal-ticket');
  ticketCards.forEach(function (ticket) {
    var tearBtn = ticket.querySelector('.ticket-tear-btn');
    var stub = ticket.querySelector('.ticket-stub');
    var codeDisplay = ticket.querySelector('.ticket-code-badge');
    var telegramBtn = ticket.querySelector('.ticket-telegram-btn');
    var dealName = ticket.getAttribute('data-deal-name') || 'Deal';

    function handleTear(e) {
      if (ticket.classList.contains('is-torn')) return;
      e.preventDefault();

      playTearSound();
      ticket.classList.add('is-torn');

      if (tearBtn) {
        tearBtn.textContent = 'Entwertet';
        tearBtn.disabled = true;
      }

      if (codeDisplay) {
        codeDisplay.classList.add('revealed');
      }

      if (telegramBtn) {
        telegramBtn.style.display = 'inline-flex';
      }

      // Spark / flash effect
      var flash = document.createElement('div');
      flash.className = 'ticket-tear-flash';
      ticket.appendChild(flash);
      setTimeout(function () {
        if (flash.parentNode) flash.parentNode.removeChild(flash);
      }, 700);
    }

    if (tearBtn) {
      tearBtn.addEventListener('click', handleTear);
    }
    if (stub) {
      stub.addEventListener('click', function (e) {
        if (!ticket.classList.contains('is-torn')) {
          handleTear(e);
        }
      });
    }

    if (telegramBtn) {
      telegramBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var code = ticket.getAttribute('data-promo-code') || 'EMOSH5AM';
        openOrderModalWithItem(dealName + ' (Promo-Code: ' + code + ')');
      });
    }
  });

  // --- 6. Quick Order & Telegram Integration ---
  var orderModal = document.getElementById('order-modal');
  var orderForm = document.getElementById('quick-order-form');
  var orderItemSelect = document.getElementById('order-item-select');
  var orderTimeSelect = document.getElementById('order-time-select');
  var orderNotesInput = document.getElementById('order-notes-input');
  var orderConfirmModal = document.getElementById('order-confirm-modal');
  var confirmDetailsEl = document.getElementById('confirm-order-details');
  var confirmTelegramBtn = document.getElementById('confirm-telegram-btn');
  var closeOrderModalBtns = document.querySelectorAll('.close-order-modal');

  function openOrderModalWithItem(itemName) {
    if (orderModal) {
      orderModal.classList.add('active');
      document.body.classList.add('modal-open');
    }
    if (orderItemSelect && itemName) {
      // Find matching option or add temporary
      var found = false;
      for (var i = 0; i < orderItemSelect.options.length; i++) {
        if (orderItemSelect.options[i].text.indexOf(itemName) !== -1 || orderItemSelect.options[i].value === itemName) {
          orderItemSelect.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        var opt = document.createElement('option');
        opt.value = itemName;
        opt.textContent = itemName;
        orderItemSelect.appendChild(opt);
        orderItemSelect.value = itemName;
      }
    }
  }

  // Bind all "In den Warenkorb / Bestellen" buttons
  var selectItemBtns = document.querySelectorAll('.card-order-btn');
  selectItemBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var title = this.getAttribute('data-item-title') || 'Speise';
      var price = this.getAttribute('data-item-price') || '';
      openOrderModalWithItem(title + (price ? ' (' + price + ')' : ''));
    });
  });

  var heroOrderBtn = document.getElementById('hero-order-trigger');
  if (heroOrderBtn) {
    heroOrderBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openOrderModalWithItem('');
    });
  }

  var navOrderBtn = document.getElementById('nav-order-trigger');
  if (navOrderBtn) {
    navOrderBtn.addEventListener('click', function (e) {
      e.preventDefault();
      openOrderModalWithItem('');
    });
  }

  // Close Modals
  closeOrderModalBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (orderModal) orderModal.classList.remove('active');
      if (orderConfirmModal) orderConfirmModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  });

  // Handle Order Form Submit
  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('order-name-input').value.trim() || 'Gast';
      var item = orderItemSelect ? orderItemSelect.value : 'Late-Night Menü';
      var time = orderTimeSelect ? orderTimeSelect.value : 'In 15 Minuten';
      var notes = orderNotesInput ? orderNotesInput.value.trim() : '';

      var orderId = 'EM-' + Math.floor(1000 + Math.random() * 9000);

      // In-page confirmation
      if (orderModal) orderModal.classList.remove('active');
      if (orderConfirmModal) {
        orderConfirmModal.classList.add('active');
      }

      var detailsHtml = '<strong>Bestell-ID: #' + orderId + '</strong><br>' +
        'Kunde: ' + name + '<br>' +
        'Gericht: ' + item + '<br>' +
        'Abholzeit: ' + time + '<br>' +
        (notes ? 'Wünsche: ' + notes + '<br>' : '') +
        '<span style="color:var(--neon-cyan);display:inline-block;margin-top:8px;">Abholbereit bei Emosh\'s, Warschauer Str. 42</span>';

      if (confirmDetailsEl) {
        confirmDetailsEl.innerHTML = detailsHtml;
      }

      // Prepare Telegram Link
      var msg = 'Hallo Emosh\'s Team! Bestelle zur Abholung (%23' + orderId + '):%0A' +
        'Name: ' + encodeURIComponent(name) + '%0A' +
        'Auswahl: ' + encodeURIComponent(item) + '%0A' +
        'Abholzeit: ' + encodeURIComponent(time) + '%0A' +
        (notes ? 'Notiz: ' + encodeURIComponent(notes) + '%0A' : '') +
        'Adresse: Warschauer Str. 42, Friedrichshain';

      var telegramUrl = 'https://t.me/rovatt?text=' + msg;
      if (confirmTelegramBtn) {
        confirmTelegramBtn.href = telegramUrl;
      }
    });
  }

  // --- 7. Instagram-Style Photo Wall Lightbox ---
  var photoCards = document.querySelectorAll('.insta-grid-item');
  var photoLightbox = document.getElementById('photo-lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');

  photoCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var img = card.querySelector('img');
      var caption = card.querySelector('.insta-overlay-text');
      if (!img || !photoLightbox) return;

      if (lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
      }
      if (lightboxCaption && caption) {
        lightboxCaption.textContent = caption.textContent;
      }
      photoLightbox.classList.add('active');
      document.body.classList.add('modal-open');
    });
  });

  if (lightboxClose && photoLightbox) {
    lightboxClose.addEventListener('click', function () {
      photoLightbox.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  }

  // --- 8. Legal Modals (Impressum & Datenschutz) ---
  var impressumModal = document.getElementById('impressum-modal');
  var datenschutzModal = document.getElementById('datenschutz-modal');
  var openImpressumBtn = document.getElementById('open-impressum-btn');
  var openDatenschutzBtn = document.getElementById('open-datenschutz-btn');
  var closeLegalBtns = document.querySelectorAll('.close-legal-modal');

  if (openImpressumBtn && impressumModal) {
    openImpressumBtn.addEventListener('click', function (e) {
      e.preventDefault();
      impressumModal.classList.add('active');
      document.body.classList.add('modal-open');
    });
  }

  if (openDatenschutzBtn && datenschutzModal) {
    openDatenschutzBtn.addEventListener('click', function (e) {
      e.preventDefault();
      datenschutzModal.classList.add('active');
      document.body.classList.add('modal-open');
    });
  }

  closeLegalBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (impressumModal) impressumModal.classList.remove('active');
      if (datenschutzModal) datenschutzModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    });
  });

  // Global ESC key to close any active modal
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var activeModals = document.querySelectorAll('.site-modal.active');
      activeModals.forEach(function (m) {
        m.classList.remove('active');
      });
      document.body.classList.remove('modal-open');
    }
  });

  // --- 9. Realistic Neon Random Micro-Flicker ---
  var flickerChars = document.querySelectorAll('.neon-flicker-char');
  if (flickerChars.length > 0) {
    setInterval(function () {
      var randIndex = Math.floor(Math.random() * flickerChars.length);
      var el = flickerChars[randIndex];
      el.classList.add('micro-flicker');
      setTimeout(function () {
        el.classList.remove('micro-flicker');
      }, 120);
    }, 3800);
  }

})();
