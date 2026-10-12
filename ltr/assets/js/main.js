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

  /* ---------- پیام‌های اسکریپت (نسخه RTL فارسی / نسخه LTR انگلیسی) ---------- */
  var T = isRTL ? {
    close: 'بستن', prev: 'قبلی', next: 'بعدی', slide: 'اسلاید ',
    bmiInvalid: 'قد و وزن را به‌درستی وارد کنید.', bmiLow: 'کمبود وزن', bmiOk: 'وزن نرمال؛ عالی است!',
    bmiMid: 'اضافه وزن', bmiHigh: 'چاقی',
    formInvalid: 'لطفاً فیلدهای مشخص‌شده را بررسی کنید.',
    formSent: 'پیام شما با موفقیت ارسال شد. به‌زودی پاسخ می‌دهم!',
    formError: 'ارسال پیام با خطا مواجه شد. دوباره تلاش کنید.',
    emailInvalid: 'لطفاً یک ایمیل معتبر وارد کنید.',
    subscribed: 'عضویت شما در خبرنامه با موفقیت انجام شد.',
    demoSubscribed: 'خبرنامه نمایشی است و ایمیلی ثبت نشد. برای فعال‌سازی، action فرم خبرنامه را تنظیم کنید.',
    demoSent: 'این فرم نمایشی است و پیامی ارسال نشد. برای ارسال واقعی، آدرس action فرم را تنظیم کنید.',
    pause: 'توقف نمایش خودکار', play: 'ادامه نمایش خودکار',
    openMenu: 'باز کردن منو', closeMenu: 'بستن منو', current: ' (صفحه فعلی)'
  } : {
    close: 'Close', prev: 'Previous', next: 'Next', slide: 'Slide ',
    bmiInvalid: 'Please enter a valid height and weight.', bmiLow: 'Underweight', bmiOk: 'Normal weight. Great!',
    bmiMid: 'Overweight', bmiHigh: 'Obese',
    formInvalid: 'Please check the highlighted fields.',
    formSent: 'Your message has been sent. I will reply soon!',
    formError: 'The message could not be sent. Please try again.',
    emailInvalid: 'Please enter a valid email address.',
    subscribed: 'You have subscribed to the newsletter.',
    demoSubscribed: 'This is a demo newsletter, so no email was saved. Set the newsletter form action to enable it.',
    demoSent: 'This is a demo form, so no message was sent. Set the form action to send real messages.',
    pause: 'Pause autoplay', play: 'Resume autoplay',
    openMenu: 'Open menu', closeMenu: 'Close menu', current: ' (current page)'
  };

  root.classList.remove('no-js');

  /* ---------- ذخیره‌سازی امن تنظیمات کاربر ---------- */
  // حالت تیره/روشن برای کل سایت یکسان ذخیره می‌شود؛ رنگ هر صفحه جداگانه تا رنگ‌بندی پیش‌فرض هر دمو حفظ شود.
  var PAGE = location.pathname.split('/').pop() || 'index.html';
  var IS_DEMO = /^home-.+\.html$/.test(PAGE);
  var IS_INNER = root.getAttribute('data-context') === 'inner';
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  var store = {
    get: function (k) { return lsGet('kg-' + k + '-' + PAGE); },
    set: function (k, v) { lsSet('kg-' + k + '-' + PAGE, v); }
  };
  // اعمال تم و رنگ ذخیره‌شده (اسکریپت داخل head همین کار را پیش از رندر انجام می‌دهد؛ این بخش پشتیبان است)
  var savedTheme = lsGet('kg-theme');
  var savedColor = store.get('color');
  // برگه رزومه قابل چاپ همیشه روشن است (کاغذ)؛ تم سراسری روی آن اعمال نمی‌شود
  if (savedTheme && PAGE !== 'resume-print.html') root.setAttribute('data-theme', savedTheme);
  if (savedColor) root.setAttribute('data-color', savedColor);

  /* ---------- زمینه دمو (Demo context) ----------
     صفحات داخلی (درباره من، وبلاگ و…) بین همه دموها مشترک‌اند. وقتی کاربر از یک دمو وارد آن‌ها می‌شود،
     رنگ، تم، لوگو و لینک «خانه» همان دمو حفظ می‌شود تا هویت سایت ناگهان عوض نشود. */
  // جدا برای نسخه فارسی و انگلیسی تا نام و لوگوی یک زبان در زبان دیگر نمایش داده نشود
  var DEMO_KEY = 'kg-demo-' + (isRTL ? 'rtl' : 'ltr');
  var demoCtx = null;
  try { demoCtx = JSON.parse(ssGet(DEMO_KEY) || 'null'); } catch (e) { demoCtx = null; }
  function saveDemoContext() {
    if (!IS_DEMO) return;
    var nameEl = $('.header .logo > span:last-child') || $('.vc-sidebar h1');
    var name = nameEl ? nameEl.textContent.replace(/\.\s*$/, '').trim() : '';
    var markEl = $('.logo-mark');
    var mark = markEl ? markEl.textContent.trim() : name.replace(/^(دکتر|Dr\.)\s*/, '').charAt(0);
    ssSet(DEMO_KEY, JSON.stringify({
      page: PAGE, color: root.getAttribute('data-color') || 'violet', theme: root.getAttribute('data-theme') || 'dark',
      mark: mark, name: name
    }));
  }
  if (PAGE === 'index.html') { try { sessionStorage.removeItem(DEMO_KEY); } catch (e) { /* ignore */ } }

  /* ---------- رنگ نوار مرورگر موبایل (theme-color) ---------- */
  function syncThemeColor() {
    var meta = $('meta[name="theme-color"]');
    if (!meta) return;
    var bg = getComputedStyle(document.body || root).backgroundColor;
    if (bg) meta.setAttribute('content', bg);
  }

  /* ---------- پیش‌بارگذاری (فقط اولین بازدید هر دمو در هر نشست) ----------
     پیشرفت واقعی را نشان می‌دهد: آماده شدن DOM، فونت‌ها و تصاویر بالای صفحه (غیر lazy). */
  var pl = $('.preloader');
  if (pl && !root.classList.contains('pl-seen')) {
    var bar = $('.preloader-bar', pl), plDone = false, plStart = Date.now();
    var tasks = { dom: false, fonts: false }, imgTotal = 0, imgDone = 0;
    var setP = function () {
      var t = 2 + imgTotal, d = (tasks.dom ? 1 : 0) + (tasks.fonts ? 1 : 0) + imgDone;
      if (bar) { bar.classList.add('live'); bar.firstElementChild.style.setProperty('--p', Math.max(.3, d / t).toFixed(3)); }
      if (d >= t) finishPreloader();
    };
    var finishPreloader = function () {
      if (plDone) return;
      plDone = true;
      if (bar) bar.firstElementChild.style.setProperty('--p', 1);
      ssSet('kg-pl-' + PAGE, '1');
      // حداقل ۳۵۰ میلی‌ثانیه نمایش تا چشمک نزند؛ در کش گرم بلافاصله بسته می‌شود
      var wait = Math.max(0, 350 - (Date.now() - plStart));
      setTimeout(function () {
        pl.classList.add('hide');
        setTimeout(function () { if (pl.parentNode) pl.parentNode.removeChild(pl); }, 600);
      }, wait);
    };
    var onDom = function () {
      tasks.dom = true;
      var imgs = $$('img').filter(function (im) { return im.getAttribute('loading') !== 'lazy' && !im.closest('.preloader'); });
      imgTotal = imgs.length;
      imgs.forEach(function (im) {
        if (im.complete) { imgDone++; return; }
        var once = function () { imgDone++; setP(); im.removeEventListener('load', once); im.removeEventListener('error', once); };
        im.addEventListener('load', once); im.addEventListener('error', once);
      });
      setP();
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { tasks.fonts = true; setP(); });
    else tasks.fonts = true;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onDom); else onDom();
    window.addEventListener('load', finishPreloader);
    setTimeout(finishPreloader, 3000); // حداکثر زمان انتظار
  } else if (pl) {
    pl.parentNode.removeChild(pl);
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- اعمال/ذخیره زمینه دمو ---------- */
    if (IS_DEMO) saveDemoContext();
    if ((IS_INNER || PAGE === 'resume-print.html') && demoCtx && demoCtx.page) {
      // لینک‌های «خانه»، لوگو و بازگشت به دمویی که کاربر از آن آمده اشاره می‌کنند
      $$('a[href="home-developer.html"]').forEach(function (a) {
        if (a.closest('.customizer, .cz-demos')) return;
        a.setAttribute('href', demoCtx.page);
      });
      if (demoCtx.mark) $$('.logo .logo-mark').forEach(function (m) { m.textContent = demoCtx.mark; });
      if (demoCtx.name) $$('.logo > span:last-child').forEach(function (s) {
        var dot = $('.logo-dot', s);
        s.textContent = demoCtx.name;
        if (dot) s.appendChild(dot);
      });
    }
    syncThemeColor();

    /* ---------- کلیک روی لوگوی همین صفحه: اسکرول نرم به بالا به جای بارگذاری مجدد ---------- */
    $$('a.logo[href="' + PAGE + '"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

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

    /* ---------- نگه داشتن فوکوس داخل یک پنل باز (منو، لایت‌باکس) ---------- */
    function focusables(box) {
      return $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', box)
        .filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    }
    function trapTab(e, box) {
      if (e.key !== 'Tab') return;
      var f = focusables(box);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }

    /* ---------- منوی موبایل ---------- */
    var nav = $('.nav');
    var overlay = $('.nav-overlay');
    var menuOpener = null;
    if (nav && !nav.id) nav.id = 'site-nav';
    $$('.menu-toggle').forEach(function (b) { if (nav) b.setAttribute('aria-controls', nav.id); });
    function isMenuOpen() { return nav && nav.classList.contains('open'); }
    function toggleMenu(open) {
      if (!nav) return;
      var wasOpen = isMenuOpen();
      nav.classList.toggle('open', open);
      if (overlay) overlay.classList.toggle('show', open);
      document.body.classList.toggle('no-scroll', open);
      $$('.menu-toggle').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
      if (open && !wasOpen) {
        menuOpener = document.activeElement;
        var closeBtn = $('.nav-close', nav);
        // پس از شروع انیمیشن کشو فوکوس به داخل منو منتقل می‌شود
        setTimeout(function () { (closeBtn || focusables(nav)[0] || nav).focus(); }, 60);
      } else if (!open && wasOpen) {
        // اگر فوکوس داخل منوی بسته‌شده مانده باشد به دکمه باز کردن منو برمی‌گردد
        if (nav.contains(document.activeElement) || !menuOpener || menuOpener === document.body) {
          var back = (menuOpener && menuOpener.classList && menuOpener.classList.contains('menu-toggle')) ? menuOpener : $('.menu-toggle');
          if (back) back.focus();
        } else if (menuOpener.focus) menuOpener.focus();
        menuOpener = null;
      }
    }
    $$('.menu-toggle').forEach(function (b) { b.addEventListener('click', function () { toggleMenu(true); }); });
    $$('.nav-close').forEach(function (b) { b.addEventListener('click', function () { toggleMenu(false); }); });
    if (overlay) overlay.addEventListener('click', function () { toggleMenu(false); });
    document.addEventListener('keydown', function (e) { if (isMenuOpen()) trapTab(e, nav); });
    // اگر عرض صفحه به حالت دسکتاپ برگردد منوی کشویی بسته می‌شود
    window.addEventListener('resize', function () { if (window.innerWidth >= 992 && isMenuOpen()) toggleMenu(false); });
    $$('.nav-link').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var li = a.parentElement;
        // در موبایل، کلیک روی آیتم دارای زیرمنو فقط آن را باز/بسته می‌کند
        if (li && li.classList.contains('has-sub') && window.innerWidth < 992) {
          e.preventDefault();
          a.setAttribute('aria-expanded', li.classList.toggle('open') ? 'true' : 'false');
          return;
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
      // همه بخش‌های صفحه دیده می‌شوند؛ اگر بخشی در منو نباشد (مثلاً مهارت‌ها) هیچ لینکی فعال نمی‌ماند
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var link = map[en.target.id];
          spyLinks.forEach(function (l) { l.classList.toggle('active', l === link); });
          spyLinks.forEach(function (l) { if (l === link) l.setAttribute('aria-current', 'location'); else l.removeAttribute('aria-current'); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      $$('main section[id], main > section').forEach(function (sec) { spy.observe(sec); });
    }

    /* ---------- تم تیره / روشن ---------- */
    function setTheme(t) {
      root.setAttribute('data-theme', t);
      lsSet('kg-theme', t); // برای کل سایت
      $$('.cz-mode').forEach(function (b) {
        var on = b.getAttribute('data-mode') === t;
        b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      $$('.theme-toggle').forEach(function (b) { b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false'); });
      saveDemoContext();
      // رنگ پس‌زمینه پس از پایان transition بدنه خوانده می‌شود
      setTimeout(syncThemeColor, 450);
    }
    $$('.theme-toggle').forEach(function (b) { b.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false'); });
    $$('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
    });

    /* ---------- پنل تنظیمات رنگ (Customizer) ---------- */
    var cz = $('.customizer');
    if (cz) {
      var czToggle = $('.customizer-toggle', cz), czPanel = $('.customizer-panel', cz);
      if (czPanel && !czPanel.id) czPanel.id = 'cz-panel';
      czToggle.setAttribute('aria-expanded', 'false');
      if (czPanel) czToggle.setAttribute('aria-controls', czPanel.id);
      var setCz = function (open, focusBack) {
        cz.classList.toggle('open', open);
        czToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open && czPanel) setTimeout(function () { var f = focusables(czPanel)[0]; if (f) f.focus(); }, 80);
        if (!open && focusBack) czToggle.focus();
      };
      czToggle.addEventListener('click', function () { setCz(!cz.classList.contains('open')); });
      document.addEventListener('click', function (e) { if (cz.classList.contains('open') && !cz.contains(e.target)) setCz(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cz.classList.contains('open')) setCz(false, true); });
      var current = root.getAttribute('data-color') || 'violet';
      $$('.cz-color', cz).forEach(function (b) {
        var on = b.getAttribute('data-color-set') === current;
        b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.addEventListener('click', function () {
          var c = b.getAttribute('data-color-set');
          root.setAttribute('data-color', c);
          store.set('color', c);
          $$('.cz-color', cz).forEach(function (x) { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          saveDemoContext();
        });
      });
      $$('.cz-mode', cz).forEach(function (b) {
        var on = b.getAttribute('data-mode') === root.getAttribute('data-theme');
        b.classList.toggle('active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.addEventListener('click', function () { setTheme(b.getAttribute('data-mode')); });
      });
      $$('.cz-demos a.current', cz).forEach(function (a) { a.setAttribute('aria-current', 'page'); });
    }

    /* ---------- متن تایپی ---------- */
    $$('[data-typed]').forEach(function (el) {
      var words;
      try { words = JSON.parse(el.getAttribute('data-typed')); } catch (e) { return; }
      if (!words || !words.length) return;
      if (reduceMotion) { el.textContent = words[0]; return; }
      // ارتفاع بلندترین عبارت از قبل رزرو می‌شود تا محتوای زیر آن هنگام تایپ بالا و پایین نپرد
      var box = el.parentElement;
      var reserve = function () {
        var keep = el.textContent, max = 0;
        box.style.minHeight = '';
        words.forEach(function (w) { el.textContent = w; max = Math.max(max, box.offsetHeight); });
        el.textContent = keep;
        box.style.minHeight = max + 'px';
      };
      reserve();
      var rz;
      window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(reserve, 150); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserve);
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
      var fit = function () { wrap.style.width = items[i].offsetWidth + 'px'; };
      fit();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
      window.addEventListener('resize', fit);
      if (reduceMotion) return;
      setInterval(function () {
        var prev = items[i];
        i = (i + 1) % items.length;
        prev.classList.remove('active'); prev.classList.add('out');
        items[i].classList.remove('out'); items[i].classList.add('active');
        fit();
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

    /* ---------- حذف لینک‌های تکراری از ترتیب Tab ----------
       در کارت‌های نمونه‌کار و وبلاگ چند لینک به یک مقصد می‌رود؛ فقط لینک عنوان (و دکمه بزرگنمایی) در Tab می‌ماند. */
    $$('.portfolio-card, .blog-card').forEach(function (card) {
      var main = $('h3 a', card);
      if (!main) return;
      var href = main.getAttribute('href');
      $$('a[href]', card).forEach(function (a) {
        if (a === main || a.hasAttribute('data-lightbox') || a.getAttribute('href') !== href) return;
        a.setAttribute('tabindex', '-1');
        a.setAttribute('aria-hidden', 'true');
      });
    });

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
        '<button class="lb-btn lb-close" aria-label="' + T.close + '"><svg class="icon"><use href="#i-close"></use></svg></button>' +
        '<button class="lb-btn lb-prev" aria-label="' + T.prev + '"><svg class="icon"><use href="#i-chevron-' + (isRTL ? 'right' : 'left') + '"></use></svg></button>' +
        '<figure><img alt=""><figcaption></figcaption></figure>' +
        '<button class="lb-btn lb-next" aria-label="' + T.next + '"><svg class="icon"><use href="#i-chevron-' + (isRTL ? 'left' : 'right') + '"></use></svg></button>';
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
      var lbSwiped = false;
      lb.addEventListener('click', function (e) { if (lbSwiped) { lbSwiped = false; return; } if (e.target === lb) closeLb(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) return;
        trapTab(e, lb);
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') show(isRTL ? idx + 1 : idx - 1);
        if (e.key === 'ArrowRight') show(isRTL ? idx - 1 : idx + 1);
      });
      // کشیدن انگشت روی تصویر در موبایل برای رفتن به تصویر قبلی/بعدی
      var lbX = null;
      lb.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') lbX = e.clientX; });
      lb.addEventListener('pointerup', function (e) {
        if (lbX === null || gallery.length < 2) { lbX = null; return; }
        var dx = e.clientX - lbX; lbX = null;
        if (Math.abs(dx) > 50) { lbSwiped = true; show(idx + ((dx > 0) === isRTL ? 1 : -1)); }
      });
    }

    /* ---------- دکمه توقف/ادامه نمایش خودکار (WCAG 2.2.2) ---------- */
    function makeAutoplayToggle(cls) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls + ' autoplay-toggle';
      b.setAttribute('aria-label', T.pause);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<svg class="icon i-pause"><use href="#i-pause"></use></svg><svg class="icon i-play"><use href="#i-play"></use></svg>';
      return b;
    }
    function setToggleState(b, paused) {
      b.classList.toggle('paused', paused);
      b.setAttribute('aria-pressed', paused ? 'true' : 'false');
      b.setAttribute('aria-label', paused ? T.play : T.pause);
    }

    /* ---------- اسلایدر (نظرات مشتریان) ---------- */
    $$('[data-slider]').forEach(function (slider) {
      var track = $('.slider-track', slider);
      var slides = $$('.slide', track);
      var dotsWrap = $('.slider-dots', slider);
      var prevBtn = $('.slider-prev', slider), nextBtn = $('.slider-next', slider);
      var autoplay = parseInt(slider.getAttribute('data-autoplay') || '5000', 10);
      var index = 0, timer = null, pages = 1;
      var userPaused = false, hoverPaused = false;
      var toggle = null;
      if (autoplay && !reduceMotion && slides.length > 1) {
        toggle = makeAutoplayToggle('icon-btn');
        var navWrap = $('.slider-nav', slider);
        if (navWrap) navWrap.appendChild(toggle);
        toggle.addEventListener('click', function () {
          userPaused = !userPaused; setToggleState(toggle, userPaused); restart();
        });
      }

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
            d.type = 'button';
            d.setAttribute('aria-label', T.slide + faNum(i + 1));
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
        if (dotsWrap) $$('button', dotsWrap).forEach(function (d, i) {
          d.classList.toggle('active', i === index);
          if (i === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
        });
      }
      function restart() {
        if (timer) clearInterval(timer);
        timer = null;
        if (autoplay && !reduceMotion && !userPaused && !hoverPaused && !document.hidden) timer = setInterval(function () { go(index + 1); }, autoplay);
      }
      if (prevBtn) prevBtn.addEventListener('click', function () { go(index - 1); restart(); });
      if (nextBtn) nextBtn.addEventListener('click', function () { go(index + 1); restart(); });
      // توقف هنگام هاور، فوکوس کیبورد یا پنهان بودن تب
      slider.addEventListener('mouseenter', function () { hoverPaused = true; restart(); });
      slider.addEventListener('mouseleave', function () { hoverPaused = slider.contains(document.activeElement); restart(); });
      slider.addEventListener('focusin', function () { hoverPaused = true; restart(); });
      slider.addEventListener('focusout', function (e) { if (!slider.contains(e.relatedTarget)) { hoverPaused = false; restart(); } });
      document.addEventListener('visibilitychange', restart);

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
      var paused = false;
      function running() { return !reduceMotion && !paused && !document.hidden; }
      function play() {
        clearInterval(timer); timer = null;
        if (running()) timer = setInterval(function () { show(i + 1); }, delay);
        else if (bar) { bar.style.transition = 'none'; bar.style.width = '0'; }
      }
      function show(n) {
        slides[i].classList.remove('active');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('active');
        if (cur) cur.textContent = faNum(i + 1);
        if (bar && running()) { bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth; bar.style.transition = 'width ' + delay + 'ms linear'; bar.style.width = '100%'; }
      }
      var nx = $('.ss-next', ss), pv = $('.ss-prev', ss);
      if (nx) nx.addEventListener('click', function () { show(i + 1); play(); });
      if (pv) pv.addEventListener('click', function () { show(i - 1); play(); });
      // دکمه توقف/ادامه کنار دکمه‌های قبلی/بعدی
      var ssNav = $('.ss-nav', ss);
      if (ssNav && !reduceMotion && slides.length > 1) {
        var tg = makeAutoplayToggle('ss-toggle');
        ssNav.insertBefore(tg, nx || null);
        tg.addEventListener('click', function () { paused = !paused; setToggleState(tg, paused); if (!paused) show(i); play(); });
      }
      document.addEventListener('visibilitychange', function () { if (!document.hidden) show(i); play(); });
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
        if (!h || !w || h < 0.5 || w < 20) { toast(T.bmiInvalid, 'error'); return; }
        var bmi = w / (h * h), label, cls;
        if (bmi < 18.5) { label = T.bmiLow; cls = 'low'; }
        else if (bmi < 25) { label = T.bmiOk; cls = 'ok'; }
        else if (bmi < 30) { label = T.bmiMid; cls = 'mid'; }
        else { label = T.bmiHigh; cls = 'high'; }
        out.className = 'bmi-result show ' + cls;
        out.innerHTML = '<strong>' + bmi.toLocaleString(isRTL ? 'fa-IR' : 'en-US', { maximumFractionDigits: 1 }) + '</strong><span>' + label + '</span>';
        var pos = Math.max(0, Math.min(100, (bmi - 15) / 20 * 100));
        var mk = $('.bmi-marker', form); if (mk) mk.style.insetInlineStart = pos + '%';
      });
    });

    /* ---------- شمارش معکوس (صفحه به‌زودی) ---------- */
    $$('[data-countdown]').forEach(function (el) {
      // data-countdown-date="2026-12-01T09:00:00" تاریخ واقعی راه‌اندازی است (پیشنهادی برای سایت واقعی).
      // در غیر این صورت data-countdown تعداد روز از اولین بازدید است و پس از رسیدن به صفر دوباره شروع نمی‌شود.
      var fixed = Date.parse(el.getAttribute('data-countdown-date') || '');
      var target;
      if (!isNaN(fixed)) target = fixed;
      else {
        var days = parseFloat(el.getAttribute('data-countdown')) || 30;
        target = parseInt(store.get('countdown-target'), 10);
        if (!target) { target = Date.now() + days * 864e5; store.set('countdown-target', target); }
      }
      var cdTimer;
      function tick() {
        var d = Math.max(0, target - Date.now());
        if (!d) { clearInterval(cdTimer); el.classList.add('is-done'); }
        var parts = { days: Math.floor(d / 864e5), hours: Math.floor(d / 36e5) % 24, minutes: Math.floor(d / 6e4) % 60, seconds: Math.floor(d / 1e3) % 60 };
        Object.keys(parts).forEach(function (k) { var n = $('[data-' + k + ']', el); if (n) n.textContent = faNum(parts[k]); });
      }
      cdTimer = setInterval(tick, 1000); tick();
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
      // پیام‌های بلندتر زمان بیشتری برای خواندن دارند
      toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, Math.min(9000, Math.max(4000, msg.length * 70)));
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
      fields.forEach(function (f, n) {
        // اتصال پیام خطا به فیلد برای صفحه‌خوان
        var err = f.closest('.form-group') && $('.error-msg', f.closest('.form-group'));
        if (err) {
          if (!err.id) err.id = (f.id || (form.id || 'form') + '-f' + n) + '-error';
          err.setAttribute('aria-live', 'polite');
          f.setAttribute('aria-describedby', ((f.getAttribute('aria-describedby') || '') + ' ' + err.id).trim());
        }
        if (f.hasAttribute('required')) f.setAttribute('aria-required', 'true');
        // خطا فقط بعد از اینکه کاربر چیزی در فیلد وارد کرده نمایش داده می‌شود (نه با رد شدن با Tab)
        f.addEventListener('input', function () { f.dataset.dirty = '1'; });
        f.addEventListener('change', function () { f.dataset.dirty = '1'; });
        f.addEventListener('blur', function () { if (f.dataset.dirty) validateField(f); });
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
          toast(T.formInvalid, 'error');
          return;
        }
        var btn = $('[type="submit"]', form);
        if (btn) btn.classList.add('loading');
        var done = function (ok) {
          if (btn) btn.classList.remove('loading');
          if (ok === 'demo') { form.reset(); fields.forEach(function (f) { delete f.dataset.dirty; }); toast(T.demoSent); }
          else if (ok) { form.reset(); fields.forEach(function (f) { delete f.dataset.dirty; }); toast(form.getAttribute('data-success') || T.formSent); }
          else toast(T.formError, 'error');
        };
        // اگر action فرم تنظیم شده باشد (مثلاً Formspree یا فایل PHP)، اطلاعات واقعاً ارسال می‌شود.
        var action = form.getAttribute('action');
        if (action && action !== '#') {
          fetch(action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
            .then(function (r) { done(r.ok); })
            .catch(function () { done(false); });
        } else {
          // حالت دمو: هیچ پیامی ارسال نمی‌شود؛ پیام موفقیت جعلی نشان داده نمی‌شود تا action فرم فراموش نشود
          if (window.console) console.warn('[Karnegareh] form has no action; message was NOT sent.', form);
          setTimeout(function () { done('demo'); }, 900);
        }
      });
    });

    /* ---------- خبرنامه ---------- */
    $$('.newsletter-form').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var inp = $('input', f);
        var okMail = emailRe.test(inp.value.trim());
        inp.setAttribute('aria-invalid', okMail ? 'false' : 'true');
        if (!okMail) { toast(T.emailInvalid, 'error'); inp.focus(); return; }
        var action = f.getAttribute('action');
        if (action && action !== '#') {
          fetch(action, { method: 'POST', body: new FormData(f), headers: { 'Accept': 'application/json' } })
            .then(function (r) { if (r.ok) { f.reset(); toast(T.subscribed); } else toast(T.formError, 'error'); })
            .catch(function () { toast(T.formError, 'error'); });
        } else {
          if (window.console) console.warn('[Karnegareh] newsletter form has no action; email was NOT saved.', f);
          f.reset();
          toast(T.demoSubscribed);
        }
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
