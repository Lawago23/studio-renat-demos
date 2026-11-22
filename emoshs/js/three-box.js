/**
 * Emosh's Late-Night Pizza & Döner - 3D Rotating Neon Pizza Box (Three.js r128 & CSS 3D Fallback)
 * Features a neon glowing pizza box that opens on scroll to reveal a steaming pizza inside.
 * If WebGL is not available or throws during context creation, gracefully falls back
 * to an interactive CSS 3D pizza box without any uncaught console errors.
 */
(function () {
  'use strict';

  var container = document.getElementById('three-box-container');
  var fallbackEl = document.getElementById('three-box-fallback');
  var lidStatusEl = document.getElementById('box-lid-status');
  var toggleLidBtn = document.getElementById('box-lid-toggle');
  var toggleRotateBtn = document.getElementById('box-rotate-toggle');

  if (!container && !fallbackEl) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Safe WebGL detection helper
   */
  function isWebGLAvailable() {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // --- CSS 3D Fallback Implementation ---
  function activateCss3DFallback() {
    if (fallbackEl) {
      fallbackEl.classList.add('active');
      fallbackEl.style.display = 'flex';
    }
    if (container) {
      container.style.display = 'none';
    }

    var cssBox = document.getElementById('css3d-box');
    var cssLid = document.getElementById('css3d-lid');
    var section = document.getElementById('box-3d-section');

    if (!cssBox || !cssLid) return;

    var cssRotX = 28;
    var cssRotY = -24;
    var targetCssRotX = 28;
    var targetCssRotY = -24;
    var cssLidAngle = 0;
    var targetCssLidAngle = 0;
    var cssAutoRotate = true;
    var cssIsDragging = false;
    var prevX = 0;
    var prevY = 0;
    var cssAnimId = null;
    var cssIsVisible = true;

    function applyTransforms() {
      cssBox.style.transform = 'rotateX(' + cssRotX.toFixed(2) + 'deg) rotateY(' + cssRotY.toFixed(2) + 'deg)';
      cssLid.style.transform = 'translateZ(20px) rotateX(' + cssLidAngle.toFixed(2) + 'deg)';
    }

    function updateLidStatus(angle) {
      if (!lidStatusEl) return;
      if (angle < 12) {
        lidStatusEl.textContent = 'Status: Geschlossen · Scrollen zum Öffnen';
      } else if (angle >= 85) {
        lidStatusEl.textContent = 'Status: Geöffnet · Dampfender Sucuk-Steinofen-Belag';
      } else {
        var pct = Math.round((angle / 115) * 100);
        lidStatusEl.textContent = 'Status: Öffnet sich (' + Math.min(100, Math.max(0, pct)) + '%)';
      }
    }

    function handleCssScroll() {
      if (!section) return;
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight;
      var progress = (vh - rect.top) / (vh + rect.height * 0.6);
      progress = Math.max(0, Math.min(1, progress));
      var eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      targetCssLidAngle = Math.max(0, Math.min(115, eased * 125));
      targetCssRotX = 28 + (targetCssLidAngle / 115) * 14;
      if (prefersReducedMotion) {
        cssLidAngle = targetCssLidAngle;
        cssRotX = targetCssRotX;
        applyTransforms();
        updateLidStatus(cssLidAngle);
      }
    }

    window.addEventListener('scroll', handleCssScroll, { passive: true });
    handleCssScroll();
    applyTransforms();
    updateLidStatus(cssLidAngle);

    if ('IntersectionObserver' in window && section) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          cssIsVisible = entry.isIntersecting;
          if (cssIsVisible && !cssAnimId && !prefersReducedMotion) {
            cssAnimId = requestAnimationFrame(cssLoop);
          } else if (!cssIsVisible && cssAnimId) {
            cancelAnimationFrame(cssAnimId);
            cssAnimId = null;
          }
        });
      }, { threshold: 0.05 });
      observer.observe(section);
    }

    // Drag to rotate in CSS 3D perspective space
    var sceneEl = document.getElementById('css3d-scene') || fallbackEl;
    sceneEl.addEventListener('pointerdown', function (e) {
      cssIsDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      cssAutoRotate = false;
      if (toggleRotateBtn) {
        toggleRotateBtn.classList.remove('active');
        toggleRotateBtn.setAttribute('aria-pressed', 'false');
      }
    });

    window.addEventListener('pointermove', function (e) {
      if (!cssIsDragging) return;
      var dx = e.clientX - prevX;
      var dy = e.clientY - prevY;
      targetCssRotY += dx * 0.45;
      targetCssRotX -= dy * 0.45;
      targetCssRotX = Math.max(-10, Math.min(75, targetCssRotX));
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener('pointerup', function () {
      cssIsDragging = false;
    });

    // Control buttons
    if (toggleLidBtn) {
      toggleLidBtn.addEventListener('click', function () {
        if (targetCssLidAngle > 30) {
          targetCssLidAngle = 0;
          this.setAttribute('aria-pressed', 'false');
        } else {
          targetCssLidAngle = 115;
          this.setAttribute('aria-pressed', 'true');
        }
      });
    }

    if (toggleRotateBtn) {
      toggleRotateBtn.addEventListener('click', function () {
        cssAutoRotate = !cssAutoRotate;
        this.classList.toggle('active', cssAutoRotate);
        this.setAttribute('aria-pressed', cssAutoRotate ? 'true' : 'false');
      });
    }

    // Lid click toggles open/close
    cssLid.addEventListener('click', function (e) {
      e.stopPropagation();
      if (targetCssLidAngle > 30) {
        targetCssLidAngle = 0;
        if (toggleLidBtn) toggleLidBtn.setAttribute('aria-pressed', 'false');
      } else {
        targetCssLidAngle = 115;
        if (toggleLidBtn) toggleLidBtn.setAttribute('aria-pressed', 'true');
      }
    });

    function cssLoop() {
      if (!cssIsVisible) return;
      cssLidAngle += (targetCssLidAngle - cssLidAngle) * 0.1;
      updateLidStatus(cssLidAngle);

      if (cssAutoRotate && !cssIsDragging) {
        targetCssRotY += 0.25;
      }

      cssRotX += (targetCssRotX - cssRotX) * 0.08;
      cssRotY += (targetCssRotY - cssRotY) * 0.08;

      applyTransforms();
      cssAnimId = requestAnimationFrame(cssLoop);
    }

    if (!prefersReducedMotion) {
      cssAnimId = requestAnimationFrame(cssLoop);
    } else {
      cssLidAngle = 90;
      applyTransforms();
      updateLidStatus(90);
    }
  }

  // If Three.js library is not available or WebGL context cannot be created, activate CSS 3D fallback
  if (typeof THREE === 'undefined' || !isWebGLAvailable()) {
    activateCss3DFallback();
    return;
  }

  // --- Three.js WebGL 3D Implementation ---
  var scene, camera, renderer;
  var boxGroup, lidPivot, pizzaGroup, steamParticles, lidMesh;
  var currentLidAngle = 0;
  var targetLidAngle = 0;
  var autoRotate = true;
  var isDragging = false;
  var prevPointerX = 0;
  var prevPointerY = 0;
  var boxRotX = 0.35;
  var boxRotY = -0.55;
  var targetRotX = 0.35;
  var targetRotY = -0.55;
  var animFrameId = null;
  var isVisible = true;
  var interiorLight = null;

  function createLidTexture() {
    var c = document.createElement('canvas');
    c.width = 1024;
    c.height = 1024;
    var ctx = c.getContext('2d');

    // Dark slate background
    ctx.fillStyle = '#0f0f18';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle cardboard texture grid
    ctx.strokeStyle = 'rgba(255, 46, 136, 0.08)';
    ctx.lineWidth = 1;
    for (var x = 0; x <= 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (var y = 0; y <= 1024; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Outer neon borders
    ctx.strokeStyle = '#FF2E88';
    ctx.lineWidth = 14;
    ctx.strokeRect(50, 50, 924, 924);

    ctx.strokeStyle = '#19E3FF';
    ctx.lineWidth = 4;
    ctx.strokeRect(70, 70, 884, 884);

    // Corner decorative brackets
    var bracketLen = 80;
    ctx.strokeStyle = '#FFE45E';
    ctx.lineWidth = 8;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(90, 90 + bracketLen); ctx.lineTo(90, 90); ctx.lineTo(90 + bracketLen, 90); ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(1024 - 90 - bracketLen, 90); ctx.lineTo(1024 - 90, 90); ctx.lineTo(1024 - 90, 90 + bracketLen); ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(90, 1024 - 90 - bracketLen); ctx.lineTo(90, 1024 - 90); ctx.lineTo(90 + bracketLen, 1024 - 90); ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(1024 - 90 - bracketLen, 1024 - 90); ctx.lineTo(1024 - 90, 1024 - 90); ctx.lineTo(1024 - 90, 1024 - 90 - bracketLen); ctx.stroke();

    // Top text: BERLIN FRIEDRICHSHAIN
    ctx.fillStyle = '#FFE45E';
    ctx.font = 'bold 32px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ BERLIN-FRIEDRICHSHAIN · WARSCHAUER STR. ★', 512, 190);

    // Main Logo: EMOSH'S
    ctx.shadowColor = '#FF2E88';
    ctx.shadowBlur = 35;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 132px "Monoton", "Space Grotesk", sans-serif';
    ctx.fillText("EMOSH'S", 512, 380);

    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF2E88';
    ctx.font = 'bold 56px "Space Grotesk", sans-serif';
    ctx.fillText('HOT & FRESH UNTIL 5 AM', 512, 470);
    ctx.shadowBlur = 0;

    // Center circular badge
    ctx.beginPath();
    ctx.arc(512, 630, 110, 0, Math.PI * 2);
    ctx.strokeStyle = '#19E3FF';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#19E3FF';
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillText('PIZZA & DÖNER', 512, 615);
    ctx.fillStyle = '#FFE45E';
    ctx.font = 'bold 42px "Space Grotesk", sans-serif';
    ctx.fillText('ORIGINAL', 512, 665);

    // Bottom warning & tagline
    ctx.fillStyle = '#A0A0C0';
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.fillText('ECHTE HOLZKOHLE · 40CM STEINOFEN · 100% KALB', 512, 830);

    ctx.fillStyle = '#FF2E88';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillText('ACHTUNG: VORSICHT HEISS · DIRECT DELIVERY VIA TELEGRAM @ROVATT', 512, 880);

    var texture = new THREE.CanvasTexture(c);
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }

  function createPizzaTexture() {
    var c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    var ctx = c.getContext('2d');

    // Golden crust ring
    var grad = ctx.createRadialGradient(256, 256, 170, 256, 256, 256);
    grad.addColorStop(0, '#c9641e');
    grad.addColorStop(0.75, '#b04a11');
    grad.addColorStop(0.95, '#5c2205');
    grad.addColorStop(1, '#3b1202');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 256, 0, Math.PI * 2);
    ctx.fill();

    // Tomato base
    var tomatoGrad = ctx.createRadialGradient(256, 256, 0, 256, 256, 220);
    tomatoGrad.addColorStop(0, '#b82012');
    tomatoGrad.addColorStop(0.8, '#91160a');
    tomatoGrad.addColorStop(1, '#660e05');
    ctx.fillStyle = tomatoGrad;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.fill();

    // Melted Mozzarella patches
    ctx.fillStyle = 'rgba(255, 238, 180, 0.88)';
    var cheesePatches = [
      { x: 220, y: 210, r: 42 },
      { x: 300, y: 240, r: 38 },
      { x: 250, y: 310, r: 48 },
      { x: 180, y: 280, r: 35 },
      { x: 320, y: 170, r: 34 },
      { x: 160, y: 190, r: 30 },
      { x: 270, y: 140, r: 36 }
    ];
    cheesePatches.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sucuk / Pepperoni slices
    var pepperoniList = [
      { x: 200, y: 160, r: 24 },
      { x: 330, y: 200, r: 26 },
      { x: 280, y: 270, r: 28 },
      { x: 170, y: 260, r: 24 },
      { x: 220, y: 340, r: 25 },
      { x: 340, y: 300, r: 23 },
      { x: 160, y: 330, r: 22 },
      { x: 260, y: 200, r: 27 }
    ];
    pepperoniList.forEach(function (p) {
      var pepGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      pepGrad.addColorStop(0, '#8c160f');
      pepGrad.addColorStop(0.7, '#6e0f09');
      pepGrad.addColorStop(1, '#3b0502');
      ctx.fillStyle = pepGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Roasted edge ring
      ctx.strokeStyle = '#290300';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spice specks
      ctx.fillStyle = 'rgba(255, 200, 100, 0.4)';
      ctx.fillRect(p.x - 4, p.y - 3, 2, 2);
      ctx.fillRect(p.x + 5, p.y + 2, 2, 2);
    });

    // Fresh Basil leaves
    ctx.fillStyle = '#2d6a2e';
    var basilSpots = [
      { x: 240, y: 240, w: 18, h: 9, a: 0.4 },
      { x: 300, y: 340, w: 16, h: 8, a: -0.7 },
      { x: 150, y: 220, w: 17, h: 8, a: 1.2 },
      { x: 280, y: 160, w: 19, h: 9, a: -0.3 }
    ];
    basilSpots.forEach(function (b) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.a);
      ctx.beginPath();
      ctx.ellipse(0, 0, b.w, b.h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    var texture = new THREE.CanvasTexture(c);
    texture.needsUpdate = true;
    return texture;
  }

  function initThree() {
    var width = container.clientWidth || 390;
    var height = container.clientHeight || 480;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0b12, 0.035);

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 9.0);
    camera.lookAt(0, -0.3, 0);

    // Safe WebGLRenderer instantiation inside try/catch block
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      // Uncaught WebGL creation error prevented: switch cleanly to CSS 3D fallback
      activateCss3DFallback();
      return;
    }

    if (!renderer || !renderer.domElement) {
      activateCss3DFallback();
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights: Vivid illumination so the 3D box is visible immediately
    var ambientLight = new THREE.AmbientLight(0x30304a, 1.4);
    scene.add(ambientLight);

    var hemiLight = new THREE.HemisphereLight(0x3a3a5e, 0x11111c, 0.9);
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(2, 8, 5);
    scene.add(dirLight);

    // Neon Pink Rim Light
    var pinkLight = new THREE.PointLight(0xFF2E88, 4.0, 22);
    pinkLight.position.set(-5, 4, 3);
    scene.add(pinkLight);

    // Neon Cyan Key Light
    var cyanLight = new THREE.PointLight(0x19E3FF, 4.0, 22);
    cyanLight.position.set(5, 3, 4);
    scene.add(cyanLight);

    // Warm Interior Pizza Light
    interiorLight = new THREE.PointLight(0xFFE45E, 0, 8);
    interiorLight.position.set(0, 1.0, 0);
    scene.add(interiorLight);

    // Box Group
    boxGroup = new THREE.Group();
    boxGroup.position.set(0, -0.4, 0);
    boxGroup.rotation.x = boxRotX;
    boxGroup.rotation.y = boxRotY;
    scene.add(boxGroup);

    var boxWidth = 4.8;
    var boxHeight = 0.55;
    var boxDepth = 4.8;

    // Materials
    var darkBoxMat = new THREE.MeshStandardMaterial({
      color: 0x141422,
      roughness: 0.35,
      metalness: 0.15
    });

    // 1. Box Bottom Tray (5 faces: bottom and 4 sides)
    var bottomGeo = new THREE.BoxBufferGeometry(boxWidth, 0.05, boxDepth);
    var bottomMesh = new THREE.Mesh(bottomGeo, darkBoxMat);
    bottomMesh.position.set(0, -boxHeight / 2 + 0.025, 0);
    boxGroup.add(bottomMesh);

    // Walls
    var wallThickness = 0.05;
    var leftWallGeo = new THREE.BoxBufferGeometry(wallThickness, boxHeight, boxDepth);
    var leftWall = new THREE.Mesh(leftWallGeo, darkBoxMat);
    leftWall.position.set(-boxWidth / 2 + wallThickness / 2, 0, 0);
    boxGroup.add(leftWall);

    var rightWall = new THREE.Mesh(leftWallGeo, darkBoxMat);
    rightWall.position.set(boxWidth / 2 - wallThickness / 2, 0, 0);
    boxGroup.add(rightWall);

    var frontWallGeo = new THREE.BoxBufferGeometry(boxWidth, boxHeight, wallThickness);
    var frontWall = new THREE.Mesh(frontWallGeo, darkBoxMat);
    frontWall.position.set(0, 0, boxDepth / 2 - wallThickness / 2);
    boxGroup.add(frontWall);

    var backWall = new THREE.Mesh(frontWallGeo, darkBoxMat);
    backWall.position.set(0, 0, -boxDepth / 2 + wallThickness / 2);
    boxGroup.add(backWall);

    // Neon edge outlines on the bottom tray
    var bottomEdgesGeo = new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(boxWidth + 0.02, boxHeight + 0.02, boxDepth + 0.02));
    var cyanLineMat = new THREE.LineBasicMaterial({ color: 0x19E3FF, linewidth: 2 });
    var bottomLineSegments = new THREE.LineSegments(bottomEdgesGeo, cyanLineMat);
    boxGroup.add(bottomLineSegments);

    // 2. Hinged Lid
    lidPivot = new THREE.Group();
    lidPivot.position.set(0, boxHeight / 2, -boxDepth / 2);
    boxGroup.add(lidPivot);

    var lidMatMaterials = [
      darkBoxMat, // right
      darkBoxMat, // left
      new THREE.MeshStandardMaterial({
        map: createLidTexture(),
        roughness: 0.3,
        metalness: 0.1
      }), // top printed face
      new THREE.MeshStandardMaterial({
        color: 0x222234,
        roughness: 0.5
      }), // bottom interior
      darkBoxMat, // front
      darkBoxMat  // back
    ];

    var lidThickness = 0.06;
    var lidGeo = new THREE.BoxBufferGeometry(boxWidth + 0.06, lidThickness, boxDepth + 0.06);
    lidMesh = new THREE.Mesh(lidGeo, lidMatMaterials);
    lidMesh.position.set(0, lidThickness / 2, (boxDepth + 0.06) / 2);
    lidPivot.add(lidMesh);

    // Lid neon rim line
    var lidEdgesGeo = new THREE.EdgesGeometry(lidGeo);
    var pinkLineMat = new THREE.LineBasicMaterial({ color: 0xFF2E88, linewidth: 2 });
    var lidLineSegments = new THREE.LineSegments(lidEdgesGeo, pinkLineMat);
    lidLineSegments.position.copy(lidMesh.position);
    lidPivot.add(lidLineSegments);

    // 3. Hot Pizza inside
    pizzaGroup = new THREE.Group();
    pizzaGroup.position.set(0, -boxHeight / 2 + 0.08, 0);
    boxGroup.add(pizzaGroup);

    var pizzaGeo = new THREE.CylinderBufferGeometry(2.0, 2.05, 0.12, 36);
    var pizzaMat = [
      new THREE.MeshStandardMaterial({ color: 0x8b3a0a, roughness: 0.8 }), // crust rim
      new THREE.MeshStandardMaterial({
        map: createPizzaTexture(),
        roughness: 0.4,
        metalness: 0.05
      }), // top pizza face
      new THREE.MeshBasicMaterial({ color: 0x241106 }) // bottom
    ];
    var pizzaMesh = new THREE.Mesh(pizzaGeo, pizzaMat);
    pizzaGroup.add(pizzaMesh);

    // 4. Steam Particles rising from the hot pizza
    var particleCount = 45;
    var particleGeo = new THREE.BufferGeometry();
    var particlePositions = new Float32Array(particleCount * 3);
    var particleVelocities = [];

    for (var i = 0; i < particleCount; i++) {
      var rad = Math.random() * 1.6;
      var ang = Math.random() * Math.PI * 2;
      particlePositions[i * 3] = Math.cos(ang) * rad;
      particlePositions[i * 3 + 1] = Math.random() * 1.2;
      particlePositions[i * 3 + 2] = Math.sin(ang) * rad;

      particleVelocities.push({
        y: Math.random() * 0.015 + 0.008,
        driftX: (Math.random() - 0.5) * 0.005,
        driftZ: (Math.random() - 0.5) * 0.005,
        maxHeight: Math.random() * 2.2 + 1.2
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    var particleCanvas = document.createElement('canvas');
    particleCanvas.width = 64;
    particleCanvas.height = 64;
    var pCtx = particleCanvas.getContext('2d');
    var pGrad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    pGrad.addColorStop(0, 'rgba(255, 235, 170, 0.85)');
    pGrad.addColorStop(0.4, 'rgba(255, 120, 190, 0.35)');
    pGrad.addColorStop(1, 'rgba(255, 46, 136, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);

    var pTexture = new THREE.CanvasTexture(particleCanvas);

    var particleMat = new THREE.PointsMaterial({
      size: 0.45,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.7
    });

    steamParticles = new THREE.Points(particleGeo, particleMat);
    steamParticles.userData = { velocities: particleVelocities };
    pizzaGroup.add(steamParticles);

    // Pointer Drag Interaction
    setupInteractions();
    setupScrollTrigger();

    // Render immediately so the 3D box is visible without waiting for interaction
    onWindowResize();
    renderer.render(scene, camera);

    if (!prefersReducedMotion) {
      animFrameId = requestAnimationFrame(animate);
    } else {
      currentLidAngle = 1.4;
      lidPivot.rotation.x = -currentLidAngle;
      renderer.render(scene, camera);
    }

    window.addEventListener('resize', onWindowResize, { passive: true });

    if ('ResizeObserver' in window && container) {
      var ro = new ResizeObserver(function () {
        onWindowResize();
      });
      ro.observe(container);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (lidMesh && lidMesh.material && lidMesh.material[2]) {
          lidMesh.material[2].map = createLidTexture();
          lidMesh.material[2].map.needsUpdate = true;
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        }
      });
    }
  }

  function setupInteractions() {
    if (!renderer || !renderer.domElement) return;
    var dom = renderer.domElement;

    dom.addEventListener('pointerdown', function (e) {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      autoRotate = false;
      if (toggleRotateBtn) {
        toggleRotateBtn.classList.remove('active');
        toggleRotateBtn.setAttribute('aria-pressed', 'false');
      }
    });

    window.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - prevPointerX;
      var dy = e.clientY - prevPointerY;
      targetRotY += dx * 0.008;
      targetRotX += dy * 0.008;
      targetRotX = Math.max(-0.2, Math.min(0.9, targetRotX));
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    });

    window.addEventListener('pointerup', function () {
      isDragging = false;
    });

    // Control buttons
    if (toggleLidBtn) {
      toggleLidBtn.addEventListener('click', function () {
        if (targetLidAngle > 0.5) {
          targetLidAngle = 0;
          this.setAttribute('aria-pressed', 'false');
        } else {
          targetLidAngle = 1.85;
          this.setAttribute('aria-pressed', 'true');
        }
      });
    }

    if (toggleRotateBtn) {
      toggleRotateBtn.addEventListener('click', function () {
        autoRotate = !autoRotate;
        this.classList.toggle('active', autoRotate);
        this.setAttribute('aria-pressed', autoRotate ? 'true' : 'false');
      });
    }
  }

  function setupScrollTrigger() {
    var section = document.getElementById('box-3d-section');
    if (!section) return;

    function handleScroll() {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight;

      // When section enters screen, map scroll progress to lid angle
      var progress = (vh - rect.top) / (vh + rect.height * 0.6);
      progress = Math.max(0, Math.min(1, progress));

      // Ease progress slightly
      var eased = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      targetLidAngle = Math.max(0, Math.min(1.85, eased * 1.95));

      // Gently tilt box forward as it opens so pizza is clearly visible
      targetRotX = 0.35 + (targetLidAngle / 1.85) * 0.22;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            onWindowResize();
            handleScroll();
            if (renderer && scene && camera) {
              renderer.render(scene, camera); // Immediately render on viewport entry!
            }
            if (!animFrameId && !prefersReducedMotion) {
              animFrameId = requestAnimationFrame(animate);
            }
          } else if (!isVisible && animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
          }
        });
      }, { threshold: 0.05 });
      observer.observe(section);
    }
  }

  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    var w = container.clientWidth;
    var h = container.clientHeight;
    if (w <= 0 || h <= 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.render(scene, camera);
  }

  function animate() {
    if (!isVisible) return;

    // Smooth Lid Interpolation
    currentLidAngle += (targetLidAngle - currentLidAngle) * 0.085;
    lidPivot.rotation.x = -currentLidAngle;

    // Update Interior Glow
    if (interiorLight) {
      var openRatio = currentLidAngle / 1.85;
      interiorLight.intensity = openRatio * 3.5;
    }

    // Update Lid Status Text
    if (lidStatusEl) {
      if (currentLidAngle < 0.2) {
        lidStatusEl.textContent = 'Status: Geschlossen · Scrollen zum Öffnen';
      } else if (currentLidAngle >= 1.5) {
        lidStatusEl.textContent = 'Status: Geöffnet · Dampfender Sucuk-Steinofen-Belag';
      } else {
        lidStatusEl.textContent = 'Status: Öffnet sich (' + Math.round((currentLidAngle / 1.85) * 100) + '%)';
      }
    }

    // Smooth Box Rotation
    if (autoRotate && !isDragging) {
      targetRotY += 0.004;
    }
    boxRotX += (targetRotX - boxRotX) * 0.08;
    boxRotY += (targetRotY - boxRotY) * 0.08;
    boxGroup.rotation.x = boxRotX;
    boxGroup.rotation.y = boxRotY;

    // Animate Steam Particles
    if (steamParticles && currentLidAngle > 0.3) {
      var positions = steamParticles.geometry.attributes.position.array;
      var vels = steamParticles.userData.velocities;
      var count = vels.length;

      for (var i = 0; i < count; i++) {
        positions[i * 3 + 1] += vels[i].y;
        positions[i * 3] += vels[i].driftX;
        positions[i * 3 + 2] += vels[i].driftZ;

        if (positions[i * 3 + 1] > vels[i].maxHeight) {
          positions[i * 3 + 1] = 0.05;
          var rad = Math.random() * 1.5;
          var ang = Math.random() * Math.PI * 2;
          positions[i * 3] = Math.cos(ang) * rad;
          positions[i * 3 + 2] = Math.sin(ang) * rad;
        }
      }
      steamParticles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
})();
