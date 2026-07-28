/* ТЕРМОТЕХНИКА33 — поведение сайта */
(function () {
  'use strict';

  /* --- Мобильное меню --- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* --- Подсветка активного пункта меню --- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navObserver.observe(s); });

    /* --- Появление блоков --- */
    var blocks = document.querySelectorAll('.section__head, .card, .scope__col, .answer, .promise, .principles article, .steps li, .estimate__text, .estimate__doc, .gallery figure, .quotes, .request__text, .form');
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(blocks, function (el) {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  /* --- Просмотр фото объектов --- */
  var lightbox = document.querySelector('.lightbox');
  var lightboxImg = lightbox.querySelector('img');
  var lightboxCap = lightbox.querySelector('figcaption');
  var lastFocused = null;

  function openShot(img) {
    var caption = img.parentElement.querySelector('figcaption');
    lastFocused = document.activeElement;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.textContent = caption ? caption.textContent : '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox__close').focus();
  }

  function closeShot() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('click', function (e) {
    var img = e.target.closest('.shot img, .band img');
    if (img) { openShot(img); return; }
    if (e.target.closest('.lightbox')) closeShot();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeShot();
  });

  /* --- Телефон: маска +7 900 000-00-00 --- */
  var phone = document.getElementById('phone');

  function formatPhone(value) {
    var digits = value.replace(/\D/g, '');
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    if (digits[0] !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    var out = '+7';
    if (digits.length > 1) out += ' ' + digits.slice(1, 4);
    if (digits.length >= 5) out += ' ' + digits.slice(4, 7);
    if (digits.length >= 8) out += '-' + digits.slice(7, 9);
    if (digits.length >= 10) out += '-' + digits.slice(9, 11);
    return out;
  }

  phone.addEventListener('input', function () {
    phone.value = formatPhone(phone.value);
    setInvalid(phone, false);
  });

  phone.addEventListener('focus', function () {
    if (!phone.value) phone.value = '+7 ';
  });

  phone.addEventListener('blur', function () {
    if (phone.value.replace(/\D/g, '').length < 2) phone.value = '';
  });

  /* --- Проверка и отправка формы --- */
  var form = document.querySelector('.form');
  var ok = form.querySelector('.form__ok');

  function setInvalid(field, state) {
    var wrap = field.closest('.field');
    if (wrap) wrap.classList.toggle('is-invalid', state);
  }

  ['area', 'need'].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', function () { setInvalid(el, false); });
    el.addEventListener('change', function () { setInvalid(el, false); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var area = document.getElementById('area');
    var need = document.getElementById('need');
    var bad = null;

    var areaOk = area.value !== '' && Number(area.value) >= 30 && Number(area.value) <= 2000;
    var needOk = need.value !== '';
    var phoneOk = phone.value.replace(/\D/g, '').length === 11;

    setInvalid(area, !areaOk);
    setInvalid(need, !needOk);
    setInvalid(phone, !phoneOk);

    if (!areaOk) bad = area;
    else if (!needOk) bad = need;
    else if (!phoneOk) bad = phone;

    if (bad) { bad.focus(); return; }

    /* Здесь подключается отправка на почту или в CRM.
       Пока — подтверждение по правилу бренд-бука: перезвоним в течение часа. */
    ok.hidden = false;
    form.querySelector('button[type="submit"]').textContent = 'Заявка отправлена';
    form.querySelector('button[type="submit"]').disabled = true;
  });

  /* --- Год в подвале держим актуальным --- */
  var bottom = document.querySelector('.footer-bottom p');
  var year = new Date().getFullYear();
  bottom.textContent = bottom.textContent.replace(/©\s*\d{4}/, '© ' + year);
})();
