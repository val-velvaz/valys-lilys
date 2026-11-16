/* ✿ núcleo: idioma, almacenamiento, índice de contenido, markdown y búsqueda ✿ */
(function () {
  const VL = (window.VL = window.VL || {});
  const C = (VL.config = window.VL_CONFIG);

  /* ---------- almacenamiento seguro ---------- */
  VL.store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("vl:" + key); return v == null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("vl:" + key, JSON.stringify(value)); } catch (e) { /* modo privado */ }
    }
  };

  /* ---------- idioma ---------- */
  VL.lang = VL.store.get("lang", C.defaultLang);
  if (!window.VL_I18N[VL.lang]) VL.lang = C.defaultLang;
  VL.t = (key) => {
    const d = window.VL_I18N[VL.lang] || {};
    return d[key] != null ? d[key] : (window.VL_I18N.es[key] != null ? window.VL_I18N.es[key] : key);
  };
  VL.setLang = (lang) => {
    VL.store.set("lang", lang);
    location.reload();
  };
  document.documentElement.lang = VL.lang;

  /* ---------- utilidades ---------- */
  VL.$ = (sel, root = document) => root.querySelector(sel);
  VL.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  VL.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  VL.norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  VL.slug = (s) => VL.norm(s).replace(/[^a-z0-9+#]+/g, "-").replace(/^-|-$/g, "");
  VL.param = (name) => new URLSearchParams(location.search).get(name);
  VL.el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  VL.parseDate = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  };
  VL.fmtDate = (s) => {
    const d = VL.parseDate(s);
    if (!d) return "";
    return d.toLocaleDateString({ es: "es-ES", en: "en-GB", de: "de-DE" }[VL.lang] || "es-ES", { day: "numeric", month: "long", year: "numeric" });
  };
  VL.sectionLabel = (id) => {
    const t = VL.t(id);
    return t === id ? id : t;
  };
  VL.sectionPage = (id) => (C.sections[id] && C.sections[id].page) || "buscar.html";
  VL.entryUrl = (e) => "entrada.html?id=" + encodeURIComponent(e.id);

  /* ---------- front matter (subconjunto de YAML) ---------- */
  VL.parseFrontMatter = function (src) {
    const m = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/.exec(src);
    if (!m) return { data: {}, body: src };
    const data = {};
    let lastKey = null;
    m[1].split(/\r?\n/).forEach((line) => {
      if (!line.trim() || line.trim().startsWith("#")) return;
      const item = /^\s+-\s+(.*)$/.exec(line);
      if (item && lastKey) {
        if (!Array.isArray(data[lastKey])) data[lastKey] = [];
        data[lastKey].push(clean(item[1]));
        return;
      }
      const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
      if (!kv) return;
      lastKey = kv[1];
      let v = kv[2].trim();
      if (v.startsWith("[") && v.endsWith("]")) v = v.slice(1, -1).split(",").map(clean).filter(Boolean);
      else if (v === "") v = [];
      else if (v === "true" || v === "false") v = v === "true";
      else v = clean(v);
      data[lastKey] = v;
    });
    return { data, body: src.slice(m[0].length) };
    function clean(s) { return s.trim().replace(/^["']|["']$/g, ""); }
  };

  /* ---------- índice ---------- */
  let indexPromise = null;
  VL.loadIndex = function () {
    if (!indexPromise) {
      indexPromise = fetch("content/index.json", { cache: "no-cache" })
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then((j) => (j.entries || []).filter((e) => !e.draft).sort((a, b) => String(b.date).localeCompare(String(a.date))))
        .catch((err) => { console.warn("index", err); VL.indexFailed = true; return []; });
    }
    return indexPromise;
  };

  VL.fetchEntry = async function (entry) {
    const r = await fetch(entry.file, { cache: "no-cache" });
    if (!r.ok) throw new Error("No se pudo cargar " + entry.file);
    return VL.parseFrontMatter(await r.text());
  };

  /* ---------- markdown ---------- */
  const HL_COLORS = { pink: "pink", rosa: "pink", yellow: "yellow", amarillo: "yellow", blue: "blue", azul: "blue", green: "green", verde: "green", lilac: "lilac", lila: "lilac" };
  VL.HL_COLORS = ["pink", "yellow", "blue", "green", "lilac"];

  if (window.marked) {
    marked.use({
      gfm: true,
      extensions: [{
        // ==texto== o =={rosa}texto== → subrayado de marcador
        name: "hlmark",
        level: "inline",
        start(src) { const i = src.indexOf("=="); return i < 0 ? undefined : i; },
        tokenizer(src) {
          const m = /^==(?:\{([a-z]+)\})?([^=\n]+?)==/.exec(src);
          if (m) return { type: "hlmark", raw: m[0], color: HL_COLORS[m[1]] || "yellow", tokens: this.lexer.inlineTokens(m[2]) };
        },
        renderer(tok) { return `<mark class="hl-md hl-${tok.color}">${this.parser.parseInline(tok.tokens)}</mark>`; }
      }]
    });
  }

  VL.renderMarkdown = function (md) {
    const html = window.marked ? marked.parse(md) : "<pre>" + VL.esc(md) + "</pre>";
    return window.DOMPurify ? DOMPurify.sanitize(html, { ADD_ATTR: ["target"] }) : html;
  };

  VL.widgets = VL.widgets || {};

  VL.enhance = function (root) {
    // títulos con id + ancla
    const used = {};
    VL.$$("h1,h2,h3,h4,h5,h6", root).forEach((h) => {
      let id = VL.slug(h.textContent) || "s";
      if (used[id]) id += "-" + ++used[id]; else used[id] = 1;
      h.id = id;
      const a = VL.el(`<a class="h-anchor no-hl" href="#${id}" aria-label="enlace a esta sección">✿</a>`);
      h.appendChild(a);
    });

    // callouts: > [!NOTE] / [!TIP] / [!FEYNMAN] / [!WARNING] / [!IMPORTANT]
    VL.$$("blockquote", root).forEach((bq) => {
      const p = bq.firstElementChild;
      if (!p) return;
      const m = /^\s*\[!(NOTE|TIP|FEYNMAN|WARNING|IMPORTANT|IDEA)\]\s*/i.exec(p.innerHTML);
      if (!m) return;
      const kind = m[1].toLowerCase();
      p.innerHTML = p.innerHTML.slice(m[0].length);
      bq.classList.add("callout", "callout-" + kind);
      const icons = { note: "✎", tip: "✿", feynman: "⚛", warning: "⚠", important: "★", idea: "💡" };
      bq.insertBefore(VL.el(`<div class="callout-title no-hl"><span>${icons[kind]}</span> ${kind}</div>`), p);
    });

    // bloques de código: widgets interactivos o código con barra de ventana
    VL.$$("pre > code", root).forEach((code) => {
      const pre = code.parentElement;
      const lang = ((code.className.match(/language-([\w-]+)/) || [])[1] || "").toLowerCase();
      if (lang && VL.widgets[lang]) {
        const box = document.createElement("div");
        box.className = "widget widget-" + lang + " no-hl";
        pre.replaceWith(box);
        try { VL.widgets[lang](box, code.textContent); }
        catch (e) { box.textContent = "⚠ widget " + lang + ": " + e.message; }
        return;
      }
      const wrap = VL.el(`<div class="code-window"><div class="code-bar no-hl"><span class="dots"><i></i><i></i><i></i></span><span class="code-lang">${VL.esc(lang || "code")}</span><button class="code-copy" type="button">copy ✿</button></div></div>`);
      pre.replaceWith(wrap);
      wrap.appendChild(pre);
      VL.$(".code-copy", wrap).addEventListener("click", (ev) => {
        const btn = ev.currentTarget;
        (navigator.clipboard ? navigator.clipboard.writeText(code.textContent) : Promise.reject())
          .then(() => (btn.textContent = "copied ♡"), () => (btn.textContent = "✗"))
          .finally(() => setTimeout(() => (btn.textContent = "copy ✿"), 1400));
      });
    });

    // enlaces externos
    VL.$$("a[href^='http']", root).forEach((a) => { if (a.host !== location.host) { a.target = "_blank"; a.rel = "noopener"; } });

    // imágenes tipo polaroid
    VL.$$("img", root).forEach((img) => {
      img.loading = "lazy";
      const p = img.parentElement;
      if (p && p.tagName === "P" && p.textContent.trim() === "" && p.children.length === 1) {
        const fig = VL.el(`<figure class="polaroid"><span class="tape no-hl"></span></figure>`);
        p.replaceWith(fig);
        fig.appendChild(img);
        if (img.alt) fig.appendChild(VL.el(`<figcaption>${VL.esc(img.alt)}</figcaption>`));
      }
    });

    // tablas con scroll propio
    VL.$$("table", root).forEach((t) => {
      const w = document.createElement("div");
      w.className = "table-wrap";
      t.replaceWith(w);
      w.appendChild(t);
    });

    // listas de tareas: guardar estado
    const key = "tasks:" + (root.dataset.entry || location.pathname);
    const saved = VL.store.get(key, {});
    VL.$$("input[type=checkbox]", root).forEach((cb, i) => {
      cb.disabled = false;
      cb.closest("li") && cb.closest("li").classList.add("task");
      if (saved[i] != null) cb.checked = saved[i];
      cb.addEventListener("change", () => { saved[i] = cb.checked; VL.store.set(key, saved); });
    });
  };

  /* ---------- búsqueda ---------- */
  VL.search = async function (query, section) {
    const all = await VL.loadIndex();
    const terms = VL.norm(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const out = [];
    all.forEach((e) => {
      if (section && e.section !== section) return;
      const title = VL.norm(e.title), tags = VL.norm((e.tags || []).join(" ")), sum = VL.norm(e.summary), body = VL.norm(e.text), sec = VL.norm(VL.sectionLabel(e.section) + " " + e.section);
      let score = 0;
      for (const t of terms) {
        let s = 0;
        if (title.includes(t)) s += title.startsWith(t) ? 12 : 8;
        if (tags.includes(t)) s += 6;
        if (sec.includes(t)) s += 3;
        if (sum.includes(t)) s += 3;
        const hits = body.split(t).length - 1;
        s += Math.min(hits, 5);
        if (!s) return; // todos los términos deben aparecer
        score += s;
      }
      out.push({ entry: e, score, snippet: snippet(e.text || e.summary || "", terms) });
    });
    return out.sort((a, b) => b.score - a.score);
  };

  function snippet(text, terms) {
    const n = VL.norm(text);
    let i = -1;
    for (const t of terms) { i = n.indexOf(t); if (i >= 0) break; }
    const start = Math.max(0, i - 50);
    let s = (start ? "…" : "") + text.slice(start, start + 150) + (text.length > start + 150 ? "…" : "");
    return s;
  }

  VL.markTerms = function (text, query) {
    let html = VL.esc(text);
    const terms = VL.norm(query).split(/\s+/).filter((t) => t.length > 1);
    if (!terms.length) return html;
    // marcar respetando acentos: buscamos en la versión normalizada y envolvemos en el original
    const plain = text, norm = VL.norm(text);
    const ranges = [];
    terms.forEach((t) => { let i = 0; while ((i = norm.indexOf(t, i)) >= 0) { ranges.push([i, i + t.length]); i += t.length; } });
    if (!ranges.length) return html;
    ranges.sort((a, b) => a[0] - b[0]);
    let res = "", pos = 0;
    ranges.forEach(([a, b]) => { if (a < pos) return; res += VL.esc(plain.slice(pos, a)) + '<mark class="hl hl-yellow">' + VL.esc(plain.slice(a, b)) + "</mark>"; pos = b; });
    return res + VL.esc(plain.slice(pos));
  };

  /* ejecuta fn cuando el marco (layout.js) ya está montado */
  VL.ready = (fn) => {
    if (document.body && document.body.classList.contains("is-ready")) fn();
    else document.addEventListener("DOMContentLoaded", () => setTimeout(fn, 0));
  };

  VL.readingTime = (text) => Math.max(1, Math.round(String(text || "").split(/\s+/).length / 200));
})();
