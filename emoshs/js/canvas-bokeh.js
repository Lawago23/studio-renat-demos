/**
 * Emosh's Late-Night Pizza & Döner - City Lights Bokeh Canvas
 * Renders floating, blurred circular bokeh particles simulating nocturnal Berlin street lights
 */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-bokeh');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var width = 0;
  var height = 0;
  var particles = [];
  var animFrameId = null;
  var isVisible = true;
  var mouseX = 0;
  var mouseY = 0;
  var targetMouseX = 0;
  var targetMouseY = 0;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var colors = [
    { r: 255, g: 46, b: 136 },  // Neon Pink #FF2E88
    { r: 25, g: 227, b: 255 },  // Neon Cyan #19E3FF
    { r: 255, g: 228, b: 94 },  // Yellow #FFE45E
    { r: 168, g: 85, b: 247 },  // Nightclub Violet
    { r: 255, g: 90, b: 95 }    // Warm Street Lamp
  ];

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function initParticles() {
    particles = [];
    var count = width < 600 ? 18 : 36;
    for (var i = 0; i < count; i++) {
      var color = colors[Math.floor(Math.random() * colors.length)];
      var radius = Math.random() * (width < 600 ? 45 : 75) + 20;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: radius,
        color: color,
        alpha: Math.random() * 0.22 + 0.08,
        baseAlpha: Math.random() * 0.22 + 0.08,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25 - 0.1,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        depth: Math.random() * 0.6 + 0.4
      });
    }
  }

  function update() {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.phase += p.pulseSpeed;
      p.alpha = p.baseAlpha + Math.sin(p.phase) * (p.baseAlpha * 0.35);

      p.x += p.vx * p.depth + mouseX * 0.008 * p.depth;
      p.y += p.vy * p.depth + mouseY * 0.008 * p.depth;

      // Wrap around edges
      if (p.x < -p.radius) p.x = width + p.radius;
      if (p.x > width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = height + p.radius;
      if (p.y > height + p.radius) p.y = -p.radius;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      var c = p.color;
      grad.addColorStop(0, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + p.alpha + ')');
      grad.addColorStop(0.5, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (p.alpha * 0.45) + ')');
      grad.addColorStop(1, 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  function loop() {
    if (!isVisible) return;
    if (!prefersReducedMotion) {
      update();
    }
    draw();
    if (!prefersReducedMotion) {
      animFrameId = requestAnimationFrame(loop);
    }
  }

  function onPointerMove(e) {
    var rect = canvas.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    targetMouseX = (e.clientX - cx);
    targetMouseY = (e.clientY - cy);
  }

  function init() {
    resize();
    initParticles();
    draw();

    if (!prefersReducedMotion) {
      animFrameId = requestAnimationFrame(loop);
      window.addEventListener('mousemove', onPointerMove, { passive: true });
    }

    window.addEventListener('resize', function () {
      resize();
      initParticles();
      draw();
    }, { passive: true });

    // Pause when hero is not visible
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible && !animFrameId && !prefersReducedMotion) {
            animFrameId = requestAnimationFrame(loop);
          } else if (!isVisible && animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
          }
        });
      }, { threshold: 0.05 });
      observer.observe(canvas);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
