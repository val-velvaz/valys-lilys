/* ✿ páginas de sección (math, cs, games…) y de tema (tema.html?t=python) ✿ */
VL.ready(async function () {
  const { $, $$, esc, t } = VL, C = VL.config;
  const main = document.getElementById("main");
  const section = document.body.dataset.section || "";
  const topic = document.body.dataset.page === "topic" ? (VL.param("t") || "") : "";
  const sec = C.sections[section] || {};

  // cabecera
  const topicInfo = C.topics.find((x) => VL.norm(x.tag) === VL.norm(topic));
  const title = topic ? (topicInfo ? topicInfo.label : topic) : VL.sectionLabel(section);
  document.title = `${title} · ${C.siteName}`;
  main.innerHTML = `
    <div class="paper paper-cream">
      <span class="deco-tape t-lilac" style="top:-12px;left:30px;transform:rotate(-4deg)"></span>
      <span class="deco-pin" style="top:-18px;right:-14px"></span>
      <div class="section-head"><h1 class="section-title"><span class="sec-icon" aria-hidden="true">${esc(topic ? "#" : sec.icon || "✿")}</span>${esc(title)}</h1></div>
      <div class="md section-intro" id="intro"></div>
      <div class="toolbar">
        <label class="sr-only" for="flt">${esc(t("filter"))}</label>
        <input class="input-pill" id="flt" type="search" placeholder="${esc(t("filter"))}">
        <select class="select-pill" id="sort" aria-label="orden">
          <option value="new">${esc(t("sortNew"))}</option><option value="old">${esc(t("sortOld"))}</option><option value="az">${esc(t("sortAZ"))}</option>
        </select>
        <span class="view-toggle" role="group"><button type="button" data-v="list">${esc(t("viewList"))}</button><button type="button" data-v="grid">${esc(t("viewGrid"))}</button></span>
      </div>
      <div class="chip-row" id="chips"></div>
      <ul class="cards" id="cards" style="list-style:none;margin:0;padding:0"></ul>
      <div class="archive" id="archive"></div>
    </div>`;

  // intro opcional en Markdown: content/paginas/<seccion>.<lang>.md
  if (section) {
    for (const lang of [VL.lang, "es"]) {
      try {
        const r = await fetch(`content/paginas/${section}.${lang}.md`, { cache: "no-cache" });
        if (!r.ok) continue;
        $("#intro", main).innerHTML = VL.renderMarkdown(VL.parseFrontMatter(await r.text()).body);
        VL.enhance($("#intro", main));
        break;
      } catch (e) { /* sin intro */ }
    }
  }

  const all = await VL.loadIndex();
  const pool = all.filter((e) => (topic ? (e.tags || []).some((x) => VL.norm(x) === VL.norm(topic)) : e.section === section));

  const state = { q: "", sort: "new", tag: "", month: "", view: VL.store.get("view:" + (section || "topic"), "list") };
  const tags = [...new Set(pool.flatMap((e) => e.tags || []))].sort();
  $("#chips", main).innerHTML = [`<button type="button" class="chip is-on" data-tag="">${esc(t("allTags"))}</button>`]
    .concat(tags.map((g) => `<button type="button" class="chip" data-tag="${esc(g)}">#${esc(g)}</button>`)).join("");

  // archivo por mes
  const months = {};
  pool.forEach((e) => { const k = String(e.date || "").slice(0, 7); if (k) months[k] = (months[k] || 0) + 1; });
  const mKeys = Object.keys(months).sort().reverse();
  if (mKeys.length > 1) {
    $("#archive", main).innerHTML = `<h3>✿ ${esc(t("archive"))}</h3><div class="chip-row">${mKeys.map((k) => {
      const [y, m] = k.split("-");
      return `<button type="button" class="chip" data-month="${k}">${esc(t("months")[+m - 1])} ${y} (${months[k]})</button>`;
    }).join("")}</div>`;
  }

  function render() {
    const q = VL.norm(state.q);
    let list = pool.filter((e) =>
      (!state.tag || (e.tags || []).includes(state.tag)) &&
      (!state.month || String(e.date).startsWith(state.month)) &&
      (!q || VL.norm([e.title, e.summary, (e.tags || []).join(" "), e.text].join(" ")).includes(q)));
    if (state.sort === "old") list = list.slice().reverse();
    if (state.sort === "az") list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
    const cards = $("#cards", main);
    cards.classList.toggle("is-grid", state.view === "grid");
    $$(".view-toggle button", main).forEach((b) => b.classList.toggle("is-on", b.dataset.v === state.view));
    cards.innerHTML = list.map((e, i) => `
      <li><a class="card" href="${VL.entryUrl(e)}">
        ${i % 3 === 0 ? `<span class="deco-tape ${["", "t-mint", "t-lilac"][i % 3]}"></span>` : ""}
        <span class="card-date">${esc(VL.fmtDate(e.date))}</span>
        ${e.emoji ? `<span class="card-emoji" aria-hidden="true">${esc(e.emoji)}</span>` : ""}
        <h3>${state.q ? VL.markTerms(e.title, state.q) : esc(e.title)}</h3>
        <p>${esc(e.summary || "")}</p>
        <span class="card-meta">
          ${topic ? `<span class="sec-badge sec-${esc(e.section)}">${esc(VL.sectionLabel(e.section))}</span>` : ""}
          ${(e.tags || []).slice(0, 4).map((g) => `<span class="tag">#${esc(g)}</span>`).join("")}
          <span>· ${VL.readingTime(e.text)} ${esc(t("minutes"))}</span>
          <span class="card-more">${esc(t("readMore"))}</span>
        </span>
      </a></li>`).join("") || `<li class="empty-state">${esc(t("noResults"))}</li>`;
  }

  $("#flt", main).addEventListener("input", (e) => { state.q = e.target.value; render(); });
  $("#sort", main).addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  main.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    const v = e.target.closest("[data-v]");
    if (v) { state.view = v.dataset.v; VL.store.set("view:" + (section || "topic"), state.view); render(); }
    if (!chip) return;
    if ("tag" in chip.dataset) { state.tag = chip.dataset.tag; $$("#chips .chip", main).forEach((c) => c.classList.toggle("is-on", c === chip)); }
    if (chip.dataset.month) {
      state.month = state.month === chip.dataset.month ? "" : chip.dataset.month;
      $$("#archive .chip", main).forEach((c) => c.classList.toggle("is-on", c.dataset.month === state.month));
    }
    render();
  });
  const pre = VL.param("tag");
  if (pre) { const c = $$("#chips .chip", main).find((x) => x.dataset.tag === pre); if (c) c.click(); else render(); }
  else render();
});
