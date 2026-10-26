/* ==========================================================================
   LABORATÓRIO DE CORES — interface
   Monta a lista de paletas, os seletores manuais e o painel de
   legibilidade. Conversa apenas com PS.theme (motor de temas).
   ========================================================================== */

(function () {
  "use strict";

  var PS = window.PS;
  var theme = PS.theme;
  var palettes = PS.palettes;
  var root = document.documentElement;

  var lab = document.querySelector("[data-lab]");
  var list = document.querySelector("[data-palette-list]");
  var status = document.querySelector("[data-lab-status]");
  var customBadge = document.querySelector("[data-custom-badge]");
  var contrastList = document.querySelector("[data-contrast-list]");
  var fabSwatches = document.querySelector("[data-fab-swatches]");
  var openers = Array.prototype.slice.call(document.querySelectorAll("[data-lab-open]"));
  var closeBtn = document.querySelector("[data-lab-close]");
  var LAB_KEY = PS.config.storageKey + ":lab-open";

  if (!lab || !list) return;

  /* ---------------- Lista de paletas ---------------- */
  var options = palettes.map(function (p) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "palette-option";
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.setAttribute("tabindex", "-1");
    btn.dataset.palette = p.id;

    var sw = document.createElement("span");
    sw.className = "palette-option__swatches";
    sw.setAttribute("aria-hidden", "true");
    [p.colors.primary, p.colors.accent, p.colors.secondary, p.colors.deep].forEach(function (c) {
      var i = document.createElement("i");
      i.style.background = c;
      sw.appendChild(i);
    });

    var name = document.createElement("span");
    name.className = "palette-option__name";
    name.textContent = p.name;
    var mood = document.createElement("span");
    mood.className = "palette-option__mood";
    mood.textContent = p.mood;
    name.appendChild(mood);

    var check = document.createElement("span");
    check.className = "palette-option__check";
    check.setAttribute("aria-hidden", "true");
    check.innerHTML = '<svg class="icon"><use href="#i-check"/></svg>';

    btn.appendChild(sw);
    btn.appendChild(name);
    btn.appendChild(check);

    btn.addEventListener("click", function () { selectPalette(p.id, true); });
    list.appendChild(btn);
    return btn;
  });

  function selectPalette(id, announce) {
    var current = theme.getState();
    if (current && current.palette.id === id && !current.customized) {
      if (announce) PS.ui.toast("“" + current.palette.name + "” já está aplicada.");
      return;
    }
    var result = theme.setPalette(id);
    if (announce) PS.ui.toast("Paleta “" + result.palette.name + "” aplicada ao site.");
  }

  // Navegação por setas dentro do grupo de opções (padrão de radiogroup)
  list.addEventListener("keydown", function (event) {
    var keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (keys.indexOf(event.key) === -1) return;
    event.preventDefault();
    var index = options.indexOf(document.activeElement);
    if (index < 0) index = 0;
    var next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % options.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = options.length - 1;
    options[next].focus();
    selectPalette(options[next].dataset.palette, false);
  });

  /* ---------------- Seletores manuais ---------------- */
  var pickers = Array.prototype.slice.call(document.querySelectorAll("[data-picker]"));
  var labels = { primary: "Cor principal", accent: "Cor de destaque", secondary: "Cor de apoio" };

  pickers.forEach(function (input) {
    var key = input.getAttribute("data-picker");
    // "input": atualiza ao vivo enquanto o seletor está aberto
    input.addEventListener("input", function () {
      theme.setOverride(key, input.value, { animate: false });
    });
    input.addEventListener("change", function () {
      theme.setOverride(key, input.value, { animate: false });
      PS.ui.toast(labels[key] + " ajustada para " + input.value.toUpperCase() + ".");
    });
  });

  /* ---------------- Ações ---------------- */
  lab.querySelectorAll("[data-action]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var action = btn.getAttribute("data-action");
      var r;
      if (action === "restore") {
        var st = theme.getState();
        if (!st.customized) {
          PS.ui.toast("A paleta “" + st.palette.name + "” já está sem ajustes.");
          return;
        }
        r = theme.restore();
        PS.ui.toast("Ajustes removidos. Paleta “" + r.palette.name + "” restaurada.");
      }
      if (action === "original") {
        r = theme.resetOriginal();
        PS.ui.toast("Configuração original restaurada: “" + r.palette.name + "”.");
      }
      if (action === "copy") copyCss();
    });
  });

  function copyCss() {
    var css = theme.exportCss();
    function done() { PS.ui.toast("Variáveis CSS copiadas. Cole em css/tokens.css."); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = css;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      if (ok) done();
      else PS.ui.toast("Não foi possível copiar automaticamente neste navegador.");
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(css).then(done, fallback);
    } else {
      fallback();
    }
  }

  /* ---------------- Atualização da interface ---------------- */
  function render(state) {
    if (!state) return;

    options.forEach(function (btn) {
      var selected = btn.dataset.palette === state.palette.id;
      btn.setAttribute("aria-checked", selected ? "true" : "false");
      btn.setAttribute("tabindex", selected ? "0" : "-1");
    });

    if (status) status.textContent = state.palette.name + (state.customized ? " · ajustada" : "");
    if (customBadge) customBadge.hidden = !state.customized;

    pickers.forEach(function (input) {
      var key = input.getAttribute("data-picker");
      var value = state.colors[key];
      if (document.activeElement !== input) input.value = value;
      var hex = document.querySelector('[data-picker-hex="' + key + '"]');
      if (hex) hex.textContent = value.toUpperCase();
    });

    if (contrastList) {
      contrastList.innerHTML = "";
      state.checks.forEach(function (chk) {
        var li = document.createElement("li");
        li.className = "contrast-item";
        li.innerHTML =
          '<span class="contrast-item__sample" aria-hidden="true">Aa</span>' +
          '<span class="contrast-item__name"></span>' +
          '<span class="contrast-item__ratio"></span>' +
          '<span class="contrast-item__grade grade--' + chk.grade.key + '"></span>';
        var sample = li.querySelector(".contrast-item__sample");
        sample.style.background = chk.bg;
        sample.style.color = chk.fg;
        li.querySelector(".contrast-item__name").textContent = chk.name;
        li.querySelector(".contrast-item__ratio").textContent = chk.ratio.toFixed(1).replace(".", ",") + ":1";
        li.querySelector(".contrast-item__grade").textContent = chk.grade.label;
        contrastList.appendChild(li);
      });
    }

    if (fabSwatches) {
      fabSwatches.innerHTML = "";
      ["primary", "accent", "secondary"].forEach(function (k) {
        var i = document.createElement("i");
        i.style.background = state.colors[k];
        fabSwatches.appendChild(i);
      });
    }
  }

  document.addEventListener("ps:themechange", function (e) { render(e.detail); });
  render(theme.getState());

  /* ---------------- Abrir e fechar o painel ---------------- */
  var lastOpener = null;
  var closeTimer = null;

  function rememberOpen(value) {
    try { localStorage.setItem(LAB_KEY, value ? "1" : "0"); } catch (e) { /* sem armazenamento */ }
  }

  function setOpenersExpanded(value) {
    openers.forEach(function (o) { o.setAttribute("aria-expanded", value ? "true" : "false"); });
  }

  function openLab(opener, moveFocus) {
    clearTimeout(closeTimer);
    lastOpener = opener || null;
    lab.hidden = false;
    lab.classList.add("is-entering");
    void lab.offsetWidth;
    lab.classList.remove("is-entering");
    root.classList.add("lab-open");
    setOpenersExpanded(true);
    rememberOpen(true);
    if (moveFocus) {
      var selected = list.querySelector('[aria-checked="true"]') || options[0];
      selected.focus({ preventScroll: true });
    }
  }

  function closeLab() {
    if (lab.hidden) return;
    lab.classList.add("is-entering");
    root.classList.remove("lab-open");
    setOpenersExpanded(false);
    rememberOpen(false);
    closeTimer = setTimeout(function () { lab.hidden = true; }, 330);
    var target = lastOpener && lastOpener.offsetParent !== null ? lastOpener : document.querySelector(".lab-fab");
    if (target && lab.contains(document.activeElement)) target.focus({ preventScroll: true });
  }

  openers.forEach(function (o) {
    o.addEventListener("click", function () {
      if (lab.hidden || root.classList.contains("lab-open") === false) openLab(o, true);
      else closeLab();
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLab);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !lab.hidden && lab.contains(document.activeElement)) closeLab();
  });

  // Em telas largas, o painel começa aberto (a menos que tenha sido fechado antes).
  // Em telas menores ele fica sempre recolhido ao carregar, para não cobrir o site.
  var stored = null;
  try { stored = localStorage.getItem(LAB_KEY); } catch (e) { stored = null; }
  var wide = window.matchMedia("(min-width: 1200px)").matches;
  if (wide && stored !== "0") openLab(null, false);
})();
