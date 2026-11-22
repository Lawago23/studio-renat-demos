/**
 * Fire Glow & Oven Embers Canvas Simulation
 * Pizzeria Pugliese – Forno a Legna
 * Full-bleed atmospheric hearth glow pulsing, rising embers & sparks, cursor heat reaction.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('heroFireCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Mouse / cursor tracking with physics interpolation
  const mouse = {
    x: width * 0.5,
    y: height * 0.75,
    targetX: width * 0.5,
    targetY: height * 0.75,
    speed: 0,
    active: false,
    lastX: width * 0.5,
    lastY: height * 0.75,
  };

  function onResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if (!mouse.active) {
      mouse.targetX = width * 0.5;
      mouse.targetY = height * 0.75;
    }
  }

  window.addEventListener('resize', onResize, { passive: true });

  window.addEventListener('mousemove', (e) => {
    mouse.active = true;
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    
    const dx = e.clientX - mouse.lastX;
    const dy = e.clientY - mouse.lastY;
    mouse.speed = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      mouse.active = true;
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
      mouse.speed = 18;
    }
  }, { passive: true });

  // Burst of sparks on click / tap
  window.addEventListener('click', (e) => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      for (let k = 0; k < 14; k++) {
        particles.push(new Ember(e.clientX, e.clientY, true));
      }
    }
  });

  // Floating Ember & Spark Particles
  const PARTICLE_COUNT = prefersReduced ? 25 : 90;
  const particles = [];

  class Ember {
    constructor(startX = null, startY = null, isBurst = false) {
      this.reset(true, startX, startY, isBurst);
    }

    reset(initial = false, startX = null, startY = null, isBurst = false) {
      if (startX !== null && startY !== null) {
        this.x = startX + (Math.random() - 0.5) * 30;
        this.y = startY + (Math.random() - 0.5) * 30;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed - 1.5;
      } else {
        // Spawn across the bottom hearth area
        const spread = width * (Math.random() < 0.6 ? 0.6 : 0.95);
        this.x = width * 0.5 + (Math.random() - 0.5) * spread;
        this.y = initial ? Math.random() * height : height * 0.92 + Math.random() * (height * 0.12);
        this.speedY = -(Math.random() * 2.4 + 1.2);
        this.speedX = (Math.random() - 0.5) * 1.6;
      }

      this.isSpark = Math.random() < 0.35;
      this.size = this.isSpark ? Math.random() * 1.5 + 0.8 : Math.random() * 2.8 + 1.6;
      this.alpha = Math.random() * 0.6 + 0.4;
      this.decay = Math.random() * 0.005 + 0.0025;
      // Vibrant fire hues: 15 (deep crimson) to 48 (bright golden ember)
      this.hue = Math.random() < 0.2 ? 18 : Math.random() < 0.65 ? 32 : 46;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.06 + 0.02;
    }

    update() {
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 1.0;
      this.y += this.speedY;

      // Cursor convection draught
      if (mouse.active) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (1 - dist / 180);
          this.x += (dx / (dist || 1)) * force * (mouse.speed * 0.12 + 2);
          this.y -= force * 2.5; // updraft
        }
      }

      this.alpha -= this.decay;
      if (this.alpha <= 0 || this.y < -30) {
        if (particles.length > PARTICLE_COUNT) {
          // Remove burst particles once dead
          const idx = particles.indexOf(this);
          if (idx !== -1) particles.splice(idx, 1);
        } else {
          this.reset();
        }
      }
    }

    draw(context) {
      context.beginPath();
      context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.isSpark) {
        context.fillStyle = `rgba(255, 235, 180, ${this.alpha})`;
        context.shadowColor = '#FFAA00';
        context.shadowBlur = this.size * 6;
      } else {
        context.fillStyle = `hsla(${this.hue}, 100%, 62%, ${this.alpha})`;
        context.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
        context.shadowBlur = this.size * 5;
      }
      context.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Ember());
  }

  // Animation Loop with Visibility Observer
  let isVisible = true;
  let animationFrameId = null;
  let time = 0;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationFrameId) {
        render();
      }
    });
  }, { threshold: 0.05 });

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    observer.observe(heroSection);
  }

  function render() {
    if (!isVisible) {
      animationFrameId = null;
      return;
    }

    time += 0.032;
    mouse.speed *= 0.93;

    // Smooth cursor interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, width, height);

    // 1. Primary Wood-Oven Hearth Glow (Pulsing at bottom center)
    const mouthX = width * 0.5 + (mouse.x - width * 0.5) * 0.15;
    const mouthY = height * 0.95 + (mouse.y - height * 0.95) * 0.08;
    const pulse = Math.sin(time * 2.2) * 22 + Math.cos(time * 4.7) * 12 + (mouse.speed * 3.5);
    const radius = Math.max(width * 0.55, 420) + pulse;

    const fireGrad = ctx.createRadialGradient(
      mouthX,
      mouthY,
      20,
      mouthX,
      mouthY,
      radius
    );
    fireGrad.addColorStop(0, 'rgba(255, 150, 30, 0.65)');
    fireGrad.addColorStop(0.22, 'rgba(240, 80, 15, 0.48)');
    fireGrad.addColorStop(0.52, 'rgba(190, 42, 22, 0.28)');
    fireGrad.addColorStop(0.82, 'rgba(120, 25, 15, 0.10)');
    fireGrad.addColorStop(1, 'rgba(21, 19, 16, 0)');

    ctx.save();
    ctx.fillStyle = fireGrad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 2. Cursor Dynamic Fiery Halo
    if (mouse.active) {
      const cursorPulse = Math.sin(time * 3.5) * 12 + mouse.speed * 2.5;
      const cursorRadius = 180 + cursorPulse;

      const cursorGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        5,
        mouse.x,
        mouse.y,
        cursorRadius
      );
      cursorGrad.addColorStop(0, 'rgba(255, 175, 45, 0.32)');
      cursorGrad.addColorStop(0.35, 'rgba(230, 85, 20, 0.18)');
      cursorGrad.addColorStop(0.75, 'rgba(180, 40, 20, 0.06)');
      cursorGrad.addColorStop(1, 'rgba(21, 19, 16, 0)');

      ctx.save();
      ctx.fillStyle = cursorGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 3. Render and Update Floating Embers & Sparks
    ctx.save();
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw(ctx);
    }
    ctx.restore();

    animationFrameId = requestAnimationFrame(render);
  }

  render();
})();
