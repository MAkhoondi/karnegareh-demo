/*!
 * ==========================================================================
 *  Karnegareh | کارنگاره - اسکریپت اصلی قالب
 *  بدون نیاز به jQuery یا هیچ کتابخانه دیگری (Vanilla JS)
 * --------------------------------------------------------------------------
 *  ماژول‌ها:  تنظیمات ذخیره‌شده، پیش‌بارگذاری، هدر و منو، اسکرول‌اسپای،
 *  تم تیره/روشن، پنل رنگ، متن تایپی، کلمات چرخان، انیمیشن ورود،
 *  شمارنده‌ها، مهارت‌ها، فیلتر نمونه‌کار، لایت‌باکس، اسلایدر،
 *  تب‌های vCard، فرم تماس، خبرنامه، بازگشت به بالا، ذرات (Particles)
 * ==========================================================================
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var isRTL = (root.getAttribute('dir') || 'rtl') === 'rtl';
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var faNum = function (n) { return Number(n).toLocaleString(isRTL ? 'fa-IR' : 'en-US'); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.remove('no-js');

  /* ---------- ذخیره‌سازی امن تنظیمات کاربر ---------- */
  // تنظیمات هر صفحه جداگانه ذخیره می‌شود تا رنگ‌بندی پیش‌فرض هر دمو حفظ شود
  var PAGE = location.pathname.split('/').pop() || 'index.html';
  var store = {
    get: function (k) { try { return localStorage.getItem('kg-' + k + '-' + PAGE); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('kg-' + k + '-' + PAGE, v); } catch (e) { /* ignore */ } }
  };
  // اعمال تم و رنگ ذخیره‌شده (در صورت وجود)
  var savedTheme = store.get('theme');
  var savedColor = store.get('color');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  if (savedColor) root.setAttribute('data-color', savedColor);

  /* ---------- پیش‌بارگذاری ---------- */
  function hidePreloader() {
    var pl = $('.preloader');
    if (pl) setTimeout(function () { pl.classList.add('hide'); }, 300);
  }
  if (document.readyState === 'complete') hidePreloader();
  else window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 4000); // حداکثر زمان انتظار

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- سال جاری در فوتر ---------- */
    $$('[data-year]').forEach(function (el) {
      try {
        el.textContent = new Intl.DateTimeFormat(isRTL ? 'fa-IR-u-nu-arabext' : 'en-US', { year: 'numeric' }).format(new Date());
      } catch (e) { el.textContent = new Date().getFullYear(); }
    });

    /* ---------- هدر چسبان + نوار پیشرفت + بازگشت به بالا ---------- */
    var header = $('.header');
    var progress = $('.scroll-progress');
    var backTop = $('.back-top');
    var backCircle = backTop ? $('circle', backTop) : null;
    var ticking = false;
    function onScroll() {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(y / max, 1) : 0;
      if (header) header.classList.toggle('scrolled', y > 40);
      if (progress) progress.style.transform = 'scaleX(' + ratio + ')';
      if (backTop) {
        backTop.classList.toggle('show', y > 500);
        if (backCircle) backCircle.style.strokeDashoffset = 150.8 * (1 - ratio);
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
    if (backTop) backTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* ---------- منوی موبایل ---------- */
    var nav = $('.nav');
    var overlay = $('.nav-overlay');
    function toggleMenu(open) {
      if (!nav) return;
      nav.classList.toggle('open', open);
      if (overlay) overlay.classList.toggle('show', open);
      document.body.classList.toggle('no-scroll', open);
      $$('.menu-toggle').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    }
    $$('.menu-toggle').forEach(function (b) { b.addEventListener('click', function () { toggleMenu(true); }); });
    $$('.nav-close').forEach(function (b) { b.addEventListener('click', function () { toggleMenu(false); }); });
    if (overlay) overlay.addEventListener('click', function () { toggleMenu(false); });
    $$('.nav-link').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var li = a.parentElement;
        // در موبایل، کلیک روی آیتم دارای زیرمنو فقط آن را باز/بسته می‌کند
        if (li && li.classList.contains('has-sub') && window.innerWidth < 992) {
          e.preventDefault(); li.classList.toggle('open'); return;
        }
        toggleMenu(false);
      });
    });
    $$('.sub-menu a').forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggleMenu(false); });

    /* ---------- اسکرول‌اسپای (فعال شدن لینک منو) ---------- */
    var spyLinks = $$('.nav-link[href^="#"]');
    if (spyLinks.length && 'IntersectionObserver' in window) {
      var map = {};
      spyLinks.forEach(function (l) {
        var id = l.getAttribute('href').slice(1);
        var sec = id && document.getElementById(id);
        if (sec) map[id] = l;
      });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && map[en.target.id]) {
            spyLinks.forEach(function (l) { l.classList.remove('active'); });
            map[en.target.id].classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
    }

    /* ---------- تم تیره / روشن ---------- */
    function setTheme(t) {
      root.setAttribute('data-theme', t);
      store.set('theme', t);
      $$('.cz-mode').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-mode') === t); });
    }
    $$('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
    });

    /* ---------- پنل تنظیمات رنگ (Customizer) ---------- */
    var cz = $('.customizer');
    if (cz) {
      $('.customizer-toggle', cz).addEventListener('click', function () { cz.classList.toggle('open'); });
      document.addEventListener('click', function (e) { if (!cz.contains(e.target)) cz.classList.remove('open'); });
      var current = root.getAttribute('data-color') || 'violet';
      $$('.cz-color', cz).forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-color-set') === current);
        b.addEventListener('click', function () {
          var c = b.getAttribute('data-color-set');
          root.setAttribute('data-color', c);
          store.set('color', c);
          $$('.cz-color', cz).forEach(function (x) { x.classList.toggle('active', x === b); });
        });
      });
      $$('.cz-mode', cz).forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-mode') === root.getAttribute('data-theme'));
        b.addEventListener('click', function () { setTheme(b.getAttribute('data-mode')); });
      });
    }

    /* ---------- متن تایپی ---------- */
    $$('[data-typed]').forEach(function (el) {
      var words;
      try { words = JSON.parse(el.getAttribute('data-typed')); } catch (e) { return; }
      if (!words || !words.length) return;
      if (reduceMotion) { el.textContent = words[0]; return; }
      var wi = 0, ci = 0, deleting = false;
      (function tick() {
        var w = words[wi];
        ci += deleting ? -1 : 1;
        el.textContent = w.slice(0, ci);
        var delay = deleting ? 45 : 95;
        if (!deleting && ci === w.length) { delay = 1800; deleting = true; }
        else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 400; }
        setTimeout(tick, delay);
      })();
    });

    /* ---------- کلمات چرخان (دموی ۳) ---------- */
    $$('.rotating-words').forEach(function (wrap) {
      var items = $$('span', wrap);
      if (items.length < 2) return;
      var i = 0;
      items[0].classList.add('active');
      setInterval(function () {
        var prev = items[i];
        i = (i + 1) % items.length;
        prev.classList.remove('active'); prev.classList.add('out');
        items[i].classList.remove('out'); items[i].classList.add('active');
        setTimeout(function () { prev.classList.remove('out'); }, 700);
      }, 2600);
    });

    /* ---------- انیمیشن‌های وابسته به دیده شدن ---------- */
    function animateCounter(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var dur = 2000, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = faNum(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    function animateSkill(el) {
      if (el.classList.contains('skill-fill')) el.style.width = el.getAttribute('data-value') + '%';
      if (el.classList.contains('ring-fg')) {
        var v = parseFloat(el.getAttribute('data-value')) || 0;
        el.style.strokeDashoffset = 314 - (314 * v / 100);
      }
    }
    var onceTargets = $$('[data-reveal], [data-count], .skill-fill, .ring-fg');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var t = en.target;
          if (t.hasAttribute('data-reveal')) t.classList.add('revealed');
          if (t.hasAttribute('data-count')) animateCounter(t);
          animateSkill(t);
          io.unobserve(t);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      onceTargets.forEach(function (t) { io.observe(t); });
    } else {
      onceTargets.forEach(function (t) {
        t.classList.add('revealed');
        if (t.hasAttribute('data-count')) t.textContent = faNum(t.getAttribute('data-count'));
        animateSkill(t);
      });
    }

    /* ---------- افکت نور زیر ماوس روی کارت خدمات ---------- */
    $$('.service-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* ---------- فیلتر نمونه کارها ---------- */
    $$('[data-filter-group]').forEach(function (group) {
      var scope = group.closest('section, .vc-page') || document;
      var items = $$('.portfolio-item', scope);
      $$('.filter-btn', group).forEach(function (btn) {
        btn.addEventListener('click', function () {
          $$('.filter-btn', group).forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
          btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
          var f = btn.getAttribute('data-filter');
          items.forEach(function (it) {
            var match = f === '*' || (it.getAttribute('data-category') || '').split(' ').indexOf(f) > -1;
            if (match) {
              it.classList.remove('is-hidden');
              requestAnimationFrame(function () { requestAnimationFrame(function () { it.classList.remove('is-hiding'); }); });
            } else {
              it.classList.add('is-hiding');
              setTimeout(function () { if (it.classList.contains('is-hiding')) it.classList.add('is-hidden'); }, 450);
            }
          });
        });
      });
    });

    /* ---------- لایت‌باکس ---------- */
    var lbLinks = $$('[data-lightbox]');
    if (lbLinks.length) {
      var lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.setAttribute('role', 'dialog');
      lb.setAttribute('aria-modal', 'true');
      lb.innerHTML =
        '<span class="lb-counter"></span>' +
        '<button class="lb-btn lb-close" aria-label="بستن"><svg class="icon"><use href="#i-close"></use></svg></button>' +
        '<button class="lb-btn lb-prev" aria-label="قبلی"><svg class="icon"><use href="#i-chevron-' + (isRTL ? 'right' : 'left') + '"></use></svg></button>' +
        '<figure><img alt=""><figcaption></figcaption></figure>' +
        '<button class="lb-btn lb-next" aria-label="بعدی"><svg class="icon"><use href="#i-chevron-' + (isRTL ? 'left' : 'right') + '"></use></svg></button>';
      document.body.appendChild(lb);
      var lbImg = $('img', lb), lbCap = $('figcaption', lb), lbCount = $('.lb-counter', lb);
      var gallery = [], idx = 0, lastFocus = null;

      function visibleGroup(name) {
        return lbLinks.filter(function (a) {
          return a.getAttribute('data-lightbox') === name && !a.closest('.is-hidden');
        });
      }
      function show(i) {
        idx = (i + gallery.length) % gallery.length;
        var a = gallery[idx];
        lbImg.src = a.getAttribute('href');
        lbImg.alt = a.getAttribute('data-title') || '';
        lbCap.textContent = a.getAttribute('data-title') || '';
        lbCount.textContent = faNum(idx + 1) + ' / ' + faNum(gallery.length);
        var multi = gallery.length > 1;
        $('.lb-prev', lb).style.display = multi ? '' : 'none';
        $('.lb-next', lb).style.display = multi ? '' : 'none';
      }
      function openLb(a) {
        gallery = visibleGroup(a.getAttribute('data-lightbox'));
        lastFocus = document.activeElement;
        show(gallery.indexOf(a));
        lb.classList.add('open');
        document.body.classList.add('no-scroll');
        $('.lb-close', lb).focus();
      }
      function closeLb() {
        lb.classList.remove('open');
        document.body.classList.remove('no-scroll');
        if (lastFocus) lastFocus.focus();
      }
      lbLinks.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); openLb(a); }); });
      $('.lb-close', lb).addEventListener('click', closeLb);
      $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
      $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') show(isRTL ? idx + 1 : idx - 1);
        if (e.key === 'ArrowRight') show(isRTL ? idx - 1 : idx + 1);
      });
    }

    /* ---------- اسلایدر (نظرات مشتریان) ---------- */
    $$('[data-slider]').forEach(function (slider) {
      var track = $('.slider-track', slider);
      var slides = $$('.slide', track);
      var dotsWrap = $('.slider-dots', slider);
      var prevBtn = $('.slider-prev', slider), nextBtn = $('.slider-next', slider);
      var autoplay = parseInt(slider.getAttribute('data-autoplay') || '5000', 10);
      var index = 0, timer = null, pages = 1;

      function perView() {
        var w = slides[0] ? slides[0].getBoundingClientRect().width : 0;
        var tw = track.getBoundingClientRect().width;
        return w ? Math.max(1, Math.round((tw + 26) / (w + 26))) : 1;
      }
      function build() {
        pages = Math.max(1, slides.length - perView() + 1);
        if (index > pages - 1) index = pages - 1;
        if (dotsWrap) {
          dotsWrap.innerHTML = '';
          for (var i = 0; i < pages; i++) {
            var d = document.createElement('button');
            d.setAttribute('aria-label', 'اسلاید ' + faNum(i + 1));
            (function (n) { d.addEventListener('click', function () { go(n); restart(); }); })(i);
            dotsWrap.appendChild(d);
          }
        }
        go(index);
      }
      function go(n) {
        index = (n + pages) % pages;
        var slide = slides[index];
        var offset = slide ? slide.offsetLeft - slides[0].offsetLeft : 0;
        track.style.transform = 'translateX(' + (-offset) + 'px)';
        if (dotsWrap) $$('button', dotsWrap).forEach(function (d, i) { d.classList.toggle('active', i === index); });
      }
      function restart() {
        if (timer) clearInterval(timer);
        if (autoplay && !reduceMotion) timer = setInterval(function () { go(index + 1); }, autoplay);
      }
      if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1); restart(); });
      if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1); restart(); });
      slider.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
      slider.addEventListener('mouseleave', restart);

      // کشیدن با ماوس / لمس
      var startX = 0, dx = 0, dragging = false, baseOffset = 0;
      function down(x) { dragging = true; startX = x; dx = 0; baseOffset = new DOMMatrix(getComputedStyle(track).transform).m41; track.classList.add('dragging'); }
      function move(x) { if (!dragging) return; dx = x - startX; track.style.transform = 'translateX(' + (baseOffset + dx) + 'px)'; }
      function up() {
        if (!dragging) return;
        dragging = false; track.classList.remove('dragging');
        // در حالت RTL کشیدن به راست = اسلاید بعدی
        if (Math.abs(dx) > 50) go(index + ((dx > 0) === isRTL ? 1 : -1)); else go(index);
        restart();
      }
      track.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' && e.button !== 0) return; down(e.clientX); });
      window.addEventListener('pointermove', function (e) { move(e.clientX); });
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      track.addEventListener('dragstart', function (e) { e.preventDefault(); });

      var rt;
      window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
      slider._rebuild = build;
      build(); restart();
    });

    /* ---------- تب‌های دموی ۲ (vCard) ---------- */
    var vcTabs = $$('.vc-tab');
    if (vcTabs.length) {
      var activate = function (id, scroll) {
        var page = document.getElementById(id);
        if (!page) return;
        vcTabs.forEach(function (t) {
          var on = t.getAttribute('data-page') === id;
          t.classList.toggle('active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        $$('.vc-page').forEach(function (p) { p.classList.toggle('active', p === page); });
        // اجرای دوباره انیمیشن‌ها در صفحه جدید
        $$('[data-reveal]', page).forEach(function (r) { r.classList.add('revealed'); });
        $$('.skill-fill, .ring-fg', page).forEach(animateSkill);
        $$('[data-count]', page).forEach(animateCounter);
        $$('[data-slider]', page).forEach(function (s) { if (s._rebuild) s._rebuild(); });
        if (scroll && window.innerWidth < 992) {
          var main = $('.vc-main');
          if (main) window.scrollTo({ top: main.offsetTop - 10, behavior: 'smooth' });
        }
        if (history.replaceState) history.replaceState(null, '', '#' + id);
      };
      vcTabs.forEach(function (t) {
        t.addEventListener('click', function (e) { e.preventDefault(); activate(t.getAttribute('data-page'), true); });
      });
      $$('[data-goto]').forEach(function (a) {
        a.addEventListener('click', function (e) { e.preventDefault(); activate(a.getAttribute('data-goto'), true); });
      });
      var hash = location.hash.slice(1);
      if (hash && document.getElementById(hash) && document.getElementById(hash).classList.contains('vc-page')) activate(hash, false);
    }

    /* ---------- آکاردئون (سؤالات متداول) ---------- */
    $$('[data-accordion]').forEach(function (acc) {
      var single = acc.getAttribute('data-accordion') !== 'multi';
      $$('.acc-item', acc).forEach(function (item) {
        var head = $('.acc-head', item), body = $('.acc-body', item);
        if (item.classList.contains('open')) body.style.maxHeight = body.scrollHeight + 'px';
        head.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
        head.addEventListener('click', function () {
          var open = !item.classList.contains('open');
          if (single) $$('.acc-item.open', acc).forEach(function (o) {
            if (o !== item) { o.classList.remove('open'); $('.acc-body', o).style.maxHeight = null; $('.acc-head', o).setAttribute('aria-expanded', 'false'); }
          });
          item.classList.toggle('open', open);
          body.style.maxHeight = open ? body.scrollHeight + 'px' : null;
          head.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      });
    });

    /* ---------- تب‌های عمومی ---------- */
    $$('[data-tabs]').forEach(function (wrap) {
      var btns = $$('[data-tab]', wrap), panels = $$('[data-panel]', wrap);
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-tab');
          btns.forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
          panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === id); });
        });
      });
    });

    /* ---------- اسلایدشوی تمام‌صفحه (دموی عکاس) ---------- */
    $$('[data-slideshow]').forEach(function (ss) {
      var slides = $$('.ss-slide', ss), i = 0, timer;
      var cur = $('.ss-current', ss), bar = $('.ss-progress span', ss);
      var delay = parseInt(ss.getAttribute('data-slideshow') || '6000', 10);
      function show(n) {
        slides[i].classList.remove('active');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('active');
        if (cur) cur.textContent = faNum(i + 1);
        if (bar) { bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth; bar.style.transition = 'width ' + delay + 'ms linear'; bar.style.width = '100%'; }
      }
      function play() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { show(i + 1); }, delay); }
      var nx = $('.ss-next', ss), pv = $('.ss-prev', ss);
      if (nx) nx.addEventListener('click', function () { show(i + 1); play(); });
      if (pv) pv.addEventListener('click', function () { show(i - 1); play(); });
      if (slides.length) { slides[0].classList.add('active'); show(0); play(); }
    });

    /* ---------- نمایش تصویر هنگام هاور روی لیست پروژه‌ها (دموی معمار) ---------- */
    $$('[data-hover-reveal]').forEach(function (list) {
      var float = document.createElement('div');
      float.className = 'reveal-float';
      float.innerHTML = '<img alt="">';
      document.body.appendChild(float);
      var img = $('img', float);
      $$('[data-img]', list).forEach(function (row) {
        row.addEventListener('mouseenter', function () { img.src = row.getAttribute('data-img'); float.classList.add('show'); });
        row.addEventListener('mouseleave', function () { float.classList.remove('show'); });
        row.addEventListener('mousemove', function (e) {
          float.style.transform = 'translate(' + (e.clientX - 160) + 'px,' + (e.clientY - 110) + 'px)';
        });
      });
    });

    /* ---------- محاسبه‌گر BMI (دموی مربی ورزشی) ---------- */
    $$('[data-bmi]').forEach(function (form) {
      var out = $('.bmi-result', form);
      var toEn = function (v) { return String(v).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }); };
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var h = parseFloat(toEn($('[name="height"]', form).value)) / 100;
        var w = parseFloat(toEn($('[name="weight"]', form).value));
        if (!h || !w || h < 0.5 || w < 20) { toast('قد و وزن را به‌درستی وارد کنید.', 'error'); return; }
        var bmi = w / (h * h), label, cls;
        if (bmi < 18.5) { label = 'کمبود وزن'; cls = 'low'; }
        else if (bmi < 25) { label = 'وزن نرمال؛ عالی است!'; cls = 'ok'; }
        else if (bmi < 30) { label = 'اضافه وزن'; cls = 'mid'; }
        else { label = 'چاقی'; cls = 'high'; }
        out.className = 'bmi-result show ' + cls;
        out.innerHTML = '<strong>' + bmi.toLocaleString(isRTL ? 'fa-IR' : 'en-US', { maximumFractionDigits: 1 }) + '</strong><span>' + label + '</span>';
        var pos = Math.max(0, Math.min(100, (bmi - 15) / 20 * 100));
        var mk = $('.bmi-marker', form); if (mk) mk.style.insetInlineStart = pos + '%';
      });
    });

    /* ---------- شمارش معکوس (صفحه به‌زودی) ---------- */
    $$('[data-countdown]').forEach(function (el) {
      var days = parseFloat(el.getAttribute('data-countdown')) || 30;
      var key = 'countdown-target', target = parseInt(store.get(key), 10);
      if (!target || target < Date.now()) { target = Date.now() + days * 864e5; store.set(key, target); }
      function tick() {
        var d = Math.max(0, target - Date.now());
        var parts = { days: Math.floor(d / 864e5), hours: Math.floor(d / 36e5) % 24, minutes: Math.floor(d / 6e4) % 60, seconds: Math.floor(d / 1e3) % 60 };
        Object.keys(parts).forEach(function (k) { var n = $('[data-' + k + ']', el); if (n) n.textContent = faNum(parts[k]); });
      }
      tick(); setInterval(tick, 1000);
    });

    /* ---------- پیام کوتاه (Toast) ---------- */
    var toastEl = null, toastTimer = null;
    function toast(msg, type) {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'toast';
        toastEl.setAttribute('role', 'status');
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
      }
      toastEl.className = 'toast' + (type === 'error' ? ' error' : '');
      toastEl.innerHTML = '<svg class="icon"><use href="#i-' + (type === 'error' ? 'alert' : 'check-circle') + '"></use></svg><span></span>';
      $('span', toastEl).textContent = msg;
      requestAnimationFrame(function () { toastEl.classList.add('show'); });
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 4000);
    }
    window.kgToast = toast;

    /* ---------- اعتبارسنجی و ارسال فرم تماس ---------- */
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    $$('form[data-validate]').forEach(function (form) {
      function validateField(f) {
        var g = f.closest('.form-group');
        var v = f.value.trim();
        var ok = true;
        if (f.hasAttribute('required') && !v) ok = false;
        if (ok && f.type === 'email' && v && !emailRe.test(v)) ok = false;
        if (ok && f.getAttribute('minlength') && v.length < +f.getAttribute('minlength')) ok = false;
        if (g) g.classList.toggle('has-error', !ok);
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        return ok;
      }
      var fields = $$('.form-control', form);
      fields.forEach(function (f) {
        f.addEventListener('blur', function () { validateField(f); });
        f.addEventListener('input', function () {
          var g = f.closest('.form-group');
          if (g && g.classList.contains('has-error')) validateField(f);
        });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var valid = fields.map(validateField).every(Boolean);
        if (!valid) {
          var firstBad = $('.has-error .form-control', form);
          if (firstBad) firstBad.focus();
          toast('لطفاً فیلدهای مشخص‌شده را بررسی کنید.', 'error');
          return;
        }
        var btn = $('[type="submit"]', form);
        if (btn) btn.classList.add('loading');
        var done = function (ok) {
          if (btn) btn.classList.remove('loading');
          if (ok) { form.reset(); toast(form.getAttribute('data-success') || 'پیام شما با موفقیت ارسال شد. به‌زودی پاسخ می‌دهم!'); }
          else toast('ارسال پیام با خطا مواجه شد. دوباره تلاش کنید.', 'error');
        };
        // اگر action فرم تنظیم شده باشد (مثلاً Formspree یا فایل PHP)، اطلاعات واقعاً ارسال می‌شود.
        var action = form.getAttribute('action');
        if (action && action !== '#') {
          fetch(action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
            .then(function (r) { done(r.ok); })
            .catch(function () { done(false); });
        } else {
          // حالت دمو: شبیه‌سازی ارسال
          setTimeout(function () { done(true); }, 1400);
        }
      });
    });

    /* ---------- خبرنامه ---------- */
    $$('.newsletter-form').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var inp = $('input', f);
        if (!emailRe.test(inp.value.trim())) { toast('لطفاً یک ایمیل معتبر وارد کنید.', 'error'); inp.focus(); return; }
        f.reset();
        toast('عضویت شما در خبرنامه با موفقیت انجام شد.');
      });
    });

    /* ---------- ذرات متحرک پس‌زمینه (دموی ۳) ---------- */
    var canvas = document.getElementById('particles');
    if (canvas && canvas.getContext && !reduceMotion) {
      var ctx = canvas.getContext('2d');
      var pts = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
      var mouse = { x: -9999, y: -9999 };
      var color = '124,92,255';
      function readColor() {
        var c = getComputedStyle(root).getPropertyValue('--primary-rgb').trim().split(/\s+/).join(',');
        if (c) color = c;
      }
      function size() {
        var r = canvas.getBoundingClientRect();
        W = r.width; H = r.height;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var count = Math.min(110, Math.floor(W * H / 14000));
        pts = [];
        for (var i = 0; i < count; i++) {
          pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: Math.random() * 2 + 1 });
        }
      }
      function frame() {
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + color + ',.7)'; ctx.fill();
          for (var j = i + 1; j < pts.length; j++) {
            var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
            if (d < 15000) {
              ctx.strokeStyle = 'rgba(' + color + ',' + (0.18 * (1 - d / 15000)) + ')';
              ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
          var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
          if (md < 30000) {
            ctx.strokeStyle = 'rgba(' + color + ',' + (0.4 * (1 - md / 30000)) + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
        requestAnimationFrame(frame);
      }
      readColor(); size(); frame();
      window.addEventListener('resize', size);
      canvas.parentElement.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });
      canvas.parentElement.addEventListener('mouseleave', function () { mouse.x = mouse.y = -9999; });
      new MutationObserver(readColor).observe(root, { attributes: true, attributeFilter: ['data-color'] });
    }

    /* ---------- دکمه چاپ رزومه ---------- */
    $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
  });
})();
