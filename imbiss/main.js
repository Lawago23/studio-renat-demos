/**
 * EINFACH STARCK – DER IMBISS (BERLIN-WEDDING)
 * Main JavaScript Controller
 * - Demo notice bar toggle
 * - Responsive navigation
 * - Live opening hours status calculator (Berlin time)
 * - Mittagstisch der Woche (Auto-selects current day Mo–Fr)
 * - Kinetic typography scroll parallax (requestAnimationFrame)
 * - "Die Wurst" interactive SVG slicing animation
 * - Office catering form with in-page confirmation
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. TOP DEMO NOTICE BAR
  // =========================================================================
  const demoBar = document.getElementById('demoBar');
  const closeDemoBar = document.getElementById('closeDemoBar');

  if (sessionStorage.getItem('starck_demo_closed') === 'true' && demoBar) {
    demoBar.classList.add('is-hidden');
  }

  if (closeDemoBar && demoBar) {
    closeDemoBar.addEventListener('click', () => {
      demoBar.classList.add('is-hidden');
      sessionStorage.setItem('starck_demo_closed', 'true');
    });
  }

  // =========================================================================
  // 2. MOBILE NAVIGATION & ACTIVE LINK TRACKING
  // =========================================================================
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('is-open')) {
          mainNav.classList.remove('is-open');
          menuToggle.classList.remove('is-active');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Active section observer
  const observedSections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && observedSections.length > 0) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { threshold: 0.35 });

    observedSections.forEach(section => navObserver.observe(section));
  }

  // =========================================================================
  // 3. LIVE OPENING HOURS STATUS (BERLIN LOCAL TIME)
  // Mo-Fr: 11:00 - 21:00 | Sa: 12:00 - 20:00 | So: Ruhetag
  // =========================================================================
  function updateLiveStatus() {
    const now = new Date();
    // Get Berlin local day and hours (CET/CEST)
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    let dayShort = '';
    let hour = 0;
    let minute = 0;

    parts.forEach(p => {
      if (p.type === 'weekday') dayShort = p.value.toLowerCase();
      if (p.type === 'hour') hour = parseInt(p.value, 10);
      if (p.type === 'minute') minute = parseInt(p.value, 10);
    });

    const currentMinutes = hour * 60 + minute;
    let isOpen = false;
    let statusText = 'Derzeit geschlossen';

    // Day check:
    // Mo - Fr (Mo, Di, Mi, Do, Fr) -> 11:00 (660) to 21:00 (1260)
    // Sa -> 12:00 (720) to 20:00 (1200)
    // So -> closed
    if (['mo', 'di', 'mi', 'do', 'fr'].some(d => dayShort.startsWith(d))) {
      if (currentMinutes >= 660 && currentMinutes < 1260) {
        isOpen = true;
        statusText = 'Jetzt geöffnet · Bis 21:00 Uhr';
      } else if (currentMinutes < 660) {
        statusText = 'Geschlossen · Öffnet um 11:00 Uhr';
      } else {
        statusText = 'Geschlossen · Grill ruht bis morgen';
      }
    } else if (dayShort.startsWith('sa')) {
      if (currentMinutes >= 720 && currentMinutes < 1200) {
        isOpen = true;
        statusText = 'Jetzt geöffnet · Bis 20:00 Uhr';
      } else if (currentMinutes < 720) {
        statusText = 'Geschlossen · Öffnet um 12:00 Uhr';
      } else {
        statusText = 'Geschlossen · Grill ruht bis Montag';
      }
    } else {
      // Sunday
      statusText = 'Sonntag Ruhetag · Öffnet Mo 11:00 Uhr';
    }

    const badgeHeader = document.getElementById('liveStatusBadge');
    const textHeader = document.getElementById('liveStatusText');
    const badgeContact = document.getElementById('liveStatusBadgeContact');
    const textContact = document.getElementById('liveStatusTextContact');

    [badgeHeader, badgeContact].forEach(badge => {
      if (!badge) return;
      badge.classList.remove('is-open', 'is-closed');
      badge.classList.add(isOpen ? 'is-open' : 'is-closed');
    });

    if (textHeader) textHeader.textContent = statusText;
    if (textContact) textContact.textContent = statusText;
  }

  updateLiveStatus();
  setInterval(updateLiveStatus, 60000);

  // =========================================================================
  // 4. MITTAGSTISCH DER WOCHE: MO–FR TABS WITH TODAY AUTO-SELECTED
  // =========================================================================
  const tabButtons = document.querySelectorAll('.mittag-tab-btn');
  const panels = document.querySelectorAll('.mittag-panel');
  const weekendNotice = document.getElementById('weekendNotice');

  // Day of week: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  const currentDayOfWeek = new Date().getDay();
  let targetDay = currentDayOfWeek;

  // If weekend (Saturday 6 or Sunday 0), show Monday and display weekend notification
  if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
    targetDay = 1; // Default to Monday
    if (weekendNotice) weekendNotice.classList.add('is-visible');
  }

  function activateDayTab(dayNum, isAutoToday = false) {
    const dayMap = { 1: 'mo', 2: 'di', 3: 'mi', 4: 'do', 5: 'fr' };
    const dayKey = dayMap[dayNum] || 'mo';

    tabButtons.forEach(btn => {
      const btnDay = parseInt(btn.getAttribute('data-day'), 10);
      const isSelected = btnDay === dayNum;
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-selected', String(isSelected));
    });

    panels.forEach(panel => {
      const isTarget = panel.getAttribute('id') === `panel-${dayKey}`;
      panel.classList.toggle('is-active', isTarget);
    });
  }

  // Mark actual today with "HEUTE" chip
  if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
    const todayBtn = document.querySelector(`.mittag-tab-btn[data-day="${currentDayOfWeek}"]`);
    if (todayBtn) {
      const chip = document.createElement('span');
      chip.className = 'today-chip';
      chip.textContent = 'Heute';
      todayBtn.appendChild(chip);
    }
  }

  // Activate today's tab initially
  activateDayTab(targetDay, true);

  // Tab click events
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosenDay = parseInt(btn.getAttribute('data-day'), 10);
      activateDayTab(chosenDay);
    });
  });

  // =========================================================================
  // 5. KINETIC TYPOGRAPHY SECTION (SCROLL VELOCITY + AMBIENT MOVEMENT)
  // =========================================================================
  const kineticSection = document.getElementById('kinetic');
  const strip1 = document.getElementById('kineticStrip1');
  const strip2 = document.getElementById('kineticStrip2');
  const strip3 = document.getElementById('kineticStrip3');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && kineticSection && strip1 && strip2 && strip3) {
    let ticking = false;

    function onScrollKinetic() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = kineticSection.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Only calculate when section is in or near viewport
          if (rect.top < windowHeight && rect.bottom > 0) {
            const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
            // Translate values in pixels
            const shift1 = (scrollProgress - 0.5) * -380;
            const shift2 = (scrollProgress - 0.5) * 440;
            const shift3 = (scrollProgress - 0.5) * -260;

            strip1.style.transform = `translate3d(${shift1}px, 0, 0)`;
            strip2.style.transform = `translate3d(${shift2}px, 0, 0)`;
            strip3.style.transform = `translate3d(${shift3}px, 0, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScrollKinetic, { passive: true });
    onScrollKinetic(); // Initial positioning
  }

  // =========================================================================
  // 6. "DIE WURST" - SVG SLICING ANIMATION & INTERACTIVE SCHÄRFE-CONTROL
  // =========================================================================
  const wurstStage = document.getElementById('wurstStage');
  const btnSliceWurst = document.getElementById('btnSliceWurst');
  const btnResetWurst = document.getElementById('btnResetWurst');
  const wurstStatusNote = document.getElementById('wurstStatusNote');
  const spiceButtons = document.querySelectorAll('.spice-btn');
  const spiceLabel = document.getElementById('spiceLabel');
  const saucePath = document.getElementById('saucePath');

  let isSliced = false;

  function sliceWurst() {
    if (!wurstStage || isSliced) return;

    // Phase 1: Knife descends
    wurstStage.classList.add('cutting');
    if (wurstStatusNote) {
      wurstStatusNote.textContent = 'Schnitt wird ausgeführt... 6 gleichmäßige Segmente!';
    }

    // Play subtle audio click using Web Audio API if allowed
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // Audio autoplay restrictions or not supported
    }

    setTimeout(() => {
      // Phase 2: Sliced state with stroke path reveal and segment separation
      wurstStage.classList.remove('cutting');
      wurstStage.classList.add('is-sliced');
      isSliced = true;
      if (wurstStatusNote) {
        wurstStatusNote.textContent = 'Perfekt portioniert! Drei-Pfeffer-Sauce & Currypulver frisch aufgetragen.';
      }
    }, 450);
  }

  function resetWurst() {
    if (!wurstStage) return;
    wurstStage.classList.remove('cutting', 'is-sliced');
    isSliced = false;
    if (wurstStatusNote) {
      wurstStatusNote.textContent = 'Klicke auf "Wurst schneiden", um den Berliner Präzisionsschnitt auszulösen.';
    }
  }

  if (btnSliceWurst) btnSliceWurst.addEventListener('click', sliceWurst);
  if (btnResetWurst) btnResetWurst.addEventListener('click', resetWurst);

  // Auto-trigger slicing once when scrolled into view
  if ('IntersectionObserver' in window && wurstStage) {
    let triggeredOnce = false;
    const wurstObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggeredOnce && !isSliced) {
          triggeredOnce = true;
          setTimeout(sliceWurst, 500);
        }
      });
    }, { threshold: 0.5 });

    wurstObserver.observe(wurstStage);
  }

  // Spiciness level selector
  spiceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      spiceButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const level = btn.getAttribute('data-level');
      const title = btn.getAttribute('data-title');
      if (spiceLabel) spiceLabel.textContent = title;

      // Adjust sauce color intensity
      if (saucePath) {
        if (level === '1') {
          saucePath.style.filter = 'saturate(0.9) brightness(1.1)';
        } else if (level === '2') {
          saucePath.style.filter = 'none';
        } else if (level === '3') {
          saucePath.style.filter = 'hue-rotate(-15deg) saturate(1.4) brightness(0.9)';
        }
      }

      // If already sliced, trigger a nice re-slice or feedback
      if (!isSliced) {
        sliceWurst();
      }
    });
  });

  // =========================================================================
  // 7. CATERING FOR OFFICES FORM (IN-PAGE CONFIRMATION)
  // =========================================================================
  const cateringForm = document.getElementById('cateringForm');
  const cateringConfirmation = document.getElementById('cateringConfirmation');
  const confSummaryDetails = document.getElementById('confSummaryDetails');
  const btnResetForm = document.getElementById('btnResetForm');
  const catDate = document.getElementById('catDate');

  // Set default min date to today
  if (catDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    catDate.min = todayStr;
    catDate.value = todayStr;
  }

  if (cateringForm && cateringConfirmation && confSummaryDetails) {
    cateringForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple validation check
      if (!cateringForm.checkValidity()) {
        cateringForm.reportValidity();
        return;
      }

      const formData = new FormData(cateringForm);
      const name = formData.get('name') || '';
      const company = formData.get('company') || 'Keine Angabe';
      const phone = formData.get('phone') || '';
      const email = formData.get('email') || '';
      const address = formData.get('address') || '';
      const date = formData.get('date') || '';
      const time = formData.get('time') || '';
      const persons = formData.get('persons') || '';
      const selectedPackage = formData.get('package') || '';
      const notes = formData.get('notes') || 'Keine';

      // Format date for German display
      let formattedDate = date;
      try {
        const [year, month, day] = date.split('-');
        formattedDate = `${day}.${month}.${year}`;
      } catch (err) {
        formattedDate = date;
      }

      confSummaryDetails.innerHTML = `
        <div style="display: grid; grid-template-columns: 140px 1fr; gap: 0.4rem; margin-bottom: 0.5rem;">
          <strong>Besteller:</strong> <span>${name} (${company})</span>
          <strong>Lieferung an:</strong> <span>${address}</span>
          <strong>Datum & Zeit:</strong> <span>${formattedDate} um ${time} Uhr</span>
          <strong>Team-Größe:</strong> <span>${persons}</span>
          <strong>Paket:</strong> <span>${selectedPackage}</span>
          <strong>Kontakt:</strong> <span>${phone} · ${email}</span>
          <strong>Notizen:</strong> <span>${notes}</span>
        </div>
      `;

      // In-page transition
      cateringForm.style.display = 'none';
      cateringConfirmation.classList.add('is-active');

      // Scroll to confirmation
      cateringConfirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    if (btnResetForm) {
      btnResetForm.addEventListener('click', () => {
        cateringForm.reset();
        cateringConfirmation.classList.remove('is-active');
        cateringForm.style.display = 'flex';
        cateringForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

});
