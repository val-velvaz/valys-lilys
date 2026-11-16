/* ✿ marco compartido: encaje, chorreado, navbar con búsqueda, banner, perfil,
   botones, calendario, macarons, temas, footer "media" y efectos ✿ */
(function () {
  const VL = window.VL, C = VL.config, t = VL.t, esc = VL.esc;
  VL.slots = {};

  /* ---------- fondo de página (texturas de rayas recreadas en CSS) ---------- */
  const BGS = ["dots", "candy", "lila", "azul", "aqua", "menta", "salvia", "crema"];
  VL.setBg = (bg) => { document.documentElement.dataset.bg = bg; VL.store.set("bg", bg); };
  VL.setBg(VL.store.get("bg", "dots"));

  /* ---------- piezas ---------- */
  const beads = (word, cls = "") =>
    `<span class="beads ${cls}" aria-hidden="true">${[...word].map((ch, i) => `<span class="bead bead-c${i % 5}" style="--i:${i}">${esc(ch)}</span>`).join("")}</span>`;

  function dripPath(W, H, drips) {
    let d = `M0,0 L0,${H} `;
    drips.forEach(({ x, w, l }) => {
      d += `L${x - w - 10},${H} Q${x - w},${H} ${x - w},${H + 10} L${x - w},${H + l - w} C${x - w},${H + l + w * 0.5} ${x + w},${H + l + w * 0.5} ${x + w},${H + l - w} L${x + w},${H + 10} Q${x + w},${H} ${x + w + 10},${H} `;
    });
    return d + `L${W},${H} L${W},0 Z`;
  }
  const dripsTop = dripPath(1000, 26, [
    { x: 60, w: 16, l: 120 }, { x: 170, w: 10, l: 46 }, { x: 255, w: 13, l: 80 }, { x: 420, w: 9, l: 34 },
    { x: 560, w: 12, l: 66 }, { x: 690, w: 15, l: 105 }, { x: 800, w: 9, l: 40 }, { x: 905, w: 14, l: 92 }
  ]);

  const icons = {
    github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="5" fill="currentColor"/><rect x="5" y="9.5" width="3" height="9" rx="1" fill="#fff"/><circle cx="6.5" cy="6.3" r="1.8" fill="#fff"/><path d="M10.5 9.5h2.8v1.3c.5-.9 1.6-1.5 2.9-1.5 2.3 0 3.3 1.4 3.3 3.9v5.3h-3v-4.8c0-1.1-.4-1.8-1.4-1.8s-1.6.7-1.6 1.8v4.8h-3z" fill="#fff"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="5" fill="currentColor"/><path d="M10 8.5v7l6-3.5z" fill="#fff"/></svg>'
  };

  /* ---------- montaje ---------- */
  function build() {
    const page = document.body.dataset.page || "";
    const section = document.body.dataset.section || "";
    const main = document.getElementById("main");
    const here = location.pathname.split("/").pop() || "index.html";

    const frame = VL.el(`
<div class="frame">
  <div class="lace-top" aria-hidden="true"></div>
  <svg class="drips" viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="dripG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5d2f0"/><stop offset="1" stop-color="#f6b9db"/></linearGradient></defs>
    <path d="${dripsTop}" fill="url(#dripG)"/>
    <path d="${dripsTop}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" transform="translate(-3,-4)"/>
  </svg>
  <div class="drip-side" aria-hidden="true"></div>

  <header class="navbar">
    <a class="mini-logo" href="index.html" aria-label="${esc(C.siteName)} — inicio">
      <span class="mini-tape">${beads("VALYS", "beads-mini")}</span>
      <span class="mini-tape mini-tape-2">${beads("LILYS", "beads-mini")}</span>
    </a>
    <form class="search-pill" action="buscar.html" role="search" autocomplete="off">
      <label class="sr-only" for="vl-q">${esc(t("search"))}</label>
      <input id="vl-q" name="q" type="search" placeholder="${esc(t("search"))}" value="${esc(VL.param("q") || "")}">
      <button class="search-go" type="submit" aria-label="buscar">✦</button>
      <div class="search-drop" role="listbox" hidden></div>
    </form>
    <div class="lang-tiles" role="group" aria-label="idioma">
      ${["en", "es", "de"].map((l, i) => `<button type="button" class="lang-tile ${l === VL.lang ? "is-on" : ""}" style="--r:${[-8, 4, -3][i]}deg" data-lang="${l}">${l.toUpperCase()}</button>`).join("")}
    </div>
  </header>

  <section class="hero">
    <div class="banner">
      <div class="glitter glitter-l" aria-hidden="true"></div>
      <div class="glitter glitter-r" aria-hidden="true"></div>
      <a class="bead-title" href="index.html" aria-label="${esc(C.siteName)}">
        <span class="tape tape-a">${beads("VALYS")}</span>
        <span class="tape tape-b">${beads("LILYS")}<span class="black-beads" aria-hidden="true">${"<i></i>".repeat(14)}</span></span>
      </a>
      <div class="banner-sparkles" aria-hidden="true"></div>
    </div>
    <a class="profile" href="about.html" aria-label="about me">
      <span class="profile-ring" aria-hidden="true"></span>
      <img id="vl-avatar" src="assets/img/perfil.svg" alt="foto de perfil">
      <span class="avatar-live" id="vl-avatar-live" hidden title="sincronizada con GitHub">● live</span>
      <span class="orn orn-t" aria-hidden="true"></span><span class="orn orn-b" aria-hidden="true"></span>
      <span class="orn orn-l" aria-hidden="true"></span><span class="orn orn-r" aria-hidden="true"></span>
    </a>
    <nav class="top-buttons" aria-label="secciones principales">
      ${C.topButtons.map((b) => `<a class="top-btn ${b.key === "about" ? "top-btn-tile" : ""} ${here === b.href ? "is-here" : ""}" href="${b.href}"><span class="mac-dot mac-dot-${b.flavor}" aria-hidden="true"></span><span>${esc(t(b.key))}</span></a>`).join("")}
    </nav>
  </section>

  <div class="cols">
    <div class="swirl" aria-hidden="true"><div class="swirl-spin"></div></div>
    <aside class="col-left">
      <div class="calendar" id="vl-calendar"></div>
      <div class="slot" id="slot-left"></div>
      <nav class="macaron-stack" aria-label="más secciones">
        ${C.macarons.map((m, i) => `
        <a class="macaron mac-${m.flavor} ${here === m.href ? "is-here" : ""}" href="${m.href}" style="--d:${i}">
          <span class="mac-shell mac-top" aria-hidden="true"></span>
          <span class="mac-cream" aria-hidden="true"></span>
          <span class="mac-shell mac-bottom" aria-hidden="true"></span>
          <span class="mac-label">${esc(t(m.key))}</span>
        </a>`).join("")}
      </nav>
    </aside>
    <div class="col-main" id="col-main"></div>
    <aside class="col-right">
      <div class="slot" id="slot-right"></div>
      <nav class="topics" aria-label="${esc(t("topic"))}">
        ${C.topics.map((tp, i) => `
        <a class="topic topic-${tp.color}" href="tema.html?t=${encodeURIComponent(tp.tag)}" style="--d:${i}">
          <span class="treat treat-${tp.treat}" aria-hidden="true"></span>
          <span class="topic-pill">${esc(tp.label)}<b class="topic-count" data-tag="${esc(tp.tag)}"></b></span>
        </a>`).join("")}
      </nav>
      <div class="upgrade" title="${esc(t("lastUpgrade"))}">
        <span class="scoop scoop-a" aria-hidden="true"></span><span class="scoop scoop-b" aria-hidden="true"></span>
        <div class="donut-big"><div class="donut-hole"><span>&lt;${esc(t("lastUpgrade"))}&gt;</span><b>v${esc(C.version)}</b><small id="vl-upgrade-date"></small></div></div>
      </div>
    </aside>
  </div>

  <footer class="media">
    <h2 class="media-title">${esc(t("media"))}</h2>
    <div class="media-band">
      <span class="icecream" aria-hidden="true"><i></i></span>
      <button class="heart heart-s" type="button" aria-label="♡"></button>
      <div class="media-links">
        <a class="media-btn" href="${esc(C.media.github)}" target="_blank" rel="noopener">${icons.github}<span>GITHUB</span></a>
        <a class="media-btn" href="${esc(C.media.linkedin)}" target="_blank" rel="noopener">${icons.linkedin}<span>LINKEDIN</span></a>
        <a class="media-btn" href="${esc(C.media.youtube)}" target="_blank" rel="noopener">${icons.youtube}<span>YOUTUBE</span></a>
      </div>
      <button class="heart heart-l" type="button" aria-label="♡"></button>
    </div>
  </footer>

  <div class="site-tools">
    <div class="bg-swatches" role="group" aria-label="${esc(t("theme"))}">
      <span class="tools-label">${esc(t("theme"))}:</span>
      ${BGS.map((b) => `<button type="button" class="swatch sw-${b}" data-bg="${b}" title="${b}" aria-label="${b}"></button>`).join("")}
    </div>
    <label class="tool-toggle"><input type="checkbox" id="vl-sparkles"> ${esc(t("sparkles"))} ✦</label>
    <a class="tool-link" href="#" id="vl-random">🎲 ${esc(t("random"))}</a>
    <a class="tool-link" href="subrayados.html">✎ ${esc(t("highlights"))}</a>
    <span class="counter" title="visitas desde este navegador"><span id="vl-counter"></span></span>
    <span class="copy">© ${new Date().getFullYear()} ${esc(C.siteName)} · hecho con ♡, html y css</span>
  </div>
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
    sparkleBanner(frame);
    githubAvatar(frame);
    VL.loadIndex().then((entries) => {
      calendar(VL.$("#vl-calendar", frame), entries);
      topicCounts(frame, entries);
      if (entries[0]) VL.$("#vl-upgrade-date", frame).textContent = VL.fmtDate(entries[0].date);
      if (VL.indexFailed) colMain.prepend(VL.el(`<div class="paper notice">⚠ ${esc(t("indexError"))}</div>`));
    });
    document.body.classList.add("is-ready");
  }

  /* ---------- búsqueda (en todas las páginas) ---------- */
  function wireSearch(frame) {
    const form = VL.$(".search-pill", frame), input = VL.$("input", form), drop = VL.$(".search-drop", form);
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
    VL.$$(".lang-tile", frame).forEach((b) => b.addEventListener("click", () => VL.setLang(b.dataset.lang)));
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
        cells += `<button type="button" class="cal-bead bead-c${(d * 7) % 5} ${list ? "has-entry" : ""} ${isToday ? "is-today" : ""}" data-key="${key}" aria-label="${d} ${months[m]}${list ? " · " + list.length + " " + t("entries") : ""}">${String(d).padStart(2, "0")}</button>`;
      }
      box.innerHTML = `
        <div class="cal-head">
          <button type="button" class="cal-nav" data-dir="-1" aria-label="${esc(t("prev"))}">‹</button>
          <button type="button" class="cal-month" title="${esc(t("today"))}">${esc(months[m])} <small>${y}</small></button>
          <button type="button" class="cal-nav" data-dir="1" aria-label="${esc(t("next"))}">›</button>
        </div>
        <div class="cal-card">
          <span class="cal-spiral" aria-hidden="true"></span>
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
      const bead = e.target.closest(".cal-bead");
      if (!bead) return;
      const pop = VL.$(".cal-pop", box), list = byDate[bead.dataset.key];
      VL.$$(".cal-bead.is-picked", box).forEach((b) => b.classList.remove("is-picked"));
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

  /* ---------- herramientas, brillitos y contador ---------- */
  function wireTools(frame) {
    VL.$$(".swatch", frame).forEach((s) => {
      s.classList.toggle("is-on", s.dataset.bg === document.documentElement.dataset.bg);
      s.addEventListener("click", () => {
        VL.setBg(s.dataset.bg);
        VL.$$(".swatch", frame).forEach((x) => x.classList.toggle("is-on", x === s));
      });
    });

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sp = VL.$("#vl-sparkles", frame);
    sp.checked = VL.store.get("sparkles", !reduce);
    sp.addEventListener("change", () => VL.store.set("sparkles", sp.checked));
    let last = 0;
    document.addEventListener("pointermove", (e) => {
      if (!sp.checked || e.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      spawn(e.clientX, e.clientY, ["✦", "✧", "·", "♡"][Math.floor(Math.random() * 4)], "trail");
    });

    VL.$("#vl-random", frame).addEventListener("click", async (e) => {
      e.preventDefault();
      const all = await VL.loadIndex();
      if (all.length) location.href = VL.entryUrl(all[Math.floor(Math.random() * all.length)]);
    });

    const n = VL.store.get("visits", 0) + 1;
    VL.store.set("visits", n);
    VL.$("#vl-counter", frame).innerHTML = String(n).padStart(6, "0").split("").map((d) => `<i>${d}</i>`).join("");

    VL.$$(".heart", frame).forEach((h) => h.addEventListener("click", (e) => {
      h.classList.remove("is-pop"); void h.offsetWidth; h.classList.add("is-pop");
      VL.burst(e.clientX, e.clientY, ["♡", "❤", "♥", "✿"], 12);
    }));
    VL.$$(".bead-title .bead", frame).forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      const n = (+(b.dataset.c || 0) + 1) % 5;
      b.dataset.c = n;
      b.className = b.className.replace(/bead-c\d/, "bead-c" + n);
      b.classList.remove("is-spin"); void b.offsetWidth; b.classList.add("is-spin");
    }));
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

  function sparkleBanner(frame) {
    const box = VL.$(".banner-sparkles", frame);
    for (let i = 0; i < 16; i++) {
      const s = document.createElement("i");
      s.textContent = ["✦", "✧", "❀", "✿"][i % 4];
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 3 + "s";
      s.style.fontSize = 8 + Math.random() * 10 + "px";
      box.appendChild(s);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
