/* ✿ página de una entrada (Markdown) con índice, checklist Feynman, subrayados y comentarios ✿ */
VL.ready(async function () {
  const { $, $$, esc, t } = VL, C = VL.config;
  const main = document.getElementById("main");
  const id = VL.param("id") || document.body.dataset.entryId;
  const all = await VL.loadIndex();
  const entry = all.find((e) => e.id === id);

  if (!entry) {
    main.innerHTML = `<div class="paper empty-state"><p>${esc(t("notFound"))}</p><a class="btn" href="index.html">← ${esc(t("back"))}</a></div>`;
    return;
  }

  let doc;
  try { doc = await VL.fetchEntry(entry); }
  catch (e) { main.innerHTML = `<div class="paper notice">⚠ ${esc(e.message)}</div>`; return; }
  const fm = Object.assign({}, entry, doc.data);
  document.title = `${fm.title} · ${C.siteName}`;

  const sibs = all.filter((e) => e.section === entry.section);
  const idx = sibs.indexOf(entry);
  const newer = sibs[idx - 1], older = sibs[idx + 1];

  main.innerHTML = `
    <article class="paper entry">
      <header class="entry-head">
        <a class="sec-badge sec-${esc(entry.section)}" href="${esc(VL.sectionPage(entry.section))}">${esc(C.sections[entry.section] ? C.sections[entry.section].icon : "✿")} ${esc(VL.sectionLabel(entry.section))}</a>
        <div class="md"><h1 class="entry-title">${fm.emoji ? `<span aria-hidden="true">${esc(fm.emoji)}</span> ` : ""}${esc(fm.title)}</h1></div>
        <div class="entry-meta">
          <span class="card-date">${esc(VL.fmtDate(fm.date))}</span>
          <span>⏱ ${VL.readingTime(doc.body)} ${esc(t("minutes"))}</span>
          ${fm.mood ? `<span>mood: ${esc(fm.mood)}</span>` : ""}
          ${(fm.tags || []).map((g) => `<a class="tag" href="tema.html?t=${encodeURIComponent(g)}">#${esc(g)}</a>`).join("")}
        </div>
      </header>
      <div class="md" id="body" data-entry="${esc(entry.id)}"></div>
      <nav class="entry-nav">
        ${older ? `<a class="btn btn-lilac" href="${VL.entryUrl(older)}">‹ ${esc(older.title)}</a>` : "<span></span>"}
        ${newer ? `<a class="btn btn-lilac" href="${VL.entryUrl(newer)}">${esc(newer.title)} ›</a>` : ""}
      </nav>
    </article>
    <section class="paper paper-cream guestbook" aria-labelledby="gb-h">
      <div class="md"><h2 id="gb-h">${esc(t("comments"))}</h2></div>
      <form><input name="who" maxlength="40" placeholder="tu nombre ✿" aria-label="nombre"><textarea name="msg" rows="3" maxlength="600" placeholder="${esc(t("commentPh"))}" aria-label="mensaje" required></textarea>
      <div class="w-row" style="margin:0"><button class="btn" type="submit">${esc(t("send"))} ♡</button><small>${esc(t("localNote"))}</small></div></form>
      <ul id="gb-list"></ul>
    </section>`;

  const body = $("#body", main);
  // si el md empieza con el mismo título que el front matter, no lo repetimos
  const md = doc.body.replace(new RegExp("^\\s*#\\s+" + fm.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\n"), "");
  body.innerHTML = VL.renderMarkdown(md);
  VL.enhance(body);

  /* índice (barra izquierda) */
  const heads = $$("h2, h3", body);
  if (heads.length > 1) {
    VL.slots.left.innerHTML = `<div class="side-card"><h3>✿ ${esc(t("toc"))}</h3><nav class="toc">${heads.map((h) =>
      `<a class="lvl-${h.tagName[1]}" href="#${h.id}">${esc(h.textContent.replace(/✿$/, ""))}</a>`).join("")}</nav></div>`;
    const links = $$(".toc a", VL.slots.left);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.hash === "#" + en.target.id));
      }), { rootMargin: "0px 0px -70% 0px" });
      heads.forEach((h) => io.observe(h));
    }
  }

  /* checklist Feynman + subrayados de esta entrada (barra derecha) */
  const fkey = "feynman:" + entry.id;
  const done = VL.store.get(fkey, []);
  VL.slots.right.innerHTML = `
    <div class="side-card">
      <h3>⚛ ${esc(t("feynman"))}</h3>
      <div class="feynman-steps">${t("steps").map((s, i) => `<label><input type="checkbox" data-i="${i}" ${done.includes(i) ? "checked" : ""}> ${i + 1}. ${esc(s)}</label>`).join("")}</div>
      <div class="progress" aria-hidden="true"><i></i></div>
    </div>
    <div class="side-card">
      <h3>✎ ${esc(t("highlights"))}</h3>
      <div class="hl-side-list" id="hl-side"></div>
    </div>`;
  const bar = $(".progress i", VL.slots.right);
  const upd = () => { const n = $$(".feynman-steps input:checked", VL.slots.right).length; bar.style.width = (n / 4) * 100 + "%"; return n; };
  upd();
  $(".feynman-steps", VL.slots.right).addEventListener("change", (e) => {
    const list = $$(".feynman-steps input:checked", VL.slots.right).map((x) => +x.dataset.i);
    VL.store.set(fkey, list);
    if (upd() === 4) { const r = e.target.getBoundingClientRect(); VL.burst(r.left, r.top, ["⚛", "✿", "♡", "★"], 14); }
  });

  const side = $("#hl-side", VL.slots.right);
  const hl = VL.highlighter(body, { id: entry.id, title: fm.title, section: entry.section }, (items) => {
    side.innerHTML = items.length
      ? items.map((it) => `<button type="button" class="hl-${esc(it.color)}" data-id="${esc(it.id)}">“${esc(it.text.length > 90 ? it.text.slice(0, 90) + "…" : it.text)}”${it.note ? `<br><small>✎ ${esc(it.note)}</small>` : ""}</button>`).join("")
      : `<span class="muted">${esc(t("noHighlights"))}</span>`;
  });
  side.addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (b) hl.flash(b.dataset.id); });
  const h = /#hl=([\w-]+)/.exec(location.hash);
  if (h) setTimeout(() => hl.flash(h[1]), 300);
  else if (location.hash.length > 1) { const tgt = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (tgt) tgt.scrollIntoView(); }

  /* comentarios guardados localmente */
  const gkey = "comments:" + entry.id;
  const list = $("#gb-list", main);
  const draw = () => {
    const items = VL.store.get(gkey, []);
    list.innerHTML = items.map((c) => `<li><b>${esc(c.who || "anónimo")}</b> <small>${esc(new Date(c.at).toLocaleString())}</small><br>${esc(c.msg)}</li>`).join("");
  };
  draw();
  $(".guestbook form", main).addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const items = VL.store.get(gkey, []);
    items.unshift({ who: f.who.value.trim(), msg: f.msg.value.trim(), at: Date.now() });
    VL.store.set(gkey, items.slice(0, 50));
    f.msg.value = "";
    draw();
    const r = f.getBoundingClientRect();
    VL.burst(r.left + r.width / 2, r.top, ["♡", "✿"], 8);
  });
});
