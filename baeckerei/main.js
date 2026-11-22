/**
 * Bäckerei Eifel – Backstube & Café (Berlin Prenzlauer Berg)
 * Premium One-Page Interaction Script
 * Features:
 * - Live Berlin Bakery Clock & Real-time Action status
 * - Pinned Scroll-Driven Horizontal Timeline (22:00 -> 06:30)
 * - 3D Tilt on Hover for Seasonal Cards
 * - Interactive Theke Counter Tabs
 * - Three.js 3D Pretzel Canvas (Lazy-loaded, WebGL fallback)
 * - Canvas Floating Flour Particles in Hero
 * - Dynamic Today Highlighting in Opening Hours
 * - In-page Preorder Form Confirmation
 * - Full-screen Drawer Menu & Demo Banner dismissal
 */

document.addEventListener('DOMContentLoaded', () => {
  initDemoBanner();
  initDrawerMenu();
  initHeroFlourParticles();
  initHeroLetters();
  initBerlinClock();
  initHorizontalTimeline();
  initTiltCards();
  initThekeTabs();
  initThreePretzel();
  initPreorderForm();
  initTodayHours();
  initScrollAnimations();
});

/* ==========================================================================
   1. Demo Banner Dismissal
   ========================================================================== */
function initDemoBanner() {
  const banner = document.getElementById('demo-banner');
  const closeBtn = document.getElementById('demo-banner-close');
  if (!banner || !closeBtn) return;

  if (sessionStorage.getItem('baeckerei_eifel_demo_dismissed') === 'true') {
    banner.classList.add('hidden');
  }

  closeBtn.addEventListener('click', () => {
    banner.classList.add('hidden');
    sessionStorage.setItem('baeckerei_eifel_demo_dismissed', 'true');
  });
}

/* ==========================================================================
   2. Full-Screen Drawer Navigation
   ========================================================================== */
function initDrawerMenu() {
  const drawer = document.getElementById('nav-drawer');
  const openBtn = document.getElementById('btn-menu-open');
  const closeBtn = document.getElementById('btn-menu-close');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!drawer || !openBtn) return;

  function openDrawer() {
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/* ==========================================================================
   3. Hero Letter-by-Letter Text Reveal
   ========================================================================== */
function initHeroLetters() {
  const headline = document.querySelector('.hero-headline');
  if (!headline) return;

  const rawText = headline.textContent.trim();
  const words = rawText.split(' ');
  headline.innerHTML = '';

  let charIndex = 0;
  words.forEach((word, wIdx) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';

    for (let i = 0; i < word.length; i++) {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = word[i];
      charSpan.style.animationDelay = `${0.15 + charIndex * 0.035}s`;
      wordSpan.appendChild(charSpan);
      charIndex++;
    }

    headline.appendChild(wordSpan);

    if (wIdx < words.length - 1) {
      headline.appendChild(document.createTextNode(' '));
    }
  });
}

/* ==========================================================================
   4. Floating Flour Dust Canvas in Hero
   ========================================================================== */
function initHeroFlourParticles() {
  const canvas = document.getElementById('flour-canvas');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 45;
  let isHeroVisible = true;
  let animationFrameId;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class FlourFlake {
    constructor() {
      this.reset(true);
    }

    reset(initRandomY = false) {
      this.x = Math.random() * width;
      this.y = initRandomY ? Math.random() * height : -10;
      this.radius = Math.random() * 2.2 + 0.8;
      this.speedY = Math.random() * 0.45 + 0.25;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.45 + 0.25;
      this.oscillation = Math.random() * Math.PI * 2;
      this.oscSpeed = Math.random() * 0.02 + 0.01;
    }

    update() {
      this.y += this.speedY;
      this.oscillation += this.oscSpeed;
      this.x += this.speedX + Math.sin(this.oscillation) * 0.25;

      if (this.y > height + 10 || this.x < -10 || this.x > width + 10) {
        this.reset(false);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(246, 239, 228, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new FlourFlake());
  }

  function loop() {
    if (!isHeroVisible) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    animationFrameId = requestAnimationFrame(loop);
  }

  const heroObserver = new IntersectionObserver((entries) => {
    isHeroVisible = entries[0].isIntersecting;
  }, { threshold: 0.05 });

  const heroSec = document.querySelector('.hero-section');
  if (heroSec) heroObserver.observe(heroSec);

  loop();
}

/* ==========================================================================
   5. Live Berlin Clock & Dynamic Bakery Action Status
   ========================================================================== */
function initBerlinClock() {
  const timeElem = document.getElementById('berlin-live-time');
  const activityElem = document.getElementById('berlin-live-activity');
  if (!timeElem || !activityElem) return;

  function updateClock() {
    const now = new Date();
    // Get Berlin time string formatted
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    let hour = 0;
    let minute = 0;
    let timeStr = '';

    parts.forEach(p => {
      if (p.type === 'hour') hour = parseInt(p.value, 10);
      if (p.type === 'minute') minute = parseInt(p.value, 10);
    });

    timeStr = formatter.format(now) + ' Uhr';
    timeElem.textContent = timeStr;

    // Determine current activity in the bakery based on Berlin hour
    let action = '';
    const totalMinutes = hour * 60 + minute;

    if (totalMinutes >= 22 * 60 || totalMinutes < 1 * 60 + 30) {
      action = '22:00 – Der Natursauerteig wird für die Nacht aufgefrischt.';
    } else if (totalMinutes < 3 * 60 + 45) {
      action = '01:30 – Meister Jonas knetet den Teig von Hand auf Buchenholz.';
    } else if (totalMinutes < 5 * 60) {
      action = '03:45 – 18 Stunden Teigruhe: Die Gärkörbe reifen im Reiferaum.';
    } else if (totalMinutes < 6 * 60 + 30) {
      action = '05:00 – Der Steinbackofen glüht bei 280°C. Erstes Brot wird geschossen.';
    } else if (totalMinutes < 11 * 60) {
      action = '06:30 – Die Türen öffnen: Frischer Kaffeeduft & ofenwarmes Roggenbrot.';
    } else if (totalMinutes < 14 * 60) {
      action = '11:00 – Die Theke ist voll: Frisches Landbrot, Croissants & Quiches.';
    } else if (totalMinutes < 17 * 60) {
      action = '14:30 – Café-Betrieb: Filterkaffee, Kardamom-Knoten & Franzbrötchen.';
    } else if (totalMinutes < 18 * 60 + 30) {
      action = '17:00 – Vorbestellungen für morgen packen, Feierabend-Brote.';
    } else {
      action = '19:00 – Die Backstube kühlt ab, Vorbereitung für die Nachtschicht.';
    }

    activityElem.textContent = action;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   6. Horizontal Timeline Scroll-Driven Animation
   ========================================================================== */
function initHorizontalTimeline() {
  const outer = document.querySelector('.timeline-outer');
  const sticky = document.querySelector('.timeline-sticky');
  const track = document.querySelector('.timeline-track');
  const progressFill = document.querySelector('.timeline-progress-fill');

  if (!outer || !sticky || !track) return;

  function onScroll() {
    // On mobile devices (<= 768px), use native horizontal scroll-snap row
    if (window.innerWidth <= 768) {
      track.style.transform = '';
      if (progressFill) {
        progressFill.style.width = '0%';
      }
      return;
    }

    const rect = outer.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = outer.offsetHeight - windowH;

    if (totalDist <= 0) return;

    // Calculate how far into the timeline section we've scrolled (0 to 1)
    const scrolled = -rect.top;
    let progress = scrolled / totalDist;
    progress = Math.max(0, Math.min(1, progress));

    // Calculate max translation of the track
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    const maxTranslate = Math.max(0, trackWidth - viewportWidth + 80);

    if (maxTranslate > 0) {
      const translateX = progress * maxTranslate;
      track.style.transform = `translateX(-${translateX}px)`;
    } else {
      track.style.transform = 'none';
    }

    if (progressFill) {
      progressFill.style.width = `${progress * 100}%`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

/* ==========================================================================
   7. 3D Tilt on Hover (Cards "Neu im November")
   ========================================================================== */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (isTouch) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      const rotateX = -deltaY * 8;
      const rotateY = deltaX * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* ==========================================================================
   8. Interactive "Die Theke heute" Counter Tabs
   ========================================================================== */
function initThekeTabs() {
  const tabs = document.querySelectorAll('.theke-tab-btn');
  const items = document.querySelectorAll('.theke-item');

  if (!tabs.length || !items.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-tab');

      items.forEach(item => {
        const itemCat = item.getAttribute('data-cat');
        if (category === 'all' || itemCat === category) {
          item.style.display = 'flex';
          item.style.animation = 'none';
          void item.offsetWidth; // trigger reflow
          item.style.animation = 'thekeItemFadeIn 0.35s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   9. Three.js 3D Pretzel Scene (Lazy-loaded, Fallback supported)
   ========================================================================== */
function initThreePretzel() {
  const container = document.getElementById('three-container');
  const fallbackImg = document.getElementById('three-fallback');
  if (!container) return;

  let scene, camera, renderer, knot, particles;
  let isInitialized = false;
  let isVisible = false;
  let targetRotationX = 0;
  let targetRotationY = 0;

  function isWebGLSupported() {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function showFallback() {
    const canvas = document.getElementById('three-canvas');
    if (canvas) canvas.style.display = 'none';
    if (fallbackImg) fallbackImg.style.display = 'block';
    const hint = container.querySelector('.three-hint');
    if (hint) hint.style.display = 'none';
  }

  function initScene() {
    if (typeof THREE === 'undefined' || !isWebGLSupported()) {
      showFallback();
      return;
    }

    const canvas = document.getElementById('three-canvas');
    if (!canvas) {
      showFallback();
      return;
    }

    try {
      scene = new THREE.Scene();

      const width = container.clientWidth || 300;
      const height = container.clientHeight || 420;

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 7.5;

      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'default'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        showFallback();
      }, false);

      // Pretzel geometry: TorusKnot represents a twisted artisan braided pretzel/loaf
      // p=2, q=3 gives the classic balanced intertwining shape
      const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.44, 128, 32, 2, 3);

      // Warm baked crust material with subtle sheen
      const knotMat = new THREE.MeshStandardMaterial({
        color: 0xBA6125, // warm golden-brown baked crust
        roughness: 0.55,
        metalness: 0.1,
        flatShading: false
      });

      knot = new THREE.Mesh(knotGeo, knotMat);
      scene.add(knot);

      // Add falling flour dust particles
      const particleCount = 140;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 8;
        posArray[i + 1] = (Math.random() - 0.5) * 8;
        posArray[i + 2] = (Math.random() - 0.5) * 8;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.045,
        color: 0xF6EFE4,
        transparent: true,
        opacity: 0.65
      });

      particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Lighting: Warm bakery glow
      const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.9);
      scene.add(ambientLight);

      const ovenDirLight = new THREE.DirectionalLight(0xffb366, 1.8);
      ovenDirLight.position.set(5, 6, 5);
      scene.add(ovenDirLight);

      const rimLight = new THREE.DirectionalLight(0xd9a55b, 0.8);
      rimLight.position.set(-5, -3, -3);
      scene.add(rimLight);

      // Mouse interaction
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        targetRotationY = normX * 1.5;
        targetRotationX = normY * 1.2;
      });

      container.addEventListener('mouseleave', () => {
        targetRotationX = 0;
        targetRotationY = 0;
      });

      window.addEventListener('resize', onResize);
      isInitialized = true;
      animate();
    } catch (err) {
      showFallback();
    }
  }

  function onResize() {
    if (!renderer || !camera || !container || container.clientHeight === 0) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function animate() {
    if (!isInitialized || !renderer || !scene || !camera) return;
    requestAnimationFrame(animate);

    if (!isVisible) return; // Don't burn cycles if not on screen

    try {
      if (knot) {
        // Gentle continuous rotation
        knot.rotation.y += 0.007;
        knot.rotation.x += 0.003;

        // Smooth lerp to mouse tilt
        knot.rotation.y += (targetRotationY - knot.rotation.y * 0.1) * 0.05;
        knot.rotation.x += (targetRotationX - knot.rotation.x * 0.1) * 0.05;
      }

      if (particles && particles.geometry && particles.geometry.attributes && particles.geometry.attributes.position) {
        // Slowly drift particles
        particles.rotation.y -= 0.0015;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.006;
          if (positions[i] < -4) {
            positions[i] = 4;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    } catch (renderErr) {
      showFallback();
    }
  }

  // Lazy initialize via IntersectionObserver
  const threeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible && !isInitialized) {
        initScene();
      }
    });
  }, { threshold: 0.1 });

  threeObserver.observe(container);
}

/* ==========================================================================
   10. Preorder Form Handling & Friendly In-page Confirmation
   ========================================================================== */
function initPreorderForm() {
  const form = document.getElementById('preorder-form');
  const confirmBox = document.getElementById('preorder-confirmation');
  const resetBtn = document.getElementById('confirmation-reset-btn');

  if (!form || !confirmBox) return;

  // Prefill bread selection if clicked from seasonal cards
  const seasonalOrderBtns = document.querySelectorAll('.seasonal-preorder-btn');
  seasonalOrderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const breadName = btn.getAttribute('data-bread');
      const selectElem = document.getElementById('form-bread');
      if (selectElem && breadName) {
        for (let i = 0; i < selectElem.options.length; i++) {
          if (selectElem.options[i].text.includes(breadName) || selectElem.options[i].value.includes(breadName)) {
            selectElem.selectedIndex = i;
            break;
          }
        }
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const day = document.getElementById('form-pickup-day').value;
    const bread = document.getElementById('form-bread').value;
    const quantity = document.getElementById('form-quantity').value;

    if (!name || !phone) return;

    // Populate confirmation
    document.getElementById('conf-name').textContent = name;
    document.getElementById('conf-bread').textContent = `${quantity}x ${bread}`;
    document.getElementById('conf-day').textContent = day;
    document.getElementById('conf-phone').textContent = phone;

    form.style.display = 'none';
    confirmBox.classList.add('active');

    confirmBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      confirmBox.classList.remove('active');
      form.style.display = 'flex';
    });
  }
}

/* ==========================================================================
   11. Opening Hours Table: Dynamically Highlight Today
   ========================================================================== */
function initTodayHours() {
  const rows = document.querySelectorAll('.hours-row');
  if (!rows.length) return;

  // Get current Berlin day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const now = new Date();
  const berlinDateStr = now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
  const berlinDate = new Date(berlinDateStr);
  const dayOfWeek = berlinDate.getDay();

  // Map dayOfWeek to row data-day
  // 1-5 = mo-fr, 6 = sa, 0 = so
  let currentDayKey = 'mo-fr';
  if (dayOfWeek === 6) {
    currentDayKey = 'sa';
  } else if (dayOfWeek === 0) {
    currentDayKey = 'so';
  }

  rows.forEach(row => {
    if (row.getAttribute('data-day') === currentDayKey) {
      row.classList.add('is-today');
      const dayCell = row.querySelector('.hours-day');
      if (dayCell) {
        const badge = document.createElement('span');
        badge.className = 'today-badge';
        badge.textContent = 'Heute';
        dayCell.appendChild(badge);
      }
    }
  });
}

/* ==========================================================================
   12. IntersectionObserver for Smooth Scroll Reveal
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in-section');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}
