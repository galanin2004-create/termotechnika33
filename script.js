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

  /* --- Оранжевое свечение за курсором --- */
  var glowSections = document.querySelectorAll('.glow');
  var glowNow = null;          // секция под курсором
  var glowX = 0, glowY = 0;    // куда тянемся
  var drawX = 0, drawY = 0;    // где рисуем сейчас
  var glowFrame = null;
  var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function paintGlow() {
    glowFrame = null;
    if (!glowNow) return;

    var k = smooth ? 0.16 : 1;
    drawX += (glowX - drawX) * k;
    drawY += (glowY - drawY) * k;

    glowNow.style.setProperty('--gx', drawX.toFixed(1) + 'px');
    glowNow.style.setProperty('--gy', drawY.toFixed(1) + 'px');

    if (Math.abs(glowX - drawX) > 0.5 || Math.abs(glowY - drawY) > 0.5) {
      glowFrame = requestAnimationFrame(paintGlow);
    }
  }

  function putGlow(el, x, y) {
    el.style.setProperty('--gx', x.toFixed(1) + 'px');
    el.style.setProperty('--gy', y.toFixed(1) + 'px');
  }

  function updateGlow(clientX, clientY, immediate) {
    var under = document.elementFromPoint(clientX, clientY);
    var section = under && under.closest ? under.closest('.glow') : null;

    if (section !== glowNow) {
      if (glowNow) glowNow.style.setProperty('--go', '0');
      glowNow = section;
      immediate = true;                 // в новую секцию входим без рывка
    }
    if (!glowNow) return;

    var rect = glowNow.getBoundingClientRect();
    glowX = clientX - rect.left;
    glowY = clientY - rect.top;

    if (immediate || !smooth) {
      drawX = glowX; drawY = glowY;
      putGlow(glowNow, drawX, drawY);
      glowNow.style.setProperty('--go', '1');
      return;
    }
    if (!glowFrame) glowFrame = requestAnimationFrame(paintGlow);
  }

  if (glowSections.length && window.matchMedia('(hover: hover)').matches) {
    var lastX = 0, lastY = 0, seenPointer = false;

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      lastX = e.clientX; lastY = e.clientY; seenPointer = true;
      updateGlow(lastX, lastY, false);
    }, { passive: true });

    /* при прокрутке курсор стоит на месте, а секции едут под ним */
    window.addEventListener('scroll', function () {
      if (seenPointer) updateGlow(lastX, lastY, true);
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      if (glowNow) { glowNow.style.setProperty('--go', '0'); glowNow = null; }
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

  /* маска на телефонных полях */
  Array.prototype.forEach.call(document.querySelectorAll('input[type="tel"]'), function (el) {
    el.addEventListener('input', function () {
      el.value = formatPhone(el.value);
      setInvalid(el, false);
    });
    el.addEventListener('focus', function () {
      if (!el.value) el.value = '+7 ';
    });
    el.addEventListener('blur', function () {
      if (el.value.replace(/\D/g, '').length < 2) el.value = '';
    });
  });

  var phone = document.getElementById('phone');

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

    var areaOk = area.value !== '' && Number(area.value) >= 30 && Number(area.value) <= 1000;
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
