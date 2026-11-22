/**
 * 3D Neapolitan Dome Oven Simulation (Three.js)
 * Pizzeria Pugliese – Forno a Legna
 * Featuring procedural terracotta dome, flickering fire light, Biscotto stone floor,
 * pizza on peel, and interactive orbit controls.
 */

(function () {
  'use strict';

  const container = document.getElementById('threejsOvenContainer');
  if (!container) return;

  // Temperature display HUD update
  const tempDegrees = document.getElementById('ovenTempDegrees');
  if (tempDegrees) {
    setInterval(() => {
      const base = 485;
      const variation = Math.floor(Math.sin(Date.now() * 0.003) * 2) + (Math.random() > 0.6 ? 1 : 0);
      tempDegrees.textContent = `${base + variation} °C`;
    }, 1400);
  }

  // Check WebGL availability and Three.js
  function isWebGLAvailable() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!window.THREE || !isWebGLAvailable()) {
    container.classList.add('fallback-mode');
    return;
  }

  let scene, camera, renderer;
  let ovenGroup;
  let fireLight, ambientLight, frontLight;
  let flameMeshes = [];
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotationY = 0.45;
  let targetRotationX = 0.15;
  let currentRotationY = 0.45;
  let currentRotationX = 0.15;
  let isVisible = false;
  let animId = null;

  function initThree() {
    try {
      const width = container.clientWidth || 600;
      const height = container.clientHeight || 420;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 3.2, 11);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      const canvas = renderer.domElement;
      canvas.className = 'threejs-canvas';
      container.appendChild(canvas);

      // Lights
      ambientLight = new THREE.AmbientLight(0x2A241F, 1.2);
      scene.add(ambientLight);

      frontLight = new THREE.DirectionalLight(0xF4EDE1, 1.0);
      frontLight.position.set(4, 8, 8);
      scene.add(frontLight);

      // Flickering Fire Light inside the oven mouth
      fireLight = new THREE.PointLight(0xFF6A00, 3.5, 12, 1.4);
      fireLight.position.set(-0.8, 0.4, 0.8);
      scene.add(fireLight);

      // Gracefully handle context loss without console errors
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        container.classList.add('fallback-mode');
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }, false);

      // Build Dome Oven Object Group
      buildOvenModel();

      // Setup interaction
      setupInteraction(canvas);

      // Setup intersection observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            animate();
          }
        });
      }, { threshold: 0.15 });

      observer.observe(container);

      window.addEventListener('resize', onWindowResize, { passive: true });
    } catch (err) {
      // Graceful fallback to static high-res photo without console errors
      container.classList.add('fallback-mode');
    }
  }

  function buildOvenModel() {
    ovenGroup = new THREE.Group();
    scene.add(ovenGroup);

    // 1. Stone Hearth Base / Counter (Basalt Stand)
    const baseGeo = new THREE.CylinderGeometry(4.3, 4.5, 1.6, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x221E19,
      roughness: 0.85,
      metalness: 0.1
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.8;
    ovenGroup.add(baseMesh);

    // 2. Terracotta Dome (Cupola Napoletana)
    const domeGeo = new THREE.SphereGeometry(3.8, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x963725, // Deep Pompeian terracotta
      roughness: 0.75,
      metalness: 0.05
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.y = 0;
    ovenGroup.add(domeMesh);

    // Subtle dome decorative bands (tiled mosaic rows)
    const bandGeo = new THREE.TorusGeometry(3.82, 0.07, 16, 40);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0xE8D7C0, // Flour cream mosaic band
      roughness: 0.6
    });
    const bandMesh1 = new THREE.Mesh(bandGeo, bandMat);
    bandMesh1.rotation.x = Math.PI / 2;
    bandMesh1.position.y = 1.0;
    ovenGroup.add(bandMesh1);

    const bandMesh2 = bandMesh1.clone();
    bandMesh2.scale.set(0.85, 0.85, 0.85);
    bandMesh2.position.y = 2.2;
    ovenGroup.add(bandMesh2);

    // 3. Biscotto di Sorrento Floor (Porous volcanic stone inside oven)
    const stoneFloorGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.2, 32);
    const stoneFloorMat = new THREE.MeshStandardMaterial({
      color: 0x8C5E3C, // Volcanic clay stone
      roughness: 0.95
    });
    const stoneFloor = new THREE.Mesh(stoneFloorGeo, stoneFloorMat);
    stoneFloor.position.y = 0.08;
    ovenGroup.add(stoneFloor);

    // 4. Arch Mouth (Bocca del Forno)
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0.6, 3.2);

    // Arch Outer Frame (Brick curvature)
    const archCurveGeo = new THREE.TorusGeometry(1.5, 0.32, 16, 24, Math.PI);
    const brickMat = new THREE.MeshStandardMaterial({
      color: 0xAD452B, // Terracotta bricks
      roughness: 0.8
    });
    const archCurve = new THREE.Mesh(archCurveGeo, brickMat);
    archCurve.rotation.z = Math.PI;
    archCurve.position.y = 0.3;
    archGroup.add(archCurve);

    // Arch Pillars
    const pillarGeo = new THREE.BoxGeometry(0.5, 1.2, 0.6);
    const leftPillar = new THREE.Mesh(pillarGeo, brickMat);
    leftPillar.position.set(-1.5, -0.3, 0);
    archGroup.add(leftPillar);

    const rightPillar = leftPillar.clone();
    rightPillar.position.x = 1.5;
    archGroup.add(rightPillar);

    // Dark Cavity Interior (Soot-covered back of hearth)
    const cavityGeo = new THREE.CylinderGeometry(1.6, 1.6, 1.6, 20, 1, false, 0, Math.PI);
    const cavityMat = new THREE.MeshStandardMaterial({
      color: 0x0A0908,
      roughness: 1.0
    });
    const cavity = new THREE.Mesh(cavityGeo, cavityMat);
    cavity.position.set(0, 0.5, -0.8);
    cavity.rotation.y = Math.PI;
    archGroup.add(cavity);

    ovenGroup.add(archGroup);

    // 5. Chimney Flue (Canna Fumaria) above the arch
    const chimneyGeo = new THREE.CylinderGeometry(0.5, 0.55, 1.4, 20);
    const chimneyMat = new THREE.MeshStandardMaterial({
      color: 0x2A2722,
      roughness: 0.7
    });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(0, 3.2, 2.5);
    ovenGroup.add(chimney);

    const chimneyCapGeo = new THREE.ConeGeometry(0.75, 0.4, 20);
    const chimneyCap = new THREE.Mesh(chimneyCapGeo, chimneyMat);
    chimneyCap.position.set(0, 4.0, 2.5);
    ovenGroup.add(chimneyCap);

    // 6. Flickering Flame Meshes inside hearth
    const flameGeo = new THREE.PlaneGeometry(0.8, 1.2);
    const flameMat1 = new THREE.MeshBasicMaterial({
      color: 0xFF5500,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const flameMat2 = new THREE.MeshBasicMaterial({
      color: 0xFFAA00,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 4; i++) {
      const f = new THREE.Mesh(flameGeo, i % 2 === 0 ? flameMat1 : flameMat2);
      f.position.set(-0.9 + (i * 0.2), 0.5 + (i * 0.05), 1.6 + (i * 0.15));
      f.rotation.y = (Math.random() - 0.5) * 0.6;
      ovenGroup.add(f);
      flameMeshes.push({
        mesh: f,
        baseScaleY: 1.0 + Math.random() * 0.4,
        speed: 4 + Math.random() * 4,
        offset: Math.random() * Math.PI * 2
      });
    }

    // 7. Pizza on Wooden Peel sliding onto Biscotto stone
    const pizzaGroup = new THREE.Group();
    pizzaGroup.position.set(0.6, 0.2, 2.6);
    pizzaGroup.rotation.y = -0.2;

    // Wooden Peel Handle
    const handleGeo = new THREE.BoxGeometry(0.12, 0.06, 3.5);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x825432, roughness: 0.8 });
    const handle = new THREE.Mesh(handleGeo, woodMat);
    handle.position.z = 1.8;
    pizzaGroup.add(handle);

    // Peel Board Head
    const peelHeadGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.04, 24);
    const peelHead = new THREE.Mesh(peelHeadGeo, woodMat);
    peelHead.position.z = 0.2;
    pizzaGroup.add(peelHead);

    // Pizza Dough Disc (with puffy golden rim)
    const pizzaRimGeo = new THREE.TorusGeometry(0.72, 0.12, 12, 24);
    const doughMat = new THREE.MeshStandardMaterial({
      color: 0xD4A36A, // Golden baked dough with leopard specks
      roughness: 0.85
    });
    const pizzaRim = new THREE.Mesh(pizzaRimGeo, doughMat);
    pizzaRim.rotation.x = Math.PI / 2;
    pizzaRim.position.set(0, 0.05, 0.2);
    pizzaGroup.add(pizzaRim);

    // Pizza Sauce & Mozzarella Center
    const sauceGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.02, 24);
    const sauceMat = new THREE.MeshStandardMaterial({
      color: 0xB3261E, // San Marzano tomato red
      roughness: 0.5
    });
    const sauce = new THREE.Mesh(sauceGeo, sauceMat);
    sauce.position.set(0, 0.04, 0.2);
    pizzaGroup.add(sauce);

    // White Mozzarella drops
    const mozMat = new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.4 });
    for (let m = 0; m < 5; m++) {
      const angle = (m / 5) * Math.PI * 2 + 0.3;
      const dist = 0.35;
      const mozGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.03, 12);
      const moz = new THREE.Mesh(mozGeo, mozMat);
      moz.position.set(Math.cos(angle) * dist, 0.06, 0.2 + Math.sin(angle) * dist);
      pizzaGroup.add(moz);
    }

    ovenGroup.add(pizzaGroup);

    // Initial group angles
    ovenGroup.rotation.y = currentRotationY;
    ovenGroup.rotation.x = currentRotationX;
  }

  function setupInteraction(canvas) {
    function onPointerDown(e) {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    }

    function onPointerMove(e) {
      if (!isDragging) {
        // Subtle hover tilt
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const xRel = (clientX - rect.left) / rect.width - 0.5;
        targetRotationY = 0.45 + xRel * 0.4;
        return;
      }

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      targetRotationY += deltaX * 0.008;
      targetRotationX = Math.max(-0.1, Math.min(0.4, targetRotationX + deltaY * 0.005));

      previousMousePosition = { x: clientX, y: clientY };
    }

    function onPointerUp() {
      isDragging = false;
    }

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });
  }

  function onWindowResize() {
    if (!renderer || !camera || !container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    if (!isVisible) {
      animId = null;
      return;
    }

    const time = Date.now() * 0.001;

    // Smooth rotation damping
    currentRotationY += (targetRotationY - currentRotationY) * 0.06;
    currentRotationX += (targetRotationX - currentRotationX) * 0.06;

    // Subtle breathing drift when idle
    if (!isDragging) {
      targetRotationY += 0.0015;
    }

    if (ovenGroup) {
      ovenGroup.rotation.y = currentRotationY;
      ovenGroup.rotation.x = currentRotationX;
    }

    // Dynamic fire flicker
    if (fireLight) {
      const flicker = Math.sin(time * 12) * 0.4 + Math.sin(time * 23) * 0.3 + (Math.random() * 0.4 - 0.2);
      fireLight.intensity = Math.max(2.4, 3.4 + flicker);

      // Light color breathing
      const g = 0.35 + Math.sin(time * 5) * 0.08;
      fireLight.color.setRGB(1.0, g, 0.05);

      // Slight flame positional jitter
      fireLight.position.x = -0.8 + Math.sin(time * 15) * 0.05;
      fireLight.position.y = 0.4 + Math.cos(time * 18) * 0.04;
    }

    // Flame mesh oscillations
    flameMeshes.forEach((item) => {
      const osc = Math.sin(time * item.speed + item.offset);
      item.mesh.scale.y = item.baseScaleY + osc * 0.25;
      item.mesh.position.y = 0.5 + (osc * 0.05);
      item.mesh.rotation.z = Math.sin(time * 3 + item.offset) * 0.15;
    });

    renderer.render(scene, camera);
    animId = requestAnimationFrame(animate);
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
})();
