/* ==========================================================================
   INTERAÇÕES DO SITE DEMONSTRATIVO
   Menu móvel, FAQ, imagens com fallback, links de WhatsApp,
   cabeçalho, link ativo, botão de voltar ao topo e avisos.
   Cada parte é independente e pode ser reaproveitada nos modelos.
   ========================================================================== */

(function () {
  "use strict";

  var PS = window.PS;
  var config = PS.config;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Aviso flutuante ---------------- */
  var toastEl = document.querySelector("[data-toast]");
  var toastText = document.querySelector("[data-toast-text]");
  var toastTimer = null;

  PS.ui = PS.ui || {};
  PS.ui.toast = function (message, duration) {
    if (!toastEl || !toastText) return;
    toastText.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, duration || 2600);
  };

  /* ---------------- Imagens com fallback ---------------- */
  function showFallback(figure, img, alt) {
    figure.classList.remove("is-loaded");
    figure.classList.add("is-fallback");
    figure.setAttribute("role", "img");
    figure.setAttribute("aria-label", alt + " (imagem indisponível)");
    img.setAttribute("aria-hidden", "true");
  }

  function loadImage(figure) {
    var key = figure.getAttribute("data-image");
    var img = figure.querySelector("img");
    var data = config.images && config.images[key];
    if (!img) return;

    if (!data || !data.src) {
      showFallback(figure, img, (data && data.alt) || "Imagem ilustrativa");
      return;
    }

    img.alt = data.alt || "";
    var timer = setTimeout(function () {
      if (!img.complete || img.naturalWidth === 0) showFallback(figure, img, img.alt);
    }, config.imageTimeout || 9000);

    img.addEventListener("load", function () {
      clearTimeout(timer);
      if (img.naturalWidth === 0) return showFallback(figure, img, img.alt);
      figure.classList.remove("is-fallback");
      figure.removeAttribute("role");
      figure.removeAttribute("aria-label");
      img.removeAttribute("aria-hidden");
      figure.classList.add("is-loaded");
    });

    img.addEventListener("error", function () {
      clearTimeout(timer);
      showFallback(figure, img, img.alt);
    });

    img.src = data.src;
  }

  var figures = Array.prototype.slice.call(document.querySelectorAll("[data-image]"));
  if ("IntersectionObserver" in window) {
    var imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          imgObserver.unobserve(entry.target);
          loadImage(entry.target);
        }
      });
    }, { rootMargin: "400px 0px" });
    figures.forEach(function (f) { imgObserver.observe(f); });
  } else {
    figures.forEach(loadImage);
  }

  /* ---------------- WhatsApp ---------------- */
  function whatsappUrl(service) {
    var w = config.whatsapp;
    var text = service ? w.serviceMessage.replace("{servico}", service) : w.defaultMessage;
    return "https://wa.me/" + String(w.number).replace(/\D/g, "") + "?text=" + encodeURIComponent(text);
  }

  document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
    var service = link.getAttribute("data-service") || "";
    if (!config.whatsapp.demoMode) {
      link.href = whatsappUrl(service);
      link.target = "_blank";
      link.rel = "noopener";
    }
    link.addEventListener("click", function (event) {
      closeMenu();
      if (!config.whatsapp.demoMode) return;
      event.preventDefault();
      PS.ui.toast(
        "Demonstração: no site publicado, este botão abre o WhatsApp" +
        (service ? " já com o assunto “" + service + "”." : " com uma mensagem pronta."),
        3600
      );
    });
  });

  /* ---------------- Menu móvel ---------------- */
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-menu-toggle]");
  var toggleLabel = document.querySelector("[data-menu-label]");
  var header = document.querySelector("[data-header]");

  function openMenu() {
    if (!nav || !toggle) return;
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    if (toggleLabel) toggleLabel.textContent = "Fechar menu";
  }

  function closeMenu() {
    if (!nav || !toggle || !nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    if (toggleLabel) toggleLabel.textContent = "Abrir menu";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
  }

  if (nav) {
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (nav && nav.classList.contains("is-open") && header && !header.contains(event.target)) closeMenu();
  });

  // Fecha o menu se o site ficar largo o suficiente para a navegação completa
  var site = document.getElementById("site");
  if (site && "ResizeObserver" in window) {
    new ResizeObserver(function (entries) {
      if (entries[0].contentRect.width >= 1000) closeMenu();
    }).observe(site);
  }

  /* ---------------- FAQ (acordeão) ---------------- */
  document.querySelectorAll("[data-accordion]").forEach(function (acc) {
    var triggers = Array.prototype.slice.call(acc.querySelectorAll(".accordion__trigger"));

    function setOpen(trigger, open) {
      var item = trigger.closest(".accordion__item");
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        panel.hidden = false;
        void panel.offsetHeight; // garante a animação após remover "hidden"
        item.classList.add("is-open");
      } else {
        item.classList.remove("is-open");
        setTimeout(function () {
          if (!item.classList.contains("is-open")) panel.hidden = true;
        }, reduceMotion ? 0 : 300);
      }
    }

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener("click", function () {
        var willOpen = trigger.getAttribute("aria-expanded") !== "true";
        triggers.forEach(function (t) {
          if (t !== trigger && t.getAttribute("aria-expanded") === "true") setOpen(t, false);
        });
        setOpen(trigger, willOpen);
      });

      // Setas para navegar entre as perguntas
      trigger.addEventListener("keydown", function (event) {
        var target = null;
        if (event.key === "ArrowDown") target = triggers[(index + 1) % triggers.length];
        if (event.key === "ArrowUp") target = triggers[(index - 1 + triggers.length) % triggers.length];
        if (event.key === "Home") target = triggers[0];
        if (event.key === "End") target = triggers[triggers.length - 1];
        if (target) {
          event.preventDefault();
          target.focus();
        }
      });
    });
  });

  /* ---------------- Cabeçalho e voltar ao topo ---------------- */
  var backToTop = document.querySelector("[data-back-to-top]");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 60);
    if (backToTop) backToTop.classList.toggle("is-visible", y > 700);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      var brand = document.querySelector(".site-header .brand");
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  /* ---------------- Link ativo na navegação ---------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav__list a"));
  if ("IntersectionObserver" in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) {
          var active = a.getAttribute("href") === id;
          a.classList.toggle("is-active", active);
          if (active) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    navLinks.forEach(function (a) {
      var section = document.querySelector(a.getAttribute("href"));
      if (section) sectionObserver.observe(section);
    });
  }

  /* ---------------- Ano no rodapé ---------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
