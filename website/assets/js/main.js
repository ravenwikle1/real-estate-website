/* Raven Wikle Real Estate — site scripts (no dependencies) */
(function () {
  'use strict';

  /* ---------------------------------------------- sticky header state --- */
  var header = document.querySelector('.site-header');
  var hasHero = !!document.querySelector('.hero, .pagehero');
  if (header) {
    if (!hasHero) header.classList.add('is-solid');
    var onScroll = function () {
      if (!hasHero) return;
      header.classList.toggle('is-solid', window.scrollY > 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------ mobile menu --- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------- scroll reveal ----- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 90) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------- phone input: light formatting ---- */
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '').slice(0, 10);
      if (d.length > 6)      input.value = d.slice(0,3) + '-' + d.slice(3,6) + '-' + d.slice(6);
      else if (d.length > 3) input.value = d.slice(0,3) + '-' + d.slice(3);
      else                   input.value = d;
    });
  });

  /* ------------------------- submit button feedback (Netlify Forms) ---- */
  document.querySelectorAll('form[data-netlify]').forEach(function (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type="submit"]');
      if (btn && !btn.disabled) { btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; btn.disabled = true; }
    });
  });

  /* ----------------------------------------- pause offscreen videos ---- */
  var vids = document.querySelectorAll('video[data-autoplay]');
  if ('IntersectionObserver' in window && vids.length) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function(){}); }
        else v.pause();
      });
    }, { threshold: 0.15 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ------------------------- hide the IDX section until code is added --- */
  var idx = document.getElementById('idx-slot');
  if (idx && !idx.innerHTML.trim()) {
    var sec = document.getElementById('idx-section');
    if (sec) sec.classList.add('is-empty');
  }

  /* --------------------------------------------------------- lightbox -- */
  var lb = document.getElementById('lb');
  if (lb) {
    var links = Array.prototype.slice.call(document.querySelectorAll('.dgallery a[data-lb]'));
    var img = document.getElementById('lb-img'), cap = document.getElementById('lb-cap');
    var cur = 0, last = null;
    var show = function (i) {
      var live = links.filter(function (a) { return a.isConnected; });
      if (!live.length) return;
      cur = (i + live.length) % live.length;
      var a = live[cur], t = a.querySelector('img');
      img.src = a.getAttribute('href'); img.alt = t ? t.alt : ''; cap.textContent = t ? t.alt : '';
    };
    var open = function (i) { last = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lb__close').focus(); };
    var close = function () { lb.hidden = true; document.body.style.overflow = ''; if (dshow) dshow(cur); if (last) last.focus(); };

    /* Listing photo viewer: thumbnails change the big photo; the big photo opens the lightbox. */
    var dv = document.querySelector('.dviewer'), dshow = null;
    if (dv) {
      var dimg = document.getElementById('dv-img'), dcount = document.getElementById('dv-count');
      var strip = dv.querySelector('.dgallery--strip'), dcur = 0;
      dshow = function (i) {
        var live = links.filter(function (a) { return a.isConnected; });
        if (!live.length) return;
        dcur = (i + live.length) % live.length;
        var a = live[dcur], t = a.querySelector('img'), fig = a.parentNode;
        dimg.src = a.getAttribute('href'); dimg.alt = t ? t.alt : '';
        dcount.textContent = (dcur + 1) + ' / ' + live.length;
        live.forEach(function (x, k) { x.parentNode.classList.toggle('is-current', k === dcur); });
        strip.scrollTo({ left: fig.offsetLeft - strip.offsetLeft - (strip.clientWidth - fig.offsetWidth) / 2, behavior: 'smooth' });
      };
      dv.querySelector('.dviewer__prev').addEventListener('click', function () { dshow(dcur - 1); });
      dv.querySelector('.dviewer__next').addEventListener('click', function () { dshow(dcur + 1); });
      dv.querySelector('.dviewer__main').addEventListener('click', function (e) { e.preventDefault(); open(dcur); });
      var sx = null, stage = dv.querySelector('.dviewer__stage');
      stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx; sx = null;
        if (Math.abs(dx) > 40) dshow(dcur + (dx < 0 ? 1 : -1));
      });
      dshow(0);
    }

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var live = links.filter(function (x) { return x.isConnected; });
        if (dshow) dshow(live.indexOf(a)); else open(live.indexOf(a));
      });
    });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__prev').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.lb__next').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ------------------------------------------------------ footer year -- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
