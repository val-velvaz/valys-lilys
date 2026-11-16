/* ✿ valy's lilys — configuración del sitio ✿
   Edita este archivo para cambiar enlaces, temas y versión. */
window.VL_CONFIG = {
  siteName: "valy's lilys",
  version: "0.1.0",
  defaultLang: "es",

  // Foto de perfil:
  //  - "github" → usa tu avatar de GitHub (githubUser) y se actualiza solo cuando lo cambias.
  //  - o una ruta propia, p. ej. "assets/img/perfil.png".
  // Si no se puede cargar, se muestra la lila de assets/img/perfil.svg.
  profileImage: "github",
  avatarRefreshMinutes: 5,

  // Usuario de GitHub para el widget (repos públicos vía https://api.github.com)
  githubUser: "val-velvaz",
  githubRepo: "valys-lilys",

  media: {
    github: "https://github.com/val-velvaz",
    linkedin: "https://www.linkedin.com/",
    youtube: "https://www.youtube.com/"
  },

  // Botones de arriba (debajo del banner)
  topButtons: [
    { key: "math", href: "math.html", flavor: "pink" },
    { key: "cs", href: "cs.html", flavor: "mint" },
    { key: "more", href: "more.html", flavor: "pink" },
    { key: "about", href: "about.html", flavor: "mint" }
  ],

  // Pila de macarons (navegación izquierda)
  macarons: [
    { key: "games", href: "games.html", flavor: "pink" },
    { key: "projects", href: "projects.html", flavor: "mint" },
    { key: "challenges", href: "challenges.html", flavor: "green" },
    { key: "portfolio", href: "portfolio.html", flavor: "butter" },
    { key: "blog", href: "blog.html", flavor: "rose" },
    { key: "ide", href: "ide.html", flavor: "pink" }
  ],

  // Temas (navegación derecha). "tag" debe coincidir con los tags del front matter.
  topics: [
    { tag: "python", label: "python", color: "pink", treat: "cookie" },
    { tag: "c++", label: "c++", color: "lilac", treat: "cookie" },
    { tag: "databases", label: "databases", color: "yellow", treat: "lemon" },
    { tag: "ai", label: "ai", color: "green", treat: "donut" },
    { tag: "algorithms", label: "algorithms", color: "pink", treat: "chip" },
    { tag: "datastructures", label: "datastructures", color: "lilac", treat: "cookie" },
    { tag: "datascience", label: "datascience", color: "yellow", treat: "lemon" },
    { tag: "r", label: "R", color: "green", treat: "donut" },
    { tag: "computer-architecture", label: "computer arquitecture", color: "blue", treat: "chip" }
  ],

  // Secciones: cada una tiene su propia página y su carpeta en content/<id>/
  sections: {
    math: { page: "math.html", color: "pink", icon: "∑" },
    cs: { page: "cs.html", color: "mint", icon: "</>" },
    games: { page: "games.html", color: "lilac", icon: "🎮" },
    projects: { page: "projects.html", color: "blue", icon: "✂" },
    challenges: { page: "challenges.html", color: "green", icon: "★" },
    portfolio: { page: "portfolio.html", color: "yellow", icon: "✿" },
    blog: { page: "blog.html", color: "rose", icon: "✎" },
    more: { page: "more.html", color: "peach", icon: "+" },
    about: { page: "about.html", color: "mint", icon: "♡" }
  }
};
