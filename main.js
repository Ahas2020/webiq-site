// ═══════════════════════════════════════════
// WEBIQ.AI — Main JavaScript
// Neural Canvas + i18n + Smart Currency + Chatbot
// ═══════════════════════════════════════════

// ── NEURAL CANVAS ──────────────────────────
const canvas = document.getElementById('neural-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function initNodes() {
    nodes = [];
    const count = Math.min(90, Math.floor(W * H / 13000));
    for (let i = 0; i < count; i++) nodes.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.45, vy:(Math.random()-.5)*.45, r:Math.random()*2+1 });
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    nodes.forEach(n => {
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0||n.x>W) n.vx*=-1;
      if(n.y<0||n.y>H) n.vy*=-1;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle='rgba(124,58,237,0.85)'; ctx.fill();
    });
    nodes.forEach((a,i)=>nodes.slice(i+1).forEach(b=>{
      const d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<165){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(124,58,237,${(1-d/165)*.38})`; ctx.lineWidth=1; ctx.stroke(); }
    }));
    requestAnimationFrame(draw);
  }
  resize(); initNodes(); draw();
  window.addEventListener('resize',()=>{resize();initNodes();});
}

// ══════════════════════════════════════════════════
// SMART GEO-PRICING ENGINE — WEBIQ.AI
// 4 zones × auto currency × instant display
// ══════════════════════════════════════════════════

// ── Zone definitions ──
const GEO_ZONES = {
  // Zone A — Maghreb & North Africa (base prices)
  MA:{zone:'A'}, DZ:{zone:'A'}, TN:{zone:'A'}, LY:{zone:'A'}, MR:{zone:'A'},
  // Zone B — Emerging Africa & Middle East
  EG:{zone:'B'}, SN:{zone:'B'}, CI:{zone:'B'}, CM:{zone:'B'}, GH:{zone:'B'},
  NG:{zone:'B'}, KE:{zone:'B'}, LB:{zone:'B'}, JO:{zone:'B'}, IQ:{zone:'B'},
  // Zone C — Gulf & wealthy Arab world
  AE:{zone:'C'}, SA:{zone:'C'}, QA:{zone:'C'}, KW:{zone:'C'},
  BH:{zone:'C'}, OM:{zone:'C'},
  // Zone D — Europe, Americas, Oceania
  FR:{zone:'D'}, DE:{zone:'D'}, GB:{zone:'D'}, IT:{zone:'D'}, ES:{zone:'D'},
  BE:{zone:'D'}, NL:{zone:'D'}, CH:{zone:'D'}, SE:{zone:'D'}, NO:{zone:'D'},
  US:{zone:'D'}, CA:{zone:'D'}, AU:{zone:'D'}, NZ:{zone:'D'},
  DEFAULT:{zone:'A'}
};

// ── Base prices per zone (USD) ──
const ZONE_PRICES = {
  A: { starter:200,  pro:500,   advanced:800,   enterprise:1200,  starter_mo:20, pro_mo:40,  enterprise_mo:80  },
  B: { starter:300,  pro:700,   advanced:1200,  enterprise:2000,  starter_mo:30, pro_mo:60,  enterprise_mo:120 },
  C: { starter:800,  pro:2000,  advanced:3500,  enterprise:6000,  starter_mo:80, pro_mo:180, enterprise_mo:350 },
  D: { starter:1000, pro:2500,  advanced:4500,  enterprise:8000,  starter_mo:100,pro_mo:220, enterprise_mo:450 },
};

// ── Zone labels ──
const ZONE_LABELS = {
  A: { flag:'🇲🇦', name:'Maghreb', badge:'Zone Maghreb' },
  B: { flag:'🌍', name:'Africa & Middle East', badge:'Zone Afrique' },
  C: { flag:'🇦🇪', name:'Gulf', badge:'Zone Gulf — Premium' },
  D: { flag:'🌐', name:'International', badge:'Zone International' },
};

// ── Currency map ──
const CURRENCY_MAP = {
  MA:{code:'MAD',symbol:'MAD',rate:10.1},
  DZ:{code:'DZD',symbol:'DZD',rate:135},
  TN:{code:'TND',symbol:'TND',rate:3.12},
  EG:{code:'EGP',symbol:'EGP',rate:49},
  SN:{code:'XOF',symbol:'CFA',rate:605},
  AE:{code:'AED',symbol:'AED',rate:3.67},
  SA:{code:'SAR',symbol:'SAR',rate:3.75},
  QA:{code:'QAR',symbol:'QAR',rate:3.64},
  KW:{code:'KWD',symbol:'KWD',rate:0.31},
  BH:{code:'BHD',symbol:'BHD',rate:0.38},
  OM:{code:'OMR',symbol:'OMR',rate:0.38},
  FR:{code:'EUR',symbol:'€',rate:0.92},
  DE:{code:'EUR',symbol:'€',rate:0.92},
  IT:{code:'EUR',symbol:'€',rate:0.92},
  ES:{code:'EUR',symbol:'€',rate:0.92},
  BE:{code:'EUR',symbol:'€',rate:0.92},
  NL:{code:'EUR',symbol:'€',rate:0.92},
  CH:{code:'CHF',symbol:'CHF',rate:0.89},
  SE:{code:'SEK',symbol:'SEK',rate:10.4},
  NO:{code:'NOK',symbol:'NOK',rate:10.6},
  GB:{code:'GBP',symbol:'£',rate:0.79},
  US:{code:'USD',symbol:'$',rate:1},
  CA:{code:'CAD',symbol:'CA$',rate:1.36},
  AU:{code:'AUD',symbol:'A$',rate:1.53},
  NZ:{code:'NZD',symbol:'NZ$',rate:1.63},
  DEFAULT:{code:'USD',symbol:'$',rate:1}
};

let userCurrency = CURRENCY_MAP.DEFAULT;
let userCountry  = 'XX';
let userZone     = 'A';
let userPrices   = ZONE_PRICES.A;

// ── Detection ──
async function detectCurrency() {
  try {
    const res  = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    userCountry  = data.country_code || 'XX';
    const geoEntry = GEO_ZONES[userCountry] || GEO_ZONES.DEFAULT;
    userZone     = geoEntry.zone;
    userPrices   = ZONE_PRICES[userZone];
    userCurrency = CURRENCY_MAP[userCountry] || CURRENCY_MAP.DEFAULT;
  } catch(e) {
    userZone   = 'A';
    userPrices = ZONE_PRICES.A;
    userCurrency = CURRENCY_MAP.DEFAULT;
  }
  renderAllPrices();
}

// ── Format price: shows zone price + local currency equivalent ──
function formatPrice(baseKey) {
  const usd   = userPrices[baseKey] || 0;
  const local = Math.round(usd * userCurrency.rate);
  const localFmt = local.toLocaleString();

  if (userCurrency.code === 'USD') {
    return `<span class="price-usd">$${usd.toLocaleString()}</span>`;
  }
  return `<span class="price-usd">$${usd.toLocaleString()}</span><span class="price-local">≈ ${userCurrency.symbol} ${localFmt}</span>`;
}

// ── Render all prices across all pages ──
function renderAllPrices() {
  // Pricing page — main cards
  const priceMap = {
    'p1-price': 'starter',
    'p2-price': 'pro',
    'p3-price': 'enterprise',
    'p1-mo':    'starter_mo',
    'p2-mo':    'pro_mo',
    'p3-mo':    'enterprise_mo',
  };
  Object.entries(priceMap).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = formatPrice(key);
  });

  // Service cards with data-price-key attribute
  document.querySelectorAll('[data-price-key]').forEach(el => {
    el.innerHTML = formatPrice(el.dataset.priceKey);
  });

  // Legacy data-usd (fallback — convert old fixed prices to zone prices)
  document.querySelectorAll('[data-usd]').forEach(el => {
    const baseUsd = parseInt(el.dataset.usd);
    // Map old base price to closest zone price key
    const keyMap = {200:'starter',250:'starter',300:'pro',500:'pro',
                    600:'advanced',800:'advanced',1200:'enterprise'};
    const key = keyMap[baseUsd] || 'starter';
    el.innerHTML = formatPrice(key);
  });

  // Zone badge
  const badge = document.getElementById('currency-badge');
  if (badge) {
    const zoneInfo = ZONE_LABELS[userZone];
    badge.innerHTML = `${zoneInfo.flag} ${zoneInfo.badge} &nbsp;|&nbsp; 💱 ${userCurrency.code}`;
    badge.title = `Prices adjusted for your region (${userCountry})`;
  }

  // Zone indicator on pricing page
  const zoneIndicator = document.getElementById('zone-indicator');
  if (zoneIndicator) {
    const zoneInfo = ZONE_LABELS[userZone];
    zoneIndicator.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:.6rem;background:rgba(124,58,237,.1);
        border:1px solid rgba(124,58,237,.25);border-radius:50px;padding:.4rem 1.1rem;
        font-size:.82rem;color:var(--purple-light);margin-bottom:1.5rem;">
        ${zoneInfo.flag}
        <span>Les prix sont adaptés à votre région — <strong>${zoneInfo.name}</strong></span>
        &nbsp;|&nbsp;
        <span style="color:var(--gold);">💱 ${userCurrency.code}</span>
      </div>`;
  }
}

detectCurrency();

// ── TRANSLATIONS ────────────────────────────
const T = {
  ar: {
    dir:'rtl', lang:'ar',
    'nav-home':'الرئيسية','nav-services':'خدماتنا','nav-portfolio':'أعمالنا',
    'nav-pricing':'الأسعار','nav-contact':'تواصل معنا','nav-order':'اطلب موقعك',
    'hero-badge':'🔥 الذكاء الاصطناعي في خدمة تجارتك',
    'hero-h1':'موقعك الذكي <span class="gradient-text">يبيع وأنت نائم</span>',
    'hero-p':'نبني لك مواقع ويب احترافية مدعومة بالذكاء الاصطناعي تجذب العملاء، ترفع مبيعاتك، وتميّزك عن منافسيك — بدون تعقيد.',
    'hero-cta1':'اطلب موقعك الآن →','hero-cta2':'شاهد أعمالنا',
    'stat1-num':'+50','stat1-label':'موقع تم تسليمه',
    'stat2-num':'7 أيام','stat2-label':'متوسط وقت التسليم',
    'stat3-num':'3x','stat3-label':'متوسط نمو المبيعات',
    'services-badge':'خدماتنا','services-title':'مواقع مصمّمة لكل قطاع تجاري',
    'services-sub':'من المطاعم إلى العيادات — نبني موقعاً يناسب نشاطك تماماً ويعمل على مدار الساعة.',
    'why-badge':'لماذا WEBIQ.AI؟','why-title':'ليس مجرد موقع — <span class="gradient-text">بل آلة مبيعات</span>',
    'why-sub':'نضيف الذكاء الاصطناعي لكل موقع نبنيه ليعمل لصالحك على مدار الساعة.',
    'why-f1-title':'Chatbot ذكي متعدد اللغات',
    'why-f1-p':'يجيب عن أسئلة عملائك تلقائياً بالعربية والفرنسية والإنجليزية — 24/7 بدون توقف.',
    'why-f2-title':'عملة كل عميل تلقائياً',
    'why-f2-p':'كل زائر يرى الأسعار بعملة بلده تلقائياً — تجربة عالمية من الدقيقة الأولى.',
    'why-f3-title':'تسليم احترافي — في أسبوع',
    'why-f3-p':'نسلّمك موقعاً احترافياً متكاملاً خلال أسبوع — جودة لا تقبل التنازل.',
    'why-f4-title':'3 لغات — بروح عالمية',
    'why-f4-p':'عربي، فرنسي، إنجليزي — موقعك يتحدث مع كل عميل بلغته.',
    'cta-title':'جاهز لتحويل تجارتك؟',
    'cta-sub':'اطلب موقعك اليوم واحصل على استشارة مجانية + عرض سعر مخصص في أقل من ساعة.',
    'cta-btn1':'🚀 اطلب موقعك الآن','cta-btn2':'💬 تحدث معنا مباشرة',
    'chat-greeting':'مرحباً! أنا مساعد WEBIQ.AI الذكي 🤖\nكيف يمكنني مساعدتك اليوم؟',
    'chat-placeholder':'اكتب سؤالك هنا...',
    'footer-tagline':'مواقع ذكية تبيع وأنت نائم 🌍',
    'footer-h-services':'خدماتنا','footer-h-company':'الشركة','footer-h-legal':'قانوني',
    'footer-h-contact':'تواصل سريع',
    'footer-l-restaurants':'مواقع المطاعم','footer-l-clinics':'مواقع العيادات',
    'footer-l-ecommerce':'المتاجر الإلكترونية','footer-l-corporate':'مواقع الشركات',
    'footer-l-hotels':'الفنادق والسياحة','footer-l-mission':'مهمتنا',
    'footer-l-portfolio':'أعمالنا','footer-l-pricing':'الأسعار',
    'footer-l-contact':'تواصل معنا','footer-l-order':'اطلب موقعك',
    'footer-l-privacy':'سياسة الخصوصية','footer-l-terms':'شروط الخدمة',
    'footer-privacy-link':'سياسة الخصوصية','footer-terms-link':'شروط الخدمة','footer-mission-link':'مهمتنا',
    'footer-copy':'© 2025 WEBIQ.AI — مواقع ذكية تبيع وأنت نائم 🌍',
    'services-more':'اكتشف كل خدماتنا →',
    'sc1-title':'مواقع المطاعم والمقاهي','sc1-desc':'قائمة طعام تفاعلية، طلب واتساب مباشر، عرض العروض والصور بشكل احترافي.',
    'sc2-title':'مواقع العيادات والأطباء','sc2-desc':'حجز مواعيد تلقائي، معلومات طبية، chatbot للإجابة عن الاستفسارات.',
    'sc3-title':'مواقع شركات البناء','sc3-desc':'حاسبة تكلفة البناء بالذكاء الاصطناعي، معرض مشاريع، طلب عروض الأسعار.',
    'sc4-title':'المتاجر الإلكترونية','sc4-desc':'توصيات ذكية، دفع إلكتروني، إدارة المخزون، تتبع الطلبات.',
    'sc5-title':'الحلاقة والتجميل','sc5-desc':'حجز مواعيد أون لاين، عرض الأسعار والخدمات، معرض الصور.',
    'sc6-title':'الفنادق والرياض','sc6-desc':'حجز الغرف، عرض الخدمات، تفاعل مع الضيوف عبر AI مدمج.',
    'price-from-1':'يبدأ من','price-from-2':'يبدأ من','price-from-3':'يبدأ من',
    'price-from-4':'يبدأ من','price-from-5':'يبدأ من','price-from-6':'يبدأ من',
  },
  fr: {
    dir:'ltr', lang:'fr',
    'nav-home':'Accueil','nav-services':'Services','nav-portfolio':'Portfolio',
    'nav-pricing':'Tarifs','nav-contact':'Contact','nav-order':'Commander',
    'hero-badge':'🔥 L\'IA au service de votre business',
    'hero-h1':'Votre site intelligent <span class="gradient-text">vend pendant que vous dormez</span>',
    'hero-p':'Nous créons des sites web professionnels propulsés par l\'IA qui attirent vos clients, boostent vos ventes et vous démarquent de la concurrence — sans aucune complexité technique.',
    'hero-cta1':'Commander mon site →','hero-cta2':'Voir nos réalisations',
    'stat1-num':'+50','stat1-label':'Sites livrés',
    'stat2-num':'7 jours','stat2-label':'Délai de livraison moyen',
    'stat3-num':'3x','stat3-label':'Croissance moyenne des ventes',
    'services-badge':'Nos services','services-title':'Des sites conçus pour chaque secteur d\'activité',
    'services-sub':'Des restaurants aux cliniques — nous créons un site parfaitement adapté à votre activité, disponible 24h/24 et 7j/7.',
    'why-badge':'Pourquoi WEBIQ.AI ?','why-title':'Pas juste un site — <span class="gradient-text">une machine à vendre</span>',
    'why-sub':'Nous intégrons l\'intelligence artificielle dans chaque site que nous créons pour qu\'il travaille pour vous en permanence.',
    'why-f1-title':'Chatbot IA multilingue',
    'why-f1-p':'Il répond automatiquement aux questions de vos clients en arabe, français et anglais — 24h/24, 7j/7, sans interruption.',
    'why-f2-title':'Devise locale automatique',
    'why-f2-p':'Chaque visiteur voit les prix dans sa monnaie locale automatiquement — une expérience mondiale dès la première minute.',
    'why-f3-title':'Livraison professionnelle en 7 jours',
    'why-f3-p':'Nous vous livrons un site web complet et professionnel en une semaine — qualité premium, aucun compromis.',
    'why-f4-title':'3 langues — une vision internationale',
    'why-f4-p':'Arabe, français, anglais — votre site s\'adresse à chaque client dans sa propre langue.',
    'cta-title':'Prêt à transformer votre activité ?',
    'cta-sub':'Commandez votre site aujourd\'hui et bénéficiez d\'une consultation gratuite + un devis personnalisé en moins d\'une heure.',
    'cta-btn1':'🚀 Commander maintenant','cta-btn2':'💬 Nous contacter sur WhatsApp',
    'chat-greeting':'Bonjour ! Je suis l\'assistant IA de WEBIQ.AI 🤖\nComment puis-je vous aider aujourd\'hui ?',
    'chat-placeholder':'Écrivez votre question ici...',
    'footer-tagline':'Des sites intelligents qui vendent 24/7 🌍',
    'footer-h-services':'Services','footer-h-company':'Entreprise','footer-h-legal':'Mentions légales',
    'footer-h-contact':'Contact rapide',
    'footer-l-restaurants':'Sites restaurants','footer-l-clinics':'Sites cliniques',
    'footer-l-ecommerce':'Boutiques en ligne','footer-l-corporate':'Sites d\'entreprise',
    'footer-l-hotels':'Hôtels & tourisme','footer-l-mission':'Notre mission',
    'footer-l-portfolio':'Portfolio','footer-l-pricing':'Tarifs',
    'footer-l-contact':'Nous contacter','footer-l-order':'Commander',
    'footer-l-privacy':'Politique de confidentialité','footer-l-terms':'Conditions d\'utilisation',
    'footer-privacy-link':'Politique de confidentialité','footer-terms-link':'Conditions d\'utilisation','footer-mission-link':'Notre mission',
    'footer-copy':'© 2025 WEBIQ.AI — Des sites intelligents qui vendent 24/7 🌍',
    'services-more':'Découvrir tous nos services →',
    'sc1-title':'Sites restaurants & cafés','sc1-desc':'Menu interactif, commande WhatsApp directe, présentation professionnelle des offres et photos.',
    'sc2-title':'Sites cliniques & médecins','sc2-desc':'Prise de rendez-vous automatique, informations médicales, chatbot pour répondre aux questions.',
    'sc3-title':'Sites entreprises BTP','sc3-desc':'Calculateur de coût de construction IA, galerie de projets, demande de devis en ligne.',
    'sc4-title':'Boutiques en ligne','sc4-desc':'Recommandations intelligentes, paiement en ligne, gestion des stocks, suivi des commandes.',
    'sc5-title':'Coiffure & beauté','sc5-desc':'Réservation en ligne, présentation des tarifs et services, galerie photos.',
    'sc6-title':'Hôtels & maisons d\'hôtes','sc6-desc':'Réservation de chambres, présentation des services, interaction avec les clients via IA intégrée.',
    'price-from-1':'À partir de','price-from-2':'À partir de','price-from-3':'À partir de',
    'price-from-4':'À partir de','price-from-5':'À partir de','price-from-6':'À partir de',
  },
  en: {
    dir:'ltr', lang:'en',
    'nav-home':'Home','nav-services':'Services','nav-portfolio':'Portfolio',
    'nav-pricing':'Pricing','nav-contact':'Contact','nav-order':'Order Now',
    'hero-badge':'🔥 AI-powered websites for your business',
    'hero-h1':'Your smart website <span class="gradient-text">sells while you sleep</span>',
    'hero-p':'We build professional AI-powered websites that attract customers, boost your sales, and set you apart from competitors — delivered with no technical complexity on your end.',
    'hero-cta1':'Order your site →','hero-cta2':'See our work',
    'stat1-num':'+50','stat1-label':'Sites delivered',
    'stat2-num':'7 days','stat2-label':'Average delivery time',
    'stat3-num':'3x','stat3-label':'Average sales growth',
    'services-badge':'Our Services','services-title':'Websites built for every industry',
    'services-sub':'From restaurants to clinics — we build a site that fits your business perfectly and works around the clock.',
    'why-badge':'Why WEBIQ.AI?','why-title':'Not just a website — <span class="gradient-text">a sales machine</span>',
    'why-sub':'We embed artificial intelligence into every site we build so it works for you continuously, day and night.',
    'why-f1-title':'Multilingual AI Chatbot',
    'why-f1-p':'It automatically answers your customers\' questions in Arabic, French and English — 24/7, without interruption.',
    'why-f2-title':'Automatic local currency',
    'why-f2-p':'Every visitor sees prices in their local currency automatically — a global experience from the very first minute.',
    'why-f3-title':'Professional delivery in 7 days',
    'why-f3-p':'We deliver a complete, professional website within one week — premium quality, zero compromise.',
    'why-f4-title':'3 languages — a global vision',
    'why-f4-p':'Arabic, French, English — your website speaks to every customer in their own language.',
    'cta-title':'Ready to transform your business?',
    'cta-sub':'Order your site today and get a free consultation + a custom quote in less than one hour.',
    'cta-btn1':'🚀 Order now','cta-btn2':'💬 Chat with us on WhatsApp',
    'chat-greeting':'Hello! I\'m WEBIQ.AI\'s AI assistant 🤖\nHow can I help you today?',
    'chat-placeholder':'Type your question here...',
    'footer-tagline':'Smart websites that sell 24/7 🌍',
    'footer-h-services':'Services','footer-h-company':'Company','footer-h-legal':'Legal',
    'footer-h-contact':'Quick contact',
    'footer-l-restaurants':'Restaurant websites','footer-l-clinics':'Clinic websites',
    'footer-l-ecommerce':'E-commerce stores','footer-l-corporate':'Corporate websites',
    'footer-l-hotels':'Hotels & tourism','footer-l-mission':'Our mission',
    'footer-l-portfolio':'Portfolio','footer-l-pricing':'Pricing',
    'footer-l-contact':'Contact us','footer-l-order':'Order now',
    'footer-l-privacy':'Privacy Policy','footer-l-terms':'Terms of Service',
    'footer-privacy-link':'Privacy Policy','footer-terms-link':'Terms of Service','footer-mission-link':'Our Mission',
    'footer-copy':'© 2025 WEBIQ.AI — Smart websites that sell 24/7 🌍',
    'services-more':'Explore all our services →',
    'sc1-title':'Restaurant & café websites','sc1-desc':'Interactive menu, direct WhatsApp ordering, professional display of offers and photos.',
    'sc2-title':'Clinic & doctor websites','sc2-desc':'Automatic appointment booking, medical information, chatbot to answer enquiries.',
    'sc3-title':'Construction company websites','sc3-desc':'AI-powered construction cost calculator, project gallery, online quote requests.',
    'sc4-title':'E-commerce stores','sc4-desc':'Smart recommendations, online payment, inventory management, order tracking.',
    'sc5-title':'Hair & beauty salons','sc5-desc':'Online booking, pricing and service display, photo gallery.',
    'sc6-title':'Hotels & guesthouses','sc6-desc':'Room booking, service display, guest interaction via integrated AI.',
    'price-from-1':'Starting from','price-from-2':'Starting from','price-from-3':'Starting from',
    'price-from-4':'Starting from','price-from-5':'Starting from','price-from-6':'Starting from',
  }
};

let currentLang = localStorage.getItem('webiq-lang') || 'ar';

function setLang(lang) {
  currentLang = lang;
  const t = T[lang];
  if(!t) return;
  // Direction
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;
  document.body.className = lang === 'ar' ? 'rtl' : lang;
  // Active button
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  // Translate all keyed elements
  Object.keys(t).forEach(key => {
    if(key === 'dir' || key === 'lang') return;
    const el = document.getElementById(key);
    if(el) el.innerHTML = t[key];
  });
  // Chatbot placeholder
  const inp = document.getElementById('chat-input');
  if(inp) inp.placeholder = t['chat-placeholder'];
  // Re-render prices in case they loaded
  renderAllPrices();
  localStorage.setItem('webiq-lang', lang);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});
// Init on load
document.addEventListener('DOMContentLoaded', () => setLang(currentLang));

// ── CHATBOT ─────────────────────────────────
const BOT_RESPONSES = {
  ar: {
    price:   'أسعارنا تبدأ من $200 للموقع الأساسي. لكل بلد نعرض السعر بعملته المحلية تلقائياً. هل تريد عرضاً مخصصاً؟',
    time:    'متوسط وقت التسليم أسبوع واحد — نحرص على الجودة الاحترافية في كل تفصيل.',
    ai:      'نضيف chatbot ذكي، حجز مواعيد تلقائي، توصيات ذكية، وتحليل الزوار — كل هذا مدمج من الأساس.',
    contact: 'يمكنك التواصل معنا عبر واتساب على الرقم +212609018612 أو استخدم زر التواصل في الأسفل.',
    default: 'شكراً على سؤالك! تواصل معنا على واتساب للحصول على إجابة تفصيلية. 📱',
  },
  fr: {
    price:   'Nos prix commencent à partir de $200 pour un site basique. Chaque visiteur voit automatiquement les prix dans sa monnaie locale. Souhaitez-vous un devis personnalisé ?',
    time:    'Notre délai de livraison moyen est d\'une semaine — nous privilégions la qualité professionnelle sur chaque détail.',
    ai:      'Nous intégrons un chatbot IA, la réservation automatique, des recommandations intelligentes et l\'analyse des visiteurs — tout est inclus dès le départ.',
    contact: 'Contactez-nous sur WhatsApp au +212609018612 ou utilisez le bouton de contact en bas de page.',
    default: 'Merci pour votre question ! Contactez-nous sur WhatsApp pour obtenir une réponse détaillée. 📱',
  },
  en: {
    price:   'Our prices start at $200 for a basic site. Every visitor automatically sees prices in their local currency. Would you like a custom quote?',
    time:    'Our average delivery time is one week — we prioritise professional quality in every single detail.',
    ai:      'We embed an AI chatbot, automatic booking, smart recommendations, and visitor analytics into every site — all included from day one.',
    contact: 'Reach us on WhatsApp at +212609018612 or use the contact button at the bottom of the page.',
    default: 'Thanks for your question! Contact us on WhatsApp for a detailed answer. 📱',
  }
};

function getBotReply(msg, lang) {
  const m = msg.toLowerCase();
  const r = BOT_RESPONSES[lang] || BOT_RESPONSES.en;
  if(/price|prix|tarif|سعر|كم|تكلفة/.test(m)) return r.price;
  if(/time|délai|temps|وقت|متى|ساعة|يوم/.test(m)) return r.time;
  if(/ai|ia|ذكاء|chatbot|bot/.test(m)) return r.ai;
  if(/contact|whatsapp|تواصل|رقم/.test(m)) return r.contact;
  return r.default;
}

const chatToggle = document.getElementById('chat-toggle');
const chatBox    = document.getElementById('chat-box');
const chatMsgs   = document.getElementById('chat-messages');
const chatInput  = document.getElementById('chat-input');
const chatSend   = document.getElementById('chat-send');
let chatOpened = false;

function addMsg(text, type) {
  if(!chatMsgs) return;
  const d = document.createElement('div');
  d.className = `msg ${type}`;
  d.textContent = text;
  chatMsgs.appendChild(d);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

chatToggle?.addEventListener('click', () => {
  chatBox?.classList.toggle('open');
  if(!chatOpened && chatBox?.classList.contains('open')) {
    chatOpened = true;
    setTimeout(() => addMsg(T[currentLang]['chat-greeting'] || T.en['chat-greeting'], 'bot'), 350);
  }
});

document.getElementById('chat-close')?.addEventListener('click', () => chatBox?.classList.remove('open'));

function sendChat() {
  const val = chatInput?.value.trim(); if(!val) return;
  addMsg(val, 'user'); chatInput.value = '';
  setTimeout(() => addMsg(getBotReply(val, currentLang), 'bot'), 650);
}
chatSend?.addEventListener('click', sendChat);
chatInput?.addEventListener('keydown', e => e.key==='Enter' && sendChat());

// ── SCROLL ANIMATIONS ────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; } });
}, { threshold:0.08 });
document.querySelectorAll('.service-card,.price-card,.port-card,.feature-item').forEach(el => {
  el.style.opacity='0'; el.style.transform='translateY(28px)';
  el.style.transition='opacity 0.55s ease,transform 0.55s ease'; observer.observe(el);
});

// ── NAVBAR SHRINK ────────────────────────────
window.addEventListener('scroll',()=>{
  const nav=document.querySelector('.navbar');
  if(nav) nav.style.padding=window.scrollY>50?'0.65rem 2rem':'1rem 2rem';
});
