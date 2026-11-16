/* ✿ todos mis subrayados ✿ */
VL.ready(function () {
  const { $, $$, esc, t } = VL;
  const main = document.getElementById("main");
  let color = "";

  main.innerHTML = `
    <div class="paper paper-cream">
      <span class="deco-bow" style="top:-20px;left:30px"><i></i></span>
      <div class="section-head"><h1 class="section-title"><span class="sec-icon">✎</span>${esc(t("highlights"))}</h1>
        <button class="btn btn-small" type="button" id="exp">${esc(t("export"))} ⬇</button></div>
      <div class="hl-filter" id="flt">
        <button type="button" class="chip" data-c="">${esc(t("allTags"))}</button>
        ${VL.HL_COLORS.map((c) => `<button type="button" class="hl-swatch hl-${c}" data-c="${c}" aria-label="${c}"></button>`).join("")}
      </div>
      <div id="groups"></div>
    </div>`;

  function render() {
    const all = VL.hlAll();
    $$("#flt [data-c]", main).forEach((b) => b.classList.toggle("is-on", b.dataset.c === color));
    const html = Object.keys(all).map((id) => {
      const g = all[id];
      const items = g.items.filter((i) => !color || i.color === color);
      if (!items.length) return "";
      const url = "entrada.html?id=" + encodeURIComponent(id);
      return `<div class="hl-group"><h3><span class="sec-badge sec-${esc(g.section)}">${esc(VL.sectionLabel(g.section || ""))}</span> <a href="${url}">${esc(g.title)}</a></h3>
        ${items.map((i) => `<div class="hl-item"><q><mark class="hl hl-${esc(i.color)}">${esc(i.text)}</mark></q>
          <span><a class="btn btn-small btn-lilac" href="${url}#hl=${esc(i.id)}" aria-label="ir">↗</a>
          <button type="button" class="btn btn-small" data-del="${esc(id)}|${esc(i.id)}" aria-label="${esc(t("remove"))}">✕</button></span>
          ${i.note ? `<span class="hl-note">✎ ${esc(i.note)}</span>` : ""}</div>`).join("")}</div>`;
    }).join("");
    $("#groups", main).innerHTML = html || `<p class="empty-state">${esc(t("noHighlights"))}</p>`;
  }

  main.addEventListener("click", (e) => {
    const f = e.target.closest("#flt [data-c]");
    if (f) { color = f.dataset.c; render(); return; }
    const d = e.target.closest("[data-del]");
    if (d) {
      const [eid, hid] = d.dataset.del.split("|");
      const all = VL.hlAll();
      if (all[eid]) {
        all[eid].items = all[eid].items.filter((i) => i.id !== hid);
        if (!all[eid].items.length) delete all[eid];
        VL.hlSave(all);
      }
      render();
      return;
    }
    if (e.target.closest("#exp")) {
      const all = VL.hlAll();
      const md = "# Mis subrayados\n\n" + Object.keys(all).map((id) => `## ${all[id].title}\n\n` +
        all[id].items.map((i) => `- ==${i.text}==` + (i.note ? `\n  - ✎ ${i.note}` : "")).join("\n")).join("\n\n") + "\n";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
      a.download = "subrayados.md";
      document.body.appendChild(a); a.click(); a.remove();
    }
  });
  render();
});
