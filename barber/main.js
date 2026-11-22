/**
 * STUDIO MAYEN – BARBERSHOP BERLIN-NEUKÖLLN
 * Core JavaScript & 3D WebGL Interactions
 */

(function () {
  'use strict';

  // State Management
  const bookingState = {
    step: 1,
    service: { id: 's1', name: 'Meisterhaarschnitt', price: 38, duration: '45 Min.' },
    barber: { id: 'any', name: 'Beliebiger Barbier' },
    date: null,
    time: null,
    client: { name: '', phone: '', email: '', notes: '' },
    bookingCode: ''
  };

  // Haircuts Data for Before/After Slider
  const haircutsData = {
    1: {
      title: 'Skin Fade & Textured Crop',
      barber: 'Kaan Mayen',
      tech: '0,0 mm Foil Shaver & Razor Edge',
      duration: '45 Minuten',
      product: 'Matte Clay Pomade No. 01',
      desc: 'Hautnaher Übergang von null Millimeter mit sanftem Blend in den oberen Bereich. Das Deckhaar wurde mit japanischer Effilierschere strukturiert für natürlichen Griff ohne Verkleben.',
      beforeImg: 'img/cut1-before.jpg',
      afterImg: 'img/cut1-after.jpg'
    },
    2: {
      title: 'Executive Taper & Bartarchitektur',
      barber: 'Elias Demir',
      tech: 'Medium Low Taper & Freihand-Messerlinien',
      duration: '60 Minuten',
      product: 'Beard Elixir Oil & Styling Balm',
      desc: 'Fließender Übergang an den Schläfen und im Nacken bei vollem Bartvolumen. Die Wangenlinie wurde mit heißer Kompresse und Rasiermesser millimetergenau konturiert.',
      beforeImg: 'img/cut2-before.jpg',
      afterImg: 'img/cut2-after.jpg'
    },
    3: {
      title: 'Classic Pompadour & Razor Fade',
      barber: 'Denis Lindner',
      tech: 'Klassischer Scherenschnitt & High Taper',
      duration: '50 Minuten',
      product: 'Traditionelle Pomade & Haartonikum',
      desc: 'Traditioneller Scheitel mit maximalem Schwung im Vorderkopf. Handgeschmiedete Scheren sorgen für langanhaltenden Sitz auch ohne tägliches Föhnen.',
      beforeImg: 'img/cut3-before.jpg',
      afterImg: 'img/cut3-after.jpg'
    }
  };

  /* ==========================================================================
     1. TOP DEMO BAR & NAVIGATION
     ========================================================================== */
  function initHeaderAndBanner() {
    const demoBar = document.getElementById('demoBar');
    const demoBarClose = document.getElementById('demoBarClose');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Demo bar close
    if (sessionStorage.getItem('mayen_demo_banner_closed') === 'true' && demoBar) {
      demoBar.classList.add('hidden');
    }

    if (demoBarClose) {
      demoBarClose.addEventListener('click', function () {
        if (demoBar) {
          demoBar.classList.add('hidden');
          sessionStorage.setItem('mayen_demo_banner_closed', 'true');
        }
      });
    }

    // Mobile menu toggle
    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener('click', function () {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileMenuBtn.classList.toggle('open');
        mobileMenuBtn.setAttribute('aria-expanded', isOpen);
        mobileDrawer.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      mobileNavLinks.forEach(link => {
        link.addEventListener('click', function () {
          mobileDrawer.classList.remove('open');
          mobileMenuBtn.classList.remove('open');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
          mobileDrawer.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ==========================================================================
     2. 3D BARBER POLE (THREE.JS R128 WITH CSS FALLBACK)
     ========================================================================== */
  function initBarberPole3D() {
    const canvas = document.getElementById('poleCanvas');
    const fallback = document.getElementById('cssPoleFallback');
    const wrapper = document.getElementById('poleWrapper');

    if (!canvas || !wrapper) return;

    // Check WebGL availability
    function isWebGLAvailable() {
      try {
        const testCanvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    }

    if (!window.THREE || !isWebGLAvailable()) {
      canvas.style.display = 'none';
      if (fallback) fallback.style.display = 'flex';
      return;
    }

    let renderer, scene, camera, poleGroup, rotatingCylinder, glassCylinder;
    let animFrameId = null;
    let isVisible = true;
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let rotationVelocity = 0.024;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) rotationVelocity = 0.005;

    try {
      const isMobile = window.innerWidth < 768;
      const width = wrapper.clientWidth || (isMobile ? 280 : 400);
      const height = wrapper.clientHeight || (isMobile ? 340 : 460);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(isMobile ? 38 : 40, width / height, 0.1, 1000);
      camera.position.set(0, 0.05, isMobile ? 8.2 : 7.2);

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // --- Lighting ---
      const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.85);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
      keyLight.position.set(4, 6, 5);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xb08d57, 0.9);
      fillLight.position.set(-4, -2, 3);
      scene.add(fillLight);

      const interiorGlow = new THREE.PointLight(0xfff0d0, 1.2, 8);
      interiorGlow.position.set(0, 0, 0.2);
      scene.add(interiorGlow);

      // --- Geometry & Materials ---
      poleGroup = new THREE.Group();
      scene.add(poleGroup);

      // Procedural Barber Stripes Texture Canvas
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 512;
      texCanvas.height = 512;
      const ctx = texCanvas.getContext('2d');

      ctx.fillStyle = '#EDE8DF';
      ctx.fillRect(0, 0, 512, 512);

      const stripeW = 64;
      const totalStripes = 512 / stripeW;

      for (let i = -totalStripes; i < totalStripes * 2; i++) {
        const x = i * stripeW * 2;

        // Barber Red stripe
        ctx.fillStyle = '#A3201E';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripeW, 0);
        ctx.lineTo(x + stripeW + 512, 512);
        ctx.lineTo(x + 512, 512);
        ctx.closePath();
        ctx.fill();

        // Brass accent border stripe
        ctx.fillStyle = '#B08D57';
        ctx.beginPath();
        ctx.moveTo(x + stripeW, 0);
        ctx.lineTo(x + stripeW + 8, 0);
        ctx.lineTo(x + stripeW + 8 + 512, 512);
        ctx.lineTo(x + stripeW + 512, 512);
        ctx.closePath();
        ctx.fill();

        // Navy blue stripe
        ctx.fillStyle = '#1B2A4A';
        ctx.beginPath();
        ctx.moveTo(x + stripeW + 48, 0);
        ctx.lineTo(x + stripeW + 48 + stripeW, 0);
        ctx.lineTo(x + stripeW + 48 + stripeW + 512, 512);
        ctx.lineTo(x + stripeW + 48 + 512, 512);
        ctx.closePath();
        ctx.fill();
      }

      const poleTexture = new THREE.CanvasTexture(texCanvas);
      poleTexture.wrapS = THREE.RepeatWrapping;
      poleTexture.wrapT = THREE.RepeatWrapping;
      poleTexture.repeat.set(1, 2);

      // 1. Inner Rotating Spiral Cylinder
      const innerGeom = new THREE.CylinderGeometry(0.68, 0.68, 3.2, 36, 1, false);
      const innerMat = new THREE.MeshStandardMaterial({
        map: poleTexture,
        roughness: 0.35,
        metalness: 0.1
      });
      rotatingCylinder = new THREE.Mesh(innerGeom, innerMat);
      poleGroup.add(rotatingCylinder);

      // 2. Outer Glass Cylinder Sleeve
      const glassGeom = new THREE.CylinderGeometry(0.76, 0.76, 3.25, 36, 1, true);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.28,
        roughness: 0.08,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      glassCylinder = new THREE.Mesh(glassGeom, glassMat);
      poleGroup.add(glassCylinder);

      // 3. Brass Metal Mountings (PBR)
      const brassMat = new THREE.MeshStandardMaterial({
        color: 0xB08D57,
        metalness: 0.88,
        roughness: 0.26
      });

      const darkBrassMat = new THREE.MeshStandardMaterial({
        color: 0x6e5229,
        metalness: 0.9,
        roughness: 0.35
      });

      // Top Dome
      const domeGeom = new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const domeMesh = new THREE.Mesh(domeGeom, brassMat);
      domeMesh.position.y = 1.74;
      poleGroup.add(domeMesh);

      // Top Finial Ball & Stem
      const finialGeom = new THREE.SphereGeometry(0.22, 24, 16);
      const finialMesh = new THREE.Mesh(finialGeom, brassMat);
      finialMesh.position.y = 2.65;
      poleGroup.add(finialMesh);

      const stemGeom = new THREE.CylinderGeometry(0.08, 0.14, 0.35, 16);
      const stemMesh = new THREE.Mesh(stemGeom, brassMat);
      stemMesh.position.y = 2.42;
      poleGroup.add(stemMesh);

      // Top & Bottom Collars
      const collarGeom = new THREE.CylinderGeometry(0.84, 0.84, 0.22, 36);
      const topCollar = new THREE.Mesh(collarGeom, brassMat);
      topCollar.position.y = 1.68;
      poleGroup.add(topCollar);

      const botCollar = new THREE.Mesh(collarGeom, brassMat);
      botCollar.position.y = -1.68;
      poleGroup.add(botCollar);

      // Bottom Base Bowl
      const baseBowlGeom = new THREE.SphereGeometry(0.8, 32, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
      const baseBowlMesh = new THREE.Mesh(baseBowlGeom, brassMat);
      baseBowlMesh.position.y = -1.74;
      poleGroup.add(baseBowlMesh);

      // Wall Mount Back Brackets (Industrial Berlin aesthetic)
      const bracketBarGeom = new THREE.BoxGeometry(0.18, 0.18, 1.2);
      const topBracket = new THREE.Mesh(bracketBarGeom, darkBrassMat);
      topBracket.position.set(0, 1.4, -0.9);
      poleGroup.add(topBracket);

      const botBracket = new THREE.Mesh(bracketBarGeom, darkBrassMat);
      botBracket.position.set(0, -1.4, -0.9);
      poleGroup.add(botBracket);

      // Wall Mounting Plate
      const wallPlateGeom = new THREE.BoxGeometry(0.35, 3.6, 0.1);
      const wallPlate = new THREE.Mesh(wallPlateGeom, darkBrassMat);
      wallPlate.position.set(0, 0, -1.5);
      poleGroup.add(wallPlate);

      // Initial rotation angle for best presentation
      poleGroup.rotation.y = -0.3;
      poleGroup.rotation.x = 0.08;

      // Mouse & Touch Interaction
      wrapper.addEventListener('pointerdown', function (e) {
        isDragging = true;
        previousPointerX = e.clientX;
      });

      window.addEventListener('pointermove', function (e) {
        if (isDragging) {
          const deltaX = e.clientX - previousPointerX;
          previousPointerX = e.clientX;
          targetRotationY += deltaX * 0.01;
        } else {
          const rect = wrapper.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          mouseX = (e.clientX - cx) / rect.width;
          mouseY = (e.clientY - cy) / rect.height;
          targetRotationY = mouseX * 0.6;
          targetRotationX = mouseY * 0.3;
        }
      });

      window.addEventListener('pointerup', function () {
        isDragging = false;
      });

      // Keep rendered and observe with generous margin
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animFrameId) {
            renderLoop();
          }
        });
      }, { rootMargin: '300px', threshold: 0 });

      observer.observe(wrapper);

      // Resize listener
      window.addEventListener('resize', () => {
        const newW = wrapper.clientWidth;
        const newH = wrapper.clientHeight;
        if (newW && newH && renderer) {
          const mobile = window.innerWidth < 768;
          camera.aspect = newW / newH;
          camera.fov = mobile ? 38 : 40;
          camera.position.z = mobile ? 8.2 : 7.2;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
          renderer.render(scene, camera);
        }
      });

      // Animation Render Loop
      function renderLoop() {
        if (!isVisible) {
          animFrameId = null;
          return;
        }

        // Rotate inner stripes cylinder
        if (rotatingCylinder) {
          rotatingCylinder.rotation.y += rotationVelocity;
        }

        // Parallax and tilt interpolation
        if (poleGroup) {
          poleGroup.rotation.y += (targetRotationY - poleGroup.rotation.y) * 0.06;
          poleGroup.rotation.x += (targetRotationX - poleGroup.rotation.x) * 0.06;
        }

        renderer.render(scene, camera);
        animFrameId = requestAnimationFrame(renderLoop);
      }

      // Initial synchronous render so canvas is never blank
      renderer.render(scene, camera);
      renderLoop();

    } catch (err) {
      console.warn('Three.js initialization failed, showing fallback', err);
      if (canvas) canvas.style.display = 'none';
      if (fallback) fallback.style.display = 'flex';
    }
  }

  /* ==========================================================================
     3. BEFORE / AFTER INTERACTIVE SLIDER
     ========================================================================== */
  function initBeforeAfterSlider() {
    const slider = document.getElementById('baSlider');
    const afterLayer = document.getElementById('baAfterLayer');
    const handle = document.getElementById('baHandle');
    const tabBtns = document.querySelectorAll('.haircut-tab-btn');

    const beforeImg = document.getElementById('baBeforeImg');
    const afterImg = document.getElementById('baAfterImg');
    const cutTitle = document.getElementById('baCutTitle');
    const cutBarber = document.getElementById('baCutBarber');
    const cutTech = document.getElementById('baCutTech');
    const cutDuration = document.getElementById('baCutDuration');
    const cutProduct = document.getElementById('baCutProduct');
    const cutDesc = document.getElementById('baCutDesc');

    if (!slider || !afterLayer || !handle) return;

    let isSliding = false;
    let currentPercent = 50;

    function updateSliderPosition(percent) {
      currentPercent = Math.max(0, Math.min(100, percent));
      afterLayer.style.width = currentPercent + '%';
      handle.style.left = currentPercent + '%';
      slider.setAttribute('aria-valuenow', Math.round(currentPercent));
    }

    function onPointerMove(e) {
      if (!isSliding) return;
      const rect = slider.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const x = clientX - rect.left;
      const percent = (x / rect.width) * 100;
      updateSliderPosition(percent);
    }

    function onPointerUp() {
      isSliding = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    }

    slider.addEventListener('pointerdown', function (e) {
      isSliding = true;
      onPointerMove(e);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });

    slider.addEventListener('touchstart', function (e) {
      isSliding = true;
      onPointerMove(e);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    }, { passive: true });

    // Keyboard support for accessibility
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateSliderPosition(currentPercent - 5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateSliderPosition(currentPercent + 5);
      }
    });

    // Tab Switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const cutId = this.getAttribute('data-cut');
        const data = haircutsData[cutId];
        if (!data) return;

        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        // Smooth image switch
        if (beforeImg) beforeImg.src = data.beforeImg;
        if (afterImg) afterImg.src = data.afterImg;
        if (cutTitle) cutTitle.textContent = data.title;
        if (cutBarber) cutBarber.textContent = data.barber;
        if (cutTech) cutTech.textContent = data.tech;
        if (cutDuration) cutDuration.textContent = data.duration;
        if (cutProduct) cutProduct.textContent = data.product;
        if (cutDesc) cutDesc.textContent = data.desc;

        // Reset slider to center
        updateSliderPosition(50);
      });
    });
  }

  /* ==========================================================================
     4. SERVICE SELECTION TRIGGERS & 3D BARBER CARDS
     ========================================================================== */
  function initServiceAndBarberTriggers() {
    // Select service from price list
    const serviceButtons = document.querySelectorAll('.btn-select-service');
    serviceButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-service-id');
        const name = this.getAttribute('data-service-name');
        const price = parseInt(this.getAttribute('data-price'), 10);
        const duration = this.getAttribute('data-duration') + ' Min.';

        bookingState.service = { id, name, price, duration };
        updateSummaryPanel();

        // Update step 1 radio selection
        const radio = document.querySelector(`.booking-service-radio[data-id="${id}"]`);
        if (radio) {
          document.querySelectorAll('.booking-service-radio').forEach(r => r.classList.remove('selected'));
          radio.classList.add('selected');
        }

        // Scroll to booking and jump to step 2
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
        goToStep(2);
      });
    });

    // Barber 3D Flip Card tap on mobile
    const flipCards = document.querySelectorAll('.barber-flip-card');
    flipCards.forEach(card => {
      card.addEventListener('click', function (e) {
        // Only flip if not clicking the book button
        if (!e.target.closest('.btn-book-barber')) {
          card.classList.toggle('flipped');
        }
      });
    });

    // Book specific barber button
    const barberButtons = document.querySelectorAll('.btn-book-barber');
    barberButtons.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const barberId = this.getAttribute('data-barber-id');
        const barberName = this.getAttribute('data-barber-name');

        bookingState.barber = { id: barberId, name: barberName };
        updateSummaryPanel();

        // Highlight barber card in step 2
        document.querySelectorAll('.booking-barber-card').forEach(c => {
          c.classList.toggle('selected', c.getAttribute('data-barber-id') === barberId);
        });

        // Scroll to booking and jump to step 3
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
        goToStep(3);
      });
    });
  }

  /* ==========================================================================
     5. ONLINE BOOKING FLOW (4 STEPS + SUMMARY + RECEIPT)
     ========================================================================== */
  function initBookingFlow() {
    const pane1 = document.getElementById('paneStep1');
    const pane2 = document.getElementById('paneStep2');
    const pane3 = document.getElementById('paneStep3');
    const pane4 = document.getElementById('paneStep4');
    const confirmationCard = document.getElementById('bookingConfirmationCard');
    const flowWrapper = document.getElementById('bookingFlowWrapper');

    const ind1 = document.getElementById('stepIndicator1');
    const ind2 = document.getElementById('stepIndicator2');
    const ind3 = document.getElementById('stepIndicator3');
    const ind4 = document.getElementById('stepIndicator4');

    // Step 1: Service radio selection
    const serviceRadios = document.querySelectorAll('.booking-service-radio');
    serviceRadios.forEach(radio => {
      radio.addEventListener('click', function () {
        serviceRadios.forEach(r => r.classList.remove('selected'));
        this.classList.add('selected');

        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = parseInt(this.getAttribute('data-price'), 10);
        const duration = this.getAttribute('data-duration');

        bookingState.service = { id, name, price, duration };
        updateSummaryPanel();
      });
    });

    // Step 2: Barber card selection
    const barberCards = document.querySelectorAll('.booking-barber-card');
    barberCards.forEach(card => {
      card.addEventListener('click', function () {
        barberCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');

        const id = this.getAttribute('data-barber-id');
        const name = this.getAttribute('data-barber-name');

        bookingState.barber = { id, name };
        updateSummaryPanel();
      });
    });

    // Step 3: Populate Dynamic Dates & Slots
    renderBookingDates();

    // Step Navigation Handlers
    document.getElementById('btnNextToBarber')?.addEventListener('click', () => goToStep(2));
    document.getElementById('btnBackToService')?.addEventListener('click', () => goToStep(1));
    document.getElementById('btnNextToDate')?.addEventListener('click', () => goToStep(3));
    document.getElementById('btnBackToBarber')?.addEventListener('click', () => goToStep(2));
    document.getElementById('btnNextToDetails')?.addEventListener('click', () => {
      if (!bookingState.date || !bookingState.time) {
        showToast('Bitte wählen Sie zuerst einen Tag und ein freies Zeitfenster.');
        return;
      }
      goToStep(4);
    });
    document.getElementById('btnBackToDate')?.addEventListener('click', () => goToStep(3));

    // Step 4: Form Submit
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameInput = document.getElementById('bookName');
        const phoneInput = document.getElementById('bookPhone');
        const emailInput = document.getElementById('bookEmail');
        const notesInput = document.getElementById('bookNotes');

        if (!nameInput.value.trim() || !phoneInput.value.trim() || !emailInput.value.trim()) {
          showToast('Bitte füllen Sie alle erforderlichen Kontaktdaten aus.');
          return;
        }

        bookingState.client = {
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          email: emailInput.value.trim(),
          notes: notesInput ? notesInput.value.trim() : ''
        };

        // Generate Booking Confirmation
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        bookingState.bookingCode = 'SM-' + randomNum;

        // Populate receipt
        document.getElementById('confirmCode').textContent = 'Buchungsnummer: ' + bookingState.bookingCode;
        document.getElementById('receiptClient').textContent = bookingState.client.name;
        document.getElementById('receiptService').textContent = `${bookingState.service.name} (${bookingState.service.duration})`;
        document.getElementById('receiptBarber').textContent = bookingState.barber.name;
        document.getElementById('receiptDateTime').textContent = `${bookingState.date.label} · ${bookingState.time} Uhr`;
        document.getElementById('receiptPrice').textContent = bookingState.service.price + ' €';

        // Switch to Confirmation view
        if (flowWrapper) flowWrapper.style.display = 'none';
        if (confirmationCard) confirmationCard.classList.add('active');

        // Scroll to confirmation
        confirmationCard.scrollIntoView({ behavior: 'smooth' });

        showToast('Termin erfolgreich reserviert!');
      });
    }

    // Reset / New Booking Button
    document.getElementById('btnNewBooking')?.addEventListener('click', function () {
      if (flowWrapper) flowWrapper.style.display = '';
      if (confirmationCard) confirmationCard.classList.remove('active');
      goToStep(1);
      bookingForm.reset();
      bookingState.date = null;
      bookingState.time = null;
      updateSummaryPanel();
      renderBookingDates();
    });

    // Download .ics Calendar File
    document.getElementById('btnDownloadIcs')?.addEventListener('click', function () {
      downloadCalendarInvite(bookingState);
    });
  }

  function goToStep(stepNum) {
    bookingState.step = stepNum;

    // Panes
    const panes = [
      document.getElementById('paneStep1'),
      document.getElementById('paneStep2'),
      document.getElementById('paneStep3'),
      document.getElementById('paneStep4')
    ];

    panes.forEach((p, idx) => {
      if (p) p.classList.toggle('active', idx + 1 === stepNum);
    });

    // Indicators
    const indicators = [
      document.getElementById('stepIndicator1'),
      document.getElementById('stepIndicator2'),
      document.getElementById('stepIndicator3'),
      document.getElementById('stepIndicator4')
    ];

    indicators.forEach((ind, idx) => {
      if (!ind) return;
      ind.classList.toggle('active', idx + 1 === stepNum);
      ind.classList.toggle('completed', idx + 1 < stepNum);
    });
  }

  function renderBookingDates() {
    const row = document.getElementById('datePickerRow');
    if (!row) return;
    row.innerHTML = '';

    const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

    const today = new Date();
    let datesList = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayIdx = d.getDay();
      const isSunday = dayIdx === 0;

      let labelDay = weekdays[dayIdx];
      if (i === 0) labelDay = 'Heute';
      else if (i === 1) labelDay = 'Morgen';

      datesList.push({
        dateObj: d,
        dayNum: d.getDate(),
        monthStr: months[d.getMonth()],
        weekdayStr: weekdays[dayIdx],
        label: `${weekdays[dayIdx]}, ${d.getDate()}. ${months[d.getMonth()]}`,
        isClosed: isSunday
      });
    }

    datesList.forEach((dItem, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'date-btn';
      if (dItem.isClosed) {
        btn.classList.add('disabled');
        btn.disabled = true;
        btn.title = 'Sonntags geschlossen';
      }

      btn.innerHTML = `
        <span class="date-day">${dItem.weekdayStr}</span>
        <span class="date-num">${dItem.dayNum}</span>
      `;

      btn.addEventListener('click', function () {
        document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        bookingState.date = dItem;
        renderTimeSlots();
        updateSummaryPanel();
      });

      row.appendChild(btn);

      // Auto-select first available open day
      if (!bookingState.date && !dItem.isClosed) {
        btn.classList.add('selected');
        bookingState.date = dItem;
      }
    });

    renderTimeSlots();
  }

  function renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    // Realistic time slots
    const slots = [
      '10:00', '10:45', '11:30', '12:15',
      '13:30', '14:15', '15:00', '15:45',
      '16:30', '17:15', '18:00', '18:45', '19:15'
    ];

    // Seeded pseudo-random booked slots based on date
    const daySeed = bookingState.date ? bookingState.date.dayNum : 1;

    slots.forEach((timeStr, idx) => {
      const isBooked = (idx * 3 + daySeed) % 5 === 0; // realistic distribution

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot-btn';
      btn.textContent = timeStr + ' Uhr';

      if (isBooked) {
        btn.classList.add('disabled');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          bookingState.time = timeStr;
          updateSummaryPanel();
        });

        // Auto select first open slot if none chosen
        if (!bookingState.time) {
          btn.classList.add('selected');
          bookingState.time = timeStr;
        }
      }

      grid.appendChild(btn);
    });

    updateSummaryPanel();
  }

  function updateSummaryPanel() {
    const sumService = document.getElementById('sumService');
    const sumDuration = document.getElementById('sumDuration');
    const sumBarber = document.getElementById('sumBarber');
    const sumDateTime = document.getElementById('sumDateTime');
    const sumPrice = document.getElementById('sumPrice');

    if (sumService) sumService.textContent = bookingState.service.name;
    if (sumDuration) sumDuration.textContent = bookingState.service.duration;
    if (sumBarber) sumBarber.textContent = bookingState.barber.name;

    if (sumDateTime) {
      if (bookingState.date && bookingState.time) {
        sumDateTime.textContent = `${bookingState.date.label} · ${bookingState.time} Uhr`;
      } else if (bookingState.date) {
        sumDateTime.textContent = `${bookingState.date.label} (Uhrzeit wählen)`;
      } else {
        sumDateTime.textContent = 'Bitte auswählen';
      }
    }

    if (sumPrice) sumPrice.textContent = bookingState.service.price + ' €';
  }

  /* ==========================================================================
     6. CALENDAR (.ICS) EXPORT FILE GENERATOR
     ========================================================================== */
  function downloadCalendarInvite(state) {
    if (!state.date || !state.time) return;

    const pad = n => (n < 10 ? '0' + n : n);
    const d = state.date.dateObj;
    const [hours, minutes] = state.time.split(':').map(Number);

    const startYear = d.getFullYear();
    const startMonth = pad(d.getMonth() + 1);
    const startDay = pad(d.getDate());
    const startHours = pad(hours);
    const startMins = pad(minutes);

    const dur = parseInt(state.service.duration, 10) || 45;
    const endDate = new Date(d);
    endDate.setHours(hours, minutes + dur);

    const endYear = endDate.getFullYear();
    const endMonth = pad(endDate.getMonth() + 1);
    const endDay = pad(endDate.getDate());
    const endHours = pad(endDate.getHours());
    const endMins = pad(endDate.getMinutes());

    const dtStart = `${startYear}${startMonth}${startDay}T${startHours}${startMins}00`;
    const dtEnd = `${endYear}${endMonth}${endDay}T${endHours}${endMins}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Studio Mayen Barbershop Berlin//DE',
      'BEGIN:VEVENT',
      `UID:${state.bookingCode || 'SM-' + Date.now()}@studiomayen.de`,
      `DTSTAMP:${dtStart}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Studio Mayen: ${state.service.name}`,
      `DESCRIPTION:Termin bei ${state.barber.name} (${state.service.duration}, ${state.service.price} EUR). Adresse: Sonnenallee 142, 12059 Berlin-Neukölln. Tel: +49 888 6661234.`,
      'LOCATION:Sonnenallee 142, 12059 Berlin-Neukölln',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Studio_Mayen_Termin_${state.bookingCode || 'SM'}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ==========================================================================
     7. PRODUCT SHELF RESERVATIONS
     ========================================================================== */
  function initProductShelf() {
    // Ensure all product card images are visible immediately
    const prodImages = document.querySelectorAll('.product-img');
    prodImages.forEach(img => {
      if (img.complete) {
        img.style.opacity = '1';
        img.style.visibility = 'visible';
      } else {
        img.addEventListener('load', () => {
          img.style.opacity = '1';
          img.style.visibility = 'visible';
        });
        img.addEventListener('error', () => {
          img.style.opacity = '1';
          img.style.visibility = 'visible';
        });
      }
    });

    const reserveButtons = document.querySelectorAll('.btn-product-reserve');
    reserveButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        const prodName = this.getAttribute('data-product');
        showToast(`${prodName} für Ihren nächsten Besuch zurückgelegt.`);
      });
    });
  }

  /* ==========================================================================
     8. LIVE OPENING HOURS STATUS (GERMAN LOCAL TIME)
     ========================================================================== */
  function initLiveHoursStatus() {
    const pill = document.getElementById('liveStatusPill');
    const text = document.getElementById('liveStatusText');
    const rows = document.querySelectorAll('.hours-row');

    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hour = now.getHours();
    const minute = now.getMinutes();
    const curTime = hour + minute / 60;

    // Highlight current day in table
    rows.forEach(r => {
      const rowDay = parseInt(r.getAttribute('data-day'), 10);
      if (rowDay === day) {
        r.classList.add('today');
        const daySpan = r.querySelector('span:first-child');
        if (daySpan) daySpan.textContent += ' (Heute)';
      }
    });

    if (!pill || !text) return;

    let isOpen = false;
    let closingTime = '';

    if (day >= 1 && day <= 5) {
      // Mon - Fri: 10:00 - 20:00
      if (curTime >= 10 && curTime < 20) {
        isOpen = true;
        closingTime = '20:00 Uhr';
      }
    } else if (day === 6) {
      // Sat: 09:00 - 18:00
      if (curTime >= 9 && curTime < 18) {
        isOpen = true;
        closingTime = '18:00 Uhr';
      }
    }

    if (isOpen) {
      pill.className = 'live-status-pill open';
      text.textContent = `Jetzt geöffnet (bis ${closingTime})`;
    } else {
      pill.className = 'live-status-pill closed';
      let nextOpen = 'morgen 10:00 Uhr';
      if (day === 0) nextOpen = 'Montag 10:00 Uhr';
      else if (day === 6 && curTime >= 18) nextOpen = 'Montag 10:00 Uhr';
      text.textContent = `Jetzt geschlossen (öffnet ${nextOpen})`;
    }
  }

  /* ==========================================================================
     9. TOAST NOTIFICATIONS
     ========================================================================== */
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toastNotice');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4200);
  }

  /* ==========================================================================
     DOCUMENT READY INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderAndBanner();
    initBarberPole3D();
    initBeforeAfterSlider();
    initServiceAndBarberTriggers();
    initBookingFlow();
    initProductShelf();
    initLiveHoursStatus();
  });

})();
