/**
 * DÖNER DER SONNE — BERLIN-KREUZBERG (V8)
 * Main Interactive Engine
 * Strictly NO emojis anywhere in copy or code.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // State Management
  const state = {
    cart: [],
    customDoner: {
      bread: { name: 'Klassisches Sesam-Fladenbrot', price: 0.00, img: 'doner_kebab-960.jpg' },
      meat: { name: '100% Kalb-Schichtfleisch (Yaprak)', price: 8.50, key: 'kalb' },
      sauces: ['Hausgemachte Knoblauch-Kräuter', 'Feurige Harissa-Chilisauce'],
      extras: ['Echter Hirtenkäse'],
      totalPrice: 9.50
    },
    activeDistrict: {
      name: 'Kreuzberg 36 & 61',
      zip: '10999, 10967, 10961',
      time: '15–25 Min',
      minOrder: '12,00 €',
      fee: 'Kostenlos ab 20 € (sonst 1,00 €)'
    }
  };

  /* ------------------------------------------------------------------------
     1. TOP NOTICE BAR (Demo Notice Dismissal)
     ------------------------------------------------------------------------ */
  const topNotice = document.getElementById('top-notice-bar');
  const closeNoticeBtn = document.getElementById('close-notice-btn');

  if (topNotice && closeNoticeBtn) {
    if (sessionStorage.getItem('sonne_demo_notice_dismissed') === 'true') {
      topNotice.classList.add('is-hidden');
    }
    closeNoticeBtn.addEventListener('click', () => {
      topNotice.classList.add('is-hidden');
      sessionStorage.setItem('sonne_demo_notice_dismissed', 'true');
    });
  }

  /* ------------------------------------------------------------------------
     2. MOBILE NAVIGATION DRAWER
     ------------------------------------------------------------------------ */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-drawer .nav-link, .main-nav .nav-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. HERO: SCROLL-DRIVEN DÖNER ASSEMBLY
     ------------------------------------------------------------------------ */
  const heroWrapper = document.getElementById('hero');
  const layerBottomBread = document.getElementById('layer-bottom-bread');
  const layerSauce = document.getElementById('layer-sauce');
  const layerMeat = document.getElementById('layer-meat');
  const layerSalad = document.getElementById('layer-salad');
  const layerExtras = document.getElementById('layer-extras');
  const layerTopBread = document.getElementById('layer-top-bread');
  const assemblyGlow = document.getElementById('assembly-glow');
  const stepCardNum = document.getElementById('step-card-num');
  const stepCardName = document.getElementById('step-card-name');
  const stepCardDesc = document.getElementById('step-card-desc');
  const scrollHintFill = document.getElementById('scroll-hint-fill');
  const scrubberPills = document.querySelectorAll('.pill-step-btn');

  const stepsData = [
    { num: '01 / 06', name: 'Steinofen-Fladenbrot', desc: 'Frisch gebacken mit goldbrauner Kruste, Sesam und Schwarzkümmel.' },
    { num: '02 / 06', name: 'Sauce & Tahini-Basis', desc: 'Hausgemachte Knoblauch-Kräuter-Creme und samtiges Sesammus.' },
    { num: '03 / 06', name: '100% Kalb-Schichtfleisch', desc: 'Hauchdünn geschnittenes Scheibenfleisch (kein Hack), kross karamellisiert.' },
    { num: '04 / 06', name: 'Frischer Kiez-Salat', desc: 'Knackiges Rotkraut, Eisbergsalat, Gurken, Strauchtomaten und Sumach-Zwiebeln.' },
    { num: '05 / 06', name: 'Extras & Harissa-Chili', desc: 'Würziger Hirtenkäse, gegrilltes Gemüse und feurige rote Chilisauce.' },
    { num: '06 / 06', name: 'Gerösteter Deckel', desc: 'Heiß vollendet, knusprig und mit aufsteigendem Kräuterdampf serviert.' }
  ];

  function updateAssembly(progress) {
    // Clamp progress between 0 and 1
    const p = Math.max(0, Math.min(1, progress));

    if (scrollHintFill) {
      scrollHintFill.style.width = `${Math.round(p * 100)}%`;
    }

    // Determine current active step (0 to 5)
    let stepIndex = Math.min(5, Math.floor(p * 6));
    if (p >= 0.96) stepIndex = 5;

    if (stepCardNum && stepCardName && stepCardDesc && stepsData[stepIndex]) {
      stepCardNum.textContent = stepsData[stepIndex].num;
      stepCardName.textContent = stepsData[stepIndex].name;
      stepCardDesc.textContent = stepsData[stepIndex].desc;
    }

    // Update scrubber buttons
    scrubberPills.forEach((pill, idx) => {
      pill.classList.toggle('is-active', idx === stepIndex);
    });

    // Animate layers based on progress
    // Layer 1: Bottom bread (always in place, slight settle)
    if (layerBottomBread) {
      const ty = (1 - p) * 30;
      layerBottomBread.style.transform = `translateY(${ty}px) translateZ(0)`;
      layerBottomBread.style.opacity = '1';
    }

    // Layer 2: Sauce (drops in from p: 0.15 to 0.35)
    if (layerSauce) {
      const sauceP = Math.max(0, Math.min(1, (p - 0.12) / 0.22));
      const ty = (1 - sauceP) * -90;
      const op = Math.max(0.15, sauceP);
      layerSauce.style.transform = `translateY(${ty}px) scale(${0.88 + sauceP * 0.12})`;
      layerSauce.style.opacity = `${op}`;
    }

    // Layer 3: Meat (drops in from p: 0.30 to 0.52)
    if (layerMeat) {
      const meatP = Math.max(0, Math.min(1, (p - 0.28) / 0.24));
      const ty = (1 - meatP) * -130;
      const op = Math.max(0.15, meatP);
      layerMeat.style.transform = `translateY(${ty}px) scale(${0.85 + meatP * 0.15})`;
      layerMeat.style.opacity = `${op}`;
    }

    // Layer 4: Salad (drops in from p: 0.48 to 0.70)
    if (layerSalad) {
      const saladP = Math.max(0, Math.min(1, (p - 0.46) / 0.24));
      const ty = (1 - saladP) * -160;
      const op = Math.max(0.15, saladP);
      layerSalad.style.transform = `translateY(${ty}px) scale(${0.82 + saladP * 0.18})`;
      layerSalad.style.opacity = `${op}`;
    }

    // Layer 5: Extras (drops in from p: 0.65 to 0.85)
    if (layerExtras) {
      const extrasP = Math.max(0, Math.min(1, (p - 0.63) / 0.22));
      const ty = (1 - extrasP) * -180;
      const op = Math.max(0.15, extrasP);
      layerExtras.style.transform = `translateY(${ty}px) scale(${0.80 + extrasP * 0.20})`;
      layerExtras.style.opacity = `${op}`;
    }

    // Layer 6: Top bread lid (drops in from p: 0.80 to 0.98)
    if (layerTopBread) {
      const topP = Math.max(0, Math.min(1, (p - 0.78) / 0.20));
      const ty = (1 - topP) * -220;
      const op = Math.max(0.15, topP);
      layerTopBread.style.transform = `translateY(${ty}px) scale(${0.78 + topP * 0.22})`;
      layerTopBread.style.opacity = `${op}`;
    }

    // Glow effect when assembled
    if (assemblyGlow) {
      assemblyGlow.classList.toggle('is-active', p > 0.88);
    }
  }

  // Scroll Listener for Hero Pinning
  function handleHeroScroll() {
    if (!heroWrapper) return;
    const rect = heroWrapper.getBoundingClientRect();
    const windowH = window.innerHeight;
    const scrollDist = heroWrapper.offsetHeight - windowH;

    if (scrollDist <= 0) return;

    // Progress from top of wrapper entering viewport to end of scroll track
    const scrolled = -rect.top;
    const progress = scrolled / scrollDist;
    updateAssembly(progress);
  }

  window.addEventListener('scroll', handleHeroScroll, { passive: true });
  window.addEventListener('resize', handleHeroScroll, { passive: true });
  handleHeroScroll();

  // Manual Step Pills Click Handler
  scrubberPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const stepIdx = parseInt(pill.getAttribute('data-step') || '0', 10);
      if (heroWrapper) {
        const windowH = window.innerHeight;
        const scrollDist = heroWrapper.offsetHeight - windowH;
        const targetScroll = heroWrapper.offsetTop + (stepIdx / 5.2) * scrollDist;
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ------------------------------------------------------------------------
     4. STEAM PARTICLES CANVAS (60fps Vapor Simulation)
     ------------------------------------------------------------------------ */
  const steamCanvas = document.getElementById('steam-canvas');
  if (steamCanvas) {
    const ctx = steamCanvas.getContext('2d');
    let animationFrameId;
    let isVisible = true;
    const particles = [];
    const maxParticles = 38;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = steamCanvas.getBoundingClientRect();
      steamCanvas.width = rect.width * dpr;
      steamCanvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    class SteamParticle {
      constructor() {
        this.reset();
      }

      reset() {
        // Originate near the center of the döner meat layer
        const w = steamCanvas.getBoundingClientRect().width;
        const h = steamCanvas.getBoundingClientRect().height;
        this.x = w * 0.5 + (Math.random() - 0.5) * (w * 0.45);
        this.y = h * 0.72 + (Math.random() - 0.5) * 20;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = -(0.7 + Math.random() * 1.1);
        this.radius = 12 + Math.random() * 16;
        this.maxRadius = this.radius * (2.8 + Math.random() * 1.5);
        this.alpha = 0.01;
        this.maxAlpha = 0.18 + Math.random() * 0.14;
        this.life = 0;
        this.maxLife = 110 + Math.random() * 90;
        // Warm slight gold tint or clean white vapor
        this.isGold = Math.random() > 0.8;
      }

      update() {
        this.life++;
        this.x += this.vx + Math.sin(this.life * 0.04) * 0.4;
        this.y += this.vy;
        this.radius += (this.maxRadius - this.radius) * 0.015;

        // Fade in then fade out
        const halfLife = this.maxLife * 0.35;
        if (this.life < halfLife) {
          this.alpha = (this.life / halfLife) * this.maxAlpha;
        } else {
          this.alpha = (1 - (this.life - halfLife) / (this.maxLife - halfLife)) * this.maxAlpha;
        }

        if (this.life >= this.maxLife) {
          this.reset();
        }
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.beginPath();
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        if (this.isGold) {
          grad.addColorStop(0, `rgba(245, 183, 0, ${this.alpha * 0.8})`);
          grad.addColorStop(1, 'rgba(245, 183, 0, 0)');
        } else {
          grad.addColorStop(0, `rgba(250, 248, 245, ${this.alpha})`);
          grad.addColorStop(1, 'rgba(250, 248, 245, 0)');
        }
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Init particles
    for (let i = 0; i < maxParticles; i++) {
      const p = new SteamParticle();
      p.life = Math.random() * p.maxLife; // Stagger initial life
      particles.push(p);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    function renderSteam() {
      if (!isVisible) return;
      const rect = steamCanvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(renderSteam);
    }

    // IntersectionObserver to pause rendering when out of view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(animationFrameId);
          renderSteam();
        }
      });
    }, { threshold: 0.05 });

    observer.observe(steamCanvas);

    // Reduced motion respect
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isVisible = false;
    }
  }

  /* ------------------------------------------------------------------------
     5. "BAU DIR DEINEN DÖNER" (Interactive Builder)
     ------------------------------------------------------------------------ */
  const builderOptionCards = document.querySelectorAll('.builder-option-card');
  const livePriceDisplay = document.getElementById('builder-live-price');
  const recipeBreadVal = document.getElementById('recipe-bread-val');
  const recipeMeatVal = document.getElementById('recipe-meat-val');
  const recipeSaucesVal = document.getElementById('recipe-sauces-val');
  const recipeExtrasVal = document.getElementById('recipe-extras-val');
  const builderPhotoImg = document.getElementById('builder-photo-img');
  const builderPhotoBadge = document.getElementById('builder-photo-badge');
  const btnBuilderAdd = document.getElementById('btn-builder-add');

  function calculateBuilderPrice() {
    let price = state.customDoner.meat.price + state.customDoner.bread.price;

    // Extras
    state.customDoner.extras.forEach(extraName => {
      if (extraName.includes('Hirtenkäse')) price += 1.00;
      else if (extraName.includes('Zucchini')) price += 1.20;
      else if (extraName.includes('Jalapeños')) price += 0.80;
      else if (extraName.includes('Granatapfelkerne')) price += 0.80;
      else if (extraName.includes('Extra Fleisch')) price += 2.50;
    });

    // Vegane Kräuter-Creme extra
    if (state.customDoner.sauces.some(s => s.includes('Vegane Kräuter-Creme'))) {
      price += 0.50;
    }

    state.customDoner.totalPrice = price;

    if (livePriceDisplay) {
      livePriceDisplay.textContent = `${price.toFixed(2).replace('.', ',')} €`;
    }

    if (btnBuilderAdd) {
      btnBuilderAdd.textContent = `Diesen Döner in den Warenkorb (${price.toFixed(2).replace('.', ',')} €)`;
    }

    // Update recipe card
    if (recipeBreadVal) recipeBreadVal.textContent = state.customDoner.bread.name;
    if (recipeMeatVal) recipeMeatVal.textContent = state.customDoner.meat.name;
    if (recipeSaucesVal) {
      recipeSaucesVal.textContent = state.customDoner.sauces.length > 0
        ? state.customDoner.sauces.join(', ')
        : 'Keine Sauce';
    }
    if (recipeExtrasVal) {
      recipeExtrasVal.textContent = state.customDoner.extras.length > 0
        ? state.customDoner.extras.join(', ')
        : 'Keine Extras';
    }

    // Update Preview Photo dynamically
    if (builderPhotoImg) {
      let imgSrc = 'assets/img/doner_kebab-960.jpg';
      let badgeText = 'Döner im Steinofenbrot';

      if (state.customDoner.bread.name.includes('Dürüm')) {
        imgSrc = 'assets/img/durum_doner-960.jpg';
        badgeText = 'Frisch gerollter Dürüm';
      } else if (state.customDoner.bread.name.includes('Box')) {
        imgSrc = 'assets/img/doner_box-960.jpg';
        badgeText = 'Kompakte Döner-Box';
      } else if (state.customDoner.meat.name.includes('Falafel')) {
        imgSrc = 'assets/img/falafel-960.jpg';
        badgeText = 'Hausgemachte Falafel';
      } else if (state.customDoner.meat.name.includes('Seitan')) {
        imgSrc = 'assets/img/salat_donerbowl-960.jpg';
        badgeText = 'Veganer Seitan Kebab';
      }

      builderPhotoImg.src = imgSrc;
      builderPhotoImg.srcset = `${imgSrc.replace('-960.jpg', '-500.jpg')} 500w, ${imgSrc} 960w`;
      if (builderPhotoBadge) builderPhotoBadge.textContent = badgeText;
    }
  }

  builderOptionCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-type');
      const name = card.getAttribute('data-name') || '';
      const price = parseFloat(card.getAttribute('data-price') || '0');

      if (type === 'bread') {
        document.querySelectorAll('.builder-option-card[data-type="bread"]').forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        state.customDoner.bread = { name, price };
      } else if (type === 'meat') {
        document.querySelectorAll('.builder-option-card[data-type="meat"]').forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');
        state.customDoner.meat = { name, price };
      } else if (type === 'sauce') {
        // Multi-select up to 3 sauces
        if (card.classList.contains('is-selected')) {
          card.classList.remove('is-selected');
          state.customDoner.sauces = state.customDoner.sauces.filter(s => s !== name);
        } else {
          if (state.customDoner.sauces.length < 3) {
            card.classList.add('is-selected');
            state.customDoner.sauces.push(name);
          } else {
            // Flash notification or alert
            card.animate([
              { transform: 'translateX(-4px)' },
              { transform: 'translateX(4px)' },
              { transform: 'translateX(0)' }
            ], { duration: 200 });
          }
        }
      } else if (type === 'extra') {
        // Toggle extra
        if (card.classList.contains('is-selected')) {
          card.classList.remove('is-selected');
          state.customDoner.extras = state.customDoner.extras.filter(e => e !== name);
        } else {
          card.classList.add('is-selected');
          state.customDoner.extras.push(name);
        }
      }

      calculateBuilderPrice();
    });
  });

  // Add custom döner to cart
  if (btnBuilderAdd) {
    btnBuilderAdd.addEventListener('click', () => {
      const customItem = {
        id: `custom-${Date.now()}`,
        name: `Mein Sonne-Döner (${state.customDoner.bread.name.split(' ')[0]})`,
        desc: `${state.customDoner.meat.name.split(' ')[1] || state.customDoner.meat.name}, ${state.customDoner.sauces.join(' / ')}`,
        price: state.customDoner.totalPrice,
        qty: 1
      };
      addToCart(customItem);
      openDrawer();
    });
  }

  /* ------------------------------------------------------------------------
     6. SPEISEKARTE (Category Filters & Add to Cart)
     ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.menu-filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.getAttribute('data-filter') || 'all';

      menuCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          card.animate([
            { opacity: 0, transform: 'scale(0.96)' },
            { opacity: 1, transform: 'scale(1)' }
          ], { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Direct order button on cards
  const orderCardBtns = document.querySelectorAll('.btn-card-order');
  orderCardBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.menu-card');
      if (!card) return;
      const title = card.querySelector('.menu-card-title')?.textContent || 'Döner';
      const priceText = card.querySelector('.menu-card-badge')?.textContent || '8,50 €';
      const price = parseFloat(priceText.replace('€', '').replace(',', '.').trim()) || 8.50;

      const item = {
        id: `menu-${Date.now()}`,
        name: title,
        desc: card.querySelector('.menu-card-desc')?.textContent || '',
        price: price,
        qty: 1
      };

      addToCart(item);

      // Button feedback
      const originalText = btn.textContent;
      btn.textContent = 'Hinzugefügt';
      btn.style.backgroundColor = 'var(--sun-yellow)';
      btn.style.color = 'var(--charcoal)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 1000);
    });
  });

  /* ------------------------------------------------------------------------
     7. "DER SPIESS": ANIMATED NUMBERS COUNTER
     ------------------------------------------------------------------------ */
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  function countUp(el, target, duration = 1600) {
    const start = 0;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (target - start) * ease);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  const statsSection = document.getElementById('spiess');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsCounted) {
          statsCounted = true;
          statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target') || '0', 10);
            countUp(stat, target);
          });
        }
      });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
  }

  /* ------------------------------------------------------------------------
     8. LATE-NIGHT HOURS & LIVE OPEN/CLOSED STATUS
     ------------------------------------------------------------------------ */
  const liveStatusPill = document.getElementById('live-status-pill');
  const liveStatusPillText = document.getElementById('live-status-pill-text');
  const liveNowBox = document.getElementById('live-now-box');
  const liveStatusHeadline = document.getElementById('live-status-headline');
  const liveStatusSubtext = document.getElementById('live-status-subtext');
  const liveKiezClock = document.getElementById('live-kiez-clock');
  const scheduleRows = document.querySelectorAll('.schedule-row');

  function updateOpeningStatus() {
    const now = new Date();
    // Accurately obtain Europe/Berlin local date and time parts
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Berlin',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const map = {};
    for (const p of parts) map[p.type] = p.value;
    let hour = parseInt(map.hour, 10);
    if (hour === 24) hour = 0;
    const minute = parseInt(map.minute, 10);
    const weekdayStr = map.weekday;
    const dayIndexMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const day = dayIndexMap[weekdayStr];
    const timeVal = hour + minute / 60;
    const berlinTimeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    if (liveKiezClock) {
      liveKiezClock.textContent = `Aktuelle Kiez-Zeit: ${berlinTimeStr} Uhr (Berlin)`;
    }

    // Official Hours Schedule:
    // Mo-Do (1-4): 11:00 – 03:00 (of next day)
    // Fr-Sa (5-6): 11:00 – 06:00 (of next day, Nachtschicht)
    // So (0):      12:00 – 03:00 (of next day)
    const schedule = [
      { open: 12, closePastMidnight: 3, openStr: '12:00', closeStr: '03:00' }, // 0: Sun
      { open: 11, closePastMidnight: 3, openStr: '11:00', closeStr: '03:00' }, // 1: Mon
      { open: 11, closePastMidnight: 3, openStr: '11:00', closeStr: '03:00' }, // 2: Tue
      { open: 11, closePastMidnight: 3, openStr: '11:00', closeStr: '03:00' }, // 3: Wed
      { open: 11, closePastMidnight: 3, openStr: '11:00', closeStr: '03:00' }, // 4: Thu
      { open: 11, closePastMidnight: 6, openStr: '11:00', closeStr: '06:00' }, // 5: Fri
      { open: 11, closePastMidnight: 6, openStr: '11:00', closeStr: '06:00' }  // 6: Sat
    ];

    const prevDay = (day + 6) % 7;
    let isOpen = false;
    let closingTime = '03:00';
    let nextOpenTime = '11:00';
    let activeShiftDay = day;

    if (timeVal < schedule[prevDay].closePastMidnight) {
      // Early morning hours belonging to the previous evening's night shift
      isOpen = true;
      closingTime = schedule[prevDay].closeStr;
      activeShiftDay = prevDay;
    } else if (timeVal >= schedule[day].open) {
      // Today's regular operating shift
      isOpen = true;
      closingTime = schedule[day].closeStr;
      activeShiftDay = day;
    } else {
      // Overnight pause between early morning closing and today's opening
      isOpen = false;
      nextOpenTime = schedule[day].openStr;
      activeShiftDay = day;
    }

    // Highlight current active shift in schedule table
    const mappedDayIndex = activeShiftDay === 0 ? 6 : activeShiftDay - 1; // 0 = Mo, 6 = So
    scheduleRows.forEach((row, idx) => {
      row.classList.toggle('is-today', idx === mappedDayIndex);
    });

    // Update Header Pill
    if (liveStatusPill && liveStatusPillText) {
      if (isOpen) {
        liveStatusPill.classList.remove('is-closed');
        liveStatusPillText.textContent = `Jetzt geöffnet (bis ${closingTime} Uhr)`;
      } else {
        liveStatusPill.classList.add('is-closed');
        liveStatusPillText.textContent = `Jetzt geschlossen (ab ${nextOpenTime} Uhr)`;
      }
    }

    // Update Hours Section Box
    if (liveNowBox && liveStatusHeadline && liveStatusSubtext) {
      if (isOpen) {
        liveNowBox.classList.remove('is-closed');
        liveNowBox.classList.add('is-open');
        liveStatusHeadline.textContent = 'JETZT GEÖFFNET';
        liveStatusSubtext.textContent = `Der Spieß dreht sich! Heute durchgehend geöffnet bis ${closingTime} Uhr morgens.`;
      } else {
        liveNowBox.classList.remove('is-open');
        liveNowBox.classList.add('is-closed');
        liveStatusHeadline.textContent = 'JETZT GESCHLOSSEN';
        liveStatusSubtext.textContent = `Unsere Teigbäcker und Fleischmeister schlafen kurz. Wir öffnen wieder um ${nextOpenTime} Uhr!`;
      }
    }
  }

  updateOpeningStatus();
  setInterval(updateOpeningStatus, 30000);

  /* ------------------------------------------------------------------------
     9. BERLIN DISTRICTS DELIVERY MAP (Interactive SVG)
     ------------------------------------------------------------------------ */
  const districts = {
    'kreuzberg': {
      name: 'Kreuzberg 36 & 61',
      zip: '10999, 10967, 10961',
      time: '15–25 Min',
      minOrder: '12,00 €',
      fee: 'Kostenlos ab 20 € (sonst 1,00 €)'
    },
    'neukoelln': {
      name: 'Neukölln Nord & Reuterkiez',
      zip: '12043, 12047, 12049',
      time: '20–30 Min',
      minOrder: '15,00 €',
      fee: '1,50 € (Kostenlos ab 25 €)'
    },
    'friedrichshain': {
      name: 'Friedrichshain & Boxhagener Platz',
      zip: '10243, 10245',
      time: '25–35 Min',
      minOrder: '18,00 €',
      fee: '2,00 € (Kostenlos ab 30 €)'
    },
    'mitte': {
      name: 'Berlin-Mitte & Alexanderplatz',
      zip: '10178, 10179',
      time: '25–40 Min',
      minOrder: '20,00 €',
      fee: '2,50 € (Kostenlos ab 35 €)'
    },
    'treptow': {
      name: 'Alt-Treptow & Arena-Kiez',
      zip: '12435',
      time: '20–35 Min',
      minOrder: '18,00 €',
      fee: '2,00 € (Kostenlos ab 30 €)'
    },
    'schoeneberg': {
      name: 'Schöneberg Nord',
      zip: '10777, 10781',
      time: '30–45 Min',
      minOrder: '25,00 €',
      fee: '3,00 € (Kostenlos ab 40 €)'
    }
  };

  const mapDistrictElements = document.querySelectorAll('.map-district');
  const districtNameEl = document.getElementById('district-name');
  const districtZipEl = document.getElementById('district-zip');
  const districtTimeEl = document.getElementById('district-time');
  const districtMinEl = document.getElementById('district-min');
  const districtFeeEl = document.getElementById('district-fee');
  const btnSelectDistrict = document.getElementById('btn-select-district');

  function selectDistrict(key) {
    const data = districts[key];
    if (!data) return;

    state.activeDistrict = data;

    mapDistrictElements.forEach(d => {
      d.classList.toggle('is-active', d.getAttribute('data-district') === key);
    });

    if (districtNameEl) districtNameEl.textContent = data.name;
    if (districtZipEl) districtZipEl.textContent = `PLZ: ${data.zip}`;
    if (districtTimeEl) districtTimeEl.textContent = data.time;
    if (districtMinEl) districtMinEl.textContent = data.minOrder;
    if (districtFeeEl) districtFeeEl.textContent = data.fee;

    if (btnSelectDistrict) {
      btnSelectDistrict.textContent = `Lieferung nach ${data.name.split(' ')[0]} bestellen`;
    }

    // Auto-update order form district selector
    const orderDistrictSelect = document.getElementById('order-district-select');
    if (orderDistrictSelect) {
      orderDistrictSelect.value = key;
    }
  }

  mapDistrictElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      const key = el.getAttribute('data-district');
      if (key) selectDistrict(key);
    });
    el.addEventListener('click', () => {
      const key = el.getAttribute('data-district');
      if (key) selectDistrict(key);
    });
  });

  if (btnSelectDistrict) {
    btnSelectDistrict.addEventListener('click', () => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. ORDER DRAWER & CART MANAGEMENT
     ------------------------------------------------------------------------ */
  const drawerOverlay = document.getElementById('order-drawer-overlay');
  const cartTriggerBtn = document.getElementById('cart-trigger-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartCountBadges = document.querySelectorAll('.cart-count-badge');
  const drawerTotalVal = document.getElementById('drawer-total-val');
  const btnDrawerCheckout = document.getElementById('btn-drawer-checkout');

  function openDrawer() {
    if (drawerOverlay) drawerOverlay.classList.add('is-open');
  }

  function closeDrawer() {
    if (drawerOverlay) drawerOverlay.classList.remove('is-open');
  }

  if (cartTriggerBtn) cartTriggerBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', (e) => {
      if (e.target === drawerOverlay) closeDrawer();
    });
  }

  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    cartCountBadges.forEach(badge => {
      badge.textContent = totalItems;
    });

    if (drawerTotalVal) {
      drawerTotalVal.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;
    }

    if (!cartItemsList) return;

    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: var(--warm-muted);">
          <p style="font-weight: 600; margin-bottom: 8px;">Dein Warenkorb ist noch leer.</p>
          <p style="font-size: 0.8125rem;">Stelle dir oben deinen Lieblingsdöner zusammen oder wähle ein Gericht aus der Speisekarte.</p>
        </div>
      `;
      if (btnDrawerCheckout) {
        btnDrawerCheckout.disabled = true;
        btnDrawerCheckout.style.opacity = '0.5';
      }
      return;
    }

    if (btnDrawerCheckout) {
      btnDrawerCheckout.disabled = false;
      btnDrawerCheckout.style.opacity = '1';
    }

    cartItemsList.innerHTML = state.cart.map((item, index) => `
      <div class="cart-item-row">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.qty}x ${item.name}</div>
          <div class="cart-item-sub">${item.desc}</div>
        </div>
        <div class="cart-item-price">${(item.price * item.qty).toFixed(2).replace('.', ',')} €</div>
        <button type="button" class="cart-item-remove" data-index="${index}" aria-label="Gericht entfernen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');

    // Attach remove handlers
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
        state.cart.splice(idx, 1);
        updateCartUI();
      });
    });
  }

  function addToCart(item) {
    const existing = state.cart.find(i => i.name === item.name && i.desc === item.desc);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push(item);
    }
    updateCartUI();
  }

  if (btnDrawerCheckout) {
    btnDrawerCheckout.addEventListener('click', () => {
      closeDrawer();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Preload one popular döner in cart as demo
  addToCart({
    id: 'demo-item-1',
    name: 'Sonne Klassik Kalb',
    desc: '100% Kalb-Schichtfleisch, Knoblauch- & Kräutersauce, Sesam-Fladenbrot',
    price: 8.50,
    qty: 1
  });

  /* ------------------------------------------------------------------------
     11. ORDER FORM & IN-PAGE CONFIRMATION
     ------------------------------------------------------------------------ */
  const orderTypeBtns = document.querySelectorAll('.form-toggle-btn');
  const deliveryFields = document.querySelectorAll('.delivery-only-field');
  const quickOrderForm = document.getElementById('quick-order-form');
  const orderConfirmationCard = document.getElementById('order-confirmation-card');
  const confirmationCodeEl = document.getElementById('confirmation-code');
  const confirmationDescEl = document.getElementById('confirmation-desc');
  const btnTelegramConfirm = document.getElementById('btn-telegram-confirm');

  let orderMode = 'delivery'; // 'delivery' or 'pickup'

  orderTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      orderTypeBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      orderMode = btn.getAttribute('data-mode') || 'delivery';

      deliveryFields.forEach(f => {
        f.style.display = orderMode === 'delivery' ? 'flex' : 'none';
      });
    });
  });

  if (quickOrderForm) {
    quickOrderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('order-name')?.value || 'Gast';
      const phone = document.getElementById('order-phone')?.value || '+49 888 6661234';
      const address = document.getElementById('order-address')?.value || 'Adalbertstraße 9';
      const district = state.activeDistrict.name;
      const orderCode = `DS-${Math.floor(1000 + Math.random() * 9000)}`;

      const itemsSummary = state.cart.length > 0
        ? state.cart.map(i => `${i.qty}x ${i.name}`).join(', ')
        : '1x Sonne Klassik Kalb';
      const totalAmount = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0) || 8.50;

      // Show in-page confirmation
      quickOrderForm.style.display = 'none';
      if (orderConfirmationCard) {
        orderConfirmationCard.classList.add('is-active');
      }

      if (confirmationCodeEl) {
        confirmationCodeEl.textContent = `Bestell-ID: #${orderCode}`;
      }

      if (confirmationDescEl) {
        const timeText = orderMode === 'delivery'
          ? `Lieferung nach ${district} in ca. ${state.activeDistrict.time}.`
          : 'Bereit zur Abholung an unserer Theke in ca. 15 Minuten.';

        confirmationDescEl.innerHTML = `
          Vielen Dank, <strong>${name}</strong>!<br>
          Deine Bestellung (${itemsSummary}) im Gesamtwert von <strong>${totalAmount.toFixed(2).replace('.', ',')} €</strong> wird jetzt frisch zubereitet.<br>
          ${timeText}
        `;
      }

      // Prepare Telegram order deep link
      if (btnTelegramConfirm) {
        const telegramText = encodeURIComponent(
          `Hallo Döner der Sonne! Meine Bestellung #${orderCode}: ${itemsSummary}. Name: ${name}, Tel: ${phone}. Modus: ${orderMode === 'delivery' ? 'Lieferung an ' + address : 'Selbstabholung'}.`
        );
        btnTelegramConfirm.href = `https://t.me/rovatt?text=${telegramText}`;
      }
    });
  }

  /* ------------------------------------------------------------------------
     12. LEGAL MODALS (Impressum & Datenschutz)
     ------------------------------------------------------------------------ */
  const impressumModal = document.getElementById('impressum-modal');
  const datenschutzModal = document.getElementById('datenschutz-modal');
  const openImpressumBtn = document.getElementById('open-impressum-btn');
  const openDatenschutzBtn = document.getElementById('open-datenschutz-btn');
  const closeImpressumBtn = document.getElementById('close-impressum-btn');
  const closeDatenschutzBtn = document.getElementById('close-datenschutz-btn');

  function openModal(modal) {
    if (modal) modal.classList.add('is-open');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('is-open');
  }

  if (openImpressumBtn) openImpressumBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(impressumModal); });
  if (openDatenschutzBtn) openDatenschutzBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(datenschutzModal); });
  if (closeImpressumBtn) closeImpressumBtn.addEventListener('click', () => closeModal(impressumModal));
  if (closeDatenschutzBtn) closeDatenschutzBtn.addEventListener('click', () => closeModal(datenschutzModal));

  [impressumModal, datenschutzModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeModal(impressumModal);
      closeModal(datenschutzModal);
    }
  });
});
