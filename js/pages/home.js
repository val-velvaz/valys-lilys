/* ✿ página de inicio ✿ */
VL.ready(async function () {
  const { $, esc, t } = VL, C = VL.config;
  const main = document.getElementById("main");

  // WELCOME en fichas
  const word = t("welcome");
  $("#welcome", main).innerHTML = [...word].map((ch, i) => `<li style="--i:${i}">${esc(ch)}</li>`).join("");
  $("#welcome", main).setAttribute("aria-label", word);
  $("#welcome", main).addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    li.classList.add("is-jump");
    setTimeout(() => li.classList.remove("is-jump"), 400);
    VL.burst(e.clientX, e.clientY, ["✿", "♡", "✦"], 6);
  });

  // textos en Markdown según idioma (content/paginas/<nombre>.<lang>.md)
  async function page(name, target) {
    for (const lang of [VL.lang, "en", "es"]) {
      try {
        const r = await fetch(`content/paginas/${name}.${lang}.md`, { cache: "no-cache" });
        if (!r.ok) continue;
        const { body } = VL.parseFrontMatter(await r.text());
        target.innerHTML = VL.renderMarkdown(body);
        target.dataset.entry = "paginas/" + name;
        VL.enhance(target);
        return;
      } catch (e) { /* siguiente idioma */ }
    }
  }
  page("bienvenida", $("#welcome-text", main));
  page("proyecto", $("#project-text", main));

  // lo más nuevo
  VL.loadIndex().then((entries) => {
    const box = $("#latest", main);
    box.innerHTML = entries.slice(0, 4).map((e) => `
      <li><a class="card" href="${VL.entryUrl(e)}">
        <span class="card-date">${esc(VL.fmtDate(e.date))}</span>
        ${e.emoji ? `<span class="card-emoji" aria-hidden="true">${esc(e.emoji)}</span>` : ""}
        <h3>${esc(e.title)}</h3>
        <p>${esc(e.summary || "")}</p>
        <span class="card-meta"><span class="sec-badge sec-${esc(e.section)}">${esc(VL.sectionLabel(e.section))}</span><span class="card-more">${esc(t("readMore"))}</span></span>
      </a></li>`).join("") || `<li class="empty-state">✿</li>`;
  });

  // widget de GitHub (API pública por https, con caché de 10 min)
  const gh = $("#gh-body", main);
  const LANG_COLORS = { JavaScript: "#f1e05a", Python: "#3572A5", "C++": "#f34b7d", C: "#555555", HTML: "#e34c26", CSS: "#563d7c", R: "#198CE7", Java: "#b07219", TypeScript: "#3178c6", Jupyter: "#DA5B0B", "Jupyter Notebook": "#DA5B0B", Shell: "#89e051" };
  async function cached(url) {
    const k = "gh:" + url;
    try {
      const c = JSON.parse(sessionStorage.getItem(k) || "null");
      if (c && Date.now() - c.at < 600000) return c.data;
    } catch (e) { /* sin sessionStorage */ }
    const r = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    try { sessionStorage.setItem(k, JSON.stringify({ at: Date.now(), data })); } catch (e) { /* lleno */ }
    return data;
  }
  try {
    const [repos, commits] = await Promise.all([
      cached(`https://api.github.com/users/${encodeURIComponent(C.githubUser)}/repos?sort=pushed&per_page=4`),
      cached(`https://api.github.com/repos/${encodeURIComponent(C.githubUser)}/${encodeURIComponent(C.githubRepo)}/commits?per_page=1`).catch(() => [])
    ]);
    gh.innerHTML = `<ul class="gh-list">${repos.map((r) => `
      <li><span class="gh-lang" style="background:${LANG_COLORS[r.language] || "var(--lilac)"}" title="${esc(r.language || "")}"></span>
        <a href="${esc(r.html_url)}" target="_blank" rel="noopener">${esc(r.name)}</a>
        <span class="gh-stars">★ ${r.stargazers_count}</span>
        <small>${esc(r.description || r.language || "✿")} · ${esc(t("updated"))} ${esc(VL.fmtDate(r.pushed_at))}</small></li>`).join("")}</ul>` +
      (commits[0] ? `<p class="gh-commit">⟢ último commit: “${esc(commits[0].commit.message.split("\n")[0])}” · ${esc(VL.fmtDate(commits[0].commit.author.date))}</p>` : "");
  } catch (e) {
    gh.innerHTML = `<p class="muted">${esc(t("githubError"))}</p><a class="btn btn-small" href="${esc(C.media.github)}" target="_blank" rel="noopener">GitHub ↗</a>`;
  }
});
