/* ✿ My IDE: mini editor para practicar (JavaScript y HTML) en un iframe aislado ✿ */
VL.ready(function () {
  const { $, $$, esc, t } = VL;
  const main = document.getElementById("main");
  const KEY = "ide";
  const SAMPLES = {
    "feynman.js": `// ✿ Explica la recursión como a un niño:\n// "Para contar los escalones, cuento uno y le pido\n//  a alguien que cuente el resto."\n\nfunction contar(escalones) {\n  if (escalones === 0) return 0;   // no quedan escalones\n  return 1 + contar(escalones - 1); // uno + el resto\n}\n\nconsole.log("escalones:", contar(5));\nconsole.log([1, 2, 3].map((n) => n * n));\n`,
    "pagina.html": `<style>\n  body { font-family: Nunito, sans-serif; background: #ffecf2; color: #414040; }\n  h1 { color: #f99dce; }\n  button { background: #e4c1f9; border: 0; border-radius: 99px; padding: 6px 14px; }\n</style>\n<h1>hola ✿</h1>\n<button onclick="this.textContent += ' ♡'">clic</button>\n`
  };
  const files = Object.assign({}, SAMPLES, VL.store.get(KEY, {}));
  let cur = "feynman.js";

  main.innerHTML = `
    <div class="paper paper-cream">
      <div class="section-head"><h1 class="section-title"><span class="sec-icon">&lt;/&gt;</span>${esc(t("ide"))}</h1></div>
      <p class="section-intro">Practica aquí lo que explicas: el código corre en tu navegador, aislado. <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para ejecutar.</p>
      <div class="ide">
        <div class="ide-win">
          <div class="ide-tabs" id="tabs"></div>
          <div class="ide-body"><pre class="ide-lines" id="lines" aria-hidden="true">1</pre>
            <textarea class="ide-code" id="code" spellcheck="false" aria-label="código"></textarea></div>
        </div>
        <div class="w-row" style="margin:0">
          <button class="btn" type="button" id="run">${esc(t("run"))}</button>
          <button class="btn btn-lilac" type="button" id="clr">${esc(t("clear"))}</button>
          <button class="btn btn-mint" type="button" id="reset">↺ ejemplo</button>
        </div>
        <pre class="ide-console" id="out" aria-live="polite"><span class="info">// ${esc(t("console"))} ✿</span></pre>
        <iframe class="ide-frame" id="frame" sandbox="allow-scripts" title="vista previa" hidden></iframe>
      </div>
    </div>`;

  const code = $("#code", main), lines = $("#lines", main), out = $("#out", main), frame = $("#frame", main);
  const isHtml = () => cur.endsWith(".html");

  function tabs() {
    $("#tabs", main).innerHTML = Object.keys(files).map((f) => `<button type="button" class="ide-tab ${f === cur ? "is-on" : ""}" data-f="${esc(f)}">${esc(f)}</button>`).join("");
  }
  function load() { code.value = files[cur]; numbers(); tabs(); frame.hidden = !isHtml(); out.hidden = isHtml(); }
  function numbers() { lines.textContent = code.value.split("\n").map((_, i) => i + 1).join("\n"); lines.scrollTop = code.scrollTop; }
  function save() { files[cur] = code.value; VL.store.set(KEY, files); }
  function log(text, cls) { const s = document.createElement("span"); if (cls) s.className = cls; s.textContent = "\n" + text; out.appendChild(s); out.scrollTop = out.scrollHeight; }

  window.addEventListener("message", (e) => {
    if (e.source !== frame.contentWindow || !e.data || e.data.vl !== "ide") return;
    log(e.data.args.join(" "), e.data.level === "error" ? "err" : "");
  });

  function run() {
    save();
    if (isHtml()) { frame.srcdoc = code.value; return; }
    out.innerHTML = `<span class="info">// ▶ ${esc(cur)}</span>`;
    const js = JSON.stringify(code.value);
    frame.srcdoc = `<script>
      const send = (level, args) => parent.postMessage({ vl: "ide", level, args: args.map((a) => { try { return typeof a === "string" ? a : JSON.stringify(a); } catch (e) { return String(a); } }) }, "*");
      console.log = (...a) => send("log", a); console.info = console.log; console.warn = console.log;
      console.error = (...a) => send("error", a);
      window.onerror = (m, s, l) => { send("error", ["⚠ " + m + (l ? " (línea " + l + ")" : "")]); };
      try { (0, eval)(${js.replace(/<\/script/gi, "<\\/script")}); } catch (err) { send("error", ["⚠ " + err.name + ": " + err.message]); }
    <\/script>`;
  }

  code.addEventListener("input", () => { numbers(); save(); });
  code.addEventListener("scroll", () => (lines.scrollTop = code.scrollTop));
  code.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const s = code.selectionStart;
      code.setRangeText("  ", s, code.selectionEnd, "end");
      numbers(); save();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
  });
  $("#tabs", main).addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (b) { save(); cur = b.dataset.f; load(); } });
  $("#run", main).addEventListener("click", (e) => { run(); VL.burst(e.clientX, e.clientY, ["▶", "✦", "♡"], 6); });
  $("#clr", main).addEventListener("click", () => { out.innerHTML = `<span class="info">// ${esc(t("console"))} ✿</span>`; });
  $("#reset", main).addEventListener("click", () => { files[cur] = SAMPLES[cur] || ""; save(); load(); });
  load();
});
