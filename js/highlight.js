/* ✿ sistema de subrayado: selecciona texto → elige color → se guarda en tu navegador ✿
   Los subrayados se guardan por entrada como posiciones de texto (inicio/fin). */
(function () {
  const VL = window.VL, esc = VL.esc, t = VL.t;
  const KEY = "highlights";

  VL.hlAll = () => VL.store.get(KEY, {});
  VL.hlSave = (all) => VL.store.set(KEY, all);

  const SKIP = ".no-hl, .h-anchor, script, style";

  function textNodes(root) {
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
    });
    let n;
    while ((n = walker.nextNode())) out.push(n);
    return out;
  }

  function pointToOffset(root, node, off) {
    const nodes = textNodes(root);
    let acc = 0;
    if (node.nodeType === 3) {
      for (const tn of nodes) { if (tn === node) return acc + off; acc += tn.length; }
      return null;
    }
    const r = document.createRange();
    r.setStart(node, off);
    for (const tn of nodes) {
      if (r.comparePoint(tn, 0) >= 0) return acc;
      acc += tn.length;
    }
    return acc;
  }

  function wrap(root, item) {
    let acc = 0;
    const jobs = [];
    for (const tn of textNodes(root)) {
      const s = acc, e = acc + tn.length;
      acc = e;
      if (e <= item.start || s >= item.end) continue;
      jobs.push([tn, Math.max(0, item.start - s), Math.min(tn.length, item.end - s)]);
    }
    jobs.forEach(([tn, a, b]) => {
      if (b <= a) return;
      let mid = tn;
      if (a > 0) mid = tn.splitText(a);
      if (b - a < mid.length) mid.splitText(b - a);
      if (!mid.data.trim() && mid.parentElement.closest("table, ul, ol")) return; // no envolver espacios de estructura
      const m = document.createElement("mark");
      m.className = "hl hl-" + item.color;
      m.dataset.hl = item.id;
      if (item.note) { m.dataset.note = "1"; m.title = item.note; }
      mid.parentNode.insertBefore(m, mid);
      m.appendChild(mid);
    });
  }

  function unwrapAll(root) {
    VL.$$("mark[data-hl]", root).forEach((m) => {
      const p = m.parentNode;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m);
      p.normalize();
    });
  }

  VL.highlighter = function (root, entry, onChange) {
    const all = VL.hlAll();
    const rec = () => (all[entry.id] = all[entry.id] || { title: entry.title, section: entry.section, items: [] });

    function apply() {
      unwrapAll(root);
      const r = all[entry.id];
      if (r) r.items.slice().sort((a, b) => a.start - b.start).forEach((it) => wrap(root, it));
      onChange && onChange(r ? r.items : []);
    }
    function save() {
      const r = all[entry.id];
      if (r && !r.items.length) delete all[entry.id];
      else if (r) { r.title = entry.title; r.section = entry.section; }
      VL.hlSave(all);
      apply();
    }

    /* barra flotante */
    const bar = VL.el(`<div class="hl-toolbar no-hl" role="toolbar" aria-label="subrayar" hidden></div>`);
    document.body.appendChild(bar);
    let pending = null, editing = null;

    function swatches(cur) {
      return VL.HL_COLORS.map((c) => `<button type="button" class="hl-swatch hl-${c} ${c === cur ? "is-on" : ""}" data-color="${c}" aria-label="${c}"></button>`).join("");
    }
    function place(rect) {
      bar.hidden = false;
      const top = rect.top + scrollY - bar.offsetHeight - 12;
      const left = Math.min(Math.max(rect.left + rect.width / 2 + scrollX, 140), document.documentElement.clientWidth - 140 + scrollX);
      bar.style.top = Math.max(scrollY + 6, top) + "px";
      bar.style.left = left + "px";
    }
    function hide() { bar.hidden = true; bar.classList.remove("is-note"); pending = editing = null; }

    function showNew(range) {
      editing = null;
      bar.classList.remove("is-note");
      bar.innerHTML = swatches() + `<button type="button" class="hl-act" data-a="note">✎ ${esc(t("note"))}</button>`;
      place(range.getBoundingClientRect());
    }
    function showEdit(mark) {
      const r = all[entry.id];
      editing = r && r.items.find((i) => i.id === mark.dataset.hl);
      if (!editing) return;
      pending = null;
      bar.classList.remove("is-note");
      bar.innerHTML = swatches(editing.color) + `<button type="button" class="hl-act" data-a="note">✎ ${esc(t("note"))}</button><button type="button" class="hl-act" data-a="del">✕ ${esc(t("remove"))}</button>`;
      place(mark.getBoundingClientRect());
    }
    function showNote(item) {
      bar.classList.add("is-note");
      bar.innerHTML = `<div class="hl-note-box"><b class="hl-act" style="justify-self:start">✎ ${esc(t("note"))}</b><textarea>${esc(item.note || "")}</textarea><div class="w-row" style="margin:0"><button type="button" class="btn btn-small" data-a="save-note">${esc(t("save"))} ♡</button></div></div>`;
      VL.$("textarea", bar).focus();
    }

    function create(color) {
      if (!pending) return null;
      const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), start: pending.start, end: pending.end, color, text: pending.text, note: "", at: new Date().toISOString() };
      rec().items.push(item);
      getSelection().removeAllRanges();
      save();
      return item;
    }

    bar.addEventListener("mousedown", (e) => { if (!e.target.closest("textarea")) e.preventDefault(); });
    bar.addEventListener("click", (e) => {
      const sw = e.target.closest("[data-color]"), act = e.target.closest("[data-a]");
      if (sw) {
        if (editing) { editing.color = sw.dataset.color; save(); hide(); }
        else { const it = create(sw.dataset.color); const r = bar.getBoundingClientRect(); hide(); if (it) VL.burst(r.left + r.width / 2, r.top + 10, ["✎", "✦", "♡"], 6); }
        return;
      }
      if (!act) return;
      if (act.dataset.a === "note") {
        if (!editing) editing = create("yellow");
        if (editing) showNote(editing);
      } else if (act.dataset.a === "del" && editing) {
        const r = all[entry.id];
        r.items = r.items.filter((i) => i !== editing);
        save(); hide();
      } else if (act.dataset.a === "save-note" && editing) {
        editing.note = VL.$("textarea", bar).value.trim();
        save(); hide();
      }
    });

    function onSelect() {
      const sel = getSelection();
      if (!sel.rangeCount || sel.isCollapsed) { if (!bar.classList.contains("is-note") && !editing) hide(); return; }
      const range = sel.getRangeAt(0);
      if (!root.contains(range.commonAncestorContainer)) return;
      const start = pointToOffset(root, range.startContainer, range.startOffset);
      const end = pointToOffset(root, range.endContainer, range.endOffset);
      if (start == null || end == null || end - start < 2) return;
      const text = textNodes(root).map((n) => n.data).join("").slice(start, end).trim();
      if (!text) return;
      pending = { start, end, text };
      showNew(range);
    }
    root.addEventListener("mouseup", () => setTimeout(onSelect, 10));
    root.addEventListener("keyup", (e) => { if (e.shiftKey) onSelect(); });
    let selTimer;
    document.addEventListener("selectionchange", () => {
      if (!matchMedia("(pointer: coarse)").matches) return; // en táctil esperamos a que termine la selección
      clearTimeout(selTimer); selTimer = setTimeout(onSelect, 450);
    });
    root.addEventListener("click", (e) => {
      const m = e.target.closest("mark[data-hl]");
      if (m && getSelection().isCollapsed) { e.preventDefault(); showEdit(m); }
    });
    document.addEventListener("mousedown", (e) => { if (!bar.contains(e.target) && !e.target.closest("mark[data-hl]")) hide(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });

    apply();
    return {
      flash(id) {
        const m = VL.$(`mark[data-hl="${id}"]`, root);
        if (!m) return;
        m.scrollIntoView({ behavior: "smooth", block: "center" });
        VL.$$(`mark[data-hl="${id}"]`, root).forEach((x) => { x.classList.remove("is-flash"); void x.offsetWidth; x.classList.add("is-flash"); });
      }
    };
  };
})();
