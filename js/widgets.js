/* ✿ juegos y widgets que se escriben dentro del Markdown con bloques ```nombre ✿

   ```flashcards        pregunta :: respuesta   (una por línea)
   ```memoria           concepto :: pareja      (juego de parejas)
   ```quiz              ? pregunta / + correcta / - incorrecta / > explicación (bloques separados por línea en blanco)
   ```pasos             líneas en el orden correcto (se barajan)
   ```jerga             (opcional) palabras extra a vigilar, una por línea; "concepto: X" para el tema
   ```hoja-feynman      (opcional) "concepto: X" → hoja de trabajo de 4 pasos exportable a .md
*/
(function () {
  const VL = window.VL, esc = VL.esc;
  const W = (VL.widgets = VL.widgets || {});
  let counter = 0;

  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const lines = (src) => src.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const pairs = (src) => lines(src).map((l) => l.split("::").map((s) => s.trim())).filter((p) => p.length >= 2 && p[0] && p[1]);
  const keyFor = (box, name) => {
    const host = box.closest("[data-entry]");
    return "w:" + (host ? host.dataset.entry : location.pathname) + ":" + name + ":" + (box.dataset.n || (box.dataset.n = ++counter));
  };
  const inline = (s) => (window.marked ? VL.renderMarkdown(marked.parseInline(s)) : esc(s));
  const head = (icon, title, extra = "") => `<div class="w-head"><span class="w-icon">${icon}</span><b>${esc(title)}</b>${extra}</div>`;
  const cheer = (box, chars) => { const r = box.getBoundingClientRect(); VL.burst(r.left + r.width / 2, r.top + 40, chars || ["✿", "♡", "✦", "★"], 14); };

  /* ---------- flashcards ---------- */
  W.flashcards = function (box, src) {
    const deck = pairs(src);
    if (!deck.length) throw new Error("sin tarjetas (usa pregunta :: respuesta)");
    let order = deck.map((_, i) => i), i = 0;
    const key = keyFor(box, "fc");
    const known = new Set(VL.store.get(key, []));
    box.innerHTML = head("❀", "flashcards", `<span class="w-score"></span>`) + `
      <button class="fc-card" type="button" aria-live="polite"><span class="fc-inner"><span class="fc-face fc-front"></span><span class="fc-face fc-back"></span></span></button>
      <div class="w-row">
        <button class="btn btn-small btn-lilac" data-a="prev">‹</button>
        <span class="fc-pos"></span>
        <button class="btn btn-small btn-lilac" data-a="next">›</button>
        <button class="btn btn-small btn-mint" data-a="know">lo sé ✓</button>
        <button class="btn btn-small" data-a="shuffle">barajar ⤨</button>
      </div>`;
    const card = VL.$(".fc-card", box);
    function show() {
      const idx = order[i];
      card.classList.remove("is-flipped");
      VL.$(".fc-front", box).innerHTML = inline(deck[idx][0]);
      VL.$(".fc-back", box).innerHTML = inline(deck[idx][1]);
      card.classList.toggle("is-known", known.has(idx));
      VL.$(".fc-pos", box).textContent = `${i + 1} / ${deck.length}`;
      VL.$(".w-score", box).textContent = `♡ ${known.size}/${deck.length}`;
    }
    card.addEventListener("click", () => card.classList.toggle("is-flipped"));
    box.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]");
      if (!a) return;
      const act = a.dataset.a;
      if (act === "next") i = (i + 1) % deck.length;
      if (act === "prev") i = (i - 1 + deck.length) % deck.length;
      if (act === "shuffle") { order = shuffle(order); i = 0; }
      if (act === "know") {
        const idx = order[i];
        known.has(idx) ? known.delete(idx) : known.add(idx);
        VL.store.set(key, [...known]);
        if (known.size === deck.length) cheer(box);
      }
      show();
    });
    show();
  };

  /* ---------- memoria (parejas) ---------- */
  W.memoria = function (box, src) {
    const ps = pairs(src).slice(0, 8);
    if (!ps.length) throw new Error("sin parejas (usa a :: b)");
    let tiles, open = [], moves = 0, done = 0, lock = false;
    const best = keyFor(box, "mem");
    function deal() {
      tiles = shuffle(ps.flatMap((p, k) => [{ k, txt: p[0] }, { k, txt: p[1] }]));
      open = []; moves = 0; done = 0;
      box.innerHTML = head("✦", "memoria", `<span class="w-score"></span>`) +
        `<div class="mem-grid">${tiles.map((tl, n) => `<button type="button" class="mem-tile" data-n="${n}"><span class="mem-back">✿</span><span class="mem-face">${inline(tl.txt)}</span></button>`).join("")}</div>
         <div class="w-row"><button class="btn btn-small" data-a="again">otra vez ↺</button></div>`;
      score();
    }
    function score() {
      const b = VL.store.get(best, null);
      VL.$(".w-score", box).textContent = `movimientos: ${moves}` + (b ? ` · récord: ${b}` : "");
    }
    box.addEventListener("click", (e) => {
      if (e.target.closest("[data-a=again]")) return deal();
      const tile = e.target.closest(".mem-tile");
      if (!tile || lock || tile.classList.contains("is-open")) return;
      tile.classList.add("is-open");
      open.push(tile);
      if (open.length < 2) return;
      moves++;
      const [a, b] = open;
      if (tiles[a.dataset.n].k === tiles[b.dataset.n].k) {
        a.classList.add("is-match"); b.classList.add("is-match");
        open = []; done++;
        if (done === ps.length) {
          const prev = VL.store.get(best, null);
          if (!prev || moves < prev) VL.store.set(best, moves);
          cheer(box);
        }
      } else {
        lock = true;
        setTimeout(() => { a.classList.remove("is-open"); b.classList.remove("is-open"); open = []; lock = false; }, 900);
      }
      score();
    });
    deal();
  };

  /* ---------- quiz ---------- */
  W.quiz = function (box, src) {
    const qs = src.split(/\n\s*\n/).map((block) => {
      const q = { text: "", options: [], why: "" };
      lines(block).forEach((l) => {
        if (l.startsWith("?")) q.text = l.slice(1).trim();
        else if (l.startsWith("+")) q.options.push({ t: l.slice(1).trim(), ok: true });
        else if (l.startsWith("-")) q.options.push({ t: l.slice(1).trim(), ok: false });
        else if (l.startsWith(">")) q.why += l.slice(1).trim() + " ";
      });
      return q;
    }).filter((q) => q.text && q.options.length);
    if (!qs.length) throw new Error("sin preguntas");
    let right = 0, answered = 0;
    box.innerHTML = head("?", "quiz", `<span class="w-score">0 / ${qs.length}</span>`) + qs.map((q, n) => `
      <fieldset class="quiz-q" data-q="${n}">
        <legend><span class="quiz-n">${n + 1}</span> ${inline(q.text)}</legend>
        ${shuffle(q.options).map((o) => `<button type="button" class="quiz-opt" data-ok="${o.ok}">${inline(o.t)}</button>`).join("")}
        <p class="quiz-why" hidden>${q.why ? inline(q.why.trim()) : ""}</p>
      </fieldset>`).join("") + `<div class="w-row"><button class="btn btn-small" data-a="reset">reiniciar ↺</button></div>`;
    box.addEventListener("click", (e) => {
      if (e.target.closest("[data-a=reset]")) { W.quiz(box, src); return; }
      const opt = e.target.closest(".quiz-opt");
      if (!opt) return;
      const fs = opt.closest(".quiz-q");
      if (fs.classList.contains("is-done")) return;
      fs.classList.add("is-done");
      answered++;
      const ok = opt.dataset.ok === "true";
      if (ok) right++;
      opt.classList.add(ok ? "is-right" : "is-wrong");
      VL.$$(".quiz-opt", fs).forEach((o) => { if (o.dataset.ok === "true") o.classList.add("is-right"); o.disabled = true; });
      const why = VL.$(".quiz-why", fs);
      if (why.textContent.trim()) why.hidden = false;
      VL.$(".w-score", box).textContent = `${right} / ${qs.length}`;
      if (ok) { const r = opt.getBoundingClientRect(); VL.burst(r.right - 20, r.top + 10, ["✓", "♡", "✦"]); }
      if (answered === qs.length && right === qs.length) cheer(box);
    });
  };

  /* ---------- ordenar pasos ---------- */
  W.pasos = function (box, src) {
    let ls = lines(src), title = "ordena los pasos";
    if (ls[0] && ls[0].startsWith("#")) title = ls.shift().replace(/^#+\s*/, "");
    const correct = ls.slice();
    let cur = shuffle(correct);
    if (cur.join() === correct.join() && cur.length > 1) cur.reverse();
    let dragFrom = null;
    function render(state) {
      box.innerHTML = head("⇅", title) + `<ol class="steps-list">${cur.map((s, n) => `
        <li class="step ${state ? (s === correct[n] ? "is-right" : "is-wrong") : ""}" draggable="true" data-n="${n}">
          <span class="step-grip" aria-hidden="true">⋮⋮</span><span class="step-txt">${inline(s)}</span>
          <span class="step-move"><button type="button" data-m="-1" aria-label="subir">▲</button><button type="button" data-m="1" aria-label="bajar">▼</button></span>
        </li>`).join("")}</ol>
        <div class="w-row"><button class="btn btn-small btn-mint" data-a="check">comprobar ✓</button><button class="btn btn-small btn-lilac" data-a="mix">barajar ⤨</button><span class="w-msg">${state === "ok" ? "¡perfecto! ✿" : state === "bad" ? "casi… revisa los rojos" : ""}</span></div>`;
    }
    box.addEventListener("click", (e) => {
      const m = e.target.closest("[data-m]");
      if (m) {
        const n = +m.closest(".step").dataset.n, to = n + +m.dataset.m;
        if (to < 0 || to >= cur.length) return;
        [cur[n], cur[to]] = [cur[to], cur[n]];
        return render();
      }
      const a = e.target.closest("[data-a]");
      if (!a) return;
      if (a.dataset.a === "mix") { cur = shuffle(correct); return render(); }
      const ok = cur.every((s, n) => s === correct[n]);
      render(ok ? "ok" : "bad");
      if (ok) cheer(box);
    });
    box.addEventListener("dragstart", (e) => { const li = e.target.closest(".step"); if (li) { dragFrom = +li.dataset.n; li.classList.add("is-drag"); } });
    box.addEventListener("dragover", (e) => { if (e.target.closest(".step")) e.preventDefault(); });
    box.addEventListener("drop", (e) => {
      const li = e.target.closest(".step");
      if (!li || dragFrom == null) return;
      e.preventDefault();
      const to = +li.dataset.n;
      const [it] = cur.splice(dragFrom, 1);
      cur.splice(to, 0, it);
      dragFrom = null;
      render();
    });
    render();
  };

  /* ---------- detector de jerga (paso 2: explícalo a un niño) ---------- */
  const JARGON = ["paradigma", "intrinseco", "sinergia", "heuristica", "ontologia", "epistemologia", "cuantitativo", "cualitativo", "implementar", "optimizar", "inherente", "inherentemente", "subyacente", "metodologia", "abstraccion", "abstracto", "dicotomia", "holistico", "iterativo", "asintotico", "polimorfismo", "encapsulamiento", "instanciar", "homomorfismo", "isomorfismo", "estocastico", "deterministico", "vectorizar", "parametrizar", "framework", "stack", "pipeline", "escalable", "robusto", "trivial", "obviamente", "evidentemente", "claramente", "simplemente", "basicamente", "per se", "a priori", "a posteriori", "ergo", "biyectiva", "inyectiva", "sobreyectiva", "derivada parcial", "complejidad computacional"];
  W.jerga = function (box, src) {
    let concept = "";
    const extra = [];
    lines(src).forEach((l) => { const m = /^concepto\s*:\s*(.+)$/i.exec(l); if (m) concept = m[1]; else extra.push(VL.norm(l)); });
    const words = JARGON.concat(extra);
    const key = keyFor(box, "jerga");
    box.innerHTML = head("✎", "explícaselo a un niño de 12 años") + `
      ${concept ? `<p class="w-prompt">concepto: <b>${esc(concept)}</b></p>` : ""}
      <textarea class="w-text" rows="6" placeholder="Escribe tu explicación con palabras sencillas…"></textarea>
      <div class="w-row"><button class="btn btn-small" data-a="go">analizar ✦</button><span class="w-msg"></span></div>
      <div class="jerga-out" hidden>
        <div class="meter"><i></i><span></span></div>
        <ul class="jerga-stats"></ul>
        <div class="jerga-preview"></div>
      </div>`;
    const ta = VL.$("textarea", box);
    ta.value = VL.store.get(key, "");
    ta.addEventListener("input", () => VL.store.set(key, ta.value));
    box.addEventListener("click", (e) => {
      if (!e.target.closest("[data-a=go]")) return;
      const text = ta.value.trim();
      if (!text) { VL.$(".w-msg", box).textContent = "escribe algo primero ♡"; return; }
      const sentences = text.split(/[.!?¡¿]+/).map((s) => s.trim()).filter(Boolean);
      const tokens = text.split(/\s+/).filter(Boolean);
      const avg = tokens.length / Math.max(1, sentences.length);
      const longWords = tokens.filter((w) => w.replace(/[^\p{L}]/gu, "").length >= 12);
      const n = VL.norm(text);
      const found = words.filter((w) => w && new RegExp("(^|[^a-z])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)").test(n));
      const analogies = (n.match(/\b(como si|es como|imagina|parecid[oa] a|igual que|por ejemplo)\b/g) || []).length;
      let score = 100 - Math.max(0, avg - 14) * 3 - longWords.length * 4 - found.length * 9 + Math.min(analogies, 3) * 5;
      score = Math.max(0, Math.min(100, Math.round(score)));
      const out = VL.$(".jerga-out", box);
      out.hidden = false;
      VL.$(".meter i", box).style.width = score + "%";
      VL.$(".meter span", box).textContent = `nivel feynman: ${score}/100 ${score >= 85 ? "🌸" : score >= 60 ? "🌱" : "🧪"}`;
      VL.$(".jerga-stats", box).innerHTML = `
        <li>${sentences.length} frases · ${tokens.length} palabras · ${avg.toFixed(1)} palabras/frase ${avg > 20 ? "→ <b>frases largas, córtalas</b>" : "✓"}</li>
        <li>${longWords.length} palabras muy largas ${longWords.length ? "→ " + esc(longWords.slice(0, 6).join(", ")) : "✓"}</li>
        <li>${found.length} palabras de jerga ${found.length ? "→ <b>" + esc(found.join(", ")) + "</b>" : "✓"}</li>
        <li>${analogies} analogías/ejemplos ${analogies ? "✓ ¡bien!" : "→ prueba con «es como…»"}</li>`;
      const norm = VL.norm(text), ranges = [];
      const addAll = (term, cls) => { let i = 0; while (term && (i = norm.indexOf(term, i)) >= 0) { ranges.push([i, i + term.length, cls]); i += term.length; } };
      found.forEach((w) => addAll(w, "hl-pink"));
      longWords.forEach((w) => addAll(VL.norm(w.replace(/[^\p{L}]/gu, "")), "hl-lilac"));
      ranges.sort((a, b) => a[0] - b[0]);
      let html = "", pos = 0;
      ranges.forEach(([a, b, cls]) => { if (a < pos) return; html += esc(text.slice(pos, a)) + `<mark class="hl ${cls}">` + esc(text.slice(a, b)) + "</mark>"; pos = b; });
      html += esc(text.slice(pos));
      VL.$(".jerga-preview", box).innerHTML = html.replace(/\n/g, "<br>");
      VL.$(".w-msg", box).textContent = "";
      if (score >= 85) cheer(box, ["🌸", "✿", "♡"]);
    });
  };

  /* ---------- hoja de trabajo Feynman (exporta a Markdown) ---------- */
  W["hoja-feynman"] = function (box, src) {
    const m = /concepto\s*:\s*(.+)/i.exec(src || "");
    const key = keyFor(box, "hoja");
    const data = VL.store.get(key, { concepto: m ? m[1].trim() : "", simple: "", lagunas: "", analogia: "" });
    const fields = [
      ["concepto", "1 · ¿qué concepto quieres entender?", "ej. la recursión", 1],
      ["simple", "2 · explícalo como a un niño", "con palabras sencillas, sin jerga…", 5],
      ["lagunas", "3 · ¿dónde te trabaste? (lagunas)", "lo que no supiste explicar, dudas, cosas que repasar…", 3],
      ["analogia", "4 · simplifica: una analogía", "es como…", 3]
    ];
    box.innerHTML = head("⚛", "hoja feynman") + `<div class="sheet">${fields.map(([k, label, ph, rows], n) => `
      <label class="sheet-step" style="--n:${n}"><span>${label}</span>
        ${rows === 1 ? `<input data-k="${k}" placeholder="${esc(ph)}">` : `<textarea data-k="${k}" rows="${rows}" placeholder="${esc(ph)}"></textarea>`}
      </label>`).join("")}</div>
      <div class="meter"><i></i><span></span></div>
      <div class="w-row"><button class="btn btn-small" data-a="export">${esc(VL.t("export"))} ⬇</button><button class="btn btn-small btn-lilac" data-a="clear">${esc(VL.t("clear"))}</button></div>`;
    const inputs = VL.$$("[data-k]", box);
    function progress() {
      const filled = inputs.filter((i) => i.value.trim().length > 2).length;
      VL.$(".meter i", box).style.width = (filled / 4) * 100 + "%";
      VL.$(".meter span", box).textContent = `${filled}/4 pasos`;
    }
    inputs.forEach((i) => {
      i.value = data[i.dataset.k] || "";
      i.addEventListener("input", () => { data[i.dataset.k] = i.value; VL.store.set(key, data); progress(); });
    });
    progress();
    box.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]");
      if (!a) return;
      if (a.dataset.a === "clear") { inputs.forEach((i) => (i.value = "")); Object.keys(data).forEach((k) => (data[k] = "")); VL.store.set(key, data); progress(); return; }
      const today = new Date().toISOString().slice(0, 10);
      const md = `---\ntitle: ${data.concepto || "Mi concepto"}\ndate: ${today}\ntags: [feynman]\nsummary: Mi explicación de ${data.concepto || "un concepto"} con el método Feynman.\nemoji: ⚛\n---\n\n# ${data.concepto || "Mi concepto"}\n\n## Explicado como a un niño\n\n${data.simple}\n\n## Mis lagunas\n\n> [!NOTE]\n> ${data.lagunas.replace(/\n/g, "\n> ")}\n\n## La analogía\n\n> [!FEYNMAN]\n> ${data.analogia.replace(/\n/g, "\n> ")}\n`;
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = (VL.slug(data.concepto) || "feynman") + ".md";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      cheer(box);
    });
  };
})();
