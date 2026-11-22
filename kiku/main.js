/**
 * KIKU Nudelbar · Interactive Script
 * Features:
 * 1) Three.js 3D Ramen Bowl Scene with lifted noodles, steam particles & mouse tilt
 * 2) "Bau deine Schüssel" interactive custom ramen builder with live SVG & price updates
 * 3) Menu category filtering
 * 4) 12-Hour Broth Gauge & Clock animation
 * 5) Interactive 10-Stamp Lunch Card with localStorage persistence & reward unlock
 * 6) Live opening hours indicator
 * 7) In-page reservation confirmation & legal modals
 */

document.addEventListener('DOMContentLoaded', () => {
  initDemoBanner();
  initNavigation();
  initThreeRamenScene();
  initBowlBuilder();
  initMenuFilters();
  initBrothGauge();
  initStampCard();
  initLiveHours();
  initReservationForm();
  initLegalModals();
});

/* ==========================================================================
   1. Demo Banner & Navigation
   ========================================================================== */
function initDemoBanner() {
  const banner = document.getElementById('demo-banner');
  const closeBtn = document.getElementById('close-demo-banner');
  if (!banner || !closeBtn) return;

  if (sessionStorage.getItem('kiku_demo_closed') === 'true') {
    banner.classList.add('is-closed');
  }

  closeBtn.addEventListener('click', () => {
    banner.classList.add('is-closed');
    sessionStorage.setItem('kiku_demo_closed', 'true');
  });
}

function initNavigation() {
  const header = document.getElementById('header');
  const toggleBtn = document.getElementById('menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }, { passive: true });

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('is-open');
      if (isOpen) {
        drawer.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        drawer.classList.add('is-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });

    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        drawer.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ==========================================================================
   2. Three.js 3D Ramen Bowl Scene
   ========================================================================== */
function initThreeRamenScene() {
  const mount = document.getElementById('three-ramen-mount');
  if (!mount) return;

  // Check WebGL availability
  if (!window.THREE || !isWebGLAvailable()) {
    renderWebGLFallback(mount);
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const width = mount.clientWidth || 400;
  const height = mount.clientHeight || 380;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
  camera.position.set(0, 5.2, 8.5);
  camera.lookAt(0, 0.5, 0);

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
  } catch (err) {
    renderWebGLFallback(mount);
    return;
  }

  // Lights
  const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.1);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfff4e6, 1.4);
  mainLight.position.set(6, 10, 7);
  scene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0xf2b33d, 1.2);
  rimLight.position.set(-8, 6, -6);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xe8452c, 0.5);
  fillLight.position.set(0, -4, 4);
  scene.add(fillLight);

  // Main Bowl Assembly Group
  const bowlGroup = new THREE.Group();
  scene.add(bowlGroup);

  // 1. Ceramic Ramen Bowl (LatheGeometry for beautiful ceramic curve)
  const bowlPoints = [];
  bowlPoints.push(new THREE.Vector2(0.0, 0.0));
  bowlPoints.push(new THREE.Vector2(1.1, 0.05)); // base foot
  bowlPoints.push(new THREE.Vector2(1.2, 0.3));
  bowlPoints.push(new THREE.Vector2(1.7, 0.9));
  bowlPoints.push(new THREE.Vector2(2.5, 1.7));
  bowlPoints.push(new THREE.Vector2(2.9, 2.3)); // rim flare
  bowlPoints.push(new THREE.Vector2(2.75, 2.3));
  bowlPoints.push(new THREE.Vector2(2.35, 1.7));
  bowlPoints.push(new THREE.Vector2(1.5, 0.9));
  bowlPoints.push(new THREE.Vector2(0.8, 0.4));
  bowlPoints.push(new THREE.Vector2(0.0, 0.35));

  const bowlGeo = new THREE.LatheGeometry(bowlPoints, 48);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0x1D2440,
    roughness: 0.25,
    metalness: 0.1
  });
  const bowlMesh = new THREE.Mesh(bowlGeo, bowlMat);
  bowlGroup.add(bowlMesh);

  // Gold decorative rim ring
  const rimTorusGeo = new THREE.TorusGeometry(2.83, 0.055, 16, 64);
  const rimTorusMat = new THREE.MeshStandardMaterial({
    color: 0xF2B33D,
    roughness: 0.3,
    metalness: 0.6
  });
  const rimMesh = new THREE.Mesh(rimTorusGeo, rimTorusMat);
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.y = 2.3;
  bowlGroup.add(rimMesh);

  // 2. Broth Surface
  const brothGeo = new THREE.CylinderGeometry(2.65, 2.65, 0.1, 48);
  const brothMat = new THREE.MeshStandardMaterial({
    color: 0xc87522, // Rich amber Shoyu broth
    roughness: 0.15,
    metalness: 0.05
  });
  const brothMesh = new THREE.Mesh(brothGeo, brothMat);
  brothMesh.position.y = 2.0;
  bowlGroup.add(brothMesh);

  // 3. Noodles in the bowl (Curved noodle rings)
  const noodleMat = new THREE.MeshStandardMaterial({
    color: 0xf5d378,
    roughness: 0.45
  });

  for (let i = 0; i < 7; i++) {
    const angleOffset = (i / 7) * Math.PI * 2;
    const curvePoints = [];
    for (let j = 0; j <= 8; j++) {
      const t = (j / 8) * Math.PI * 2;
      const r = 1.2 + Math.sin(t * 3 + i) * 0.55;
      const x = Math.cos(t + angleOffset) * r;
      const z = Math.sin(t + angleOffset) * r;
      const y = 2.05 + Math.sin(t * 4 + i) * 0.08;
      curvePoints.push(new THREE.Vector3(x, y, z));
    }
    const spline = new THREE.CatmullRomCurve3(curvePoints, true);
    const noodleGeo = new THREE.TubeGeometry(spline, 36, 0.065, 8, true);
    const noodleMesh = new THREE.Mesh(noodleGeo, noodleMat);
    bowlGroup.add(noodleMesh);
  }

  // 4. Lifted Noodles (Rising up towards the chopsticks!)
  const liftedGroup = new THREE.Group();
  bowlGroup.add(liftedGroup);

  const liftedPoints1 = [
    new THREE.Vector3(0.1, 2.05, 0.2),
    new THREE.Vector3(0.3, 2.7, 0.4),
    new THREE.Vector3(0.2, 3.6, 0.5),
    new THREE.Vector3(-0.1, 4.3, 0.4),
    new THREE.Vector3(0.0, 4.6, 0.3)
  ];
  const liftedCurve1 = new THREE.CatmullRomCurve3(liftedPoints1);
  const liftedGeo1 = new THREE.TubeGeometry(liftedCurve1, 32, 0.055, 8, false);
  const liftedMesh1 = new THREE.Mesh(liftedGeo1, noodleMat);
  liftedGroup.add(liftedMesh1);

  const liftedPoints2 = [
    new THREE.Vector3(-0.15, 2.05, 0.1),
    new THREE.Vector3(-0.05, 2.8, 0.25),
    new THREE.Vector3(0.1, 3.7, 0.35),
    new THREE.Vector3(0.05, 4.4, 0.3),
    new THREE.Vector3(0.0, 4.6, 0.3)
  ];
  const liftedCurve2 = new THREE.CatmullRomCurve3(liftedPoints2);
  const liftedGeo2 = new THREE.TubeGeometry(liftedCurve2, 32, 0.05, 8, false);
  const liftedMesh2 = new THREE.Mesh(liftedGeo2, noodleMat);
  liftedGroup.add(liftedMesh2);

  const liftedPoints3 = [
    new THREE.Vector3(0.3, 2.05, 0.0),
    new THREE.Vector3(0.4, 2.9, 0.2),
    new THREE.Vector3(0.25, 3.8, 0.4),
    new THREE.Vector3(0.08, 4.5, 0.35),
    new THREE.Vector3(0.0, 4.6, 0.3)
  ];
  const liftedCurve3 = new THREE.CatmullRomCurve3(liftedPoints3);
  const liftedGeo3 = new THREE.TubeGeometry(liftedCurve3, 32, 0.05, 8, false);
  const liftedMesh3 = new THREE.Mesh(liftedGeo3, noodleMat);
  liftedGroup.add(liftedMesh3);

  // 5. Chopsticks (Bamboo wooden rods lifting the noodles)
  const chopstickMat = new THREE.MeshStandardMaterial({
    color: 0xd4a359,
    roughness: 0.4
  });

  const chopstickGeo1 = new THREE.CylinderGeometry(0.055, 0.09, 4.2, 16);
  const chopstick1 = new THREE.Mesh(chopstickGeo1, chopstickMat);
  chopstick1.position.set(-0.2, 4.6, 0.3);
  chopstick1.rotation.z = Math.PI / 3.2;
  chopstick1.rotation.y = -0.15;
  bowlGroup.add(chopstick1);

  const chopstickGeo2 = new THREE.CylinderGeometry(0.055, 0.09, 4.2, 16);
  const chopstick2 = new THREE.Mesh(chopstickGeo2, chopstickMat);
  chopstick2.position.set(-0.15, 4.75, 0.38);
  chopstick2.rotation.z = Math.PI / 3.35;
  chopstick2.rotation.y = -0.22;
  bowlGroup.add(chopstick2);

  // 6. Toppings in the bowl
  // Ajitsuke Tamago (Half egg)
  const eggGroup = new THREE.Group();
  const eggWhiteGeo = new THREE.SphereGeometry(0.65, 24, 16);
  eggWhiteGeo.scale(1, 0.55, 1.25);
  const eggWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xfdfbf0,
    roughness: 0.2
  });
  const eggWhite = new THREE.Mesh(eggWhiteGeo, eggWhiteMat);
  eggGroup.add(eggWhite);

  const eggYolkGeo = new THREE.SphereGeometry(0.38, 20, 16);
  eggYolkGeo.scale(1, 0.35, 1);
  const eggYolkMat = new THREE.MeshStandardMaterial({
    color: 0xff7b00,
    roughness: 0.15
  });
  const eggYolk = new THREE.Mesh(eggYolkGeo, eggYolkMat);
  eggYolk.position.set(0, 0.18, 0);
  eggGroup.add(eggYolk);

  eggGroup.position.set(-1.1, 2.1, 0.7);
  eggGroup.rotation.set(0.2, 0.4, -0.1);
  bowlGroup.add(eggGroup);

  // Chashu Pork Slices (Textured pork discs)
  const chashuGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.08, 24);
  const chashuMat = new THREE.MeshStandardMaterial({
    color: 0xb5533c,
    roughness: 0.5
  });
  const chashu1 = new THREE.Mesh(chashuGeo, chashuMat);
  chashu1.position.set(1.15, 2.15, 0.5);
  chashu1.rotation.set(-0.25, 0.4, 0.3);
  bowlGroup.add(chashu1);

  const chashu2 = new THREE.Mesh(chashuGeo, chashuMat);
  chashu2.position.set(0.9, 2.18, 1.1);
  chashu2.rotation.set(-0.15, 0.2, 0.2);
  bowlGroup.add(chashu2);

  // Nori Sheet (Dark seaweed sheet leaning at rim)
  const noriGeo = new THREE.BoxGeometry(1.2, 1.5, 0.04);
  const noriMat = new THREE.MeshStandardMaterial({
    color: 0x17281d,
    roughness: 0.85
  });
  const noriMesh = new THREE.Mesh(noriGeo, noriMat);
  noriMesh.position.set(-1.4, 2.7, -1.1);
  noriMesh.rotation.set(-0.35, 0.6, -0.2);
  bowlGroup.add(noriMesh);

  // Narutomaki (White disc with pink swirl)
  const narutoGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.07, 24);
  const narutoMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3
  });
  const narutoMesh = new THREE.Mesh(narutoGeo, narutoMat);
  narutoMesh.position.set(-0.4, 2.15, 1.45);
  narutoMesh.rotation.set(0.3, -0.2, 0.1);
  bowlGroup.add(narutoMesh);

  // Scallion Sprinkles (Bright green little rings)
  const scallionGeo = new THREE.TorusGeometry(0.09, 0.035, 8, 12);
  const scallionMat = new THREE.MeshStandardMaterial({
    color: 0x3cb346,
    roughness: 0.3
  });
  for (let k = 0; k < 14; k++) {
    const sc = new THREE.Mesh(scallionGeo, scallionMat);
    sc.position.set(
      (Math.random() - 0.5) * 1.5,
      2.16 + Math.random() * 0.05,
      (Math.random() - 0.5) * 1.5
    );
    sc.rotation.set(
      Math.PI / 2 + (Math.random() - 0.5) * 0.4,
      Math.random() * Math.PI,
      0
    );
    bowlGroup.add(sc);
  }

  // 7. Rising Steam Particles System
  const particleCount = 45;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let p = 0; p < particleCount; p++) {
    const pX = (Math.random() - 0.5) * 2.2;
    const pY = 2.2 + Math.random() * 3.5;
    const pZ = (Math.random() - 0.5) * 2.2;
    particlePositions[p * 3] = pX;
    particlePositions[p * 3 + 1] = pY;
    particlePositions[p * 3 + 2] = pZ;

    particleVelocities.push({
      speedY: 0.015 + Math.random() * 0.02,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobbleOffset: Math.random() * Math.PI * 2
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  // Canvas circle texture for soft steam cloud
  const steamCanvas = document.createElement('canvas');
  steamCanvas.width = 32;
  steamCanvas.height = 32;
  const ctx = steamCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255, 248, 238, 0.8)');
  grad.addColorStop(0.5, 'rgba(255, 248, 238, 0.3)');
  grad.addColorStop(1, 'rgba(255, 248, 238, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);

  const steamTexture = new THREE.CanvasTexture(steamCanvas);
  const steamMat = new THREE.PointsMaterial({
    size: 0.45,
    map: steamTexture,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.NormalBlending
  });

  const steamPoints = new THREE.Points(particleGeo, steamMat);
  bowlGroup.add(steamPoints);

  // Interaction State
  let targetRotationY = 0.4;
  let targetRotationX = 0.15;
  let currentRotationY = 0.4;
  let currentRotationX = 0.15;
  let isPointerDown = false;
  let pointerStartX = 0;
  let pointerStartY = 0;

  // Mouse Move / Tilt on Desktop
  mount.addEventListener('mousemove', (e) => {
    const rect = mount.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    targetRotationY = x * 1.1;
    targetRotationX = y * 0.35 + 0.15;
  });

  // Touch / Drag Tilt
  mount.addEventListener('pointerdown', (e) => {
    isPointerDown = true;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const deltaX = (e.clientX - pointerStartX) * 0.008;
    const deltaY = (e.clientY - pointerStartY) * 0.005;
    targetRotationY += deltaX;
    targetRotationX = Math.max(-0.2, Math.min(0.5, targetRotationX + deltaY));
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
  });

  // Animation Loop (60 fps)
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      // Smooth dampening towards target rotation
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;

      // Gentle floating idle wobble
      bowlGroup.rotation.y = currentRotationY + Math.sin(elapsedTime * 0.8) * 0.05;
      bowlGroup.rotation.x = currentRotationX + Math.cos(elapsedTime * 0.6) * 0.02;
      bowlGroup.position.y = -1.2 + Math.sin(elapsedTime * 1.2) * 0.08;

      // Update steam particle positions
      const positions = particleGeo.attributes.position.array;
      for (let p = 0; p < particleCount; p++) {
        const vel = particleVelocities[p];
        positions[p * 3 + 1] += vel.speedY; // move up
        positions[p * 3] += Math.sin(elapsedTime * 2 + vel.wobbleOffset) * 0.005;

        // Reset particle to broth if it floats too high
        if (positions[p * 3 + 1] > 6.0) {
          positions[p * 3 + 1] = 2.1;
          positions[p * 3] = (Math.random() - 0.5) * 1.8;
          positions[p * 3 + 2] = (Math.random() - 0.5) * 1.8;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
    } else {
      bowlGroup.position.y = -1.2;
      bowlGroup.rotation.y = 0.4;
      bowlGroup.rotation.x = 0.15;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    const newWidth = mount.clientWidth;
    const newHeight = mount.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function renderWebGLFallback(mount) {
  mount.innerHTML = `
    <div class="webgl-fallback-card">
      <div class="fallback-steam-wrap" aria-hidden="true">
        <span class="steam-fallback steam-fb-1"></span>
        <span class="steam-fallback steam-fb-2"></span>
        <span class="steam-fallback steam-fb-3"></span>
      </div>
      <img src="img/shoyu-ramen.jpg" alt="KIKU Tokyo Shoyu Ramen frisch serviert" class="fallback-hero-img">
      <div class="fallback-overlay-badge">
        <span class="sticker-tag sticker-yellow">Täglich frisch gekocht</span>
      </div>
    </div>
  `;
}

/* ==========================================================================
   3. "Bau deine Schüssel" Interactive Bowl Builder
   ========================================================================== */
function initBowlBuilder() {
  const brothCards = document.querySelectorAll('.broth-options .option-card');
  const noodleCards = document.querySelectorAll('.noodle-options .option-card');
  const toppingBtns = document.querySelectorAll('.topping-btn');
  const svgBrothSurface = document.getElementById('svg-broth-surface');

  const receiptBrothVal = document.getElementById('receipt-broth-val');
  const receiptNoodleVal = document.getElementById('receipt-noodle-val');
  const receiptToppingsVal = document.getElementById('receipt-toppings-val');
  const builderTotalPrice = document.getElementById('builder-total-price');
  const builderBowlName = document.getElementById('builder-bowl-name');
  const builderSubmitBtn = document.getElementById('builder-submit-btn');

  let state = {
    brothKey: 'shoyu',
    brothName: 'Tokyo Shoyu',
    brothPrice: 13.50,
    noodleKey: 'classic',
    noodleName: 'Klassisch dünn',
    noodlePrice: 0.00,
    toppings: {
      egg: { name: 'Ajitsuke Tamago', price: 1.80, active: true },
      chashu: { name: 'Chashu Schweinebauch', price: 2.80, active: true },
      menma: { name: 'Menma Bambus', price: 1.50, active: true },
      nori: { name: 'Nori-Alge', price: 1.00, active: true },
      pakchoi: { name: 'Pak Choi', price: 1.50, active: false },
      tofu: { name: 'Bio-Tofu', price: 2.00, active: false },
      corn: { name: 'Mais & Butter', price: 1.20, active: false },
      chilicrisp: { name: 'Chili-Crisp', price: 0.80, active: false }
    }
  };

  function updateBuilderUI() {
    // 1. Calculate Total
    let total = state.brothPrice + state.noodlePrice;
    const activeToppingsNames = [];

    Object.keys(state.toppings).forEach(k => {
      const top = state.toppings[k];
      if (top.active) {
        total += top.price;
        activeToppingsNames.push(top.name);
      }
    });

    // 2. Update Receipt
    if (receiptBrothVal) {
      receiptBrothVal.textContent = `${state.brothName} (${formatEUR(state.brothPrice)})`;
    }
    if (receiptNoodleVal) {
      receiptNoodleVal.textContent = `${state.noodleName} (+${formatEUR(state.noodlePrice)})`;
    }
    if (receiptToppingsVal) {
      receiptToppingsVal.textContent = activeToppingsNames.length > 0 
        ? activeToppingsNames.join(', ')
        : 'Keine Extras gewählt';
    }
    if (builderTotalPrice) {
      builderTotalPrice.textContent = formatEUR(total);
    }
    if (builderBowlName) {
      builderBowlName.textContent = `KIKU ${state.brothName} Spezial`;
    }

    // 3. Update SVG Broth
    if (svgBrothSurface) {
      svgBrothSurface.setAttribute('fill', `url(#grad-${state.brothKey})`);
    }

    // 4. Update SVG Toppings Visibility
    Object.keys(state.toppings).forEach(k => {
      const svgEl = document.getElementById(`svg-topping-${k}`);
      if (svgEl) {
        if (state.toppings[k].active) {
          svgEl.classList.remove('is-hidden');
        } else {
          svgEl.classList.add('is-hidden');
        }
      }
    });
  }

  // Broth Radios
  brothCards.forEach(card => {
    card.addEventListener('click', () => {
      brothCards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      state.brothKey = card.dataset.broth;
      state.brothPrice = parseFloat(card.dataset.price);
      state.brothName = card.dataset.name;
      updateBuilderUI();
    });
  });

  // Noodle Radios
  noodleCards.forEach(card => {
    card.addEventListener('click', () => {
      noodleCards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      state.noodleKey = card.dataset.noodle;
      state.noodlePrice = parseFloat(card.dataset.extra);
      state.noodleName = card.dataset.name;
      updateBuilderUI();
    });
  });

  // Topping Buttons
  toppingBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.topping;
      if (!state.toppings[key]) return;

      const isCurrentlyActive = state.toppings[key].active;
      state.toppings[key].active = !isCurrentlyActive;

      if (state.toppings[key].active) {
        btn.classList.add('is-selected');
      } else {
        btn.classList.remove('is-selected');
      }
      updateBuilderUI();
    });
  });

  // Submit / Vormerken Button
  if (builderSubmitBtn) {
    builderSubmitBtn.addEventListener('click', () => {
      let activeList = [];
      Object.keys(state.toppings).forEach(k => {
        if (state.toppings[k].active) activeList.push(state.toppings[k].name);
      });

      const modal = document.getElementById('site-modal');
      const modalTitle = document.getElementById('modal-title');
      const modalBody = document.getElementById('modal-body-content');

      if (modal && modalTitle && modalBody) {
        modalTitle.textContent = 'Deine Wunsch-Schüssel';
        modalBody.innerHTML = `
          <div style="background-color: var(--color-rice); border: var(--border-thin); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
            <h4 style="font-size: 1.2rem; color: var(--color-red); margin-top: 0;">KIKU ${state.brothName} Spezial</h4>
            <p><strong>Basis-Brühe:</strong> ${state.brothName} (${formatEUR(state.brothPrice)})</p>
            <p><strong>Nudeln:</strong> ${state.noodleName} (+${formatEUR(state.noodlePrice)})</p>
            <p><strong>Toppings:</strong> ${activeList.length ? activeList.join(', ') : 'Klassisch ohne Extras'}</p>
            <div style="height: 1px; background: rgba(29,36,64,0.2); margin: 0.75rem 0;"></div>
            <p style="font-size: 1.2rem; font-weight: 700; color: var(--color-navy); margin: 0;">
              Gesamtpreis: <span style="color: var(--color-red);">${builderTotalPrice.textContent}</span>
            </p>
          </div>
          <p style="font-size: 0.9rem; color: #4b5268;">
            Deine individuelle Schüssel ist vorgemerkt! Du kannst diese Kreation direkt bei deinem nächsten Besuch an unserem Tresen im Prenzlauer Berg bestellen oder mit deiner Tischreservierung verknüpfen.
          </p>
          <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
            <a href="#reservierung" class="btn btn-red btn-sm" onclick="document.getElementById('site-modal').close()">Jetzt Tisch dafür anfragen</a>
            <button type="button" class="btn btn-navy-ghost btn-sm" onclick="document.getElementById('site-modal').close()">Schließen</button>
          </div>
        `;
        modal.showModal();
      }
    });
  }

  updateBuilderUI();
}

function formatEUR(val) {
  return val.toFixed(2).replace('.', ',') + ' €';
}

/* ==========================================================================
   4. Menu Filters
   ========================================================================== */
function initMenuFilters() {
  const chips = document.querySelectorAll('.menu-filters-bar .filter-chip');
  const cards = document.querySelectorAll('.menu-grid .menu-card');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');

      const filter = chip.dataset.filter;

      cards.forEach(card => {
        const categories = card.dataset.category || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInCard 0.35s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. 12-Hour Broth Gauge & Process Clock
   ========================================================================== */
function initBrothGauge() {
  const slider = document.getElementById('gauge-slider');
  const stageBtns = document.querySelectorAll('.stage-item');
  const hourNumText = document.getElementById('gauge-current-hour');
  const stageLabelText = document.getElementById('gauge-status-text');
  const tempDisplay = document.getElementById('gauge-temp-display');
  const pointerGroup = document.getElementById('gauge-pointer-group');
  const progressArc = document.getElementById('gauge-progress-arc');

  const stageData = [
    { hour: 2, label: 'Kaltansatz', temp: '20°C → 75°C', stageIndex: 0 },
    { hour: 6, label: 'Emulsion', temp: '96°C konstant', stageIndex: 1 },
    { hour: 9, label: 'Aromaten', temp: '94°C sanft', stageIndex: 2 },
    { hour: 12, label: 'Tare-Vollendung', temp: '92°C Filtration', stageIndex: 3 }
  ];

  function updateGauge(hour) {
    hour = parseInt(hour, 10);
    if (isNaN(hour) || hour < 1) hour = 1;
    if (hour > 12) hour = 12;

    if (slider) slider.value = hour;
    if (hourNumText) hourNumText.textContent = `${hour}h`;

    // Rotate dial hand: 12h = 360 degrees (30 deg per hour)
    const angle = (hour / 12) * 360;
    if (pointerGroup) {
      pointerGroup.setAttribute('transform', `rotate(${angle} 150 150)`);
    }

    // Circumference of r=130 is 2 * PI * 130 ≈ 816.8
    const circumference = 816.8;
    const offset = circumference - (circumference * (hour / 12));
    if (progressArc) {
      progressArc.style.strokeDashoffset = offset;
    }

    // Stage matching
    let activeStage = 0;
    if (hour <= 2) {
      activeStage = 0;
      if (stageLabelText) stageLabelText.textContent = 'Kaltansatz';
      if (tempDisplay) tempDisplay.textContent = '75°C Vorwärmung';
    } else if (hour <= 6) {
      activeStage = 1;
      if (stageLabelText) stageLabelText.textContent = 'Emulsion';
      if (tempDisplay) tempDisplay.textContent = '96°C Emulsion';
    } else if (hour <= 9) {
      activeStage = 2;
      if (stageLabelText) stageLabelText.textContent = 'Aromaten';
      if (tempDisplay) tempDisplay.textContent = '94°C Infusion';
    } else {
      activeStage = 3;
      if (stageLabelText) stageLabelText.textContent = 'Tare-Vollendung';
      if (tempDisplay) tempDisplay.textContent = '92°C Vollendung';
    }

    stageBtns.forEach((btn, idx) => {
      if (idx === activeStage) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      updateGauge(e.target.value);
    });
  }

  stageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetHour = parseInt(btn.dataset.hour, 10);
      updateGauge(targetHour);
    });
  });

  updateGauge(2);
}

/* ==========================================================================
   6. Interactive Lunch Stamp Card (10 Stamps)
   ========================================================================== */
function initStampCard() {
  const slots = document.querySelectorAll('.stamps-grid .stamp-slot');
  const addBtn = document.getElementById('btn-add-stamp');
  const resetBtn = document.getElementById('btn-reset-stamps');
  const counterText = document.getElementById('stamp-counter-text');
  const rewardBox = document.getElementById('stamp-reward-box');
  const copyBtn = document.getElementById('copy-code-btn');

  const STORAGE_KEY = 'kiku_stamps_count';
  let stampCount = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
  if (stampCount < 0) stampCount = 0;
  if (stampCount > 10) stampCount = 10;

  function renderStamps() {
    slots.forEach((slot, idx) => {
      const slotIndex = idx + 1;
      if (slotIndex <= stampCount) {
        slot.classList.add('is-stamped');
      } else {
        slot.classList.remove('is-stamped');
      }
    });

    if (counterText) {
      counterText.textContent = `${stampCount} von 10`;
    }

    if (stampCount >= 10) {
      if (rewardBox) rewardBox.classList.remove('is-hidden');
    } else {
      if (rewardBox) rewardBox.classList.add('is-hidden');
    }

    localStorage.setItem(STORAGE_KEY, stampCount.toString());
  }

  // Click on single slot
  slots.forEach((slot, idx) => {
    slot.addEventListener('click', () => {
      const targetIdx = idx + 1;
      if (targetIdx > stampCount) {
        stampCount = targetIdx;
      } else if (targetIdx === stampCount) {
        stampCount = targetIdx - 1;
      }
      renderStamps();
    });
  });

  // +1 Button
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (stampCount < 10) {
        stampCount++;
        renderStamps();
      }
    });
  }

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Möchtest du deine KIKU Stempelkarte wirklich zurücksetzen?')) {
        stampCount = 0;
        renderStamps();
      }
    });
  }

  // Copy Code Button
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('KIKU-LUNCH-FREI-10').then(() => {
        const orig = copyBtn.textContent;
        copyBtn.textContent = 'Kopiert!';
        setTimeout(() => {
          copyBtn.textContent = orig;
        }, 2000);
      }).catch(() => {
        alert('Gutscheincode: KIKU-LUNCH-FREI-10');
      });
    });
  }

  renderStamps();
}

/* ==========================================================================
   7. Live Opening Hours Indicator
   ========================================================================== */
function initLiveHours() {
  const pill = document.getElementById('live-hours-pill');
  const label = document.getElementById('live-hours-text');
  if (!pill || !label) return;

  function checkStatus() {
    const now = new Date();
    // Berlin Time
    const day = now.getDay(); // 0 is Sunday, 6 is Saturday
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours + minutes / 60;

    let isOpen = false;
    let nextInfo = '';

    if (day >= 1 && day <= 5) {
      // Mo - Fr: 11:30 - 15:00 & 17:30 - 22:30
      if ((currentTime >= 11.5 && currentTime < 15.0) || (currentTime >= 17.5 && currentTime < 22.5)) {
        isOpen = true;
        nextInfo = currentTime < 15.0 ? 'geöffnet bis 15:00 Uhr' : 'geöffnet bis 22:30 Uhr';
      } else {
        isOpen = false;
        if (currentTime < 11.5) {
          nextInfo = 'öffnet heute um 11:30 Uhr';
        } else if (currentTime < 17.5) {
          nextInfo = 'öffnet heute wieder um 17:30 Uhr';
        } else {
          nextInfo = 'öffnet morgen um 11:30 Uhr';
        }
      }
    } else {
      // Sa - So: 12:00 - 23:00 durchgehend
      if (currentTime >= 12.0 && currentTime < 23.0) {
        isOpen = true;
        nextInfo = 'geöffnet bis 23:00 Uhr';
      } else {
        isOpen = false;
        nextInfo = currentTime < 12.0 ? 'öffnet um 12:00 Uhr' : 'öffnet morgen um 12:00 Uhr';
      }
    }

    if (isOpen) {
      pill.className = 'live-status-pill is-open';
      label.textContent = `Jetzt ${nextInfo}`;
    } else {
      pill.className = 'live-status-pill is-closed';
      label.textContent = `Geschlossen · ${nextInfo}`;
    }
  }

  checkStatus();
  setInterval(checkStatus, 60000); // Check every minute
}

/* ==========================================================================
   8. In-Page Table Reservation Form
   ========================================================================== */
function initReservationForm() {
  const form = document.getElementById('res-form');
  const successBox = document.getElementById('res-success-box');
  const newBtn = document.getElementById('res-new-btn');
  const dateInput = document.getElementById('res-date');

  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  if (form && successBox) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('res-name').value.trim();
      const persons = document.getElementById('res-persons').value;
      const dateVal = document.getElementById('res-date').value;
      const timeVal = document.getElementById('res-time').value;

      if (!name) {
        alert('Bitte gib deinen Namen an.');
        return;
      }

      // Format date for German readout
      let formattedDate = dateVal;
      try {
        const parts = dateVal.split('-');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
      } catch (err) {}

      const confPersons = document.getElementById('conf-persons');
      const confDate = document.getElementById('conf-date');

      if (confPersons) confPersons.textContent = `${persons} Person(en)`;
      if (confDate) confDate.textContent = `${formattedDate} um ${timeVal} Uhr`;

      form.classList.add('is-hidden');
      form.style.display = 'none';
      successBox.classList.remove('is-hidden');
    });

    if (newBtn) {
      newBtn.addEventListener('click', () => {
        form.reset();
        form.style.display = 'flex';
        form.classList.remove('is-hidden');
        successBox.classList.add('is-hidden');
      });
    }
  }
}

/* ==========================================================================
   9. Legal & Information Modals
   ========================================================================== */
function initLegalModals() {
  const modal = document.getElementById('site-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body-content');
  const openImpressum = document.getElementById('open-impressum');
  const openDatenschutz = document.getElementById('open-datenschutz');

  if (!modal || !closeBtn || !modalTitle || !modalBody) return;

  closeBtn.addEventListener('click', () => {
    modal.close();
  });

  // Close when clicking modal backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });

  if (openImpressum) {
    openImpressum.addEventListener('click', () => {
      modalTitle.textContent = 'Impressum';
      modalBody.innerHTML = `
        <h4>Angaben gemäß § 5 TMG</h4>
        <p><strong>KIKU Nudelbar Berlin</strong> (Fiktiver Demonstrationsbetrieb)<br>
        Oderberger Straße 34<br>
        10435 Berlin-Prenzlauer Berg</p>

        <h4>Kontakt</h4>
        <p>Telefon: <a href="tel:+498886661234">+49 888 6661234</a><br>
        E-Mail: <a href="mailto:12234456789@gmail.com">12234456789@gmail.com</a><br>
        Telegram: <a href="https://t.me/rovatt" target="_blank" rel="noopener">@rovatt</a></p>

        <h4>Konzeption & Gestaltung</h4>
        <p>Gestaltung: Renat<br>
        Fiktives Portfolio- und Showcase-Projekt zur Demonstration moderner Restaurant-Webauftritte in Berlin.</p>
      `;
      modal.showModal();
    });
  }

  if (openDatenschutz) {
    openDatenschutz.addEventListener('click', () => {
      modalTitle.textContent = 'Datenschutzerklärung';
      modalBody.innerHTML = `
        <h4>1. Datenschutz auf einen Blick</h4>
        <p>Diese Website ist ein fiktives Demonstrationsprojekt von Renat. Es werden keine personenbezogenen Tracking-Daten an externe Werbenetzwerke übertragen.</p>
        
        <h4>2. Lokale Speicherung (LocalStorage)</h4>
        <p>Für die interaktive Lunch-Stempelkarte speichern wir deinen Stempelstand ausschließlich lokal in deinem Webbrowser (LocalStorage). Diese Daten verlassen dein Endgerät zu keinem Zeitpunkt.</p>

        <h4>3. Tischreservierungsformular</h4>
        <p>Eingaben im Reservierungsformular werden clientseitig verarbeitet und nicht auf einem Server gespeichert. Es erfolgt keine Weitergabe an Dritte.</p>
      `;
      modal.showModal();
    });
  }
}
