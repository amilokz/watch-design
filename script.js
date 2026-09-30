/* AURUM FS-60P — scroll-driven interactions. No dependencies. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- reveal on scroll (static sections below the journey) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- pinned watch journey (500vh, watch stays centered) ---------- */
  var journey = document.getElementById("journey");
  if (journey && !reduced) {
    var pin = document.getElementById("journey-pin");
    var phaseEls = journey.querySelectorAll(".phase");
    var jWatch = document.getElementById("j-watch");
    var jParts = document.getElementById("j-parts");
    var jBg = document.getElementById("j-bg");
    var heroTitle = document.getElementById("hero-title");
    var heroRing = document.getElementById("hero-ring");
    var hint = document.getElementById("scroll-hint");
    var dots = Array.prototype.slice.call(journey.querySelectorAll(".j-dot"));

    var jp = 0;              // journey progress 0..1
    var mtx = 0, mty = 0;    // parallax targets (-1..1)
    var mcx = 0, mcy = 0;    // parallax current (lerped)
    var lastActive = -1;

    function seg(p, a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); }
    function f3(n) { return n.toFixed(3); }

    function apply() {
      var p = jp;
      var vh = window.innerHeight;
      var mobile = window.innerWidth <= 640;
      var par = p < 0.3 ? 1 : 0;   // mouse parallax only in hero phase
      var px = mcx * par, py = mcy * par;

      /* the watch DESCENDS through the journey: 0 → ~42vh down (32vh on mobile) */
      var descentMax = vh * (mobile ? 0.32 : 0.42);
      var dy = seg(p, 0.03, 1) * descentMax;
      var wScale = 1 - 0.18 * p;

      /* phase crossfades (headlines live in the upper-center) */
      phaseEls[0].style.opacity = f3(1 - seg(p, 0.16, 0.25));
      phaseEls[1].style.opacity = f3(seg(p, 0.25, 0.33) * (1 - seg(p, 0.42, 0.50)));
      phaseEls[2].style.opacity = f3(seg(p, 0.50, 0.58) * (1 - seg(p, 0.67, 0.75)));
      phaseEls[3].style.opacity = f3(seg(p, 0.75, 0.84));

      /* hero title: scales up + fades as the watch leaves */
      var tScale = 1 + seg(p, 0, 0.25) * 0.22;
      heroTitle.style.transform =
        "translate(" + (px * -14).toFixed(1) + "px," + (py * -14).toFixed(1) + "px) scale(" + tScale.toFixed(3) + ")";
      heroTitle.style.opacity = f3(1 - seg(p, 0.14, 0.24));

      /* double ring fades with the hero */
      heroRing.style.opacity = f3(1 - seg(p, 0.10, 0.20));
      heroRing.style.transform =
        "translate(calc(-50% + " + (px * -10).toFixed(1) + "px), calc(-50% + " + (py * -10).toFixed(1) + "px))";

      /* watch: travels down, rotates 360° in timeless, fades out at the bottom */
      var rot = seg(p, 0.25, 0.50) * 360;
      jWatch.style.opacity = f3(1 - seg(p, 0.70, 0.80));
      jWatch.style.transform =
        "translate(calc(-50% + " + (px * 22).toFixed(1) + "px), calc(-50% + " + dy.toFixed(1) + "px))" +
        " rotate(" + rot.toFixed(1) + "deg) scale(" + wScale.toFixed(3) + ")";

      /* exploded parts: fade in flanking the watch, separate as it descends, fade out */
      jParts.style.opacity = f3(seg(p, 0.50, 0.58) * (1 - seg(p, 0.72, 0.80)));
      jParts.style.transform = "translate(-50%, calc(-50% + " + dy.toFixed(1) + "px))";
      journey.style.setProperty("--sep", (4 + seg(p, 0.50, 0.75) * 10).toFixed(2));

      /* dark backdrop for mechanical heart + scroll hint */
      jBg.style.opacity = f3(seg(p, 0.68, 0.80));
      hint.style.opacity = f3(1 - seg(p, 0.02, 0.08));

      /* progress dots */
      var active = Math.min(3, Math.floor(p * 4));
      if (active !== lastActive) {
        lastActive = active;
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === active); });
      }
    }

    function measure() {
      var r = journey.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = r.height - vh;
      jp = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { ticking = false; measure(); apply(); });
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    /* hero mouse parallax (fine pointers only) */
    var parRaf = null;
    function parTick() {
      mcx += (mtx - mcx) * 0.08;
      mcy += (mty - mcy) * 0.08;
      apply();
      if (Math.abs(mtx - mcx) > 0.0005 || Math.abs(mty - mcy) > 0.0005) {
        parRaf = requestAnimationFrame(parTick);
      } else {
        parRaf = null;
      }
    }
    function wakeParallax() { if (finePointer && !parRaf) parRaf = requestAnimationFrame(parTick); }
    if (pin && finePointer) {
      pin.addEventListener("mousemove", function (e) {
        var r = pin.getBoundingClientRect();
        mtx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        mty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        wakeParallax();
      });
      pin.addEventListener("mouseleave", function () { mtx = 0; mty = 0; wakeParallax(); });
    }

    /* dots: smooth-jump to a phase */
    dots.forEach(function (d) {
      d.addEventListener("click", function () {
        var i = parseInt(d.getAttribute("data-go"), 10) || 0;
        var top = journey.getBoundingClientRect().top + window.scrollY;
        var y = top + ((i + 0.5) / 4) * (journey.offsetHeight - window.innerHeight);
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });

    measure();
    apply();
  }

  /* ---------- collection swatches ---------- */
  var stage = document.getElementById("collection-watch");
  var modelName = document.getElementById("model-name");
  var finishName = document.getElementById("finish-name");
  var swatches = document.querySelectorAll(".swatch");

  swatches.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      swatches.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      var applySwatch = function () {
        stage.src = btn.getAttribute("data-img");
        stage.alt = "AURUM FS-60P in " + btn.getAttribute("data-finish");
        modelName.textContent = btn.getAttribute("data-model");
        finishName.textContent = btn.getAttribute("data-finish");
        stage.classList.remove("swap");
      };

      if (reduced) { applySwatch(); return; }
      stage.classList.add("swap");
      window.setTimeout(applySwatch, 220);
    });
  });
})();
