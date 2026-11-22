/**
 * Studio Vela – Nails & Beauty · Berlin-Mitte
 * Main JavaScript: 3D Flacon (Three.js), Interactive Color Switcher,
 * Price Calculator, Gallery Masonry Filter, Booking Engine & Accordion
 */

(function () {
  'use strict';

  // State Management
  const state = {
    activeShade: {
      color: '#8C5A6E',
      code: 'No. 01',
      name: 'Mauve Nocturne',
      desc: 'Tiefes, pudriges Samt-Mauve'
    },
    calculator: {
      base: { name: 'BIAB Russian Manicure', price: 65, duration: 60 },
      extras: []
    },
    booking: {
      artist: 'Beliebige Stylistin',
      date: '',
      timeSlot: '11:30',
      totalPrice: 65,
      totalDuration: 60,
      treatmentName: 'BIAB Russian Manicure'
    }
  };

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. TOP DEMO BAR & NAVIGATION
     ========================================================================== */
  function initHeaderAndBanner() {
    const demoBar = document.getElementById('demoTopBar');
    const demoClose = document.getElementById('demoTopBarClose');
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    // Check if dismissed in session
    if (sessionStorage.getItem('vela_demo_dismissed') === 'true' && demoBar) {
      demoBar.classList.add('hidden');
    }

    if (demoClose && demoBar) {
      demoClose.addEventListener('click', () => {
        demoBar.classList.add('hidden');
        sessionStorage.setItem('vela_demo_dismissed', 'true');
      });
    }

    // Mobile Drawer Toggle
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
          mobileDrawer.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileDrawer.setAttribute('aria-hidden', 'true');
        } else {
          mobileDrawer.classList.add('open');
          mobileToggle.setAttribute('aria-expanded', 'true');
          mobileDrawer.setAttribute('aria-hidden', 'false');
        }
      });

      drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileDrawer.setAttribute('aria-hidden', 'true');
        });
      });
    }
  }

  /* ==========================================================================
     2. 3D GLOSSY NAIL-POLISH BOTTLE (THREE.JS R128)
     ========================================================================== */
  let threeScene, threeCamera, threeRenderer, flaconGroup, liquidMesh, liquidMaterial;
  let targetLiquidColor;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let currentRotationSpeed = 0.006;
  let animationFrameId = null;

  function init3DFlacon() {
    const viewport = document.getElementById('canvasViewport');
    const loadingElem = document.getElementById('canvasLoading');
    const fallbackElem = document.getElementById('canvasFallback');

    // Check WebGL and THREE availability
    const hasWebGL = (function () {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    })();

    if (!window.THREE || !hasWebGL || !viewport) {
      if (loadingElem) loadingElem.style.display = 'none';
      if (fallbackElem) fallbackElem.classList.add('active');
      return;
    }

    try {
      const width = viewport.clientWidth || 380;
      const height = viewport.clientHeight || 380;

      // Scene & Camera
      threeScene = new THREE.Scene();
      threeCamera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      threeCamera.position.set(0, 0.8, 6.2);
      threeCamera.lookAt(0, 0.2, 0);

      // Renderer
      threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      threeRenderer.setSize(width, height);
      threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      threeRenderer.toneMappingExposure = 1.15;
      viewport.appendChild(threeRenderer.domElement);

      // Main Group
      flaconGroup = new THREE.Group();
      threeScene.add(flaconGroup);

      // Materials
      targetLiquidColor = new THREE.Color(state.activeShade.color);
      liquidMaterial = new THREE.MeshStandardMaterial({
        color: targetLiquidColor.clone(),
        roughness: 0.12,
        metalness: 0.15,
        transparent: true,
        opacity: 0.94
      });

      // Clear Glass Flacon Body Material
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.08,
        transmission: 0.85,
        transparent: true,
        opacity: 0.45,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        ior: 1.52
      });

      // Champagne Gold Cap Material
      const goldCapMaterial = new THREE.MeshStandardMaterial({
        color: 0xD4B483,
        roughness: 0.28,
        metalness: 0.85
      });

      // Glass Bottle Body (Rounded Box / Octagonal Flacon)
      const bottleGeo = new THREE.CylinderGeometry(1.08, 1.08, 1.9, 32, 1);
      const bottleMesh = new THREE.Mesh(bottleGeo, glassMaterial);
      bottleMesh.position.y = -0.35;
      flaconGroup.add(bottleMesh);

      // Inner Nail Polish Liquid
      const liquidGeo = new THREE.CylinderGeometry(0.96, 0.94, 1.5, 32, 1);
      liquidMesh = new THREE.Mesh(liquidGeo, liquidMaterial);
      liquidMesh.position.y = -0.48;
      flaconGroup.add(liquidMesh);

      // Bottle Neck
      const neckGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.4, 24);
      const neckMesh = new THREE.Mesh(neckGeo, goldCapMaterial);
      neckMesh.position.y = 0.72;
      flaconGroup.add(neckMesh);

      // Bottle Cap (Tall, sleek luxury cylinder)
      const capGeo = new THREE.CylinderGeometry(0.42, 0.42, 1.45, 32);
      const capMesh = new THREE.Mesh(capGeo, goldCapMaterial);
      capMesh.position.y = 1.6;
      flaconGroup.add(capMesh);

      // Subtle Label Band on Glass
      const labelGeo = new THREE.CylinderGeometry(1.09, 1.09, 0.5, 32, 1, true, 0, Math.PI * 0.8);
      const labelMat = new THREE.MeshBasicMaterial({
        color: 0xFFFBF7,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.y = -0.2;
      labelMesh.rotation.y = Math.PI * 0.6;
      flaconGroup.add(labelMesh);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xFFF7F2, 1.3);
      threeScene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xFFEAD8, 1.8);
      keyLight.position.set(4, 5, 4);
      threeScene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xF4D6D0, 1.2);
      fillLight.position.set(-4, -1, -3);
      threeScene.add(fillLight);

      const topLight = new THREE.PointLight(0xFFFFFF, 1.2, 10);
      topLight.position.set(0, 4, 2);
      threeScene.add(topLight);

      // Initial gentle angle
      flaconGroup.rotation.x = 0.08;
      flaconGroup.rotation.y = 0.3;

      if (loadingElem) {
        loadingElem.classList.add('fade-out');
        setTimeout(() => loadingElem.remove(), 400);
      }

      // Drag / Orbit Interaction
      const domElem = threeRenderer.domElement;

      function onPointerDown(e) {
        isDragging = true;
        previousMousePosition = {
          x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
          y: e.clientY || (e.touches && e.touches[0].clientY) || 0
        };
        const hint = document.getElementById('dragHint');
        if (hint) hint.style.opacity = '0.3';
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        const deltaX = currentX - previousMousePosition.x;
        const deltaY = currentY - previousMousePosition.y;

        flaconGroup.rotation.y += deltaX * 0.012;
        flaconGroup.rotation.x = Math.max(-0.25, Math.min(0.35, flaconGroup.rotation.x + deltaY * 0.008));

        previousMousePosition = { x: currentX, y: currentY };
      }

      function onPointerUp() {
        isDragging = false;
      }

      domElem.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      domElem.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);

      // Resize Handler
      window.addEventListener('resize', () => {
        if (!viewport || !threeCamera || !threeRenderer) return;
        const nw = viewport.clientWidth;
        const nh = viewport.clientHeight;
        threeCamera.aspect = nw / nh;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(nw, nh);
      });

      // Render Loop
      function animate() {
        animationFrameId = requestAnimationFrame(animate);

        // Ambient rotation if not dragging and not reduced motion
        if (!isDragging && !prefersReducedMotion) {
          flaconGroup.rotation.y += currentRotationSpeed;
        }

        // Smooth liquid color transition
        if (liquidMaterial && targetLiquidColor) {
          liquidMaterial.color.lerp(targetLiquidColor, 0.08);
        }

        threeRenderer.render(threeScene, threeCamera);
      }

      animate();

    } catch (err) {
      console.warn('Three.js initialization notice:', err);
      if (loadingElem) loadingElem.style.display = 'none';
      if (fallbackElem) fallbackElem.classList.add('active');
    }
  }

  /* Color Dots Switcher */
  function initColorDots() {
    const dots = document.querySelectorAll('.color-dot');
    const codeElem = document.getElementById('activeShadeCode');
    const nameElem = document.getElementById('activeShadeName');
    const descElem = document.getElementById('activeShadeDesc');
    const fallbackLiquid = document.getElementById('fallbackLiquid');

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        dots.forEach(d => {
          d.classList.remove('active');
          d.setAttribute('aria-checked', 'false');
        });
        dot.classList.add('active');
        dot.setAttribute('aria-checked', 'true');

        const colorHex = dot.dataset.color;
        const code = dot.dataset.code;
        const name = dot.dataset.name;
        const desc = dot.dataset.desc;

        state.activeShade = { color: colorHex, code, name, desc };

        // Update Text
        if (codeElem) codeElem.textContent = code;
        if (nameElem) nameElem.textContent = name;
        if (descElem) descElem.textContent = desc;

        // Update 3D Liquid target
        if (window.THREE && targetLiquidColor) {
          targetLiquidColor.set(colorHex);
        }

        // Update Fallback Liquid
        if (fallbackLiquid) {
          fallbackLiquid.style.backgroundColor = colorHex;
        }
      });
    });

    // "Nuance merken" from Palette section
    const paletteBtn = document.getElementById('btnBookPaletteShade');
    if (paletteBtn) {
      paletteBtn.addEventListener('click', () => {
        const shadeText = paletteBtn.dataset.shade;
        const notesInput = document.getElementById('clientNotes');
        if (notesInput) {
          notesInput.value = `Wunschfarbe: ${shadeText}`;
        }
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
        paletteBtn.textContent = 'Für Termin gemerkt!';
        setTimeout(() => {
          paletteBtn.textContent = 'Nuance für Termin merken';
        }, 3000);
      });
    }
  }

  /* ==========================================================================
     3. NAIL DESIGN GALLERY (FILTERS & LIGHTBOX)
     ========================================================================== */
  function initGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('galleryModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalClose = document.getElementById('modalClose');
    const modalImg = document.getElementById('modalImg');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalArtist = document.getElementById('modalArtist');
    const modalPrice = document.getElementById('modalPrice');
    const modalDuration = document.getElementById('modalDuration');
    const modalBookBtn = document.getElementById('modalBookBtn');

    // Filter logic
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;

        galleryItems.forEach(item => {
          const category = item.dataset.category;
          if (filter === 'all' || category === filter) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });

    // Lightbox Modal
    function openModal(item) {
      const img = item.querySelector('img');
      const title = item.dataset.title;
      const artist = item.dataset.artist;
      const price = item.dataset.price;
      const duration = item.dataset.duration;
      const category = item.dataset.category.toUpperCase();

      if (modalImg && img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt;
      }
      if (modalCategory) modalCategory.textContent = category;
      if (modalTitle) modalTitle.textContent = title;
      if (modalArtist) modalArtist.textContent = artist;
      if (modalPrice) modalPrice.textContent = price;
      if (modalDuration) modalDuration.textContent = duration;

      if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeModal() {
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }

    galleryItems.forEach(item => {
      const inspectBtn = item.querySelector('.btn-inspect');
      const card = item.querySelector('.gallery-card');

      if (inspectBtn) {
        inspectBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openModal(item);
        });
      }
      if (card) {
        card.addEventListener('click', () => openModal(item));
      }
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeModal();
      }
    });

    if (modalBookBtn) {
      modalBookBtn.addEventListener('click', () => {
        closeModal();
        const designTitle = modalTitle ? modalTitle.textContent : '';
        const notesInput = document.getElementById('clientNotes');
        if (notesInput && designTitle) {
          notesInput.value = `Referenz-Design: ${designTitle}`;
        }
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  /* ==========================================================================
     4. SIGNATURE INTERACTIVE PRICE CALCULATOR
     ========================================================================== */
  function initPriceCalculator() {
    const radioCards = document.querySelectorAll('.radio-card');
    const checkboxCards = document.querySelectorAll('.checkbox-card');
    const totalAmountElem = document.getElementById('calcTotalAmount');
    const totalDurationElem = document.getElementById('calcTotalDuration');
    const summaryListElem = document.getElementById('calcSummaryList');
    const transferBtn = document.getElementById('btnTransferToBooking');

    function updateCalculator() {
      let total = state.calculator.base.price;
      let duration = state.calculator.base.duration;

      // Clear list
      if (summaryListElem) {
        summaryListElem.innerHTML = '';

        // Add Base Treatment
        const baseLi = document.createElement('li');
        baseLi.className = 'summary-item base-item';
        baseLi.innerHTML = `
          <span class="item-name">${state.calculator.base.name}</span>
          <span class="item-price">${state.calculator.base.price} €</span>
        `;
        summaryListElem.appendChild(baseLi);

        // Add Extras
        state.calculator.extras.forEach(extra => {
          total += extra.price;
          duration += extra.duration;

          const extraLi = document.createElement('li');
          extraLi.className = 'summary-item';
          extraLi.innerHTML = `
            <span class="item-name">+ ${extra.name}</span>
            <span class="item-price">+${extra.price} €</span>
          `;
          summaryListElem.appendChild(extraLi);
        });
      }

      // Smooth number animation
      if (totalAmountElem) {
        totalAmountElem.textContent = total;
      }
      if (totalDurationElem) {
        totalDurationElem.textContent = `${duration} Min.`;
      }

      // Update Booking State Sync
      state.booking.totalPrice = total;
      state.booking.totalDuration = duration;
      state.booking.treatmentName = state.calculator.base.name;
    }

    // Base Treatment Radio Handlers
    radioCards.forEach(card => {
      card.addEventListener('click', () => {
        radioCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const input = card.querySelector('input');
        if (input) input.checked = true;

        const price = parseInt(card.dataset.price, 10);
        const duration = parseInt(card.dataset.duration, 10);
        const name = card.dataset.name;

        state.calculator.base = { name, price, duration };
        updateCalculator();
      });
    });

    // Extras Checkbox Handlers
    checkboxCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent double toggling if clicking the hidden input
        if (e.target.tagName !== 'INPUT') {
          const input = card.querySelector('input');
          if (input) input.checked = !input.checked;
        }

        const isChecked = card.querySelector('input').checked;
        card.classList.toggle('selected', isChecked);

        const price = parseInt(card.dataset.price, 10);
        const duration = parseInt(card.dataset.duration, 10);
        const name = card.dataset.name;

        if (isChecked) {
          state.calculator.extras.push({ name, price, duration });
        } else {
          state.calculator.extras = state.calculator.extras.filter(item => item.name !== name);
        }

        updateCalculator();
      });
    });

    // Transfer To Booking Button
    if (transferBtn) {
      transferBtn.addEventListener('click', () => {
        const bookingServiceName = document.getElementById('bookingServiceName');
        const bookingServiceMeta = document.getElementById('bookingServiceMeta');

        let fullServiceName = state.calculator.base.name;
        if (state.calculator.extras.length > 0) {
          fullServiceName += ` (+ ${state.calculator.extras.map(e => e.name.split(' ')[0]).join(', ')})`;
        }

        if (bookingServiceName) bookingServiceName.textContent = fullServiceName;
        if (bookingServiceMeta) bookingServiceMeta.textContent = `${state.booking.totalPrice} € · ${state.booking.totalDuration} Min.`;

        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    updateCalculator();
  }

  /* ==========================================================================
     5. ARTIST SELECTION & TEAM BUTTONS
     ========================================================================== */
  function initTeamAndArtistSelect() {
    const artistButtons = document.querySelectorAll('.btn-artist-book');
    const artistPills = document.querySelectorAll('.artist-radio-pill');

    function selectArtistInForm(artistName) {
      artistPills.forEach(pill => {
        const input = pill.querySelector('input');
        if (input && (input.value === artistName || (artistName === '' && input.value === 'any'))) {
          pill.classList.add('selected');
          input.checked = true;
          state.booking.artist = artistName === 'any' ? 'Beliebige Stylistin' : artistName;
        } else {
          pill.classList.remove('selected');
        }
      });
    }

    artistButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const artist = btn.dataset.artist;
        selectArtistInForm(artist);
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    artistPills.forEach(pill => {
      pill.addEventListener('click', () => {
        artistPills.forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        const input = pill.querySelector('input');
        if (input) {
          input.checked = true;
          state.booking.artist = input.value === 'any' ? 'Beliebige Stylistin' : input.value;
        }
      });
    });
  }

  /* ==========================================================================
     6. BOOKING ENGINE (DATE PICKER, TIME SLOTS, IN-PAGE CONFIRMATION)
     ========================================================================== */
  function initBookingFlow() {
    const dateRow = document.getElementById('datePickerRow');
    const slots = document.querySelectorAll('.slot-btn');
    const bookingForm = document.getElementById('bookingForm');
    const confirmationCard = document.getElementById('bookingConfirmationCard');
    const resetBookingBtn = document.getElementById('btnResetBooking');
    const downloadIcsBtn = document.getElementById('btnDownloadIcs');

    // Generate next 7 days
    if (dateRow) {
      dateRow.innerHTML = '';
      const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
      const today = new Date();

      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date();
        nextDate.setDate(today.getDate() + i);

        const dayOfWeek = nextDate.getDay();
        const isClosed = (dayOfWeek === 0 || dayOfWeek === 1); // Sunday & Monday closed
        const isDefault = (!isClosed && !state.booking.date);

        const dateCard = document.createElement('button');
        dateCard.type = 'button';
        dateCard.className = `date-card ${isDefault ? 'selected' : ''} ${isClosed ? 'closed' : ''}`;
        dateCard.dataset.fullDate = `${dayNames[dayOfWeek]}, ${nextDate.getDate()}. ${monthNames[nextDate.getMonth()]}`;
        dateCard.setAttribute('role', 'radio');
        dateCard.setAttribute('aria-checked', isDefault ? 'true' : 'false');
        if (isClosed) dateCard.disabled = true;

        if (isDefault) {
          state.booking.date = dateCard.dataset.fullDate;
        }

        dateCard.innerHTML = `
          <span class="date-day-name">${dayNames[dayOfWeek]}</span>
          <span class="date-day-num">${nextDate.getDate()}</span>
          <span class="date-status">${isClosed ? 'Ruhetag' : 'Geöffnet'}</span>
        `;

        dateCard.addEventListener('click', () => {
          if (isClosed) return;
          document.querySelectorAll('.date-card').forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
          });
          dateCard.classList.add('selected');
          dateCard.setAttribute('aria-checked', 'true');
          state.booking.date = dateCard.dataset.fullDate;
        });

        dateRow.appendChild(dateCard);
      }
    }

    // Time Slot Buttons
    slots.forEach(slot => {
      slot.addEventListener('click', () => {
        slots.forEach(s => {
          s.classList.remove('selected');
          s.setAttribute('aria-checked', 'false');
        });
        slot.classList.add('selected');
        slot.setAttribute('aria-checked', 'true');
        state.booking.timeSlot = slot.dataset.slot;
      });
    });

    // Form Submit Handler
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('clientName');
        const phoneInput = document.getElementById('clientPhone');
        const emailInput = document.getElementById('clientEmail');

        const clientName = nameInput ? nameInput.value.trim() : '';
        const clientPhone = phoneInput ? phoneInput.value.trim() : '';
        const clientEmail = emailInput ? emailInput.value.trim() : '';

        // Validate required fields
        if (!clientName) {
          if (nameInput) {
            nameInput.focus();
            nameInput.reportValidity?.();
          }
          return;
        }
        if (!clientPhone) {
          if (phoneInput) {
            phoneInput.focus();
            phoneInput.reportValidity?.();
          }
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!clientEmail || !emailRegex.test(clientEmail)) {
          if (emailInput) {
            emailInput.focus();
            emailInput.reportValidity?.();
          }
          return;
        }

        const randomNum = Math.floor(100 + Math.random() * 900);
        const bookingCode = `VELA-2026-M${randomNum}`;

        // Populate Confirmation Card
        const confirmCode = document.getElementById('confirmCode');
        const confirmTreatment = document.getElementById('confirmTreatment');
        const confirmArtist = document.getElementById('confirmArtist');
        const confirmDateTime = document.getElementById('confirmDateTime');
        const confirmPrice = document.getElementById('confirmPrice');
        const confirmSummaryText = document.getElementById('confirmSummaryText');

        if (confirmCode) confirmCode.textContent = bookingCode;
        if (confirmTreatment) confirmTreatment.textContent = state.booking.treatmentName;
        if (confirmArtist) confirmArtist.textContent = state.booking.artist || 'Elena Vaneva';
        if (confirmDateTime) confirmDateTime.textContent = `${state.booking.date || 'Dienstag, 24. Nov'} · ${state.booking.timeSlot} Uhr`;
        if (confirmPrice) confirmPrice.textContent = `${state.booking.totalPrice} €`;
        if (confirmSummaryText) {
          confirmSummaryText.textContent = `Liebe/r ${clientName}, dein Termin im Studio Vela wurde verbindlich reserviert. Eine SMS-Bestätigung wurde an ${clientPhone} gesendet.`;
        }

        // Show Confirmation Card, Hide Form
        bookingForm.style.display = 'none';
        bookingForm.setAttribute('hidden', '');
        if (confirmationCard) {
          confirmationCard.removeAttribute('hidden');
          confirmationCard.classList.add('is-active');
          confirmationCard.style.display = 'flex';
          confirmationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    // Reset Booking
    if (resetBookingBtn) {
      resetBookingBtn.addEventListener('click', () => {
        if (bookingForm) {
          bookingForm.reset();
          bookingForm.removeAttribute('hidden');
          bookingForm.style.display = 'flex';
          bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (confirmationCard) {
          confirmationCard.setAttribute('hidden', '');
          confirmationCard.classList.remove('is-active');
          confirmationCard.style.display = 'none';
        }
      });
    }

    // Calendar .ics download simulation
    if (downloadIcsBtn) {
      downloadIcsBtn.addEventListener('click', () => {
        const icsData = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Studio Vela//Nails and Beauty Berlin//DE',
          'BEGIN:VEVENT',
          `SUMMARY:Studio Vela – ${state.booking.treatmentName}`,
          'DESCRIPTION:Termin bei Studio Vela Nails & Beauty in Berlin-Mitte (Linienstraße 139). Tel: +49 888 6661234',
          'LOCATION:Linienstraße 139, 10115 Berlin-Mitte',
          'STATUS:CONFIRMED',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'studio-vela-termin.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  /* ==========================================================================
     7. AFTERCARE ACCORDION
     ========================================================================== */
  function initAccordion() {
    const items = document.querySelectorAll('.accordion-item');

    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const body = item.querySelector('.accordion-body');

      if (header && body) {
        header.addEventListener('click', () => {
          const isActive = item.classList.contains('active');

          // Close all others
          items.forEach(i => {
            i.classList.remove('active');
            const h = i.querySelector('.accordion-header');
            const b = i.querySelector('.accordion-body');
            if (h) h.setAttribute('aria-expanded', 'false');
            if (b) b.setAttribute('hidden', '');
          });

          // Toggle current
          if (!isActive) {
            item.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
            body.removeAttribute('hidden');
          }
        });
      }
    });
  }

  /* ==========================================================================
     8. QUICK INQUIRY FORM & LEGAL MODALS
     ========================================================================== */
  function initInquiryAndLegal() {
    // Quick Inquiry Form
    const inquiryForm = document.getElementById('quickInquiryForm');
    const inquirySuccess = document.getElementById('inquirySuccess');

    if (inquiryForm) {
      inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        inquiryForm.reset();
        if (inquirySuccess) {
          inquirySuccess.removeAttribute('hidden');
          setTimeout(() => {
            inquirySuccess.setAttribute('hidden', '');
          }, 5000);
        }
      });
    }

    // Legal Modal
    const legalModal = document.getElementById('legalModal');
    const legalBackdrop = document.getElementById('legalModalBackdrop');
    const legalClose = document.getElementById('legalModalClose');
    const legalBody = document.getElementById('legalModalBody');
    const btnImpressum = document.getElementById('btnImpressum');
    const btnDatenschutz = document.getElementById('btnDatenschutz');

    function openLegal(contentHtml) {
      if (legalBody) legalBody.innerHTML = contentHtml;
      if (legalModal) {
        legalModal.classList.add('open');
        legalModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeLegal() {
      if (legalModal) {
        legalModal.classList.remove('open');
        legalModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }

    if (btnImpressum) {
      btnImpressum.addEventListener('click', () => {
        openLegal(`
          <h3>Impressum</h3>
          <p><strong>Studio Vela – Nails & Beauty</strong><br>
          Inhaberin: Elena Vaneva (fiktiv)<br>
          Linienstraße 139<br>
          10115 Berlin-Mitte</p>
          <p><strong>Kontakt:</strong><br>
          Telefon: +49 888 6661234<br>
          E-Mail: 12234456789@gmail.com<br>
          Telegram: @rovatt</p>
          <p><strong>Umsatzsteuer-ID:</strong><br>
          Fiktive Angabe gemäß § 27 a UStG: DE 999 888 777</p>
          <p><strong>Hinweis zum Demo-Charakter:</strong><br>
          Dies ist ein fiktives Webdesign-Projekt, gestaltet und entwickelt von Renat. Alle Personen, Angebote, Preise und Kontaktdaten dienen ausschließlich Demonstrationszwecken.</p>
        `);
      });
    }

    if (btnDatenschutz) {
      btnDatenschutz.addEventListener('click', () => {
        openLegal(`
          <h3>Datenschutzerklärung</h3>
          <p><strong>1. Datenschutz auf einen Blick</strong><br>
          Wir nehmen den Schutz deiner persönlichen Daten ernst. Diese Website ist ein Demonstrationsprojekt. Alle übermittelten Formulardaten verbleiben lokal in deinem Browser und werden nicht an einen Server übertragen.</p>
          <p><strong>2. Verantwortliche Stelle:</strong><br>
          Studio Vela – Nails & Beauty<br>
          Linienstraße 139, 10115 Berlin-Mitte<br>
          E-Mail: 12234456789@gmail.com</p>
          <p><strong>3. Deine Rechte:</strong><br>
          Du hast jederzeit das Recht auf unentgeltliche Auskunft über deine gespeicherten personenbezogenen Daten sowie ein Recht auf Berichtigung oder Löschung.</p>
        `);
      });
    }

    if (legalClose) legalClose.addEventListener('click', closeLegal);
    if (legalBackdrop) legalBackdrop.addEventListener('click', closeLegal);
  }

  /* ==========================================================================
     INITIALIZATION ON DOM LOAD
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderAndBanner();
    init3DFlacon();
    initColorDots();
    initGallery();
    initPriceCalculator();
    initTeamAndArtistSelect();
    initBookingFlow();
    initAccordion();
    initInquiryAndLegal();
  });

})();
