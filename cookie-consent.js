/* ═══════════════════════════════════════════════════════════════════
   COOKIE-BANNER / EINWILLIGUNG
   Google Analytics wird erst geladen, nachdem der Besucher zugestimmt hat.
   Die Entscheidung liegt im localStorage ("cookieConsent") und wird nach
   12 Monaten oder bei einer neuen CONSENT_VERSION erneut abgefragt.
   Jedes Element mit dem Attribut data-cookie-settings öffnet den Banner erneut.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var GA_ID = 'G-MH4B6GJ4E5';
  var STORAGE_KEY = 'cookieConsent';
  var CONSENT_VERSION = 1;
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

  var TEXT = {
    de: {
      title: 'Cookies & Datenschutz',
      body: 'Wir möchten mit Google Analytics anonymisiert auswerten, wie diese Website genutzt wird, um sie zu verbessern. Dafür werden Cookies gesetzt und Daten an Google (auch in die USA) übertragen. Das passiert nur mit Ihrer Einwilligung, die Sie jederzeit über „Cookie-Einstellungen“ im Footer widerrufen können.',
      more: 'Mehr in der Datenschutzerklärung',
      accept: 'Akzeptieren',
      reject: 'Ablehnen'
    },
    en: {
      title: 'Cookies & privacy',
      body: 'We would like to use Google Analytics to anonymously analyse how this website is used so we can improve it. This sets cookies and transfers data to Google (including to the USA). This only happens with your consent, which you can revoke at any time via “Cookie settings” in the footer.',
      more: 'More in the privacy policy',
      accept: 'Accept',
      reject: 'Decline'
    }
  };

  /* ── Speicher ── */
  function readConsent() {
    try {
      var c = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!c || c.v !== CONSENT_VERSION || Date.now() - c.ts > MAX_AGE_MS) return null;
      return c;
    } catch (e) { return null; }
  }
  function writeConsent(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: CONSENT_VERSION, analytics: analytics, ts: Date.now() }));
    } catch (e) {}
  }

  /* ── Google Analytics ── */
  var gaLoaded = false;
  function loadAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  function deleteAnalyticsCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga/.test(name) && name !== '_gid' && !/^_gat/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  /* ── Banner ── */
  function lang() {
    var l = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
    if (l !== 'de' && l !== 'en') {
      try { l = localStorage.getItem('lang'); } catch (e) {}
    }
    return l === 'de' ? 'de' : 'en';
  }

  var CSS =
    '#cc-banner{position:fixed;left:24px;right:24px;bottom:24px;z-index:1000;max-width:560px;' +
    'background:#151515;color:#F2EDE4;border:1px solid rgba(255,202,25,0.18);border-radius:2px;' +
    'padding:28px 28px 24px;box-shadow:0 20px 60px rgba(0,0,0,0.55);' +
    "font-family:'DM Sans',-apple-system,sans-serif;line-height:1.6;" +
    'opacity:0;transform:translateY(16px);transition:opacity .3s ease,transform .3s ease}' +
    '#cc-banner.cc-show{opacity:1;transform:none}' +
    "#cc-banner .cc-title{font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;font-weight:500;color:#fff;margin:0 0 10px}" +
    '#cc-banner .cc-body{font-size:14px;font-weight:300;color:rgba(242,237,228,0.82);margin:0 0 10px}' +
    '#cc-banner .cc-more{font-size:13px;color:#ffca19;text-decoration:none;border-bottom:1px solid rgba(255,202,25,0.18)}' +
    '#cc-banner .cc-more:hover{border-bottom-color:#ffca19}' +
    '#cc-banner .cc-actions{display:flex;gap:12px;margin-top:22px}' +
    "#cc-banner button{flex:1;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;letter-spacing:.1em;" +
    'text-transform:uppercase;padding:13px 18px;border-radius:2px;cursor:pointer;transition:all .2s;' +
    'border:1px solid #ffca19;background:transparent;color:#ffca19}' +
    '#cc-banner button:hover,#cc-banner button:focus-visible{background:#ffca19;color:#0D0D0D;outline:none}' +
    '@media(max-width:680px){#cc-banner{left:12px;right:12px;bottom:12px;padding:22px 18px 18px}' +
    '#cc-banner .cc-actions{flex-direction:column-reverse}}';

  var banner = null;

  function render() {
    if (!banner) return;
    var t = TEXT[lang()];
    banner.querySelector('.cc-title').textContent = t.title;
    banner.querySelector('.cc-body').textContent = t.body;
    banner.querySelector('.cc-more').textContent = t.more;
    banner.querySelector('[data-cc="accept"]').textContent = t.accept;
    banner.querySelector('[data-cc="reject"]').textContent = t.reject;
  }

  function showBanner() {
    if (!banner) {
      var style = document.createElement('style');
      style.textContent = CSS;
      document.head.appendChild(style);

      banner = document.createElement('div');
      banner.id = 'cc-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-live', 'polite');
      banner.setAttribute('aria-labelledby', 'cc-title');
      banner.innerHTML =
        '<p class="cc-title" id="cc-title"></p>' +
        '<p class="cc-body"></p>' +
        '<a class="cc-more" href="datenschutz.html"></a>' +
        '<div class="cc-actions">' +
        '<button type="button" data-cc="reject"></button>' +
        '<button type="button" data-cc="accept"></button>' +
        '</div>';
      banner.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-cc]');
        if (btn) decide(btn.getAttribute('data-cc') === 'accept');
      });
      document.body.appendChild(banner);

      // Sprachwechsel der Seite (html lang) übernehmen
      new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
    render();
    banner.style.display = '';
    requestAnimationFrame(function () { banner.classList.add('cc-show'); });
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('cc-show');
    setTimeout(function () { banner.style.display = 'none'; }, 300);
  }

  function decide(analytics) {
    var before = readConsent();
    writeConsent(analytics);
    hideBanner();
    if (analytics) {
      loadAnalytics();
    } else {
      deleteAnalyticsCookies();
      // Ein bereits geladenes Google Analytics lässt sich nur per Neuladen sicher stoppen
      if (gaLoaded || (before && before.analytics)) location.reload();
    }
  }

  /* ── Start ── */
  function init() {
    var c = readConsent();
    if (c && c.analytics) loadAnalytics();
    if (!c) showBanner();

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-cookie-settings]');
      if (!el) return;
      e.preventDefault();
      showBanner();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
