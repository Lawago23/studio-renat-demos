/**
 * Main Application Logic & Interactivity
 * Pizzeria Pugliese – Forno a Legna (Berlin-Neukölln)
 */

(function () {
  'use strict';

  // 1. Top Demo Announcement Bar
  const topBar = document.getElementById('topDemoBar');
  const closeTopBarBtn = document.getElementById('closeTopBarBtn');

  if (topBar && closeTopBarBtn) {
    if (sessionStorage.getItem('pugliese_demo_bar_closed') === 'true') {
      topBar.classList.add('hidden');
    }

    closeTopBarBtn.addEventListener('click', () => {
      topBar.classList.add('hidden');
      sessionStorage.setItem('pugliese_demo_bar_closed', 'true');
    });
  }

  // 2. Sticky Header Scroll Effect
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer-btn');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      mobileToggle.classList.toggle('open', !isOpen);
      mobileDrawer.classList.toggle('open', !isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // 4. "48 Stunden Teig" Step Story Progress & Scroll Spy
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const progressFill = document.getElementById('teigProgressFill');

  // Step data to highlight on right side panel
  const stepMeta = [
    { hydra: '72%', temp: '18°C', time: '15 Min.' },
    { hydra: '72%', temp: '20°C', time: '20 Min.' },
    { hydra: '72%', temp: '4°C',  time: '48 Std.' },
    { hydra: '72%', temp: '22°C', time: '1 Min.' },
    { hydra: '72%', temp: '485°C', time: '90 Sek.' }
  ];

  if (timelineSteps.length > 0) {
    let maxStepReached = 0;

    const checkSteps = () => {
      const windowH = window.innerHeight;
      const triggerPoint = windowH * 0.88; // Step becomes visible once in view

      timelineSteps.forEach((step, idx) => {
        const rect = step.getBoundingClientRect();
        // If step has entered viewport or has been scrolled past
        if (rect.top <= triggerPoint) {
          if (idx > maxStepReached) {
            maxStepReached = idx;
          }
        }
      });

      // Every step once in view must become and remain fully visible
      timelineSteps.forEach((step, idx) => {
        if (idx <= maxStepReached) {
          step.classList.add('active');
          step.classList.add('visible');
        }
      });

      // Determine the currently prominent step for formula indicator
      let currentActive = 0;
      timelineSteps.forEach((step, idx) => {
        const rect = step.getBoundingClientRect();
        if (rect.top <= windowH * 0.55 && rect.bottom >= 0) {
          currentActive = idx;
        }
      });
      if (maxStepReached > currentActive) {
        currentActive = maxStepReached;
      }

      if (progressFill) {
        const pct = Math.min(100, Math.round(((maxStepReached + 1) / timelineSteps.length) * 100));
        progressFill.style.height = `${pct}%`;
      }

      if (stepMeta[currentActive]) {
        const elValHydra = document.getElementById('formulaHydra');
        const elValTemp = document.getElementById('formulaTemp');
        const elValTime = document.getElementById('formulaTime');
        if (elValHydra) elValHydra.textContent = stepMeta[currentActive].hydra;
        if (elValTemp) elValTemp.textContent = stepMeta[currentActive].temp;
        if (elValTime) elValTime.textContent = stepMeta[currentActive].time;
      }
    };

    // Scroll listener with RAF throttle
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          checkSteps();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', checkSteps, { passive: true });

    // Initial check on load
    checkSteps();
  }

  // 5. Menu Tabs Switching
  const menuTabBtns = document.querySelectorAll('.menu-tab-btn');
  const menuPanels = document.querySelectorAll('.menu-tab-panel');

  if (menuTabBtns.length > 0) {
    menuTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        menuTabBtns.forEach((b) => b.classList.remove('active'));
        menuPanels.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPanel = document.getElementById(`tab-${targetTab}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  // 6. Table Reservation Form Handling & Confirmation Receipt
  const resForm = document.getElementById('reservationForm');
  const resReceipt = document.getElementById('reservationReceipt');
  const resResetBtn = document.getElementById('reservationResetBtn');
  const dateInput = document.getElementById('resDate');

  // Set minimum date to today
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  if (resForm && resReceipt) {
    resForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve form values
      const dateVal = dateInput ? dateInput.value : '';
      const timeVal = document.getElementById('resTime')?.value || '19:00 Uhr';
      const personsVal = document.getElementById('resPersons')?.value || '2 Personen';
      const areaVal = document.querySelector('input[name="resArea"]:checked')?.value || 'Am Holzofen';
      const nameVal = document.getElementById('resName')?.value || 'Gast';
      const emailVal = document.getElementById('resEmail')?.value || '';
      const phoneVal = document.getElementById('resPhone')?.value || '';

      // Format date into European format DD.MM.YYYY
      let formattedDate = dateVal;
      if (dateVal.includes('-')) {
        const parts = dateVal.split('-');
        formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
      }

      // Generate random confirmation code
      const randomCode = `PUGLIESE-${Math.floor(1000 + Math.random() * 9000)}`;

      // Populate Receipt
      const elCode = document.getElementById('receiptCode');
      const elDate = document.getElementById('receiptDate');
      const elTime = document.getElementById('receiptTime');
      const elPersons = document.getElementById('receiptPersons');
      const elArea = document.getElementById('receiptArea');
      const elName = document.getElementById('receiptName');
      const elEmail = document.getElementById('receiptEmail');

      if (elCode) elCode.textContent = randomCode;
      if (elDate) elDate.textContent = formattedDate;
      if (elTime) elTime.textContent = timeVal;
      if (elPersons) elPersons.textContent = personsVal;
      if (elArea) elArea.textContent = areaVal;
      if (elName) elName.textContent = nameVal;
      if (elEmail) elEmail.textContent = emailVal;

      // Switch view smoothly
      resForm.style.display = 'none';
      resReceipt.classList.add('active');

      // Scroll receipt into clear view
      resReceipt.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    if (resResetBtn) {
      resResetBtn.addEventListener('click', () => {
        resReceipt.classList.remove('active');
        resForm.reset();
        resForm.style.display = 'block';
        if (dateInput) {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const dd = String(today.getDate()).padStart(2, '0');
          dateInput.value = `${yyyy}-${mm}-${dd}`;
        }
      });
    }
  }

  // 7. Smooth Scroll Offset Correction for Fixed Header
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
})();
