/**
 * AURUM – Kaffeerösterei & Café (Berlin-Mitte, Torstraße)
 * Premium One-Page Interaction Script
 * 
 * Features:
 * 1. Three.js 3D Coffee Bean with rising steam particles & interactive drag
 * 2. "Vom Feld in die Tasse" scroll-driven horizontal journey (Äthiopien -> Röster -> Tasse)
 * 3. Interactive Specialty Coffee Flavor Wheel (SVG segment selection)
 * 4. Coffee menu filtering by brewing method (SVG icons, no emoji)
 * 5. Specialty bean shop with grind selector & functional mini cart drawer
 * 6. Cupping workshop booking with live pricing & in-page confirmation
 * 7. Live opening status calculator for Berlin-Mitte & contact form
 * 8. Demo announcement banner dismissal & responsive drawer menu
 */

document.addEventListener('DOMContentLoaded', () => {
  initDemoBanner();
  initMobileDrawer();
  initThreeBeanCanvas();
  initJourneyTrack();
  initFlavorWheel();
  initMenuTabs();
  initShopAndCart();
  initWorkshopBooking();
  initLiveHoursAndContact();
  initLegalModals();
});

/* ==========================================================================
   1. Demo Banner Dismissal
   ========================================================================== */
function initDemoBanner() {
  const banner = document.getElementById('demo-banner');
  const closeBtn = document.getElementById('demo-banner-close');
  if (!banner || !closeBtn) return;

  if (sessionStorage.getItem('aurum_demo_banner_dismissed') === 'true') {
    banner.classList.add('hidden');
  }

  closeBtn.addEventListener('click', () => {
    banner.classList.add('hidden');
    sessionStorage.setItem('aurum_demo_banner_dismissed', 'true');
  });
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function initMobileDrawer() {
  const openBtn = document.getElementById('btn-mobile-open');
  const closeBtn = document.getElementById('btn-mobile-close');
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!drawer || !openBtn) return;

  function openMenu() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    openBtn.classList.add('open');
  }

  function closeMenu() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
    openBtn.classList.remove('open');
  }

  openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMenu();
    }
  });

  // Header scroll shadow
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }
}

/* ==========================================================================
   3. Three.js 3D Roasted Coffee Bean with Rising Steam Particles
   ========================================================================== */
function isWebGLSupported() {
  try {
    const testCanvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function initThreeBeanCanvas() {
  const stage = document.getElementById('hero-visual-stage');
  const container = document.getElementById('three-bean-container');
  const hint = document.getElementById('canvas-hint');
  const steamFallback = document.getElementById('hero-steam-fallback');

  function activateFallback() {
    if (stage) {
      stage.classList.remove('webgl-active');
      stage.classList.add('webgl-failed');
    }
    if (container) container.style.display = 'none';
    if (hint) hint.style.display = 'none';
    if (steamFallback) steamFallback.style.display = 'flex';
  }

  // Gracefully fall back if Three.js or WebGL is not available
  if (!container || typeof THREE === 'undefined' || !isWebGLSupported()) {
    activateFallback();
    return;
  }

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let scene, camera, renderer, beanMesh, steamParticles;
  let isVisible = true;
  let isDragging = false;
  let previousMouseX = 0;
  let previousMouseY = 0;
  let targetRotationX = 0.25;
  let targetRotationY = 0.45;
  let currentRotationX = 0.25;
  let currentRotationY = 0.45;
  let rotVelocityX = 0;
  let rotVelocityY = 0;

  try {
    const width = container.clientWidth || 440;
    const height = container.clientHeight || 440;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.6);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Lights ---
    // Soft warm ambient light
    const ambientLight = new THREE.AmbientLight(0xfff6ec, 0.85);
    scene.add(ambientLight);

    // Key light (warm golden roastery sun)
    const keyLight = new THREE.DirectionalLight(0xffeed6, 1.4);
    keyLight.position.set(3, 4, 3.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Rim light (cool sage crema highlight from behind)
    const rimLight = new THREE.DirectionalLight(0xe8d3b0, 0.9);
    rimLight.position.set(-3.5, 2, -2.5);
    scene.add(rimLight);

    // Bottom bounce light
    const bounceLight = new THREE.DirectionalLight(0x8fa58a, 0.4);
    bounceLight.position.set(0, -3, 1);
    scene.add(bounceLight);

    // --- Procedural Coffee Bean Geometry ---
    // A coffee bean is an ellipsoid with a longitudinal indentation (crease) on the front face
    const sphereGeo = new THREE.SphereGeometry(1.25, 64, 48);
    const pos = sphereGeo.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      vertex.fromBufferAttribute(pos, i);

      // Scale to bean proportions (slightly flatter along Z, elongated along Y)
      let x = vertex.x * 0.92;
      let y = vertex.y * 1.35;
      let z = vertex.z * 0.76;

      // Add characteristic bean curvature and tapering towards the tips
      const yNorm = Math.abs(y / 1.35);
      const taper = 1.0 - 0.22 * (yNorm * yNorm);
      x *= taper;
      z *= taper;

      // The signature longitudinal fissure/cleft on the front face (z > 0)
      if (z > 0) {
        // Deep groove down the center (x ~ 0)
        const cleftWidth = 18.0;
        const cleftDepth = 0.44 * (1.0 - Math.min(1.0, yNorm * 0.85));
        const cleft = Math.exp(-cleftWidth * (x * x)) * cleftDepth;

        // Slight natural curve / wiggle in the fissure line
        const wiggle = Math.sin(y * 2.5) * 0.04;
        const cleftWiggle = Math.exp(-cleftWidth * Math.pow(x - wiggle, 2)) * cleftDepth;

        z -= cleftWiggle;
      } else {
        // Rounded convex back with subtle roasted contour
        z *= 1.08;
      }

      // Subtle organic surface roughness
      const noise = (Math.sin(x * 8.0) * Math.cos(y * 8.0) * 0.015);
      x += noise;
      y += noise;
      z += noise;

      pos.setXYZ(i, x, y, z);
    }
    sphereGeo.computeVertexNormals();

    // Material: rich roasted specialty brown with satin oil sheen
    const beanMat = new THREE.MeshStandardMaterial({
      color: 0x3b2418,
      roughness: 0.38,
      metalness: 0.08,
      bumpScale: 0.02
    });

    beanMesh = new THREE.Mesh(sphereGeo, beanMat);
    beanMesh.rotation.set(0.3, 0.4, -0.15);
    scene.add(beanMesh);

    // --- Rising Steam / Aroma Particles ---
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleOffsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Spawn near bottom of the bean, floating upward
      particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 1.8;
      particlePositions[i * 3 + 1] = -1.6 + Math.random() * 3.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 1.4;

      particleSpeeds[i] = 0.006 + Math.random() * 0.01;
      particleOffsets[i] = Math.random() * Math.PI * 2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle texture (soft circular glow)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(232, 211, 176, 0.7)');
    grad.addColorStop(0.4, 'rgba(232, 211, 176, 0.25)');
    grad.addColorStop(1, 'rgba(232, 211, 176, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    steamParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(steamParticles);

    // --- Mouse & Touch Drag Controls ---
    function onPointerDown(e) {
      isDragging = true;
      previousMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      previousMouseY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      rotVelocityX = 0;
      rotVelocityY = 0;
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const deltaX = clientX - previousMouseX;
      const deltaY = clientY - previousMouseY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      rotVelocityX = deltaY * 0.005;
      rotVelocityY = deltaX * 0.005;

      previousMouseX = clientX;
      previousMouseY = clientY;
    }

    function onPointerUp() {
      isDragging = false;
    }

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Resize Handler
    function onResize() {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 440;
      const h = container.clientHeight || 440;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    // IntersectionObserver to pause rendering when out of viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    observer.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate Bean
      if (!prefersReducedMotion) {
        if (!isDragging) {
          // Slow steady artisanal rotation
          targetRotationY += 0.004;
          // Apply residual inertia
          targetRotationX += rotVelocityX;
          targetRotationY += rotVelocityY;
          rotVelocityX *= 0.94;
          rotVelocityY *= 0.94;
        }

        // Smooth damping interpolation
        currentRotationX += (targetRotationX - currentRotationX) * 0.08;
        currentRotationY += (targetRotationY - currentRotationY) * 0.08;

        beanMesh.rotation.x = currentRotationX;
        beanMesh.rotation.y = currentRotationY;

        // Subtle floating bobbing
        beanMesh.position.y = Math.sin(time * 1.5) * 0.08;

        // Animate rising steam particles
        if (steamParticles) {
          const positions = steamParticles.geometry.attributes.position.array;
          for (let i = 0; i < particleCount; i++) {
            // Rise along Y
            positions[i * 3 + 1] += particleSpeeds[i];

            // Gentle spiral sway
            positions[i * 3 + 0] += Math.sin(time * 2.0 + particleOffsets[i]) * 0.003;
            positions[i * 3 + 2] += Math.cos(time * 1.8 + particleOffsets[i]) * 0.003;

            // Loop back to bottom when rising past top
            if (positions[i * 3 + 1] > 2.2) {
              positions[i * 3 + 1] = -1.6;
              positions[i * 3 + 0] = (Math.random() - 0.5) * 1.2;
              positions[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
            }
          }
          steamParticles.geometry.attributes.position.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    if (stage) stage.classList.add('webgl-active');
    if (steamFallback) steamFallback.style.display = 'none';

  } catch (err) {
    activateFallback();
  }
}

/* ==========================================================================
   4. "Vom Feld in die Tasse" (Scroll-Driven Sideways Journey)
   ========================================================================== */
function initJourneyTrack() {
  const trackWrapper = document.getElementById('journey-track-wrapper');
  const cards = document.querySelectorAll('.journey-card');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const btnPrev = document.getElementById('journey-btn-prev');
  const btnNext = document.getElementById('journey-btn-next');

  if (!trackWrapper || cards.length === 0) return;

  let activeIndex = 0;

  function scrollToCard(index) {
    if (index < 0 || index >= cards.length) return;
    activeIndex = index;
    const targetCard = cards[index];
    trackWrapper.scrollTo({
      left: targetCard.offsetLeft - trackWrapper.offsetLeft,
      behavior: 'smooth'
    });
    updateIndicators(index);
  }

  function updateIndicators(index) {
    stepIndicators.forEach((ind, i) => {
      if (i === index) {
        ind.classList.add('active');
      } else {
        ind.classList.remove('active');
      }
    });
  }

  // Indicator click
  stepIndicators.forEach(ind => {
    ind.addEventListener('click', () => {
      const stepIdx = parseInt(ind.getAttribute('data-step') || '0', 10);
      scrollToCard(stepIdx);
    });
  });

  // Buttons
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      scrollToCard(Math.max(0, activeIndex - 1));
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      scrollToCard(Math.min(cards.length - 1, activeIndex + 1));
    });
  }

  // Scroll listener on wrapper
  let scrollTimeout;
  trackWrapper.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPos = trackWrapper.scrollLeft;
      cards.forEach((card, idx) => {
        const cardLeft = card.offsetLeft - trackWrapper.offsetLeft;
        if (Math.abs(scrollPos - cardLeft) < card.offsetWidth / 2) {
          activeIndex = idx;
          updateIndicators(idx);
        }
      });
    }, 60);
  }, { passive: true });
}

/* ==========================================================================
   5. Interactive Specialty Coffee Flavor Wheel (SVG)
   ========================================================================== */
const FLAVOR_DATA = {
  guji: {
    note: 'Jasmin & Bergamotte',
    family: 'Blumig & Zitrisch',
    coffee: 'AURUM No. 1: Guji Highland',
    origin: 'Äthiopien · Yirgacheffe Region (2.150 m ü. M.)',
    process: 'Gewaschen (Washed) · 100% Heirloom',
    desc: 'Hochelegante florale Noten von weißem Jasmin und getrockneter Bergamotte. Im Abgang feine Nuancen von sonnengereiftem Pfirsich und kühlem Schwarztee.',
    saeure: '85%',
    koerper: '45%',
    suesse: '78%',
    roestung: 'Hell (Filter Roast)',
    price: '14,50 €',
    targetShopId: 'guji'
  },
  yirgacheffe: {
    note: 'Blaubeere & Steinobst',
    family: 'Fruchtig & Frisch',
    coffee: 'AURUM No. 1: Guji Highland',
    origin: 'Äthiopien · Guji Hochland (2.100 m ü. M.)',
    process: 'Anaerobic Natural · Heirloom',
    desc: 'Explosive Fruchtigkeit reifer Waldblaubeeren und saftiger Weinbergpfirsiche mit samtigem, weinartigem Mundgefühl und natürlicher Süße.',
    saeure: '80%',
    koerper: '55%',
    suesse: '88%',
    roestung: 'Hell (Filter Roast)',
    price: '14,50 €',
    targetShopId: 'guji'
  },
  colombia: {
    note: 'Dunkle Schokolade & Feige',
    family: 'Schokolade & Würze',
    coffee: 'AURUM No. 2: Finca La Esperanza',
    origin: 'Kolumbien · Huila / Pitalito (1.850 m ü. M.)',
    process: 'Honey Process · Castillo & Caturra',
    desc: 'Intensive Noten edler 75% Zartbitterschokolade, getrockneter Bergfeige und gebrannter Haselnuss mit seidigem, vollmundigem Körper.',
    saeure: '48%',
    koerper: '82%',
    suesse: '85%',
    roestung: 'Medium (Omni Roast)',
    price: '13,80 €',
    targetShopId: 'colombia'
  },
  torstrasse: {
    note: 'Gebrannte Mandel & Toffee',
    family: 'Süß & Vollmundig',
    coffee: 'AURUM No. 3: Torstraße Espresso Blend',
    origin: 'Brasilien Fazenda Rainha & Äthiopien Sidama',
    process: 'Pulped Natural & Washed',
    desc: 'Unser beliebter Signature Espresso an der Torstraße. Dichte Crema, Nuancen von karamellisiertem Toffee, süßer Mandel und feiner Kakaonote.',
    saeure: '35%',
    koerper: '90%',
    suesse: '82%',
    roestung: 'Medium-Dark (Espresso Roast)',
    price: '12,90 €',
    targetShopId: 'torstrasse'
  },
  rwanda: {
    note: 'Roter Apfel & Pflaume',
    family: 'Fruchtig & Frisch',
    coffee: 'AURUM Special: Nyamasheke Lot',
    origin: 'Ruanda · Kivu-See Terrassen (1.900 m ü. M.)',
    process: 'Fully Washed · Red Bourbon',
    desc: 'Knackige Frische von rotem Boskoop-Apfel, dunklen Pflaumen und feinstem Rohrzucker. Ausgezeichnete Klarheit in der V60-Extraktion.',
    saeure: '75%',
    koerper: '60%',
    suesse: '80%',
    roestung: 'Hell (Filter Roast)',
    price: '15,20 €',
    targetShopId: 'guji'
  },
  brazil: {
    note: 'Karamell & Rohrzucker',
    family: 'Süß & Schokoladig',
    coffee: 'AURUM No. 3: Torstraße Espresso Blend',
    origin: 'Brasilien · Minas Gerais (1.250 m ü. M.)',
    process: 'Natural Pulped · Yellow Bourbon',
    desc: 'Sehr geringe Säure, enorme Süße von braunem Demerara-Zucker und geschmolzener Milchschokolade. Perfekt für samtige Flat Whites.',
    saeure: '28%',
    koerper: '88%',
    suesse: '92%',
    roestung: 'Medium-Dark (Espresso Roast)',
    price: '12,90 €',
    targetShopId: 'torstrasse'
  },
  sumatra: {
    note: 'Kardamom & Zedernholz',
    family: 'Würzig & Tief',
    coffee: 'AURUM No. 2: Finca La Esperanza',
    origin: 'Kolumbien & Sumatra Micro-Lot',
    process: 'Wet-Hulled & Anaerobic',
    desc: 'Würzige Facetten orientalischer Gewürze, schwarzem Kardamom und frischem Zedernholz. Ein tiefgründiger Kaffee für Siebträger-Liebhaber.',
    saeure: '32%',
    koerper: '92%',
    suesse: '68%',
    roestung: 'Medium (Omni Roast)',
    price: '13,80 €',
    targetShopId: 'colombia'
  },
  kenya: {
    note: 'Zitrusblüte & Aprikose',
    family: 'Blumig & Zitrisch',
    coffee: 'AURUM No. 1: Guji Highland',
    origin: 'Kenia & Äthiopien Highland Highlands',
    process: 'Double Washed · SL28 & Heirloom',
    desc: 'Prickelnde Noten frischer Limettenblüte, reifer Aprikose und schwarzer Johannisbeere. Komplex, saftig und erfrischend als Batch Brew.',
    saeure: '90%',
    koerper: '52%',
    suesse: '75%',
    roestung: 'Hell (Filter Roast)',
    price: '14,50 €',
    targetShopId: 'guji'
  }
};

function initFlavorWheel() {
  const segments = document.querySelectorAll('.wheel-segment');
  const badgeNote = document.getElementById('active-note-badge');
  const badgeFamily = document.getElementById('active-family-lbl');
  const coffeeTitle = document.getElementById('matched-coffee-title');
  const coffeeOrigin = document.getElementById('matched-coffee-origin');
  const coffeeDesc = document.getElementById('matched-coffee-desc');
  const barSaeure = document.getElementById('bar-saeure');
  const barKoerper = document.getElementById('bar-koerper');
  const barSuesse = document.getElementById('bar-suesse');
  const barRoestung = document.getElementById('bar-roestung');
  const coffeePrice = document.getElementById('matched-coffee-price');
  const btnAddToCartFromWheel = document.getElementById('btn-add-from-wheel');

  if (segments.length === 0 || !coffeeTitle) return;

  let currentKey = 'guji';

  function setFlavor(key) {
    const data = FLAVOR_DATA[key];
    if (!data) return;
    currentKey = key;

    // Update SVG active state
    segments.forEach(seg => {
      if (seg.getAttribute('data-note') === key) {
        seg.classList.add('active');
      } else {
        seg.classList.remove('active');
      }
    });

    // Animate details
    if (badgeNote) badgeNote.textContent = data.note;
    if (badgeFamily) badgeFamily.textContent = data.family;
    if (coffeeTitle) coffeeTitle.textContent = data.coffee;
    if (coffeeOrigin) coffeeOrigin.textContent = data.origin + ' · ' + data.process;
    if (coffeeDesc) coffeeDesc.textContent = data.desc;
    if (coffeePrice) coffeePrice.textContent = data.price;

    if (barSaeure) barSaeure.style.width = data.saeure;
    if (barKoerper) barKoerper.style.width = data.koerper;
    if (barSuesse) barSuesse.style.width = data.suesse;
    if (barRoestung) barRoestung.textContent = data.roestung;
  }

  segments.forEach(seg => {
    seg.addEventListener('click', () => {
      const noteKey = seg.getAttribute('data-note');
      if (noteKey) setFlavor(noteKey);
    });

    seg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const noteKey = seg.getAttribute('data-note');
        if (noteKey) setFlavor(noteKey);
      }
    });
  });

  // Direct Add to Cart from Wheel
  if (btnAddToCartFromWheel) {
    btnAddToCartFromWheel.addEventListener('click', () => {
      const data = FLAVOR_DATA[currentKey];
      if (data) {
        addToCart({
          id: data.targetShopId,
          name: data.coffee,
          grind: 'Ganze Bohne',
          weight: '250g',
          price: parseFloat(data.price.replace(',', '.')),
          img: `assets/img/bag-${data.targetShopId}.jpg`
        });
      }
    });
  }

  // Set initial state
  setFlavor('guji');
}

/* ==========================================================================
   6. Coffee Menu Category Filtering (SVG Icons)
   ========================================================================== */
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab-btn');
  const items = document.querySelectorAll('.menu-item-card');

  if (tabs.length === 0 || items.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter') || 'all';

      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category') || '';
        if (filter === 'all' || itemCategory.includes(filter)) {
          item.style.display = 'flex';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 20);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 180);
        }
      });
    });
  });
}

/* ==========================================================================
   7. Shop & Mini Cart Drawer
   ========================================================================== */
let cartState = [];

function initShopAndCart() {
  const productCards = document.querySelectorAll('.product-card');
  const cartToggleBtn = document.getElementById('btn-cart-toggle');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartCloseBtn = document.getElementById('cart-drawer-close');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartCountBadges = document.querySelectorAll('.cart-count');
  const cartTotalVal = document.getElementById('cart-total-val');
  const shippingMeterText = document.getElementById('shipping-meter-text');
  const shippingBarFill = document.getElementById('shipping-bar-fill');
  const promoInput = document.getElementById('cart-promo-input');
  const promoBtn = document.getElementById('cart-promo-btn');
  const promoFeedback = document.getElementById('cart-promo-feedback');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  // Handle Product Cards (Grind, Weight & Add to Cart)
  productCards.forEach(card => {
    const productId = card.getAttribute('data-product-id');
    const basePrice250 = parseFloat(card.getAttribute('data-price-250') || '14.50');
    const basePrice1000 = parseFloat(card.getAttribute('data-price-1000') || '52.00');
    const priceDisplay = card.querySelector('.product-price-display');
    const grindBtns = card.querySelectorAll('.grind-btn');
    const weightBtns = card.querySelectorAll('.weight-btn');
    const addBtn = card.querySelector('.btn-add-cart');
    const productImg = card.querySelector('.product-img');
    const titleEl = card.querySelector('.product-title');

    let selectedGrind = 'Ganze Bohne';
    let selectedWeight = '250g';
    let currentPrice = basePrice250;

    // Grind selection
    grindBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        grindBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGrind = btn.getAttribute('data-grind') || 'Ganze Bohne';
      });
    });

    // Weight selection
    weightBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        weightBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedWeight = btn.getAttribute('data-weight') || '250g';

        if (selectedWeight === '1000g') {
          currentPrice = basePrice1000;
        } else {
          currentPrice = basePrice250;
        }

        if (priceDisplay) {
          priceDisplay.textContent = currentPrice.toFixed(2).replace('.', ',') + ' €';
        }
      });
    });

    // Add to cart click
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const item = {
          id: `${productId}-${selectedWeight}-${selectedGrind}`,
          productId: productId,
          name: titleEl ? titleEl.textContent.trim() : 'AURUM Kaffeebohnen',
          grind: selectedGrind,
          weight: selectedWeight,
          price: currentPrice,
          img: productImg ? productImg.getAttribute('src') : 'assets/img/bag-guji.jpg'
        };

        addToCart(item);

        // Micro-interaction on button
        const originalText = addBtn.innerHTML;
        addBtn.classList.add('added');
        addBtn.innerHTML = '<span>Hinzugef&uuml;gt</span>';
        setTimeout(() => {
          addBtn.classList.remove('added');
          addBtn.innerHTML = originalText;
        }, 1200);
      });
    }
  });

  // Drawer Toggle
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);

  // Promo Code
  let discountMultiplier = 1.0;
  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'MITTE10' || code === 'TORSTRASSE10') {
        discountMultiplier = 0.9;
        if (promoFeedback) {
          promoFeedback.textContent = 'Gutschein MITTE10 angewendet: 10% Rabatt!';
          promoFeedback.style.color = '#5C7557';
        }
        renderCart();
      } else {
        if (promoFeedback) {
          promoFeedback.textContent = 'Ungültiger Code. Teste: MITTE10';
          promoFeedback.style.color = '#C8452D';
        }
      }
    });
  }

  // Checkout modal
  const orderModal = document.getElementById('order-modal');
  const orderModalClose = document.getElementById('order-modal-close');
  const orderModalSummary = document.getElementById('order-modal-summary');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cartState.length === 0) return;
      closeCart();

      // Populate confirmation modal
      if (orderModalSummary) {
        let summaryHtml = '';
        cartState.forEach(it => {
          summaryHtml += `<div><strong>${it.qty}x</strong> ${it.name} (${it.weight}, ${it.grind}) – ${(it.price * it.qty).toFixed(2).replace('.', ',')} €</div>`;
        });
        const finalTotal = (calculateSubtotal() * discountMultiplier).toFixed(2).replace('.', ',');
        summaryHtml += `<div style="margin-top: 8px; font-weight: 700; border-top: 1px solid rgba(59,36,24,0.15); padding-top: 8px;">Gesamtbetrag: ${finalTotal} €</div>`;
        orderModalSummary.innerHTML = summaryHtml;
      }

      if (orderModal) orderModal.classList.add('open');

      // Reset cart state
      cartState = [];
      discountMultiplier = 1.0;
      if (promoInput) promoInput.value = '';
      if (promoFeedback) promoFeedback.textContent = '';
      renderCart();
    });
  }

  if (orderModalClose && orderModal) {
    orderModalClose.addEventListener('click', () => {
      orderModal.classList.remove('open');
    });
  }
}

function addToCart(item) {
  const existing = cartState.find(it => it.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cartState.push({ ...item, qty: 1 });
  }
  renderCart();

  // Bumping cart badge
  const badges = document.querySelectorAll('.cart-count');
  badges.forEach(b => {
    b.classList.remove('bump');
    void b.offsetWidth;
    b.classList.add('bump');
  });

  // Open drawer automatically
  const cartDrawer = document.getElementById('cart-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  if (cartDrawer) cartDrawer.classList.add('open');
  if (drawerBackdrop) drawerBackdrop.classList.add('open');
}

function calculateSubtotal() {
  return cartState.reduce((acc, it) => acc + (it.price * it.qty), 0);
}

function renderCart() {
  const cartItemsList = document.getElementById('cart-items-list');
  const cartCountBadges = document.querySelectorAll('.cart-count');
  const cartTotalVal = document.getElementById('cart-total-val');
  const shippingMeterText = document.getElementById('shipping-meter-text');
  const shippingBarFill = document.getElementById('shipping-bar-fill');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  // Total item count
  const totalQty = cartState.reduce((acc, it) => acc + it.qty, 0);
  cartCountBadges.forEach(b => b.textContent = totalQty);

  // Subtotal
  const subtotal = calculateSubtotal();
  if (cartTotalVal) {
    cartTotalVal.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
  }

  // Free shipping meter (Threshold 45 €)
  const freeThreshold = 45.0;
  if (shippingMeterText && shippingBarFill) {
    if (subtotal >= freeThreshold) {
      shippingMeterText.innerHTML = 'Kostenloser Versand in ganz Deutschland qualifiziert!';
      shippingBarFill.style.width = '100%';
    } else {
      const remaining = (freeThreshold - subtotal).toFixed(2).replace('.', ',');
      shippingMeterText.innerHTML = `Noch <strong>${remaining} €</strong> bis zum kostenlosen Versand`;
      const pct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
      shippingBarFill.style.width = pct + '%';
    }
  }

  // Items List
  if (!cartItemsList) return;

  if (cartState.length === 0) {
    cartItemsList.innerHTML = `
      <div class="cart-empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <p>Dein Warenkorb ist noch leer.</p>
        <p style="font-size: 0.8rem;">Wähle oben frisch geröstete Bohnen aus.</p>
      </div>
    `;
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  let html = '';
  cartState.forEach(item => {
    html += `
      <div class="cart-item-row" data-id="${item.id}">
        <img src="${item.img}" alt="${item.name}" class="cart-item-thumb" width="60" height="60" loading="lazy">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-spec">${item.weight} · ${item.grind}</div>
          <div class="cart-item-price">${(item.price * item.qty).toFixed(2).replace('.', ',')} €</div>
        </div>
        <div class="cart-item-stepper">
          <button type="button" class="cart-step-btn" data-action="dec" data-id="${item.id}" aria-label="Menge verringern">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button type="button" class="cart-step-btn" data-action="inc" data-id="${item.id}" aria-label="Menge erhöhen">+</button>
        </div>
        <button type="button" class="cart-item-remove" data-action="del" data-id="${item.id}" aria-label="Artikel entfernen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
  });

  cartItemsList.innerHTML = html;

  // Bind step buttons
  cartItemsList.querySelectorAll('.cart-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const it = cartState.find(x => x.id === id);
      if (!it) return;

      if (action === 'inc') {
        it.qty += 1;
      } else if (action === 'dec') {
        it.qty -= 1;
        if (it.qty <= 0) {
          cartState = cartState.filter(x => x.id !== id);
        }
      }
      renderCart();
    });
  });

  // Bind remove buttons
  cartItemsList.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      cartState = cartState.filter(x => x.id !== id);
      renderCart();
    });
  });
}

/* ==========================================================================
   8. Cupping Workshop Booking
   ========================================================================== */
function initWorkshopBooking() {
  const form = document.getElementById('workshop-booking-form');
  const typeSelect = document.getElementById('workshop-type');
  const personsInput = document.getElementById('workshop-persons');
  const priceDisplay = document.getElementById('booking-price-val');
  const confirmedBox = document.getElementById('booking-confirmed-box');
  const confirmedText = document.getElementById('booking-confirmed-text');

  if (!form) return;

  function updatePrice() {
    const pricePerPerson = typeSelect ? parseFloat(typeSelect.value || '69') : 69;
    const persons = personsInput ? parseInt(personsInput.value || '1', 10) : 1;
    const total = pricePerPerson * persons;
    if (priceDisplay) {
      priceDisplay.textContent = total.toFixed(2).replace('.', ',') + ' €';
    }
  }

  if (typeSelect) typeSelect.addEventListener('change', updatePrice);
  if (personsInput) personsInput.addEventListener('input', updatePrice);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('workshop-name')?.value || 'Gast';
    const email = document.getElementById('workshop-email')?.value || '12234456789@gmail.com';
    const date = document.getElementById('workshop-date')?.value || 'nächsten Samstag';
    const slot = document.getElementById('workshop-slot')?.value || '11:00 Uhr';
    const persons = personsInput ? personsInput.value : '1';
    const selectedOption = typeSelect ? typeSelect.options[typeSelect.selectedIndex].text : 'Sensorik & Cupping';
    const bookingCode = 'AUR-' + Math.floor(1000 + Math.random() * 9000);

    if (confirmedText) {
      confirmedText.innerHTML = `
        Vielen Dank, <strong>${name}</strong>!<br>
        Deine Plätze für <strong>${selectedOption}</strong> (${persons} Person(en)) am <strong>${date} um ${slot}</strong> sind verbindlich reserviert.<br>
        Buchungs-Code: <strong>${bookingCode}</strong>.<br>
        Eine Bestätigung wurde an <em>${email}</em> gesendet. Wir freuen uns auf dich an der Torstraße 142!
      `;
    }

    if (confirmedBox) {
      confirmedBox.classList.add('active');
      confirmedBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    form.reset();
    updatePrice();
  });
}

/* ==========================================================================
   9. Live Opening Hours & Contact Inquiry
   ========================================================================== */
function initLiveHoursAndContact() {
  const statusDot = document.getElementById('live-status-dot');
  const statusText = document.getElementById('live-status-text');
  const tableRows = document.querySelectorAll('.hours-table tr');

  // Berlin Time Calculation
  const now = new Date();
  // Get day of week (0 = Sunday, 1 = Monday, ...)
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const curTime = hour + (minute / 60);

  // Mo-Fr: 08:00 - 18:00 (day 1..5)
  // Sa-So: 09:00 - 18:00 (day 6, 0)
  let isOpen = false;
  let closeOrOpenTime = '18:00';

  if (day >= 1 && day <= 5) {
    // Weekday
    if (curTime >= 8.0 && curTime < 18.0) {
      isOpen = true;
    }
  } else {
    // Weekend
    if (curTime >= 9.0 && curTime < 18.0) {
      isOpen = true;
    }
  }

  if (statusDot && statusText) {
    if (isOpen) {
      statusDot.classList.remove('closed');
      statusText.textContent = 'Jetzt geöffnet · Barista-Service bis 18:00 Uhr';
    } else {
      statusDot.classList.add('closed');
      statusText.textContent = 'Aktuell geschlossen · Öffnet wieder ab 08:00 Uhr';
    }
  }

  // Highlight today in table
  // Table rows: 0: Mo-Fr, 1: Sa, 2: So
  if (tableRows.length >= 3) {
    if (day >= 1 && day <= 5) {
      tableRows[0].classList.add('today-highlight');
    } else if (day === 6) {
      tableRows[1].classList.add('today-highlight');
    } else if (day === 0) {
      tableRows[2].classList.add('today-highlight');
    }
  }

  // Quick Contact / B2B Inquiry Form
  const inquiryForm = document.getElementById('quick-inquiry-form');
  const inquiryAlert = document.getElementById('inquiry-confirmed-alert');

  if (inquiryForm && inquiryAlert) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      inquiryAlert.classList.add('active');
      inquiryForm.reset();
      setTimeout(() => {
        inquiryAlert.classList.remove('active');
      }, 7000);
    });
  }
}

/* ==========================================================================
   10. Legal & Credits Modals
   ========================================================================== */
function initLegalModals() {
  const modal = document.getElementById('legal-modal');
  const modalClose = document.getElementById('legal-modal-close');
  const modalTitle = document.getElementById('legal-modal-title');
  const modalContent = document.getElementById('legal-modal-content');
  const backdrop = document.getElementById('drawer-backdrop');

  const btnImpressum = document.getElementById('btn-impressum');
  const btnDatenschutz = document.getElementById('btn-datenschutz');
  const btnCredits = document.getElementById('btn-credits');

  if (!modal) return;

  function openLegal(title, html) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalContent) modalContent.innerHTML = html;
    modal.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLegal() {
    modal.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeLegal);

  if (btnImpressum) {
    btnImpressum.addEventListener('click', () => {
      openLegal('Impressum', `
        <p><strong>AURUM – Kaffeerösterei & Café GmbH i.G.</strong><br>
        Torstraße 142<br>
        10119 Berlin-Mitte</p>
        <p style="margin-top: 12px;"><strong>Kontakt:</strong><br>
        Telefon: <a href="tel:+498886661234">+49 888 6661234</a><br>
        E-Mail: <a href="mailto:12234456789@gmail.com">12234456789@gmail.com</a><br>
        Telegram: <a href="https://t.me/rovatt" target="_blank" rel="noopener">@rovatt</a></p>
        <p style="margin-top: 12px;"><strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:</strong><br>
        Renat (Gestaltung & Konzeption)</p>
        <p style="margin-top: 12px; font-size: 0.85rem; color: #6B4E3D;"><em>Hinweis: Dies ist ein fiktives Demo-Projekt. Alle Angebote, Röstchargen und Preise dienen ausschließlich zu Präsentationszwecken.</em></p>
      `);
    });
  }

  if (btnDatenschutz) {
    btnDatenschutz.addEventListener('click', () => {
      openLegal('Datenschutzerklärung', `
        <p>Wir freuen uns über dein Interesse an unserem Kaffeerösterei-Demo-Projekt.</p>
        <p style="margin-top: 10px;"><strong>Erhebung und Speicherung personenbezogener Daten:</strong><br>
        Diese Website arbeitet rein clientseitig im Browser. Buchungsformulare, der Warenkorb und Kontaktanfragen verarbeiten Daten ausschließlich lokal im Speicher Ihres Endgeräts. Es werden keine Daten an externe Datenbanken übermittelt oder verkauft.</p>
        <p style="margin-top: 10px;"><strong>Lokale Speicherung (SessionStorage):</strong><br>
        Lediglich der Status des Demo-Hinweisbanners wird für die Dauer Ihrer Sitzung lokal gespeichert.</p>
        <p style="margin-top: 10px;"><strong>Ihre Rechte:</strong><br>
        Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft und Zweck Ihrer gespeicherten personenbezogenen Daten.</p>
      `);
    });
  }

  if (btnCredits) {
    btnCredits.addEventListener('click', () => {
      openLegal('Bildnachweise & Lizenzen', `
        <p>Fotografien stammen aus Wikimedia Commons und sind unter freien Lizenzen (CC0, CC BY 2.0, CC BY-SA 4.0) veröffentlicht:</p>
        <ul style="margin: 12px 0 0 20px; font-size: 0.88rem; line-height: 1.6;">
          <li><em>Espresso-Extraktion:</em> Machine pouring coffee (Unsplash) / Gold Coast Media Lab (CC0)</li>
          <li><em>Tamping & Barista:</em> Shixart1985 (CC BY 2.0)</li>
          <li><em>Rösten & Kühltrog:</em> Fresh hot roasted coffee beans / Jameswasswa (CC BY-SA 4.0)</li>
          <li><em>Rohkaffee-Handauslese:</em> Joshua Newton (CC0)</li>
          <li><em>Hand-Filter V60:</em> Thomas Martinsen (CC0)</li>
          <li><em>Latte Art:</em> Chevanon Photography (CC0)</li>
          <li><em>Verpackungs-Mockups:</em> Generiert im Rahmen dieses Demo-Projekts.</li>
        </ul>
      `);
    });
  }
}
