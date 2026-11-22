/**
 * Interactive SVG Map of Italy & Regional Pizza Discovery
 * Pizzeria Pugliese – Forno a Legna
 */

(function () {
  'use strict';

  const regionalData = {
    puglia: {
      name: 'Puglia',
      title: 'Apulien',
      originTag: 'Heimat & Herz unseres Hauses',
      pizzaName: 'La Pugliese d’Oro',
      price: '17,50 €',
      ingredients: 'Stracciatella di Burrata aus Andria, geschmorte Cime di Rapa mit Knoblauch & Chili, Capocollo di Martina Franca, geröstete Mandelsplitter, apulisches Coratina-Olivenöl extra vergine.',
      tastingNotes: 'Unglaublich cremig durch die frische Stracciatella, fein-herbe Würze des Stängelkohls und knusprige Röstaromen der Mandeln.',
      doughNote: 'Mit 15% apulischem Hartweizengrieß (Semola Rimacinata) für goldenen Glanz und kernigen Biss.',
      badge: 'Haus-Spezialität'
    },
    campania: {
      name: 'Campania',
      title: 'Kampanien',
      originTag: 'Die Wiege der Pizza Verace',
      pizzaName: 'Margherita Verace D.O.P.',
      price: '13,50 €',
      ingredients: 'San Marzano Tomaten D.O.P. von den Hängen des Vesuvs, handgezupfte Mozzarella di Bufala Campana, frisches Basilikum, Meersalz aus Cervia.',
      tastingNotes: 'Reine Harmonie: Die fruchtige Mineralität der Vulkantomaten verschmilzt mit saftig-milchigem Büffelkäse und ätherischem Basilikum.',
      doughNote: '90 Sekunden bei 485°C – der elastische, von Hand geschlagene Teig zeigt die unverwechselbare Leopardenmusterung.',
      badge: 'D.O.P. Zertifiziert'
    },
    calabria: {
      name: 'Calabria',
      title: 'Kalabrien',
      originTag: 'Feuer aus dem Süden',
      pizzaName: 'Calabrese Piccante',
      price: '16,00 €',
      ingredients: 'Scharfe Nduja di Spilinga, krosse Spianata Calabrese, geräucherte Scamorza, San Marzano Tomaten, marinierte rote Zwiebeln aus Tropea.',
      tastingNotes: 'Feurig und tiefwürzig: Die schmelzende Nduja spendet pikante Wärme, während die Tropea-Zwiebeln eine süßliche Balance schenken.',
      doughNote: 'Hoher Rand mit knusprigen Bläschen fängt das würzige, abfließende Paprikaöl perfekt auf.',
      badge: 'Pikant & Rauchig'
    },
    lazio: {
      name: 'Lazio',
      title: 'Latium / Rom',
      originTag: 'Römische Trattoria-Kultur',
      pizzaName: 'Carbonara Neukölln',
      price: '16,50 €',
      ingredients: 'Fior di Latte, knusprig kross ausgelassener Guanciale di Amatrice, Eigelb-Pecorino-Romano-Creme, frisch gemahlener Tellicherry-Pfeffer.',
      tastingNotes: 'Herzhafter Schmelz des Backenspecks, samtige Pecorino-Creme und ein markanter, warmer Pfefferkick auf der Zunge.',
      doughNote: 'Pizza Bianca ohne Tomatensauce – dadurch bleibt der Boden besonders kross und tragfähig.',
      badge: 'Trattoria-Klassiker'
    },
    sicilia: {
      name: 'Sicilia',
      title: 'Sizilien',
      originTag: 'Aromen des Ätna',
      pizzaName: 'Pistacchio & Mortadella',
      price: '17,00 €',
      ingredients: 'Fior di Latte, nach dem Backen hauchdünn drapierte Mortadella di Bologna I.G.P., cremige Mini-Burrata, Pistazienpesto aus Bronte, gehackte Pistazien.',
      tastingNotes: 'Nussig, opulent und samtweich. Das kühle, intensive Pistazienpesto trifft auf den dampfend heißen Teigboden.',
      doughNote: 'Extra luftiger Cornicione mit 72% Hydratation für maximale Zartheit.',
      badge: 'Gourmet-Favorit'
    },
    emilia: {
      name: 'Emilia-Romagna',
      title: 'Emilia-Romagna',
      originTag: 'Das Tal der Feinschmecker',
      pizzaName: 'Parma 24 Mesi & Rucola',
      price: '16,50 €',
      ingredients: 'San Marzano Tomaten, Fior di Latte, 24 Monate gereifter Prosciutto di Parma, wilder Rucola, gehobelte Flocken von 30 Monate altem Parmigiano Reggiano D.O.P.',
      tastingNotes: 'Edles Wechselspiel aus nussig-salzigem Schinken, gereiftem Parmigiano und frischer Rucola-Schärfe.',
      doughNote: 'Hauchdünner Teigkern nach neapolitanischer Art, der sich sanft zusammenfalten lässt.',
      badge: '24 Monate Reifung'
    },
    liguria: {
      name: 'Liguria',
      title: 'Ligurien',
      originTag: 'Kräutergärten am Meer',
      pizzaName: 'Genovese al Pesto Fresco',
      price: '15,50 €',
      ingredients: 'Süße gelbe Datterini-Tomaten, Fior di Latte, hausgemachtes Pesto Genovese mit Basilikum D.O.P., geröstete Pinienkerne, kühle Stracciatella.',
      tastingNotes: 'Ätherisch, sommerlich und kräuterintensiv. Die Säure der gelben Datterini hebt das frische Pesto elegant hervor.',
      doughNote: 'Feinporiger Rand mit delikater Bräunung.',
      badge: 'Vegetarisch [V]'
    }
  };

  function initMap() {
    const card = document.getElementById('regionalPizzaCard');
    const pills = document.querySelectorAll('.region-pill');
    const paths = document.querySelectorAll('.region-path');
    const pins = document.querySelectorAll('.region-pin');

    if (!card) return;

    const elOrigin = document.getElementById('regionOriginTag');
    const elTitle = document.getElementById('regionTitle');
    const elPrice = document.getElementById('regionPizzaPrice');
    const elPizzaName = document.getElementById('regionPizzaName');
    const elIngredients = document.getElementById('regionIngredients');
    const elTasting = document.getElementById('regionTasting');
    const elDough = document.getElementById('regionDough');
    const elBadge = document.getElementById('regionBadge');

    function setActiveRegion(regionKey) {
      const data = regionalData[regionKey];
      if (!data) return;

      // Update pills
      pills.forEach((p) => {
        p.classList.toggle('active', p.getAttribute('data-region') === regionKey);
      });

      // Update SVG paths
      paths.forEach((path) => {
        path.classList.toggle('active', path.getAttribute('data-region') === regionKey);
      });

      // Update SVG pins
      pins.forEach((pin) => {
        pin.classList.toggle('active', pin.getAttribute('data-region') === regionKey);
      });

      // Animate card content transition
      card.style.opacity = '0.3';
      card.style.transform = 'translateY(6px)';

      setTimeout(() => {
        if (elOrigin) elOrigin.textContent = data.originTag;
        if (elTitle) elTitle.textContent = `${data.name} (${data.title})`;
        if (elPrice) elPrice.textContent = data.price;
        if (elPizzaName) elPizzaName.textContent = data.pizzaName;
        if (elIngredients) elIngredients.textContent = data.ingredients;
        if (elTasting) elTasting.textContent = data.tastingNotes;
        if (elDough) elDough.textContent = data.doughNote;
        if (elBadge) elBadge.textContent = data.badge;

        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 150);
    }

    // Attach listeners to pills
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const r = pill.getAttribute('data-region');
        setActiveRegion(r);
      });
    });

    // Attach listeners to SVG paths
    paths.forEach((path) => {
      path.addEventListener('click', () => {
        const r = path.getAttribute('data-region');
        setActiveRegion(r);
      });
    });

    // Attach listeners to SVG pins
    pins.forEach((pin) => {
      pin.addEventListener('click', () => {
        const r = pin.getAttribute('data-region');
        setActiveRegion(r);
      });
    });

    // Initial region: Puglia
    setActiveRegion('puglia');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
  } else {
    initMap();
  }
})();
