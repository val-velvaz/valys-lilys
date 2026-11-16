/* ✿ resultados de búsqueda (buscar.html?q=…&s=seccion) ✿ */
VL.ready(async function () {
  const { $, esc, t } = VL;
  const main = document.getElementById("main");
  const q = (VL.param("q") || "").trim();
  let sec = VL.param("s") || "";
  document.title = `${q || t("search")} · ${VL.config.siteName}`;

  const res = q ? await VL.search(q) : [];
  const counts = {};
  res.forEach((r) => (counts[r.entry.section] = (counts[r.entry.section] || 0) + 1));

  main.innerHTML = `
    <div class="paper paper-cream">
      <div class="section-head"><h1 class="section-title"><span class="sec-icon">✦</span>${esc(t("search").replace(/\.+$/, ""))}</h1></div>
      <form class="toolbar" action="buscar.html">
        <input class="input-pill" name="q" type="search" value="${esc(q)}" placeholder="${esc(t("search"))}" aria-label="${esc(t("search"))}">
        <button class="btn" type="submit">✦</button>
      </form>
      ${q ? `<p class="section-intro">${res.length} ${esc(t("results"))} “${esc(q)}”</p>` : ""}
      <div class="chip-row" id="secs">
        <button type="button" class="chip" data-s="">${esc(t("searchAll"))} (${res.length})</button>
        ${Object.keys(counts).map((s) => `<button type="button" class="chip" data-s="${esc(s)}">${esc(VL.sectionLabel(s))} (${counts[s]})</button>`).join("")}
      </div>
      <ul class="cards" id="res" style="list-style:none;margin:0;padding:0"></ul>
    </div>`;

  function render() {
    VL.$$("#secs .chip", main).forEach((c) => c.classList.toggle("is-on", c.dataset.s === sec));
    const list = res.filter((r) => !sec || r.entry.section === sec);
    $("#res", main).innerHTML = list.map((r) => `
      <li><a class="card" href="${VL.entryUrl(r.entry)}">
        <span class="sec-badge sec-${esc(r.entry.section)}">${esc(VL.sectionLabel(r.entry.section))}</span>
        <h3>${VL.markTerms(r.entry.title, q)}</h3>
        <p>${VL.markTerms(r.snippet, q)}</p>
        <span class="card-meta">${(r.entry.tags || []).map((g) => `<span class="tag">#${esc(g)}</span>`).join("")}<span class="card-more">${esc(t("readMore"))}</span></span>
      </a></li>`).join("") || `<li class="empty-state">${esc(q ? t("noResults") : "✿ ✦ ✿")}</li>`;
  }
  $("#secs", main).addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    sec = c.dataset.s;
    const u = new URL(location.href);
    if (sec) u.searchParams.set("s", sec); else u.searchParams.delete("s");
    history.replaceState(null, "", u);
    render();
  });
  render();
});
