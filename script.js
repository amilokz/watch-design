/* ==========================================================
   AKCLNT Timepieces — CHRONO S
   Scroll scenes, reveals, counters, nav, menu.
   Respects prefers-reduced-motion.
   ========================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".counter");
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var duration = 1600;
    var start = null;
    function tick(now) {
      if (!start) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterIO.observe(el); });
  } else {
    counters.forEach(runCounter);
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

  /* ---------- Scroll-driven scenes (rAF) ---------- */
  var hero = document.getElementById("hero");
  var heroBg = document.getElementById("heroBg");
  var slimImg = document.getElementById("slimImg");
  var craftBg = document.getElementById("craftBg");
  var exploded = document.getElementById("exploded");
  var explodedImg = document.getElementById("explodedImg");
  var partLabels = Array.prototype.slice.call(document.querySelectorAll(".part-label"));

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function explodedProgress() {
    var rect = exploded.getBoundingClientRect();
    var total = exploded.offsetHeight - window.innerHeight;
    var passed = -rect.top;
    return clamp(passed / total, 0, 1);
  }

  function onScroll() {
    updateNav();
    if (reduceMotion) return;

    var vh = window.innerHeight;
    var sy = window.scrollY;

    /* Hero parallax: background drifts down slower than content scrolls */
    if (heroBg && sy < vh * 1.2) {
      heroBg.style.transform = "translateY(" + (sy * 0.35).toFixed(1) + "px)";
    }

    /* Slim image drift: subtle vertical drift while in viewport */
    if (slimImg) {
      var r = slimImg.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 .. 0.5
        slimImg.style.transform = "scale(1.06) translateY(" + (-p * 60).toFixed(1) + "px)";
      }
    }

    /* Craft background parallax */
    if (craftBg) {
      var cr = craftBg.parentElement.getBoundingClientRect();
      if (cr.bottom > 0 && cr.top < vh) {
        var cp = (cr.top + cr.height / 2 - vh / 2) / vh;
        craftBg.style.transform = "translateY(" + (-cp * 90).toFixed(1) + "px)";
      }
    }

    /* Exploded scene: zoom + sequential part labels */
    if (explodedImg) {
      var ep = explodedProgress();
      var visible = ep > 0 && ep < 1;
      if (visible || ep === 0 || ep === 1) {
        explodedImg.style.transform = "scale(" + (1 + ep * 0.14).toFixed(3) + ")";
        partLabels.forEach(function (label, i) {
          var onAt = 0.06 + i * 0.17;
          if (ep >= onAt) label.classList.add("on");
          else label.classList.remove("on");
        });
      }
    }
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
    /* Static but complete: all exploded labels visible */
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
    partLabels.forEach(function (label) { label.classList.add("on"); });
  } else {
    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    onScroll();
  }
})();
