/* LAMLIHCAFTAN — interactions */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Numéro WhatsApp (format international, sans + ni espaces) — 06 10 79 50 59
  var WHATSAPP_NUMBER = '212610795059';

  var isRTL = root.dir === 'rtl';
  var T = root.lang === 'ar' ? {
    and: ' و ',
    custom: function (b, t) { return 'السلام عليكم، أرغب في جلابة حسب المقاس: القماش ' + b + '، والسفيفة ' + t + '.'; },
    model: function (m) { return 'السلام عليكم، أنا مهتم(ة) بموديل « ' + m + ' ».'; },
    name: 'الاسم: ', phone: 'الهاتف: '
  } : {
    and: ' & ',
    custom: function (b, t) { return 'Bonjour, je souhaite une djellaba sur mesure : tissu ' + b + ', sfifa ' + t + '.'; },
    model: function (m) { return 'Bonjour, je suis intéressé(e) par le modèle « ' + m + ' ».'; },
    name: 'Nom : ', phone: 'Tél : '
  };

  /* ---------- Loader ---------- */
  document.body.classList.add('is-loading');
  var loaderDone = false;
  function hideLoader() {
    if (loaderDone) return;
    loaderDone = true;
    document.querySelector('.loader').classList.add('is-done');
    document.body.classList.remove('is-loading');
  }
  window.addEventListener('load', function () { setTimeout(hideLoader, reduceMotion ? 0 : 1700); });
  setTimeout(hideLoader, 4000); // sécurité si une image tarde à charger

  /* ---------- Thème jour / nuit ---------- */
  var toggle = document.getElementById('themeToggle');
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    metaTheme.setAttribute('content', t === 'dark' ? '#0E1128' : '#FBF6EA');
    try { localStorage.setItem('lamlih-theme', t); } catch (e) {}
  }
  setTheme(root.getAttribute('data-theme') || 'dark');

  toggle.addEventListener('click', function (e) {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    // Révélation circulaire depuis le bouton (si le navigateur le permet)
    if (!document.startViewTransition || reduceMotion) { setTheme(next); return; }
    var r = toggle.getBoundingClientRect();
    var x = r.left + r.width / 2, y = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(function () { setTheme(next); });
    vt.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });

  /* ---------- Étoiles ---------- */
  var sky = document.querySelector('.sky');
  for (var i = 0; i < 70; i++) {
    var s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.setProperty('--d', (2 + Math.random() * 4) + 's');
    s.style.setProperty('--delay', (Math.random() * 4) + 's');
    if (Math.random() > .85) { s.style.width = s.style.height = '3px'; }
    sky.appendChild(s);
  }

  /* ---------- Navigation ---------- */
  var nav = document.querySelector('.nav');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ---------- Scroll : nav + fil ---------- */
  var fill = document.querySelector('.thread__fill');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    var max = document.documentElement.scrollHeight - innerHeight;
    fill.style.height = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal ---------- */
  document.querySelectorAll('.section__head, .collections__grid, .craft__grid, .steps, .stats, .hero__text').forEach(function (group) {
    group.querySelectorAll('.reveal').forEach(function (el, idx) { el.style.setProperty('--rd', (idx * 0.12) + 's'); });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- Compteurs ---------- */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, target = +el.dataset.count, start = null, dur = 1600;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      reduceMotion ? (el.textContent = target) : requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- Tilt 3D des cartes ---------- */
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt] .look-card__media').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty('--ry', (px * 8) + 'deg');
        card.style.setProperty('--rx', (-py * 8) + 'deg');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- Lookbook : glisser + flèches ---------- */
  var rail = document.getElementById('rail');
  var down = false, startX = 0, startScroll = 0, moved = false;
  rail.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = e.clientX; startScroll = rail.scrollLeft;
  });
  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { moved = true; rail.classList.add('is-dragging'); }
    rail.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', function () {
    down = false;
    setTimeout(function () { rail.classList.remove('is-dragging'); }, 0);
  });
  document.querySelectorAll('.circle-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var w = rail.querySelector('.frame').offsetWidth + 24;
      rail.scrollBy({ left: w * +b.dataset.dir * (isRTL ? -1 : 1), behavior: 'smooth' });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lightbox__cap');
  var lastFocus = null;
  rail.addEventListener('click', function (e) {
    var img = e.target.closest('img');
    if (!img || moved) return;
    lastFocus = document.activeElement;
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.textContent = img.parentElement.querySelector('figcaption').textContent;
    lb.hidden = false;
    lb.querySelector('.lightbox__close').focus();
  });
  function closeLb() { lb.hidden = true; if (lastFocus) lastFocus.focus(); }
  lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* ---------- Atelier virtuel ---------- */
  var studio = document.querySelector('.studio__svg');
  var summary = document.getElementById('studioSummary');
  var choice = {
    body: document.querySelector('[data-target="body"] .is-active').dataset.name,
    trim: document.querySelector('[data-target="trim"] .is-active').dataset.name
  };
  document.querySelectorAll('.chips').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      studio.style.setProperty('--dj-' + group.dataset.target, chip.dataset.color);
      choice[group.dataset.target] = chip.dataset.name;
      summary.textContent = choice.body + T.and + choice.trim;
    });
  });

  var msg = document.getElementById('message');
  document.getElementById('studioSend').addEventListener('click', function () {
    msg.value = T.custom(choice.body, choice.trim);
  });
  document.querySelectorAll('[data-model]').forEach(function (a) {
    a.addEventListener('click', function () {
      msg.value = T.model(a.dataset.model);
    });
  });

  /* ---------- Formulaire → WhatsApp ---------- */
  document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var text = T.name + f.name.value + (f.phone.value ? '\n' + T.phone + f.phone.value : '') + '\n\n' + f.message.value;
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });

  /* ---------- Curseur ---------- */
  var cursor = document.querySelector('.cursor');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; cursor.classList.add('is-visible'); });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-visible'); });
    (function loop() {
      cx += (tx - cx) * .18; cy += (ty - cy) * .18;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .frame img, .look-card__media').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
