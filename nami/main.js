/**
 * NAMI – Sushi & Izakaya · Berlin-Schöneberg
 * Signature Interactions:
 * 1) WebGL Sumi-e Ink-Wash Wave Shader (Canvas + GLSL with fallback & reduced motion)
 * 2) 8-Seat Omakase Hinoki Counter Picker with live calculation & in-page booking ticket
 * 3) QR-Menu Category Chips, Search & Filter System
 * 4) Interactive Bottom Sheet Dish Details & Sommelier Pairings
 * 5) Tasting List Drawer for table guests
 * 6) Stroke-Drawn SVG Animations on Scroll
 * 7) Real-Time Berlin Opening Hours Status
 * 8) Language Switch DE / EN
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. Signature Sumi-e Ink-Wash Wave Animation (HTML5 2D Canvas - Works 100% without WebGL)
  // =========================================================================
  const canvas = document.getElementById('ink-wave-canvas');
  const heroSection = document.getElementById('hero');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && heroSection) {
    const ctx = canvas.getContext('2d');
    let animFrameId = null;
    let isHeroVisible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let mouse = { x: 0.5, y: 0.5, currentX: 0.5, currentY: 0.5 };
    let time = 0;

    // Ink mist particles floating across the wave
    const particles = [];
    const PARTICLE_COUNT = 32;

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random(),
          y: Math.random() * 0.65 + 0.35,
          radius: Math.random() * 2.8 + 1.2,
          speedX: Math.random() * 0.0004 + 0.0002,
          speedY: (Math.random() - 0.5) * 0.0002,
          alpha: Math.random() * 0.38 + 0.15,
          color: Math.random() > 0.3 ? '#2B3A67' : '#D2462B'
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = heroSection.clientWidth || window.innerWidth;
      height = heroSection.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) initParticles();
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('pointermove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        mouse.x = Math.max(0, Math.min(1, (e.clientX - rect.left) / width));
        mouse.y = Math.max(0, Math.min(1, (e.clientY - rect.top) / height));
      }
    }, { passive: true });

    const heroObserver = new IntersectionObserver((entries) => {
      isHeroVisible = entries[0].isIntersecting;
      if (isHeroVisible && !animFrameId && !prefersReducedMotion) {
        render();
      }
    }, { threshold: 0.05 });
    heroObserver.observe(heroSection);

    function drawWaveLayer(baseY, amp1, freq1, speed1, amp2, freq2, speed2, fillStyle, strokeStyle, strokeW, crestColor) {
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      const mouseInfluenceY = (mouse.currentY - 0.5) * 40;
      const mouseInfluenceX = (mouse.currentX - 0.5) * 0.25;

      for (let x = 0; x <= width; x += 6) {
        const normX = x / width;
        const rightBias = 0.65 + normX * 0.85;
        
        const y1 = Math.sin(normX * freq1 * Math.PI * 2 + time * speed1 + mouseInfluenceX) * amp1 * rightBias;
        const y2 = Math.cos(normX * freq2 * Math.PI * 2 + time * speed2) * amp2;
        const y = baseY + y1 + y2 + mouseInfluenceY * Math.sin(normX * Math.PI);

        if (x === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();

      if (strokeStyle && strokeW) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const normX = x / width;
          const rightBias = 0.65 + normX * 0.85;
          const y1 = Math.sin(normX * freq1 * Math.PI * 2 + time * speed1 + mouseInfluenceX) * amp1 * rightBias;
          const y2 = Math.cos(normX * freq2 * Math.PI * 2 + time * speed2) * amp2;
          const y = baseY + y1 + y2 + mouseInfluenceY * Math.sin(normX * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = strokeW;
        ctx.stroke();
      }

      if (crestColor) {
        ctx.strokeStyle = crestColor;
        ctx.lineWidth = 2;
        for (let x = 60; x <= width; x += 85) {
          const normX = x / width;
          const rightBias = 0.65 + normX * 0.85;
          const y1 = Math.sin(normX * freq1 * Math.PI * 2 + time * speed1 + mouseInfluenceX) * amp1 * rightBias;
          const y2 = Math.cos(normX * freq2 * Math.PI * 2 + time * speed2) * amp2;
          const y = baseY + y1 + y2 + mouseInfluenceY * Math.sin(normX * Math.PI);
          
          ctx.beginPath();
          ctx.arc(x, y - 5, 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    function render() {
      if (!isHeroVisible) {
        animFrameId = null;
        return;
      }

      mouse.currentX += (mouse.x - mouse.currentX) * 0.05;
      mouse.currentY += (mouse.y - mouse.currentY) * 0.05;

      time += 0.016;

      ctx.clearRect(0, 0, width, height);

      // Layer 1: Distant Deep Indigo Wash
      const grad1 = ctx.createLinearGradient(0, height * 0.35, width, height);
      grad1.addColorStop(0, 'rgba(43, 58, 103, 0.18)');
      grad1.addColorStop(0.5, 'rgba(43, 58, 103, 0.32)');
      grad1.addColorStop(1, 'rgba(16, 20, 26, 0.38)');
      drawWaveLayer(height * 0.60, 38, 1.2, 0.55, 18, 2.4, 0.35, grad1, 'rgba(43, 58, 103, 0.5)', 2, null);

      // Layer 2: Midground Sumi-e Ink Wave with organic roll
      const grad2 = ctx.createLinearGradient(0, height * 0.45, width, height);
      grad2.addColorStop(0, 'rgba(16, 20, 26, 0.28)');
      grad2.addColorStop(0.6, 'rgba(43, 58, 103, 0.46)');
      grad2.addColorStop(1, 'rgba(16, 20, 26, 0.64)');
      drawWaveLayer(height * 0.68, 50, 1.6, 0.85, 25, 3.1, -0.45, grad2, 'rgba(210, 70, 43, 0.5)', 2.5, 'rgba(210, 70, 43, 0.7)');

      // Layer 3: Foreground Main Powerful Ink Wave sweeping across
      const grad3 = ctx.createLinearGradient(0, height * 0.55, width, height);
      grad3.addColorStop(0, 'rgba(16, 20, 26, 0.52)');
      grad3.addColorStop(0.5, 'rgba(16, 20, 26, 0.78)');
      grad3.addColorStop(1, 'rgba(43, 58, 103, 0.88)');
      drawWaveLayer(height * 0.76, 58, 2.0, 1.1, 30, 4.0, 0.65, grad3, 'rgba(241, 236, 226, 0.8)', 3.5, 'rgba(210, 70, 43, 0.9)');

      // Layer 4: Delicate Vermilion Crest Accent Line
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const normX = x / width;
        const rightBias = 0.65 + normX * 0.85;
        const y = (height * 0.76) +
                  Math.sin(normX * 2.0 * Math.PI * 2 + time * 1.1) * 58 * rightBias +
                  Math.cos(normX * 4.0 * Math.PI * 2 + time * 0.65) * 30 - 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(210, 70, 43, 0.85)';
      ctx.lineWidth = 2.8;
      ctx.stroke();

      // Floating Ink Mist Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > 1) p.x = 0;
        if (p.x < 0) p.x = 1;
        if (p.y > 1) p.y = 0.35;
        if (p.y < 0.3) p.y = 0.9;

        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (!prefersReducedMotion) {
        animFrameId = requestAnimationFrame(render);
      }
    }

    render();
  }

  // =========================================================================
  // 2. Demo Bar Dismissal
  // =========================================================================
  const demoBar = document.getElementById('demo-bar');
  const closeDemoBtn = document.getElementById('close-demo-bar');

  if (closeDemoBtn && demoBar) {
    closeDemoBtn.addEventListener('click', () => {
      demoBar.classList.add('hidden');
    });
  }

  // =========================================================================
  // 3. Mobile Header Drawer Toggle
  // =========================================================================
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isOpen);
      mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', isOpen);
    });

    mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // =========================================================================
  // 4. Dish Data Model & Allergen Mapping
  // =========================================================================
  const ALLERGEN_LABELS = {
    'A': 'A · Glutenhaltiges Getreide',
    'B': 'B · Krebstiere',
    'C': 'C · Eier & Eierzeugnisse',
    'D': 'D · Fisch & Fischerzeugnisse',
    'E': 'E · Erdnüsse',
    'F': 'F · Sojabohnen & Soja-Tare',
    'G': 'G · Milch & Laktose',
    'H': 'H · Schalenfrüchte',
    'I': 'I · Sellerie',
    'J': 'J · Senf',
    'K': 'K · Sesamsamen & Goma',
    'L': 'L · Schwefeldioxid / Sulfite',
    'M': 'M · Lupinen',
    'N': 'N · Weichtiere'
  };

  const DISHES_DATA = {
    'otoro-nigiri': {
      title: 'Ōtoro Nigiri',
      kanji: '大トロ',
      pieces: '2 Stück',
      price: '14,50 €',
      priceNum: 14.50,
      img: 'img/otoro-nigiri.jpg',
      desc: 'Zartes Bauchstück vom Balfegó-Blauflossenthunfisch aus nachhaltigem Fang. Nach traditioneller Jukusei-Methode 7 Tage trocken nachgereift für intensive Umami-Dichte. Glasiert mit hausgekochtem Nikiri-Sojalack auf handwarmem Akasu-Shari mit Schnittlauch.',
      pairing: 'Aramasa No. 6 S-Type Junmai',
      pairingNote: 'Helle mineralische Eleganz und feine natürliche Kohlensäure balancieren den reichen Schmelz des Thunfischfettes meisterhaft.',
      allergens: ['D', 'F'],
      diet: ['Glutenfrei (auf Wunsch Tamari)']
    },
    'hamachi-sashimi': {
      title: 'Hamachi Trüffel-Ponzu',
      kanji: 'ハマチ',
      pieces: '6 Tranchen',
      price: '18,50 €',
      priceNum: 18.50,
      img: 'img/hamachi-sashimi.jpg',
      desc: 'Gelbschwanzmakrele in Sashimi-Güte aus den kühlen Küstengewässern Japans. Mit der einseitig geschliffenen Yanagiba-Klinge hauchdünn tranchiert. Gebettet auf weißem Trüffel-Ponzu aus frischem Yuzu-Saft, geriebenem Daikon-Rettich und Micro-Shisoblättern.',
      pairing: 'Bijofu Tokubetsu Junmai',
      pairingNote: 'Glasklare Zitrusnoten heben die feine Fettstruktur der Makrele und die Trüffel-Aromatik hervor.',
      allergens: ['D', 'F'],
      diet: ['Glutenfrei']
    },
    'wagyu-robata': {
      title: 'Miyazaki A5 Wagyu Kushiyaki',
      kanji: '和牛串',
      pieces: '2 Spieße',
      price: '22,00 €',
      priceNum: 22.00,
      img: 'img/wagyu-robata.jpg',
      desc: 'Original japanisches Black Wagyu Beef der höchsten Güteklasse A5 aus der Präfektur Miyazaki. Kurz und scharf über weißer Kishu-Binchotan-Eichenkohle geröstet, glasiert mit 20 Jahre alter Moromi-Tare und gewürzt mit handgepflücktem Wakayama-Sansho-Pfeffer.',
      pairing: 'Echigo Tsurukame Black Junmai',
      pairingNote: 'Trockener, rauchiger Körper harmoniert mit dem nussigen Binchotan-Röstaroma.',
      allergens: ['F'],
      diet: ['Glutenfrei']
    },
    'unagi-don': {
      title: 'Unagi Donburi',
      kanji: '鰻丼',
      pieces: '1 Schale',
      price: '21,50 €',
      priceNum: 21.50,
      img: 'img/unagi-don.jpg',
      desc: 'Traditionell gedämpfter und über Holzkohle kross lackierter Süßwasseraal (Kabayaki). Serviert in handgefertigter Yamanaka-Lackschale auf dampfendem Niigata-Koshihikari-Reis, bestreut mit geröstetem Nori und feinem Bergpfeffer.',
      pairing: 'Kamoizumi Shusen Junmai Ginjo',
      pairingNote: 'Karamell- und Pilznoten verbinden sich perfekt mit der reichhaltigen Kabayaki-Reduktion.',
      allergens: ['A', 'D', 'F', 'K'],
      diet: []
    },
    'hotate-nigiri': {
      title: 'Hotate Aburi Nigiri',
      kanji: '帆立炙り',
      pieces: '2 Stück',
      price: '11,50 €',
      priceNum: 11.50,
      img: 'img/hotate-nigiri.jpg',
      desc: 'Frische Riesenkamm-Muschel (Hotate) aus Hokkaido. Mit feinem Diamant-Kreuzschnitt versehen und mit dem Bunsenbrenner nur 2 Sekunden zart geflämmt. Gewürzt mit Oshima-Meersalzflocken und Sudachi-Zitrus.',
      pairing: 'Kokuryu Black Dragon Daiginjo',
      pairingNote: 'Seidige Textur mit mineralischem Finish, unterstreicht die natürliche Süße der Jakobsmuschel.',
      allergens: ['N', 'F'],
      diet: ['Glutenfrei']
    },
    'sake-toro': {
      title: 'Sake Toro Nigiri',
      kanji: 'サーモントロ',
      pieces: '2 Stück',
      price: '9,50 €',
      priceNum: 9.50,
      img: 'img/sake-toro.jpg',
      desc: 'Norwegischer Fjordlachs-Bauch von außergewöhnlicher Frische. Zart mit dem Bunsenbrenner karamellisiert, bestrichen mit süßem Mirin-Glaze und auf warmem Akasu-Shari serviert.',
      pairing: 'Dassai 45 Junmai Daiginjo',
      pairingNote: 'Leichte Pfirsichnoten und sanfte Säure bringen die samtige Textur des Lachsbauchs zur Geltung.',
      allergens: ['D', 'F'],
      diet: ['Glutenfrei']
    },
    'izakaya-karaage': {
      title: 'Tori Karaage',
      kanji: '唐揚げ',
      pieces: 'Portion 180g',
      price: '10,50 €',
      priceNum: 10.50,
      img: 'img/izakaya-karaage.jpg',
      desc: 'Klassiker der Tokioter Izakaya-Nächte: Saftiges Bio-Hähnchenfleisch, mariniert in Sake, geriebenem Bio-Ingwer und Knoblauch. Zweifach in Kartoffelstärke goldgelb frittiert für maximale Knusprigkeit. Serviert mit pikanter Yuzu-Kosho-Kewpie-Creme.',
      pairing: 'NAMI Tokyo Night Highball',
      pairingNote: 'Eiskaltes Prickeln, feine Malzsüße des Nikka Whiskys und Shiso reinigen den Gaumen zwischen den Bissen.',
      allergens: ['A', 'C', 'F', 'J'],
      diet: []
    },
    'eryngii-robata': {
      title: 'Eryngii Miso Butter',
      kanji: 'エリンギ',
      pieces: '2 Spieße',
      price: '8,50 €',
      priceNum: 8.50,
      img: 'img/eryngii-robata.jpg',
      desc: 'Frische Kräuterseitlinge, am Spieß über Binchotan geschmort. Glasiert mit Kyoto Saikyo Sweet Miso und gebräunter Alpenbutter, bestreut mit feinstem Schnittlauch.',
      pairing: 'Kenbishi Mizuho Junmai',
      pairingNote: 'Kräftiges, nussiges Umami mit Anklängen von gerösteter Kastanie.',
      allergens: ['F', 'G'],
      diet: ['Vegetarisch', 'Glutenfrei']
    },
    'gyoza-kurobuta': {
      title: 'Gyoza Kurobuta',
      kanji: '黒豚餃子',
      pieces: '5 Stück',
      price: '9,50 €',
      priceNum: 9.50,
      img: 'img/gyoza-kurobuta.jpg',
      desc: 'Handgefaltete Teigtaschen gefüllt mit saftigem Kagoshima-Kurobuta-Schweinefleisch, Frühlingslauch, Weißkohl und Sesamöl. In der Gusseisenpfanne mit knusprigem Spitzenrand (Hanetsuki) gebraten. Dazu Chili-Dashi-Dip.',
      pairing: 'Asahi Super Dry vom Fass',
      pairingNote: 'Knackig-trockener Abgang, der den herzhaften Fleischsaft der Gyoza erfrischt.',
      allergens: ['A', 'F', 'K'],
      diet: []
    },
    'sake-flight': {
      title: 'NAMI Signature Sake Flight',
      kanji: '利き酒',
      pieces: '3 x 50ml',
      price: '17,00 €',
      priceNum: 17.00,
      img: 'img/sake-flight.jpg',
      desc: 'Drei kuratierte Gläser handwerklicher Sake-Tradition: 1) Karakuchi (knochentrocken & mineralisch), 2) Junmai Ginjo (duftig nach weißem Pfirsich), 3) Yamahai Moromi (erdig, unfiltriert & tiefgründig). Serviert in handgedrehten Steinzeug-Ochoko.',
      pairing: 'Begleitung zu Omakase oder Nigiri',
      pairingNote: 'Zeigt die unglaubliche Bandbreite von poliertem Yamada-Nishiki-Reis und Bergquellwasser.',
      allergens: ['L'],
      diet: ['Glutenfrei']
    },
    'matcha-dessert': {
      title: 'Uji Matcha Tartelette',
      kanji: '抹茶甘味',
      pieces: '1 Portion',
      price: '8,50 €',
      priceNum: 8.50,
      img: 'img/matcha-dessert.jpg',
      desc: 'Intensive Ganache aus zeremoniellem Matcha aus Uji (Kyoto). Auf knusprigem Mürbeteigboden mit schwarzem Sesam-Krokant, verfeinert mit leicht aufgeschlagener Mascarpone-Yuzu-Creme.',
      pairing: 'Hojicha Rösttee aus Shizuoka',
      pairingNote: 'Geröstete Holzaromen des Hojicha erden die Bitternote des Matchas perfekt.',
      allergens: ['A', 'C', 'G', 'K'],
      diet: ['Vegetarisch']
    }
  };

  // =========================================================================
  // 5. Sticky Category Chips & Search Filter
  // =========================================================================
  const stickyBar = document.getElementById('sticky-bar');
  const searchInput = document.getElementById('menu-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const chipButtons = document.querySelectorAll('.chip-btn');
  const dietButtons = document.querySelectorAll('.diet-btn:not(.allergen-legend-trigger)');
  const dishCards = document.querySelectorAll('.dish-card');
  const dishesCountBadge = document.getElementById('dishes-count');

  let activeCategory = 'all';
  let activeDietFilter = null;
  let searchQuery = '';

  // Sticky Bar Scoped Strictly Inside Menu Section (#speisekarte)
  const menuSection = document.getElementById('speisekarte');
  if (stickyBar && menuSection) {
    const updateStickyState = () => {
      const siteHeader = document.getElementById('site-header');
      const headerH = siteHeader ? siteHeader.offsetHeight : 68;
      const menuRect = menuSection.getBoundingClientRect();
      const barH = stickyBar.offsetHeight || 60;

      // When the bottom of the menu section reaches the top header + bar height, it must unstick / hide
      const pastMenu = menuRect.bottom <= (headerH + barH + 10);
      const isInside = menuRect.top <= (headerH + 2) && !pastMenu;

      stickyBar.classList.toggle('past-section', pastMenu);
      stickyBar.classList.toggle('is-stuck', isInside);
    };

    window.addEventListener('scroll', updateStickyState, { passive: true });
    window.addEventListener('resize', updateStickyState, { passive: true });
    updateStickyState();
  }

  // Category Chip Click
  chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chipButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      activeCategory = btn.getAttribute('data-category');
      filterDishes();
    });
  });

  // Dietary Toggle Click
  dietButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      if (activeDietFilter === filter) {
        activeDietFilter = null;
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        dietButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        activeDietFilter = filter;
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }
      filterDishes();
    });
  });

  // Search Input Handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
      }
      filterDishes();
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      searchInput.focus();
      filterDishes();
    });
  }

  function filterDishes() {
    let visibleCount = 0;

    dishCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      const diet = (card.getAttribute('data-diet') || '').toLowerCase();
      const text = (card.innerText || '').toLowerCase();

      let matchCat = (activeCategory === 'all' || cat === activeCategory);
      let matchDiet = true;
      if (activeDietFilter === 'glutenfree') {
        matchDiet = diet.includes('glutenfree');
      } else if (activeDietFilter === 'vegetarian') {
        matchDiet = diet.includes('vegetarian');
      }

      let matchSearch = true;
      if (searchQuery.length > 0) {
        matchSearch = text.includes(searchQuery);
      }

      if (matchCat && matchDiet && matchSearch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (dishesCountBadge) {
      dishesCountBadge.textContent = `${visibleCount} von ${dishCards.length} Gerichten`;
    }
  }

  // =========================================================================
  // 6. Interactive Bottom Sheet / Dish Details Modal
  // =========================================================================
  const bottomSheet = document.getElementById('dish-bottom-sheet');
  const sheetBackdrop = document.getElementById('dish-modal-backdrop');
  const closeSheetBtn = document.getElementById('close-dish-sheet');

  const modalImg = document.getElementById('modal-dish-img');
  const modalKanji = document.getElementById('modal-dish-kanji');
  const modalPieces = document.getElementById('modal-dish-pieces');
  const modalTitle = document.getElementById('modal-dish-title');
  const modalPrice = document.getElementById('modal-dish-price');
  const modalDesc = document.getElementById('modal-dish-desc');
  const modalPairing = document.getElementById('modal-dish-pairing');
  const modalPairingNote = document.getElementById('modal-dish-pairing-note');
  const modalAllergensList = document.getElementById('modal-dish-allergens');

  const stepperMinus = document.getElementById('stepper-minus');
  const stepperPlus = document.getElementById('stepper-plus');
  const stepperVal = document.getElementById('stepper-val');
  const addToTastingBtn = document.getElementById('add-to-tasting-btn');

  let currentDishKey = 'otoro-nigiri';
  let currentStepperQty = 1;

  // Open Dish Sheet on Card Tap / Enter
  dishCards.forEach(card => {
    const dishId = card.getAttribute('data-id');
    const openCard = () => openDishModal(dishId);

    card.addEventListener('click', openCard);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCard();
      }
    });
  });

  function openDishModal(id) {
    const data = DISHES_DATA[id];
    if (!data) return;

    currentDishKey = id;
    currentStepperQty = 1;
    if (stepperVal) stepperVal.textContent = '1';

    if (modalImg) modalImg.src = data.img;
    if (modalKanji) modalKanji.textContent = data.kanji;
    if (modalPieces) modalPieces.textContent = data.pieces;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalPrice) modalPrice.textContent = data.price;
    if (modalDesc) modalDesc.textContent = data.desc;
    if (modalPairing) modalPairing.textContent = data.pairing;
    if (modalPairingNote) modalPairingNote.textContent = data.pairingNote;

    // Render Allergens
    if (modalAllergensList) {
      modalAllergensList.innerHTML = '';
      if (data.allergens && data.allergens.length > 0) {
        data.allergens.forEach(code => {
          const row = document.createElement('div');
          row.className = 'modal-allergen-item';
          row.innerHTML = `
            <span class="modal-allergen-badge">${code}</span>
            <span>${ALLERGEN_LABELS[code] || code}</span>
          `;
          modalAllergensList.appendChild(row);
        });
      } else {
        modalAllergensList.innerHTML = '<span style="color:var(--ink-muted);font-size:13px;">Keine kennzeichnungspflichtigen Allergene.</span>';
      }
    }

    if (bottomSheet) bottomSheet.classList.add('open');
    if (sheetBackdrop) sheetBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDishModal() {
    if (bottomSheet) bottomSheet.classList.remove('open');
    if (sheetBackdrop) sheetBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeSheetBtn) closeSheetBtn.addEventListener('click', closeDishModal);
  if (sheetBackdrop) sheetBackdrop.addEventListener('click', closeDishModal);

  // Stepper handlers
  if (stepperMinus && stepperPlus && stepperVal) {
    stepperMinus.addEventListener('click', () => {
      if (currentStepperQty > 1) {
        currentStepperQty--;
        stepperVal.textContent = currentStepperQty;
      }
    });
    stepperPlus.addEventListener('click', () => {
      currentStepperQty++;
      stepperVal.textContent = currentStepperQty;
    });
  }

  // =========================================================================
  // 7. Tasting List & QR-Notepad Drawer
  // =========================================================================
  const tastingBar = document.getElementById('tasting-bar');
  const tastingCountBadge = document.getElementById('tasting-count-badge');
  const tastingSumPrice = document.getElementById('tasting-sum-price');
  const openTastingBtn = document.getElementById('open-tasting-drawer');

  const tastingDrawer = document.getElementById('tasting-drawer');
  const closeTastingBtn = document.getElementById('close-tasting-drawer');
  const tastingItemsList = document.getElementById('tasting-items-list');
  const drawerTotalSum = document.getElementById('drawer-total-sum');
  const clearTastingBtn = document.getElementById('clear-tasting-btn');
  const telegramOrderLink = document.getElementById('telegram-order-link');

  let tastingList = []; // { id, title, priceNum, qty, pieces }

  if (addToTastingBtn) {
    addToTastingBtn.addEventListener('click', () => {
      const data = DISHES_DATA[currentDishKey];
      if (!data) return;

      const existing = tastingList.find(item => item.id === currentDishKey);
      if (existing) {
        existing.qty += currentStepperQty;
      } else {
        tastingList.push({
          id: currentDishKey,
          title: data.title,
          priceNum: data.priceNum,
          qty: currentStepperQty,
          pieces: data.pieces
        });
      }

      updateTastingUI();
      closeDishModal();

      // Show temporary confirmation effect on tasting bar
      if (tastingBar) {
        tastingBar.classList.add('active');
        tastingBar.style.transform = 'translateY(-6px)';
        setTimeout(() => {
          tastingBar.style.transform = 'translateY(0)';
        }, 200);
      }
    });
  }

  function updateTastingUI() {
    let totalItems = 0;
    let totalPrice = 0;

    tastingList.forEach(item => {
      totalItems += item.qty;
      totalPrice += item.priceNum * item.qty;
    });

    const priceFormatted = totalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

    if (tastingCountBadge) tastingCountBadge.textContent = `${totalItems} ${totalItems === 1 ? 'Position' : 'Positionen'}`;
    if (tastingSumPrice) tastingSumPrice.textContent = priceFormatted;
    if (drawerTotalSum) drawerTotalSum.textContent = priceFormatted;

    if (tastingBar) {
      tastingBar.classList.toggle('active', totalItems > 0);
    }

    // Render Items in Drawer
    if (tastingItemsList) {
      if (tastingList.length === 0) {
        tastingItemsList.innerHTML = '<p class="empty-list-notice">Noch keine Gerichte ausgewählt. Wähle ein Gericht aus der Speisekarte.</p>';
      } else {
        tastingItemsList.innerHTML = '';
        tastingList.forEach(item => {
          const row = document.createElement('div');
          row.className = 'tasting-item-row';
          const lineTotal = (item.priceNum * item.qty).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
          row.innerHTML = `
            <div class="item-left">
              <span class="item-name">${item.qty}x ${item.title}</span>
              <span class="item-meta">${item.pieces} · à ${item.priceNum.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div class="item-right">
              <strong class="item-price">${lineTotal}</strong>
              <button type="button" class="item-remove" data-remove="${item.id}" aria-label="${item.title} entfernen">×</button>
            </div>
          `;
          tastingItemsList.appendChild(row);
        });

        // Attach remove buttons
        tastingItemsList.querySelectorAll('.item-remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idToRemove = e.target.getAttribute('data-remove');
            tastingList = tastingList.filter(i => i.id !== idToRemove);
            updateTastingUI();
          });
        });
      }
    }

    // Update Telegram Order Message
    if (telegramOrderLink) {
      let msg = 'Hallo NAMI, ich sitze am Tisch und möchte folgende Auswahl bestellen:%0A';
      tastingList.forEach(item => {
        msg += `• ${item.qty}x ${item.title} (${item.pieces})%0A`;
      });
      msg += `%0AGesamt: ${priceFormatted}%0AAkazienstraße 22, Schöneberg`;
      telegramOrderLink.href = `https://t.me/rovatt?text=${encodeURIComponent(msg)}`;
    }
  }

  if (openTastingBtn && tastingDrawer) {
    openTastingBtn.addEventListener('click', () => {
      tastingDrawer.classList.add('open');
      if (sheetBackdrop) sheetBackdrop.classList.add('open');
    });
  }

  if (closeTastingBtn && tastingDrawer) {
    closeTastingBtn.addEventListener('click', () => {
      tastingDrawer.classList.remove('open');
      if (sheetBackdrop && !bottomSheet.classList.contains('open')) {
        sheetBackdrop.classList.remove('open');
      }
    });
  }

  if (clearTastingBtn) {
    clearTastingBtn.addEventListener('click', () => {
      tastingList = [];
      updateTastingUI();
      if (tastingDrawer) tastingDrawer.classList.remove('open');
      if (sheetBackdrop) sheetBackdrop.classList.remove('open');
    });
  }

  // =========================================================================
  // 8. Omakase am Tresen: 8-Seat Counter Picker & In-Page Booking
  // =========================================================================
  const seatNodes = document.querySelectorAll('.seat-node');
  const inspectorSeatTitle = document.getElementById('inspector-seat-title');
  const inspectorSeatDesc = document.getElementById('inspector-seat-desc');
  const summarySeats = document.getElementById('summary-seats');
  const summaryTotal = document.getElementById('summary-total');
  const currentSlotDisplay = document.getElementById('current-slot-display');

  const slotRadioCards = document.querySelectorAll('.slot-radio-card');
  const omakaseBookingForm = document.getElementById('omakase-booking-form');
  const bookingFormWrapper = document.getElementById('booking-form-wrapper');
  const bookingConfirmationView = document.getElementById('booking-confirmation-view');
  const resetBookingBtn = document.getElementById('reset-booking-btn');

  // Confirmation Elements
  const confSeatsDisplay = document.getElementById('conf-seats-display');
  const confSlotDisplay = document.getElementById('conf-slot-display');
  const confNameDisplay = document.getElementById('conf-name-display');
  const confCode = document.getElementById('conf-code');

  const SEAT_DESCRIPTIONS = {
    '1': { title: 'Platz 1 (Außenplatz links)', desc: 'Ruhiger Randplatz neben dem Sake-Altar. Perfekt für Gäste, die ein diskretes Gespräch suchen.' },
    '2': { title: 'Platz 2 (Zentraler Einblick)', desc: 'Erstklassiger frontaler Blick auf die Zugschnitt-Technik der Yanagiba-Klinge.' },
    '3': { title: 'Platz 3 (Chef-Position Mitte)', desc: 'Unmittelbar vor Meister Kenjis Schneideblock und dem warmen Shari-Holzbottich.' },
    '4': { title: 'Platz 4 (Chef-Position Hauptplatz)', desc: 'Bester Platz am Tresen für direkte Erläuterungen der Gänge durch Meister Tanaka.' },
    '5': { title: 'Platz 5 (Binchotan-Station)', desc: 'Direkt vor der glimmenden Holzkohle. Bereits fest vergeben.' },
    '6': { title: 'Platz 6 (Tresenmitte rechts)', desc: 'Zentraler Platz mit optimalem Überblick. Bereits fest vergeben.' },
    '7': { title: 'Platz 7 (Zweierbereich rechts)', desc: 'Geselliger Platz mit direktem Blick auf die kunstvolle Anrichte der Keramikteller.' },
    '8': { title: 'Platz 8 (Fensterseite Schöneberg)', desc: 'Intimer Platz an der Fensterfront zur Akazienstraße.' }
  };

  let selectedSeats = ['3', '4']; // Default 2 seats selected
  let currentSlotPricePerGuest = 135;
  let currentSlotLabel = '18:00 – 20:15 Uhr (12 Gänge · 135 € p.P.)';

  // Seat Click Handler
  seatNodes.forEach(node => {
    node.addEventListener('click', () => {
      const seatNum = node.getAttribute('data-seat');
      if (node.classList.contains('seat-taken') || node.disabled) return;

      const idx = selectedSeats.indexOf(seatNum);
      if (idx > -1) {
        // Deselect if more than 1 seat remaining
        if (selectedSeats.length > 1) {
          selectedSeats.splice(idx, 1);
          node.classList.remove('seat-selected');
          node.querySelector('.seat-status-tag').textContent = 'Frei';
          node.setAttribute('aria-label', `Platz ${seatNum} wählen (Frei)`);
        }
      } else {
        // Limit max 4 seats per booking
        if (selectedSeats.length >= 4) {
          selectedSeats.shift(); // remove oldest
          syncSeatNodeVisuals();
        }
        selectedSeats.push(seatNum);
        node.classList.add('seat-selected');
        node.querySelector('.seat-status-tag').textContent = 'Gewählt';
        node.setAttribute('aria-label', `Platz ${seatNum} gewählt`);
      }

      updateSeatSummaryUI();
    });
  });

  function syncSeatNodeVisuals() {
    seatNodes.forEach(node => {
      const num = node.getAttribute('data-seat');
      if (node.classList.contains('seat-taken')) return;

      const isSel = selectedSeats.includes(num);
      node.classList.toggle('seat-selected', isSel);
      const tag = node.querySelector('.seat-status-tag');
      if (tag) tag.textContent = isSel ? 'Gewählt' : 'Frei';
    });
  }

  function updateSeatSummaryUI() {
    selectedSeats.sort((a, b) => parseInt(a) - parseInt(b));
    const seatNames = selectedSeats.map(n => `Platz ${n}`).join(', ');
    const guestCount = selectedSeats.length;
    const totalPrice = (guestCount * currentSlotPricePerGuest).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';

    if (summarySeats) {
      summarySeats.textContent = `${seatNames} (${guestCount} ${guestCount === 1 ? 'Gast' : 'Gäste'})`;
    }
    if (summaryTotal) {
      summaryTotal.textContent = totalPrice;
    }

    // Update Inspector
    if (inspectorSeatTitle && inspectorSeatDesc) {
      if (selectedSeats.length === 1) {
        const info = SEAT_DESCRIPTIONS[selectedSeats[0]];
        inspectorSeatTitle.textContent = info.title;
        inspectorSeatDesc.textContent = info.desc;
      } else {
        inspectorSeatTitle.textContent = `${seatNames} ausgewählt`;
        inspectorSeatDesc.textContent = `Ausgewählt für ${guestCount} Personen. Perfekte Sicht auf Meister Kenjis Nigiri-Handgriff und den Hangiri-Zuber.`;
      }
    }
  }

  // Time Slot Radios
  slotRadioCards.forEach(card => {
    card.addEventListener('click', () => {
      slotRadioCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      const isSlot2 = radio && radio.value === 'slot-2';
      currentSlotPricePerGuest = isSlot2 ? 175 : 135;
      currentSlotLabel = isSlot2 ? '20:30 – 22:45 Uhr (16 Gänge · 175 € p.P.)' : '18:00 – 20:15 Uhr (12 Gänge · 135 € p.P.)';

      if (currentSlotDisplay) {
        currentSlotDisplay.textContent = `Slot: ${isSlot2 ? '20:30 Uhr · 16 Gänge' : '18:00 Uhr · 12 Gänge'}`;
      }

      updateSeatSummaryUI();
    });
  });

  // Booking Form Submission (In-Page Confirmation)
  if (omakaseBookingForm) {
    omakaseBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const guestNameInput = document.getElementById('guest-name');
      const guestName = guestNameInput ? guestNameInput.value.trim() : 'Gast';
      const randomCode = '#NAMI-' + Math.floor(1000 + Math.random() * 9000);

      const seatNames = selectedSeats.map(n => `Platz ${n}`).join(' & ');

      if (confSeatsDisplay) confSeatsDisplay.textContent = seatNames;
      if (confSlotDisplay) confSlotDisplay.textContent = currentSlotLabel;
      if (confNameDisplay) confNameDisplay.textContent = guestName;
      if (confCode) confCode.textContent = randomCode;

      if (bookingFormWrapper) bookingFormWrapper.style.display = 'none';
      if (bookingConfirmationView) bookingConfirmationView.classList.remove('hidden');
    });
  }

  if (resetBookingBtn) {
    resetBookingBtn.addEventListener('click', () => {
      if (bookingFormWrapper) bookingFormWrapper.style.display = '';
      if (bookingConfirmationView) bookingConfirmationView.classList.add('hidden');
      if (omakaseBookingForm) omakaseBookingForm.reset();
    });
  }

  // =========================================================================
  // 9. Craft: Knife & Rice Story (Scroll-Triggered SVG Stroke Animation)
  // =========================================================================
  const craftKnifeCard = document.getElementById('craft-knife-card');
  const craftRiceCard = document.getElementById('craft-rice-card');

  function setupStrokeAnimation(card) {
    if (!card) return;
    const paths = card.querySelectorAll('.svg-stroke-path');
    paths.forEach((el, index) => {
      let len = 800;
      try {
        if (typeof el.getTotalLength === 'function') {
          len = el.getTotalLength();
        } else if (el.tagName.toLowerCase() === 'circle') {
          len = 2 * Math.PI * parseFloat(el.getAttribute('r') || 5);
        } else if (el.tagName.toLowerCase() === 'ellipse') {
          const rx = parseFloat(el.getAttribute('rx') || 20);
          const ry = parseFloat(el.getAttribute('ry') || 10);
          len = Math.PI * (rx + ry);
        } else if (el.tagName.toLowerCase() === 'line') {
          const x1 = parseFloat(el.getAttribute('x1') || 0);
          const y1 = parseFloat(el.getAttribute('y1') || 0);
          const x2 = parseFloat(el.getAttribute('x2') || 0);
          const y2 = parseFloat(el.getAttribute('y2') || 0);
          len = Math.hypot(x2 - x1, y2 - y1);
        }
      } catch (err) {
        len = 800;
      }
      
      const roundedLen = Math.ceil(len) + 6;
      el.style.strokeDasharray = `${roundedLen} ${roundedLen}`;
      el.style.strokeDashoffset = `${roundedLen}`;
      el.style.transition = `stroke-dashoffset 1.8s cubic-bezier(0.25, 1, 0.5, 1) ${index * 0.08}s`;
    });
  }

  setupStrokeAnimation(craftKnifeCard);
  setupStrokeAnimation(craftRiceCard);

  const craftObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        const paths = entry.target.querySelectorAll('.svg-stroke-path');
        paths.forEach(p => {
          p.style.strokeDashoffset = '0';
        });
      }
    });
  }, { threshold: 0.18 });

  if (craftKnifeCard) craftObserver.observe(craftKnifeCard);
  if (craftRiceCard) craftObserver.observe(craftRiceCard);

  // =========================================================================
  // 10. Real-Time Berlin Opening Hours Status Indicator
  // =========================================================================
  const liveDot = document.getElementById('live-dot');
  const liveText = document.getElementById('live-text');

  function updateBerlinOpeningHours() {
    if (!liveDot || !liveText) return;

    // Calculate current time in Berlin timezone
    const now = new Date();
    const berlinTimeStr = now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const berlinDate = new Date(berlinTimeStr);

    const day = berlinDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const hour = berlinDate.getHours();
    const minute = berlinDate.getMinutes();
    const currentMins = hour * 60 + minute;

    // Monday is closed (Ruhetag)
    if (day === 1) {
      liveDot.className = 'live-status-dot closed';
      liveText.textContent = 'Heute Ruhetag · Öffnet Dienstag um 17:30 Uhr';
      return;
    }

    let openMins = 17 * 60 + 30; // 17:30
    let closeMins = 23 * 60;     // 23:00

    if (day === 0) { // Sunday
      openMins = 17 * 60;
      closeMins = 22 * 60 + 30;
    } else if (day === 5 || day === 6) { // Fri/Sat
      closeMins = 24 * 60; // 00:00
    }

    if (currentMins >= openMins && currentMins < closeMins) {
      liveDot.className = 'live-status-dot';
      liveText.textContent = `Jetzt geöffnet · Service bis ${day === 5 || day === 6 ? '00:00' : '23:00'} Uhr`;
    } else if (currentMins < openMins) {
      liveDot.className = 'live-status-dot closed';
      liveText.textContent = `Öffnet heute um ${day === 0 ? '17:00' : '17:30'} Uhr`;
    } else {
      liveDot.className = 'live-status-dot closed';
      liveText.textContent = 'Geschlossen · Öffnet morgen um 17:30 Uhr';
    }
  }

  updateBerlinOpeningHours();
  setInterval(updateBerlinOpeningHours, 60000);

  // =========================================================================
  // 11. Allergen Legend Modal
  // =========================================================================
  const allergenModal = document.getElementById('allergen-modal');
  const allergenBackdrop = document.getElementById('allergen-modal-backdrop');
  const openAllergenBtn = document.getElementById('open-allergen-modal');
  const closeAllergenBtn = document.getElementById('close-allergen-modal');

  function openAllergenModal() {
    if (allergenModal) allergenModal.classList.add('open');
    if (allergenBackdrop) allergenBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeAllergenModal() {
    if (allergenModal) allergenModal.classList.remove('open');
    if (allergenBackdrop) allergenBackdrop.classList.remove('open');
    if (!bottomSheet.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  if (openAllergenBtn) openAllergenBtn.addEventListener('click', openAllergenModal);
  if (closeAllergenBtn) closeAllergenBtn.addEventListener('click', closeAllergenModal);
  if (allergenBackdrop) allergenBackdrop.addEventListener('click', closeAllergenModal);

  // Global Escape Key to Close Modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDishModal();
      closeAllergenModal();
      if (tastingDrawer) tastingDrawer.classList.remove('open');
    }
  });

  // =========================================================================
  // 12. Language Switcher DE / EN (Seamless in-place toggle)
  // =========================================================================
  const langButtons = document.querySelectorAll('.lang-btn');

  const I18N = {
    de: {
      hero_badge: 'Berlin-Schöneberg · Akazienstraße',
      hero_lead: 'Die Welle des Geschmacks. Traditionelles Edomae-Sushi mit warmem Akasu-Shari, Robata-Spieße über weißer Binchotan-Kohle und ein intimer 8-Plätze-Tresen für das Omakase des Abends.',
      cta_menu: 'Digitale Speisekarte',
      cta_omakase: 'Omakase-Tresen (8 Plätze)',
      qr_title: 'QR-Tischkarte & Omakase',
      qr_desc: 'Wähle deine Favoriten direkt im Browser. Deine Auswahl wird gespeichert und kann jederzeit dem Service gezeigt werden.',
      scroll_down: 'Speisekarte entdecken',
      cat_all: 'Alle',
      cat_nigiri: 'Nigiri',
      cat_sashimi: 'Sashimi',
      cat_robata: 'Robata Grill',
      cat_izakaya: 'Izakaya & Bowls',
      cat_drinks: 'Sake & Bar',
      menu_kicker: 'Edomae & Binchotan',
      menu_title: 'Handwerk & Speisen'
    },
    en: {
      hero_badge: 'Berlin-Schöneberg · Akazienstraße',
      hero_lead: 'The wave of flavor. Traditional Edomae sushi with warm seasoned Akasu shari, Robata skewers over white Binchotan charcoal, and an intimate 8-seat counter for the evening Omakase.',
      cta_menu: 'Digital Menu',
      cta_omakase: 'Omakase Counter (8 Seats)',
      qr_title: 'QR Table Menu & Omakase',
      qr_desc: 'Explore and select your favorites in the browser. Show your tasting list directly to the waitstaff.',
      scroll_down: 'Explore Menu',
      cat_all: 'All',
      cat_nigiri: 'Nigiri',
      cat_sashimi: 'Sashimi',
      cat_robata: 'Robata Grill',
      cat_izakaya: 'Izakaya & Bowls',
      cat_drinks: 'Sake & Bar',
      menu_kicker: 'Edomae & Binchotan',
      menu_title: 'Craft & Dishes'
    }
  };

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      langButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Apply i18n strings
      const dict = I18N[lang] || I18N.de;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          el.textContent = dict[key];
        }
      });
    });
  });

});
