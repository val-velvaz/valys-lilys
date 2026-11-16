/* ✿ marco compartido (layout tipo MySpace): navbar con búsqueda, título/banner,
   foto de perfil, botones, calendario, navegación, temas, sección y footer ✿ */
(function () {
  const VL = window.VL, C = VL.config, t = VL.t, esc = VL.esc;
  VL.slots = {};

  const icons = {
    github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="5" fill="currentColor"/><rect x="5" y="9.5" width="3" height="9" rx="1" fill="#fff"/><circle cx="6.5" cy="6.3" r="1.8" fill="#fff"/><path d="M10.5 9.5h2.8v1.3c.5-.9 1.6-1.5 2.9-1.5 2.3 0 3.3 1.4 3.3 3.9v5.3h-3v-4.8c0-1.1-.4-1.8-1.4-1.8s-1.6.7-1.6 1.8v4.8h-3z" fill="#fff"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="5" fill="currentColor"/><path d="M10 8.5v7l6-3.5z" fill="#fff"/></svg>'
  };

  /* ---------- montaje ---------- */
  function build() {
    const main = document.getElementById("main");
    const here = location.pathname.split("/").pop() || "index.html";
    const label = (k) => `<h2 class="box-label">${esc(k)}</h2>`;

    const frame = VL.el(`
<div class="frame">
  <header class="navbar box">
    <a class="logo" href="index.html">✿ ${esc(C.siteName)}</a>
    <form class="search" action="buscar.html" role="search" autocomplete="off">
      <label class="sr-only" for="vl-q">${esc(t("search"))}</label>
      <button class="search-go" type="submit" aria-label="buscar"></button>
      <input id="vl-q" name="q" type="search" placeholder="${esc(t("search"))}" value="${esc(VL.param("q") || "")}">
      <div class="search-drop" role="listbox" hidden></div>
    </form>
    <div class="lang" role="group" aria-label="idioma">
      ${["en", "es", "de"].map((l) => `<button type="button" class="lang-btn ${l === VL.lang ? "is-on" : ""}" data-lang="${l}">${l.toUpperCase()}</button>`).join("")}
    </div>
  </header>

  <section class="hero">
    <div class="title box">
      <a class="site-title" href="index.html">${esc(C.siteName)}</a>
      <p class="site-sub">${esc(t("tagline"))}</p>
    </div>
    <a class="profile" href="about.html" aria-label="about me">
      <img id="vl-avatar" src="assets/img/perfil.svg" alt="foto de perfil">
      <span class="avatar-live" id="vl-avatar-live" hidden title="sincronizada con GitHub">● live</span>
    </a>
    <nav class="top-buttons" aria-label="secciones principales">
      ${C.topButtons.map((b) => `<a class="top-btn ${here === b.href ? "is-here" : ""}" href="${b.href}"><span class="dot" aria-hidden="true"></span>${esc(t(b.key))}</a>`).join("")}
    </nav>
  </section>

  <div class="cols">
    <aside class="col-left">
      <section class="box">${label(t("calendar"))}<div class="calendar" id="vl-calendar"></div></section>
      <div class="slot" id="slot-left"></div>
      <nav class="box" aria-label="navigation">${label(t("navigation"))}
        <ul class="nav-list">
          ${C.macarons.map((m) => `<li><a class="${here === m.href ? "is-here" : ""}" href="${m.href}">${esc(t(m.key))}</a></li>`).join("")}
        </ul>
      </nav>
    </aside>
    <div class="col-main" id="col-main"></div>
    <aside class="col-right">
      <div class="slot" id="slot-right"></div>
      <nav class="box" aria-label="${esc(t("topic"))}">${label(t("topics"))}
        <ul class="topics">
          ${C.topics.map((tp) => `<li><a class="topic topic-${tp.color}" href="tema.html?t=${encodeURIComponent(tp.tag)}">${esc(tp.label)}<b class="topic-count" data-tag="${esc(tp.tag)}"></b></a></li>`).join("")}
        </ul>
      </nav>
      <section class="box">${label(t("lastUpgrade"))}
        <p class="upgrade"><b>v${esc(C.version)}</b><br><small id="vl-upgrade-date"></small></p>
      </section>
    </aside>
  </div>

  <footer class="footer box">
    ${label(t("media"))}
    <div class="media-links">
      <a class="media-btn" href="${esc(C.media.github)}" target="_blank" rel="noopener">${icons.github}<span>GitHub</span></a>
      <a class="media-btn" href="${esc(C.media.linkedin)}" target="_blank" rel="noopener">${icons.linkedin}<span>LinkedIn</span></a>
      <a class="media-btn" href="${esc(C.media.youtube)}" target="_blank" rel="noopener">${icons.youtube}<span>YouTube</span></a>
    </div>
    <div class="site-tools">
      <a href="#" id="vl-random">${esc(t("random"))}</a> ·
      <a href="subrayados.html">${esc(t("highlights"))}</a> ·
      <span class="counter" title="visitas desde este navegador" id="vl-counter"></span>
    </div>
    <p class="copy">© ${new Date().getFullYear()} ${esc(C.siteName)}</p>
  </footer>
</div>`);

    document.body.prepend(frame);
    const colMain = VL.$("#col-main", frame);
    if (main) colMain.appendChild(main);
    VL.slots.left = VL.$("#slot-left", frame);
    VL.slots.right = VL.$("#slot-right", frame);

    VL.$$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    wireSearch(frame);
    wireLang(frame);
    wireTools(frame);
    githubAvatar(frame);
    VL.loadIndex().then((entries) => {
      calendar(VL.$("#vl-calendar", frame), entries);
      topicCounts(frame, entries);
      if (entries[0]) VL.$("#vl-upgrade-date", frame).textContent = VL.fmtDate(entries[0].date);
      if (VL.indexFailed) colMain.prepend(VL.el(`<div class="box notice">⚠ ${esc(t("indexError"))}</div>`));
    });
    document.body.classList.add("is-ready");
  }

  /* ---------- búsqueda (en todas las páginas) ---------- */
  function wireSearch(frame) {
    const form = VL.$(".search", frame), input = VL.$("input", form), drop = VL.$(".search-drop", form);
    let active = -1, timer;
    const close = () => { drop.hidden = true; active = -1; };

    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const q = input.value.trim();
        if (q.length < 2) return close();
        const res = (await VL.search(q)).slice(0, 6);
        drop.innerHTML = res.length
          ? res.map((r) => `<a class="drop-item" role="option" href="${VL.entryUrl(r.entry)}">
               <span class="sec-badge sec-${esc(r.entry.section)}">${esc(VL.sectionLabel(r.entry.section))}</span>
               <b>${VL.markTerms(r.entry.title, q)}</b><small>${VL.markTerms(r.snippet, q)}</small></a>`).join("") +
            `<a class="drop-all" href="buscar.html?q=${encodeURIComponent(q)}">${esc(t("seeAll"))} →</a>`
          : `<div class="drop-empty">${esc(t("noResults"))}</div>`;
        drop.hidden = false;
        active = -1;
      }, 120);
    });
    input.addEventListener("keydown", (e) => {
      const items = VL.$$("a", drop);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (drop.hidden || !items.length) return;
        e.preventDefault();
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle("is-active", i === active));
        items[active].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && active >= 0 && items[active]) {
        e.preventDefault(); location.href = items[active].href;
      } else if (e.key === "Escape") close();
    });
    form.addEventListener("submit", (e) => { if (!input.value.trim()) e.preventDefault(); });
    document.addEventListener("click", (e) => { if (!form.contains(e.target)) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        e.preventDefault(); input.focus();
      }
    });
  }

  function wireLang(frame) {
    VL.$$(".lang-btn", frame).forEach((b) => b.addEventListener("click", () => VL.setLang(b.dataset.lang)));
  }

  /* ---------- calendario de cuentas ---------- */
  function calendar(box, entries) {
    const byDate = {};
    entries.forEach((e) => { if (e.date) (byDate[e.date.slice(0, 10)] = byDate[e.date.slice(0, 10)] || []).push(e); });
    const now = new Date();
    let y = now.getFullYear(), m = now.getMonth();

    function render() {
      const months = t("months"), first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7; // lunes primero
      let cells = "";
      for (let i = 0; i < lead; i++) cells += `<span class="cal-empty"></span>`;
      for (let d = 1; d <= days; d++) {
        const key = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const list = byDate[key];
        const isToday = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
        cells += `<button type="button" class="cal-day ${list ? "has-entry" : ""} ${isToday ? "is-today" : ""}" data-key="${key}" aria-label="${d} ${months[m]}${list ? " · " + list.length + " " + t("entries") : ""}">${String(d).padStart(2, "0")}</button>`;
      }
      box.innerHTML = `
        <div class="cal-head">
          <button type="button" class="cal-nav" data-dir="-1" aria-label="${esc(t("prev"))}">‹</button>
          <button type="button" class="cal-month" title="${esc(t("today"))}">${esc(months[m])} <small>${y}</small></button>
          <button type="button" class="cal-nav" data-dir="1" aria-label="${esc(t("next"))}">›</button>
        </div>
        <div class="cal-card">
          <div class="cal-week">${t("weekdays").map((w) => `<span>${esc(w)}</span>`).join("")}</div>
          <div class="cal-grid">${cells}</div>
        </div>
        <div class="cal-pop" hidden></div>`;
    }
    render();

    box.addEventListener("click", (e) => {
      const nav = e.target.closest(".cal-nav");
      if (nav) { m += +nav.dataset.dir; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } render(); return; }
      if (e.target.closest(".cal-month")) { y = now.getFullYear(); m = now.getMonth(); render(); return; }
      const bead = e.target.closest(".cal-day");
      if (!bead) return;
      const pop = VL.$(".cal-pop", box), list = byDate[bead.dataset.key];
      VL.$$(".cal-day.is-picked", box).forEach((b) => b.classList.remove("is-picked"));
      bead.classList.add("is-picked");
      pop.innerHTML = `<b>${esc(VL.fmtDate(bead.dataset.key))}</b>` + (list
        ? list.map((en) => `<a href="${VL.entryUrl(en)}"><span class="sec-badge sec-${esc(en.section)}">${esc(VL.sectionLabel(en.section))}</span> ${esc(en.title)}</a>`).join("")
        : `<span class="muted">${esc(t("calendarEmpty"))}</span>`);
      pop.hidden = false;
      if (list) VL.burst(e.clientX, e.clientY, ["✿", "♡", "✦"]);
    });
  }

  function topicCounts(frame, entries) {
    VL.$$(".topic-count", frame).forEach((b) => {
      const tag = VL.norm(b.dataset.tag);
      const n = entries.filter((e) => (e.tags || []).some((x) => VL.norm(x) === tag)).length;
      if (n) b.textContent = n;
    });
  }

  /* ---------- herramientas del footer ---------- */
  function wireTools(frame) {
    VL.$("#vl-random", frame).addEventListener("click", async (e) => {
      e.preventDefault();
      const all = await VL.loadIndex();
      if (all.length) location.href = VL.entryUrl(all[Math.floor(Math.random() * all.length)]);
    });
    const n = VL.store.get("visits", 0) + 1;
    VL.store.set("visits", n);
    VL.$("#vl-counter", frame).textContent = String(n).padStart(6, "0");
  }

  function spawn(x, y, ch, kind) {
    const s = document.createElement("span");
    s.className = "fx fx-" + kind;
    s.textContent = ch;
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.setProperty("--c", ["#ff99c9", "#e4c1f9", "#bfd4f2", "#d7fbcb", "#fcf5bf", "#f99dce"][Math.floor(Math.random() * 6)]);
    s.style.setProperty("--dx", (Math.random() * 2 - 1) * 60 + "px");
    s.style.setProperty("--dy", (-40 - Math.random() * 70) + "px");
    s.style.setProperty("--rot", (Math.random() * 2 - 1) * 180 + "deg");
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
  VL.burst = (x, y, chars, n = 8) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < n; i++) spawn(x, y, chars[i % chars.length], "burst");
  };

  /* ---------- foto de perfil sincronizada con GitHub ----------
     Si profileImage es "github", se usa tu avatar de https://github.com/<usuario>.png.
     Se vuelve a pedir cada pocos minutos (y al volver a la pestaña), así que cuando
     cambias tu foto en GitHub la página la actualiza sola. */
  function githubAvatar(frame) {
    const img = VL.$("#vl-avatar", frame), live = VL.$("#vl-avatar-live", frame);
    const fallback = "assets/img/perfil.svg";
    const src = C.profileImage;
    if (src && src !== "github") {
      img.onerror = () => { img.onerror = null; img.src = fallback; };
      img.src = src;
      return;
    }
    const user = encodeURIComponent(C.githubUser);
    const every = (C.avatarRefreshMinutes || 5) * 60000;
    function load() {
      // el parámetro "v" cambia cada intervalo para saltarse la caché del navegador
      const url = `https://github.com/${user}.png?size=400&v=${Math.floor(Date.now() / every)}`;
      const probe = new Image();
      probe.onload = () => {
        if (img.src !== probe.src) {
          img.src = probe.src;
          img.classList.remove("is-fresh"); void img.offsetWidth; img.classList.add("is-fresh");
        }
        img.alt = `foto de perfil de ${C.githubUser} en GitHub`;
        live.hidden = false;
      };
      probe.onerror = () => { live.hidden = true; };
      probe.src = url;
    }
    load();
    setInterval(load, every);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
