/* ==========================================================
   AKCLNT Timepieces — CHRONO S
   Pinned scroll journey, reveals, nav, menu, CTA.
   Respects prefers-reduced-motion.
   ========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function smooth(t) { return t * t * (3 - 2 * t); } /* smoothstep 0..1 */

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav background on scroll ---------- */
  var nav = document.getElementById("nav");
  function updateNav() {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
  }
  hamburger.addEventListener("click", function () {
    var isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
  mobileMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- CTA demo submit ---------- */
  var ctaSubmit = document.getElementById("ctaSubmit");
  var ctaEmail = document.getElementById("ctaEmail");
  var ctaNote = document.getElementById("ctaNote");
  ctaSubmit.addEventListener("click", function () {
    var val = ctaEmail.value.trim();
    if (val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      ctaNote.textContent = "Thank you — the atelier will be in touch shortly.";
      ctaNote.style.color = "var(--gold)";
      ctaEmail.value = "";
    } else {
      ctaNote.textContent = "Please enter a valid email address.";
      ctaNote.style.color = "#e07856";
      ctaEmail.focus();
    }
  });
  ctaEmail.addEventListener("keydown", function (e) {
    if (e.key === "Enter") ctaSubmit.click();
  });

  /* ==========================================================
     Scroll-driven scenes
     ========================================================== */
  var hero = document.getElementById("hero");
  var heroBg = document.getElementById("heroBg");
  var heroContent = document.getElementById("heroContent");

  /* --- Journey elements --- */
  var journey = document.getElementById("journey");
  var jWatch = document.getElementById("jWatch");
  var jGhost = document.getElementById("jGhost");
  var jImgs = Array.prototype.slice.call(document.querySelectorAll(".j-watch img"));
  var jWords = Array.prototype.slice.call(document.querySelectorAll(".j-word"));
  var jCaps = Array.prototype.slice.call(document.querySelectorAll(".j-cap"));
  var jDots = Array.prototype.slice.call(document.querySelectorAll(".j-dot"));
  var jCur = document.getElementById("jCur");
  var jHint = document.getElementById("jHint");
  var SCENES = jImgs.length; /* 5 */

  function journeyDrive() {
    var rect = journey.getBoundingClientRect();
    var total = journey.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var p = clamp(-rect.top / total, 0, 1); /* 0 → 1 across the runway */
    var sf = p * (SCENES - 1);             /* float scene index */

    for (var i = 0; i < SCENES; i++) {
      var d = Math.abs(sf - i);
      var vis = smooth(clamp(1 - d * 1.5, 0, 1)); /* crossfade */

      jImgs[i].style.opacity = vis.toFixed(3);
      jImgs[i].style.transform = "scale(" + (0.92 + vis * 0.08).toFixed(3) + ")";

      jWords[i].style.opacity = (vis * 0.9).toFixed(3);

      jCaps[i].style.opacity = vis.toFixed(3);
      jCaps[i].style.transform = "translateY(" + ((1 - vis) * 28).toFixed(1) + "px)";

      jDots[i].classList.toggle("on", d < 0.5);
    }

    var cur = Math.round(sf);
    if (jCur) jCur.textContent = ("0" + (cur + 1)).slice(-2);

    /* The descent: the watch drifts downward while ghost words rise past it */
    jWatch.style.transform = "translateY(" + (p * 90).toFixed(1) + "px)";
    jGhost.style.transform = "translateY(" + ((0.5 - p) * 26).toFixed(2) + "vh)";

    if (jHint) jHint.style.opacity = p < 0.03 ? "1" : "0";
  }

  function heroDrive(sy, vh) {
    /* Hero background: slow parallax drift + gentle zoom as it scrolls away */
    if (heroBg && sy < vh * 1.2) {
      heroBg.style.transform =
        "translateY(" + (sy * 0.32).toFixed(1) + "px)" +
        " scale(" + (1 + sy / (vh * 7)).toFixed(4) + ")";
    }
    /* Hero content: fades and rises away, handing off to the journey */
    if (heroContent && sy < vh) {
      var hp = clamp(1 - sy / (vh * 0.62), 0, 1);
      heroContent.style.opacity = hp.toFixed(3);
      heroContent.style.transform = "translateY(" + (sy * 0.24).toFixed(1) + "px)";
    }
  }

  function journeyNearViewport() {
    var r = journey.getBoundingClientRect();
    return r.bottom > -window.innerHeight && r.top < window.innerHeight * 2;
  }

  function onScroll() {
    updateNav();
    if (reduceMotion) return;

    var vh = window.innerHeight;
    var sy = window.scrollY;

    heroDrive(sy, vh);
    if (journeyNearViewport()) journeyDrive();
  }

  var ticking = false;
  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
    }
  }

  if (reduceMotion) {
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  } else {
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    onScroll();
  }
})();
