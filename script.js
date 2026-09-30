/* AURUM FS-60P — scroll-driven interactions. No dependencies. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reveal on scroll ---------- */
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

  /* ---------- hero mouse parallax (desktop, fine pointers only) ---------- */
  var hero = document.getElementById("hero");
  if (hero && !reduced && window.matchMedia("(pointer: fine)").matches) {
    var raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      hero.style.setProperty("--mx", cx.toFixed(3));
      hero.style.setProperty("--my", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else { raf = null; }
    }
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    hero.addEventListener("mouseleave", function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    });
  }

  /* ---------- scroll progress -> --p on [data-fx] sections ---------- */
  var fxEls = document.querySelectorAll("[data-fx]");
  if (fxEls.length && !reduced) {
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      fxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = (vh - r.top) / (r.height + vh);
        p = Math.min(1, Math.max(0, p));
        el.style.setProperty("--p", p.toFixed(4));
      });
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  } else if (fxEls.length && reduced) {
    /* static resting state: parts slightly apart, watch unrotated */
    fxEls.forEach(function (el) { el.style.setProperty("--p", "0.55"); });
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

      var apply = function () {
        stage.src = btn.getAttribute("data-img");
        stage.alt = "AURUM FS-60P in " + btn.getAttribute("data-finish");
        modelName.textContent = btn.getAttribute("data-model");
        finishName.textContent = btn.getAttribute("data-finish");
        stage.classList.remove("swap");
      };

      if (reduced) { apply(); return; }
      stage.classList.add("swap");
      window.setTimeout(apply, 220);
    });
  });
})();
