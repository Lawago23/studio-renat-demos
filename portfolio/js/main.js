/**
 * STUDIO RENAT — PORTFOLIO JAVASCRIPT
 * Award-Winning Agency Showcase: Three.js 3D Floating Cards,
 * Smooth Custom Cursor, Magnetic Buttons, Bento Micro-Interactions,
 * Scroll Reveals, Horizontal Process Sequence, FAQ Accordion & In-Page Form Confirmation.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. TOP DISCLAIMER BAR DISMISSAL
     ========================================================================== */
  const disclaimerBar = document.getElementById('disclaimerBar');
  const disclaimerClose = document.getElementById('disclaimerClose');

  if (disclaimerBar && disclaimerClose) {
    if (sessionStorage.getItem('studio_renat_banner_closed') === 'true') {
      disclaimerBar.classList.add('is-hidden');
    }

    disclaimerClose.addEventListener('click', () => {
      disclaimerBar.classList.add('is-hidden');
      sessionStorage.setItem('studio_renat_banner_closed', 'true');
    });
  }

  /* ==========================================================================
     2. HEADER SCROLL STATE & MOBILE DRAWER MENU
     ========================================================================== */
  const siteHeader = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky Header Blur on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader?.classList.add('is-scrolled');
    } else {
      siteHeader?.classList.remove('is-scrolled');
    }
  }, { passive: true });

  // Mobile Drawer Toggle
  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ==========================================================================
     3. SMOOTH CUSTOM CURSOR (DESKTOP)
     ========================================================================== */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    // Smooth Lerp for Outer Ring
    const renderCursor = () => {
      if (isVisible && !prefersReducedMotion) {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
      }
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .case-card, .process-card, .bento-item, .pricing-card, input, select, textarea');
    hoverTargets.forEach(target => {
      target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ==========================================================================
     4. MAGNETIC BUTTONS
     ========================================================================== */
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const magneticBtns = document.querySelectorAll('.magnetic');

    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  /* ==========================================================================
     5. THREE.JS 3D FLOATING CARDS HERO SCENE
     ========================================================================== */
  const initThreeJsHero = () => {
    const container = document.getElementById('hero3dWrapper');
    const canvas = document.getElementById('heroCanvas');
    const fallbackFan = document.getElementById('heroFallbackFan');

    if (!container || !canvas) return;

    // Verify WebGL availability
    const isWebGLAvailable = () => {
      try {
        const testCanvas = document.createElement('canvas');
        return Boolean(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    };

    if (!isWebGLAvailable() || typeof THREE === 'undefined') {
      if (container) container.style.display = 'none';
      fallbackFan?.classList.add('is-active');
      return;
    }

    try {
      // Responsive layout parameters
      const isMobile = () => window.innerWidth <= 900;
      const getLayout = () => {
        if (isMobile()) {
          return {
            cardW: 1.5,
            cardH: 0.95,
            radiusX: 2.5,
            radiusZ: 1.7,
            camY: 0.3,
            camZ: 8.4,
            rotScale: 1.4
          };
        }
        return {
          cardW: 1.85,
          cardH: 1.15,
          radiusX: 3.6,
          radiusZ: 2.5,
          camY: 0.7,
          camZ: 9.6,
          rotScale: 2.2
        };
      };

      const layout = getLayout();

      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(46, container.clientWidth / (container.clientHeight || 1), 0.1, 1000);
      camera.position.set(0, layout.camY, layout.camZ);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);

      // 2. Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const lightMagenta = new THREE.PointLight(0xf72585, 2.8, 30);
      lightMagenta.position.set(6, 4, 8);
      scene.add(lightMagenta);

      const lightViolet = new THREE.PointLight(0x7209b7, 3.2, 30);
      lightViolet.position.set(-6, -3, 6);
      scene.add(lightViolet);

      const lightElectric = new THREE.DirectionalLight(0x4cc9f0, 0.8);
      lightElectric.position.set(0, 8, 4);
      scene.add(lightElectric);

      // 3. 10 Project Card Details
      const projects = [
        { id: 'case-doener', name: 'Döner der Sonne', img: 'img/doener-card.jpg' },
        { id: 'case-pizza', name: 'Pizzeria Pugliese', img: 'img/pizza-card.jpg' },
        { id: 'case-aurum', name: 'AURUM Coffee', img: 'img/aurum-card.jpg' },
        { id: 'case-nami', name: 'NAMI Sushi', img: 'img/nami-card.jpg' },
        { id: 'case-kiku', name: 'KIKU Nudelbar', img: 'img/kiku-card.jpg' },
        { id: 'case-emoshs', name: "Emosh's Late Night", img: 'img/emoshs-card.jpg' },
        { id: 'case-imbiss', name: 'einfach starck', img: 'img/imbiss-card.jpg' },
        { id: 'case-baeckerei', name: 'Bäckerei Eifel', img: 'img/baeckerei-card.jpg' },
        { id: 'case-barber', name: 'Studio Mayen', img: 'img/barber-card.jpg' },
        { id: 'case-vela', name: 'Studio Vela', img: 'img/vela-card.jpg' }
      ];

      const cardsGroup = new THREE.Group();
      scene.add(cardsGroup);

      const textureLoader = new THREE.TextureLoader();
      const cardGeometry = new THREE.PlaneGeometry(layout.cardW, layout.cardH);
      const cardMeshes = [];

      // Card distribution along an elliptical helix
      const totalCards = projects.length;

      projects.forEach((proj, idx) => {
        const texture = textureLoader.load(proj.img);
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.25,
          metalness: 0.15,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(cardGeometry, material);
        mesh.userData = { id: proj.id, name: proj.name, originalScale: 1.0 };

        // Position in ellipse
        const angle = (idx / totalCards) * Math.PI * 2;
        mesh.position.x = Math.sin(angle) * layout.radiusX;
        mesh.position.z = Math.cos(angle) * layout.radiusZ - 1.2;
        mesh.position.y = Math.sin(angle * 2) * 0.7 + (idx % 2 === 0 ? 0.25 : -0.25);

        // Face towards center/camera
        mesh.lookAt(0, mesh.position.y * 0.2, 8);
        mesh.rotation.z = Math.sin(angle) * 0.08;

        cardsGroup.add(mesh);
        cardMeshes.push(mesh);
      });

      // Subtle particle stars in background
      const particleCount = 200;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 35;
        particlePositions[i + 1] = (Math.random() - 0.5) * 20;
        particlePositions[i + 2] = (Math.random() - 0.5) * 15 - 5;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xf72585,
        size: 0.06,
        transparent: true,
        opacity: 0.4
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Mouse Parallax & Interaction
      let targetRotY = 0;
      let targetRotX = 0;
      let isDragging = false;
      let prevMouseX = 0;

      window.addEventListener('mousemove', (e) => {
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotY = normX * 0.35;
        targetRotX = normY * 0.15;
      });

      // Touch drag for mobile
      container.addEventListener('touchstart', (e) => {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
      }, { passive: true });

      container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - prevMouseX;
        cardsGroup.rotation.y += deltaX * 0.006;
        prevMouseX = e.touches[0].clientX;
      }, { passive: true });

      container.addEventListener('touchend', () => { isDragging = false; });

      // Raycasting for Hover & Click
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(-999, -999);
      let hoveredMesh = null;

      window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      });

      // Click on 3D card scrolls to that case card
      canvas.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cardMeshes);
        if (intersects.length > 0) {
          const targetId = intersects[0].object.userData.id;
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.classList.add('is-revealed');
          }
        }
      });

      // Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // Auto slow orbit rotation
        if (!prefersReducedMotion && !isDragging) {
          cardsGroup.rotation.y += delta * 0.12;
        }

        // Camera smooth lerp
        const curLayout = getLayout();
        camera.position.x += (targetRotY * curLayout.rotScale - camera.position.x) * 0.05;
        camera.position.y += (curLayout.camY + targetRotX * 1.2 - camera.position.y) * 0.05;
        camera.position.z += (curLayout.camZ - camera.position.z) * 0.05;
        camera.lookAt(0, 0, 0);

        // Raycast Hover Check
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cardMeshes);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hoveredMesh !== hit) {
            if (hoveredMesh) hoveredMesh.scale.set(1, 1, 1);
            hoveredMesh = hit;
            canvas.style.cursor = 'pointer';
          }
          hit.scale.lerp(new THREE.Vector3(1.14, 1.14, 1.14), 0.15);
        } else {
          if (hoveredMesh) {
            hoveredMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
            if (hoveredMesh.scale.x < 1.01) hoveredMesh = null;
          }
          canvas.style.cursor = 'default';
        }

        // Slow particles drift
        particles.rotation.y += delta * 0.02;

        renderer.render(scene, camera);
      };

      animate();

      // Window Resize Listener
      window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);

        const newLayout = getLayout();
        cardMeshes.forEach((mesh, idx) => {
          const angle = (idx / totalCards) * Math.PI * 2;
          mesh.position.x = Math.sin(angle) * newLayout.radiusX;
          mesh.position.z = Math.cos(angle) * newLayout.radiusZ - 1.2;
          mesh.position.y = Math.sin(angle * 2) * 0.7 + (idx % 2 === 0 ? 0.25 : -0.25);
        });
      });

    } catch (err) {
      console.warn('Three.js initialization failed, switching to CSS 3D fallback:', err);
      if (container) container.style.display = 'none';
      fallbackFan?.classList.add('is-active');
    }
  };

  initThreeJsHero();

  /* ==========================================================================
     6. FILTER TABS FOR SELECTED WORK
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const caseCards = document.querySelectorAll('.case-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update active tab button state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter project case cards
      caseCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('is-filtered-out');
        } else {
          card.classList.add('is-filtered-out');
        }
      });
    });
  });

  /* ==========================================================================
     7. SCROLL CLIP-PATH REVEAL FOR CASE CARDS
     ========================================================================== */
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.12
    });

    document.querySelectorAll('.reveal-wipe').forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal-wipe').forEach(el => el.classList.add('is-revealed'));
  }

  /* ==========================================================================
     8. PROCESS SECTION — DESKTOP PINNED HORIZONTAL SEQUENCE
     ========================================================================== */
  const processViewport = document.getElementById('processViewport');
  const processTrack = document.getElementById('processTrack');

  const updateProcessHorizontalScroll = () => {
    if (!processViewport || !processTrack) return;

    // Only apply horizontal scroll on wide desktop screens
    if (window.innerWidth >= 1100 && !prefersReducedMotion) {
      const rect = processViewport.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Calculate progress when section is in view
      if (rect.top <= 100 && rect.bottom >= 0) {
        const totalScrollable = rect.height - viewportHeight;
        const currentScroll = Math.max(0, -rect.top + 100);
        const progress = Math.min(1, Math.max(0, currentScroll / (totalScrollable || 1)));

        // Translate track slightly for rich pinned horizontal feel
        const maxShift = (processTrack.scrollWidth - processTrack.clientWidth) * 0.6;
        processTrack.style.transform = `translateX(-${progress * maxShift}px)`;
      } else {
        processTrack.style.transform = 'translateX(0px)';
      }
    } else {
      processTrack.style.transform = 'translateX(0px)';
    }
  };

  window.addEventListener('scroll', updateProcessHorizontalScroll, { passive: true });
  window.addEventListener('resize', updateProcessHorizontalScroll);

  /* ==========================================================================
     9. FAQ ACCORDION
     ========================================================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('is-active');

      // Close all other accordion items
      faqItems.forEach(other => {
        other.classList.remove('is-active');
        other.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked item
      if (!isActive) {
        item.classList.add('is-active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================================
     10. PRE-SELECT PRICING PACKAGE IN CONTACT FORM
     ========================================================================== */
  const pricingPackageButtons = document.querySelectorAll('.pricing-action a');
  const packageSelect = document.getElementById('formPackage');

  pricingPackageButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pkgText = btn.getAttribute('data-package') || '';
      if (packageSelect) {
        if (pkgText.includes('Start')) packageSelect.value = 'start';
        else if (pkgText.includes('Business')) packageSelect.value = 'business';
        else if (pkgText.includes('Premium')) packageSelect.value = 'premium';
      }
    });
  });

  /* ==========================================================================
     11. CONTACT FORM WITH IN-PAGE CONFIRMATION
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  const resetFormBtn = document.getElementById('resetFormBtn');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('formName');
      const bizInput = document.getElementById('formBusiness');
      const emailInput = document.getElementById('formEmail');

      let isValid = true;

      // Validation
      if (!nameInput.value.trim()) {
        nameInput.closest('.form-group')?.classList.add('has-error');
        isValid = false;
      } else {
        nameInput.closest('.form-group')?.classList.remove('has-error');
      }

      if (!bizInput.value.trim()) {
        bizInput.closest('.form-group')?.classList.add('has-error');
        isValid = false;
      } else {
        bizInput.closest('.form-group')?.classList.remove('has-error');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.closest('.form-group')?.classList.add('has-error');
        isValid = false;
      } else {
        emailInput.closest('.form-group')?.classList.remove('has-error');
      }

      if (!isValid) return;

      // Simulate sending with loading spinner
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Wird gesendet...</span>`;
      }

      setTimeout(() => {
        contactForm.style.display = 'none';
        formSuccess.classList.add('is-visible');
        formSuccess.setAttribute('aria-hidden', 'false');
      }, 700);
    });

    // Reset button to allow submitting another message
    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        contactForm.reset();
        contactForm.style.display = 'flex';
        formSuccess.classList.remove('is-visible');
        formSuccess.setAttribute('aria-hidden', 'true');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Anfrage unverbindlich senden</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          `;
        }
      });
    }
  }

});
