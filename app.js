const API_BASE = "https://fapreski-api.princewillobongha.workers.dev";
/* =========================
   SUPABASE AUTH + TRANSLATIONS
========================= */
const supabaseUrl = window.FAPRESKI_SUPABASE_URL || "";
const supabaseKey = window.FAPRESKI_SUPABASE_KEY || "";
const supabaseClient = window.supabase && supabaseUrl && supabaseKey
  ? window.supabase.createClient(supabaseUrl, supabaseKey)
  : null;
let pendingTrial = false;

const translations = {
  en:{navHome:"Home",navNew:"New Releases",navCategories:"Categories",navMyList:"My List",navMessages:"Messages",signIn:"Sign in",trial:"Start 7-Day Trial",searchPlaceholder:"Search movies...",heroEyebrow:"FAPRESKI ORIGINAL EXPERIENCE",heroTitle:"Movies at Your Fingertips.",heroDesc:"Discover movies, stream in HD, save your favourites, and enjoy subtitles in your preferred language.",watchNow:"▶ Watch Now",myList:"＋ My List",aboutEyebrow:"ABOUT FAPRESKI",aboutTitle:"Movies, Entertainment & More",discover:"DISCOVER",newReleases:"New Releases",seeAll:"See all →",explore:"EXPLORE",categories:"Browse by Category",forYou:"FOR YOU",trending:"Trending Now",yourSpace:"YOUR SPACE",messages:"Messages",community:"COMMUNITY",membership:"MEMBERSHIP",trialHeading:"Start watching with a 7-day free trial.",help:"Help",feedback:"Feedback",report:"Report",privacy:"Privacy",createProfile:"Create Profile",openMessages:"Open Messages",hd:"HD",subtitles:"Subtitles",global:"Global"},
  fr:{navHome:"Accueil",navNew:"Nouveautés",navCategories:"Catégories",navMyList:"Ma liste",navMessages:"Messages",signIn:"Se connecter",trial:"Essai gratuit de 7 jours",searchPlaceholder:"Rechercher des films...",heroEyebrow:"EXPÉRIENCE ORIGINALE FAPRESKI",heroTitle:"Les films au bout des doigts.",heroDesc:"Découvrez des films, regardez-les en HD, enregistrez vos favoris et profitez des sous-titres.",watchNow:"▶ Regarder",myList:"＋ Ma liste",aboutEyebrow:"À PROPOS DE FAPRESKI",aboutTitle:"Films, divertissement et plus",discover:"DÉCOUVRIR",newReleases:"Nouveautés",seeAll:"Tout voir →",explore:"EXPLORER",categories:"Parcourir par catégorie",forYou:"POUR VOUS",trending:"Tendances",yourSpace:"VOTRE ESPACE",messages:"Messages",community:"COMMUNAUTÉ",membership:"ABONNEMENT",trialHeading:"Commencez avec un essai gratuit de 7 jours.",help:"Aide",feedback:"Commentaires",report:"Signaler",privacy:"Confidentialité",createProfile:"Créer un profil",openMessages:"Ouvrir les messages",hd:"HD",subtitles:"Sous-titres",global:"Global"},
  es:{navHome:"Inicio",navNew:"Nuevos estrenos",navCategories:"Categorías",navMyList:"Mi lista",navMessages:"Mensajes",signIn:"Iniciar sesión",trial:"Prueba gratis de 7 días",searchPlaceholder:"Buscar películas...",heroEyebrow:"EXPERIENCIA ORIGINAL FAPRESKI",heroTitle:"Películas al alcance de tu mano.",heroDesc:"Descubre películas, disfruta en HD, guarda tus favoritas y usa subtítulos.",watchNow:"▶ Ver ahora",myList:"＋ Mi lista",aboutEyebrow:"SOBRE FAPRESKI",aboutTitle:"Películas, entretenimiento y más",discover:"DESCUBRIR",newReleases:"Nuevos estrenos",seeAll:"Ver todo →",explore:"EXPLORAR",categories:"Explorar por categoría",forYou:"PARA TI",trending:"Tendencias",yourSpace:"TU ESPACIO",messages:"Mensajes",community:"COMUNIDAD",membership:"MEMBRESÍA",trialHeading:"Empieza con una prueba gratis de 7 días.",help:"Ayuda",feedback:"Comentarios",report:"Reportar",privacy:"Privacidad",createProfile:"Crear perfil",openMessages:"Abrir mensajes",hd:"HD",subtitles:"Subtítulos",global:"Global"},
  pt:{navHome:"Início",navNew:"Lançamentos",navCategories:"Categorias",navMyList:"Minha lista",navMessages:"Mensagens",signIn:"Entrar",trial:"Teste grátis de 7 dias",searchPlaceholder:"Pesquisar filmes...",heroEyebrow:"EXPERIÊNCIA ORIGINAL FAPRESKI",heroTitle:"Filmes ao seu alcance.",heroDesc:"Descubra filmes, assista em HD, salve favoritos e aproveite legendas.",watchNow:"▶ Assistir agora",myList:"＋ Minha lista",aboutEyebrow:"SOBRE A FAPRESKI",aboutTitle:"Filmes, entretenimento e mais",discover:"DESCOBRIR",newReleases:"Lançamentos",seeAll:"Ver tudo →",explore:"EXPLORAR",categories:"Explorar por categoria",forYou:"PARA VOCÊ",trending:"Em alta",yourSpace:"SEU ESPAÇO",messages:"Mensagens",community:"COMUNIDADE",membership:"ASSINATURA",trialHeading:"Comece com um teste grátis de 7 dias.",help:"Ajuda",feedback:"Feedback",report:"Denunciar",privacy:"Privacidade",createProfile:"Criar perfil",openMessages:"Abrir mensagens",hd:"HD",subtitles:"Legendas",global:"Global"},
  ar:{navHome:"الرئيسية",navNew:"إصدارات جديدة",navCategories:"الفئات",navMyList:"قائمتي",navMessages:"الرسائل",signIn:"تسجيل الدخول",trial:"تجربة مجانية 7 أيام",searchPlaceholder:"ابحث عن أفلام...",heroEyebrow:"تجربة FAPRESKI الأصلية",heroTitle:"الأفلام في متناول يدك.",heroDesc:"اكتشف الأفلام وشاهدها بجودة HD واحفظ المفضلة واستمتع بالترجمة.",watchNow:"▶ شاهد الآن",myList:"＋ قائمتي",aboutEyebrow:"عن FAPRESKI",aboutTitle:"الأفلام والترفيه والمزيد",discover:"اكتشف",newReleases:"إصدارات جديدة",seeAll:"عرض الكل →",explore:"استكشف",categories:"تصفح حسب الفئة",forYou:"لك",trending:"الأكثر رواجًا",yourSpace:"مساحتك",messages:"الرسائل",community:"المجتمع",membership:"العضوية",trialHeading:"ابدأ تجربة مجانية لمدة 7 أيام.",help:"مساعدة",feedback:"ملاحظات",report:"إبلاغ",privacy:"الخصوصية",createProfile:"إنشاء ملف شخصي",openMessages:"فتح الرسائل",hd:"HD",subtitles:"ترجمة",global:"عالمي"},
  de:{navHome:"Startseite",navNew:"Neuerscheinungen",navCategories:"Kategorien",navMyList:"Meine Liste",navMessages:"Nachrichten",signIn:"Anmelden",trial:"7 Tage kostenlos testen",searchPlaceholder:"Filme suchen...",heroEyebrow:"FAPRESKI ORIGINAL-ERLEBNIS",heroTitle:"Filme immer griffbereit.",heroDesc:"Entdecke Filme, streame in HD, speichere Favoriten und nutze Untertitel.",watchNow:"▶ Jetzt ansehen",myList:"＋ Meine Liste",aboutEyebrow:"ÜBER FAPRESKI",aboutTitle:"Filme, Unterhaltung & mehr",discover:"ENTDECKEN",newReleases:"Neuerscheinungen",seeAll:"Alle ansehen →",explore:"ERKUNDEN",categories:"Nach Kategorie stöbern",forYou:"FÜR DICH",trending:"Jetzt im Trend",yourSpace:"DEIN BEREICH",messages:"Nachrichten",community:"COMMUNITY",membership:"MITGLIEDSCHAFT",trialHeading:"Starte mit einer 7-tägigen kostenlosen Testphase.",help:"Hilfe",feedback:"Feedback",report:"Melden",privacy:"Datenschutz",createProfile:"Profil erstellen",openMessages:"Nachrichten öffnen",hd:"HD",subtitles:"Untertitel",global:"Global"},
  it:{navHome:"Home",navNew:"Nuove uscite",navCategories:"Categorie",navMyList:"La mia lista",navMessages:"Messaggi",signIn:"Accedi",trial:"Prova gratuita di 7 giorni",searchPlaceholder:"Cerca film...",heroEyebrow:"ESPERIENZA ORIGINALE FAPRESKI",heroTitle:"Film sempre a portata di mano.",heroDesc:"Scopri film, guarda in HD, salva i preferiti e usa i sottotitoli.",watchNow:"▶ Guarda ora",myList:"＋ La mia lista",aboutEyebrow:"SU FAPRESKI",aboutTitle:"Film, intrattenimento e altro",discover:"SCOPRI",newReleases:"Nuove uscite",seeAll:"Vedi tutto →",explore:"ESPLORA",categories:"Sfoglia per categoria",forYou:"PER TE",trending:"Di tendenza",yourSpace:"IL TUO SPAZIO",messages:"Messaggi",community:"COMMUNITY",membership:"ABBONAMENTO",trialHeading:"Inizia con una prova gratuita di 7 giorni.",help:"Aiuto",feedback:"Feedback",report:"Segnala",privacy:"Privacy",createProfile:"Crea profilo",openMessages:"Apri messaggi",hd:"HD",subtitles:"Sottotitoli",global:"Globale"},
  zh:{navHome:"首页",navNew:"新片",navCategories:"分类",navMyList:"我的片单",navMessages:"消息",signIn:"登录",trial:"7天免费试用",searchPlaceholder:"搜索电影...",heroEyebrow:"FAPRESKI 原创体验",heroTitle:"电影触手可及。",heroDesc:"发现电影、高清观看、保存收藏，并使用字幕。",watchNow:"▶ 立即观看",myList:"＋ 我的片单",aboutEyebrow:"关于 FAPRESKI",aboutTitle:"电影、娱乐及更多",discover:"发现",newReleases:"新片",seeAll:"查看全部 →",explore:"探索",categories:"按类别浏览",forYou:"为你推荐",trending:"热门影片",yourSpace:"你的空间",messages:"消息",community:"社区",membership:"会员",trialHeading:"开始7天免费试用。",help:"帮助",feedback:"反馈",report:"举报",privacy:"隐私",createProfile:"创建个人资料",openMessages:"打开消息",hd:"高清",subtitles:"字幕",global:"全球"}
};
function t(key){return (translations[currentLanguage]||translations.en)[key]||translations.en[key]||key;}
function updateLanguageButtons(){
  const label=currentLanguage==="zh"?"中文":currentLanguage.toUpperCase();
  [document.getElementById("languageBtn"),document.getElementById("mobileLanguageBtn")].forEach(b=>{if(b)b.textContent=label+" ▾";});
  document.querySelectorAll("[data-language]").forEach(b=>b.classList.toggle("active",b.dataset.language===currentLanguage));
}
function applyTranslations(){
  document.documentElement.lang=currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
  const set=(sel,key)=>{const el=document.querySelector(sel);if(el)el.textContent=t(key);};
  set("#home .eyebrow","heroEyebrow");set("#home h1","heroTitle");set("#home>div>p","heroDesc");set("[data-watch='0']","watchNow");set("#heroList","myList");
  set("#about .eyebrow","aboutEyebrow");set("#about h2","aboutTitle");set("#new .eyebrow","discover");set("#new h2","newReleases");set("#seeMoreBtn","seeAll");
  set("#categories .eyebrow","explore");set("#categories h2","categories");set("#trending .eyebrow","forYou");set("#trending h2","trending");
  set("#mylist .eyebrow","yourSpace");set("#mylist h2","myList");set("#profileBtn","createProfile");set("#messages .eyebrow","community");set("#messages h2","messages");set("#messageBtn","openMessages");
  set(".pricing .eyebrow","membership");set(".pricing h2","trialHeading");
  document.querySelectorAll(".hero-meta span").forEach((el,i)=>{if(i===0)el.textContent=t("hd");if(i===1)el.textContent=t("subtitles");if(i===2)el.textContent=t("global");});
  document.querySelectorAll(".footer-links a").forEach((el,i)=>el.textContent=t(["help","feedback","report","privacy"][i]));
  updateLanguageButtons();
}


let currentLanguage =
  localStorage.getItem("fapreskiLanguage") || "en";

let movies = [];

const fallbackMovies = [
  {
    title: "Midnight Horizon",
    genre: "Action • Thriller",
    year: "2026",
    rating: "8.4",
    desc: "A FAPRESKI demo movie.",
    tag: "NEW"
  },
  {
    title: "The Last Signal",
    genre: "Sci-Fi • Mystery",
    year: "2026",
    rating: "8.7",
    desc: "A futuristic FAPRESKI demo title.",
    tag: "NEW"
  },
  {
    title: "Whisper in the Dark",
    genre: "Horror • Mystery",
    year: "2026",
    rating: "8.3",
    desc: "A horror demo title for FAPRESKI.",
    tag: "HORROR"
  }
];

const newGrid = document.getElementById("new-grid");
const trendingGrid = document.getElementById("trending-grid");
const modal = document.getElementById("movieModal");
const player = document.getElementById("player");
const titleEl = document.getElementById("modalTitle");
const descEl = document.getElementById("modalDescription");
const genreEl = document.getElementById("modalGenre");
const metaEl = document.getElementById("modalMeta");
const toast = document.getElementById("toast");

/* =========================
   HELPERS
========================= */

function posterUrl(path) {
  return path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));
}

function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/* =========================
   TMDB MOVIE CONVERTER
========================= */

function convertMovie(movie, tag = "") {
  return {
    id: movie.id,
    title: movie.title || movie.name || "Untitled",

    genre: movie.genre_names?.length
      ? movie.genre_names.join(" • ")
      : "Movie",

    year:
      (
        movie.release_date ||
        movie.first_air_date ||
        ""
      ).substring(0, 4) || "—",

    rating: Number(
      movie.vote_average || 0
    ).toFixed(1),

    desc:
      movie.overview ||
      "No description available.",

    poster:
      posterUrl(movie.poster_path),

    backdrop:
      posterUrl(movie.backdrop_path),

    tag,

    /* Will be filled when a free version is found */
    freeVideo: null,
    freePoster: null,
    freeSource: null,
    freeLicense: null,
    freeRights: null
  };
}

/* =========================
   MOVIE CARD
========================= */

function card(movie, index) {
  const background = movie.poster
    ? `style="background-image:linear-gradient(0deg,rgba(0,0,0,.85),rgba(0,0,0,.1)),url('${movie.poster}')"`
    : "";

  return `
    <article
      class="movie-card"
      data-watch="${index}"
      tabindex="0"
    >

      <div class="poster" ${background}>
        <span>
          ${escapeHtml(movie.tag || "MOVIE")}
        </span>
      </div>

      <div class="movie-body">
        <h3>
          ${escapeHtml(movie.title)}
        </h3>

        <p>
          ${escapeHtml(movie.genre)}
          • ${movie.rating} ★
        </p>
      </div>

    </article>
  `;
}

function renderNew(list) {
  if (!newGrid) return;

  newGrid.innerHTML = list
    .slice(0, 10)
    .map((movie, index) =>
      card(movie, index)
    )
    .join("");
}

function renderTrending(list) {
  if (!trendingGrid) return;

  trendingGrid.innerHTML = list
    .slice(0, 10)
    .map((movie, index) =>
      card(movie, index)
    )
    .join("");
}

/* =========================
   API
========================= */

async function api(endpoint) {
  const languageMap = {
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    pt: "pt-PT",
    ar: "ar-SA",
    de: "de-DE",
    it: "it-IT",
    zh: "zh-CN"
  };

  const tmdbLanguage =
    languageMap[currentLanguage] ||
    "en-US";

  /*
    Free-movie endpoints don't need
    the TMDB language parameter.
  */

  const isFreeEndpoint =
    endpoint.startsWith("/free-");

  const separator =
    endpoint.includes("?")
      ? "&"
      : "?";

  const finalEndpoint =
    isFreeEndpoint
      ? endpoint
      : `${endpoint}${separator}language=${encodeURIComponent(tmdbLanguage)}`;

  const response =
    await fetch(
      `${API_BASE}${finalEndpoint}`
    );

  if (!response.ok) {
    throw new Error(
      `API error: ${response.status}`
    );
  }

  return response.json();
}

/* =========================
   FIND FREE VERSION
========================= */

async function findFreeMovie(title) {
  try {
    const data =
      await api(
        `/free-search?q=${encodeURIComponent(title)}`
      );

    const results =
      data.results || [];

    if (!results.length) {
      return null;
    }

    const wanted =
      normalizeTitle(title);

    /*
      First try an exact title match.
    */
    let match =
      results.find(movie =>
        normalizeTitle(movie.title) === wanted
      );

    /*
      If there is no exact match,
      try a safe partial match.
    */
    if (!match) {
      match =
        results.find(movie => {
          const found =
            normalizeTitle(movie.title);

          return (
            found.includes(wanted) ||
            wanted.includes(found)
          );
        });
    }

    return match || null;

  } catch (error) {
    console.error(
      "Free movie search error:",
      error
    );

    return null;
  }
}

/* =========================
   LOAD CATALOGUE
========================= */

async function loadCatalogue() {
  try {

    const [
      upcomingData,
      trendingData
    ] = await Promise.all([
      api("/upcoming"),
      api("/trending")
    ]);

    const upcoming =
      (upcomingData.results || [])
        .map(movie =>
          convertMovie(
            movie,
            "NEW"
          )
        );

    const trending =
      (trendingData.results || [])
        .map(movie =>
          convertMovie(
            movie,
            "TRENDING"
          )
        );

    movies = [
      ...upcoming,
      ...trending
    ];

    if (!movies.length) {
      throw new Error(
        "No movies returned"
      );
    }

    renderNew(
      upcoming.length
        ? upcoming
        : trending
    );

    renderTrending(
      trending.length
        ? trending
        : upcoming
    );

  } catch (error) {

    console.error(
      "FAPRESKI API error:",
      error
    );

    movies = fallbackMovies;

    renderNew(
      fallbackMovies
    );

    renderTrending(
      fallbackMovies
    );

    notify(
      "Showing demo movies while the movie service loads."
    );
  }
}

/* =========================
   CATEGORIES
========================= */

async function loadCategory(category) {

  const endpointMap = {
    action: "/action",
    comedy: "/comedy",
    romance: "/romance",
    animation: "/animation",
    horror: "/horror",
    drama: "/drama",
    thriller: "/thriller",
    family: "/family",
    documentary: "/documentary",
    scifi: "/scifi",
    mystery: "/mystery"
  };

  const endpoint =
    endpointMap[category];

  if (!endpoint) return;

  try {

    notify(
      `Loading ${category} movies...`
    );

    const data =
      await api(endpoint);

    const results =
      (data.results || [])
        .map(movie =>
          convertMovie(
            movie,
            category.toUpperCase()
          )
        );

    if (!results.length) {

      notify(
        `No ${category} movies found.`
      );

      return;
    }

    movies = results;

    renderNew(results);

    if (trendingGrid) {
      trendingGrid.innerHTML = "";
    }

    const newTitle =
      document.querySelector(
        "#new h2"
      );

    if (newTitle) {

      newTitle.textContent =
        `${category.charAt(0).toUpperCase()}${category.slice(1)} Movies`;
    }

    document
      .getElementById("new")
      ?.scrollIntoView({
        behavior: "smooth"
      });

  } catch (error) {

    console.error(
      "Category error:",
      error
    );

    notify(
      `${category} movies could not be loaded.`
    );
  }
}

/* =========================
   SEARCH
========================= */

async function searchMovies(query) {

  const cleanQuery =
    query.trim();

  if (!cleanQuery) {

    notify(
      "Type a movie name first."
    );

    return;
  }

  try {

    notify(
      `Searching for "${cleanQuery}"...`
    );

    /*
      TMDB search gives us the normal
      movie information and posters.
    */

    const tmdbData =
      await api(
        `/search?q=${encodeURIComponent(cleanQuery)}`
      );

    let results =
      (tmdbData.results || [])
        .map(movie =>
          convertMovie(
            movie,
            "SEARCH"
          )
        );

    /*
      Also search Internet Archive
      for legally available versions.
    */

    let freeResults = [];

    try {

      const freeData =
        await api(
          `/free-search?q=${encodeURIComponent(cleanQuery)}`
        );

      freeResults =
        freeData.results || [];

    } catch (freeError) {

      console.error(
        "Free search error:",
        freeError
      );
    }

    /*
      Attach free playable versions
      to matching TMDB movies.
    */

    results =
      results.map(movie => {

        const wanted =
          normalizeTitle(
            movie.title
          );

        const freeMatch =
          freeResults.find(freeMovie => {

            const freeTitle =
              normalizeTitle(
                freeMovie.title
              );

            return (
              freeTitle === wanted ||
              freeTitle.includes(wanted) ||
              wanted.includes(freeTitle)
            );
          });

        if (freeMatch) {

          movie.freeVideo =
            freeMatch.video;

          movie.freePoster =
            freeMatch.poster;

          movie.freeSource =
            freeMatch.source;

          movie.freeLicense =
            freeMatch.license;

          movie.freeRights =
            freeMatch.rights;
        }

        return movie;
      });

    /*
      If Internet Archive has a movie
      that TMDB didn't return, add it
      as a free movie result.
    */

    const tmdbTitles =
      new Set(
        results.map(movie =>
          normalizeTitle(movie.title)
        )
      );

    for (const freeMovie of freeResults) {

      const normalized =
        normalizeTitle(
          freeMovie.title
        );

      if (
        normalized &&
        !tmdbTitles.has(normalized)
      ) {

        results.push({

          id:
            `archive-${freeMovie.id}`,

          title:
            freeMovie.title,

          genre:
            "Free Movie",

          year:
            freeMovie.year || "—",

          rating:
            "—",

          desc:
            freeMovie.description ||
            "Free movie available for legal viewing.",

          poster:
            freeMovie.poster || "",

          backdrop:
            freeMovie.poster || "",

          tag:
            "FREE",

          freeVideo:
            freeMovie.video,

          freePoster:
            freeMovie.poster,

          freeSource:
            freeMovie.source,

          freeLicense:
            freeMovie.license,

          freeRights:
            freeMovie.rights
        });
      }
    }

    movies = results;

    if (!results.length) {

      if (newGrid) {

        newGrid.innerHTML = `
          <p class="muted">
            No movies found for
            "${escapeHtml(cleanQuery)}".
          </p>
        `;
      }

      if (trendingGrid) {
        trendingGrid.innerHTML = "";
      }

      const title =
        document.querySelector(
          "#new h2"
        );

      if (title) {
        title.textContent =
          "Search Results";
      }

      document
        .getElementById("new")
        ?.scrollIntoView({
          behavior: "smooth"
        });

      notify(
        "No movies found."
      );

      return;
    }

    renderNew(results);

    if (trendingGrid) {
      trendingGrid.innerHTML = "";
    }

    const title =
      document.querySelector(
        "#new h2"
      );

    if (title) {

      title.textContent =
        `Search Results for "${cleanQuery}"`;
    }

    document
      .getElementById("new")
      ?.scrollIntoView({
        behavior: "smooth"
      });

    notify(
      `${results.length} movies found.`
    );

  } catch (error) {

    console.error(
      "Search error:",
      error
    );

    notify(
      "Search is temporarily unavailable."
    );
  }
}

/* =========================
   MOVIE PLAYER
========================= */

async function showMovie(index) {

  const movie =
    movies[index];

  if (!movie) return;

  if (titleEl) {
    titleEl.textContent =
      movie.title;
  }

  if (descEl) {
    descEl.textContent =
      movie.desc;
  }

  if (genreEl) {

    genreEl.textContent =
      movie.genre.toUpperCase();
  }

  if (metaEl) {

    metaEl.innerHTML = `
      <span>${movie.year}</span>
      <span>${movie.rating} ★</span>
      <span>HD</span>
      <span>Subtitles</span>
    `;
  }

  modal?.classList.remove(
    "hidden"
  );

  /*
    If the movie already has a free
    playable video, use it immediately.
  */

  if (movie.freeVideo) {

    playFreeMovie(
      movie.freeVideo
    );

    return;
  }

  /*
    Otherwise search Internet Archive
    using the movie title.
  */

  notify(
    `Checking for a free legal version of "${movie.title}"...`
  );

  if (player) {

    player.pause();

    player.removeAttribute(
      "src"
    );

    player.load();
  }

  const freeMovie =
    await findFreeMovie(
      movie.title
    );

  if (
    freeMovie &&
    freeMovie.video
  ) {

    movie.freeVideo =
      freeMovie.video;

    movie.freePoster =
      freeMovie.poster;

    movie.freeSource =
      freeMovie.source;

    movie.freeLicense =
      freeMovie.license;

    movie.freeRights =
      freeMovie.rights;

    playFreeMovie(
      freeMovie.video
    );

    notify(
      "Free movie found. Playing now."
    );

  } else {

    notify(
      "A legal free playable version of this movie was not found."
    );
  }
}

/* =========================
   PLAY FREE MOVIE
========================= */

function playFreeMovie(videoUrl) {

  if (!player) return;

  player.src = videoUrl;

  player.load();

  player.play().catch(error => {

    console.error(
      "Video playback error:",
      error
    );

    notify(
      "The video could not start automatically. Press Play."
    );
  });
}

/* =========================
   CLOSE MOVIE
========================= */

function closeMovie() {

  if (player) {

    player.pause();

    player.removeAttribute(
      "src"
    );

    player.load();
  }

  modal?.classList.add(
    "hidden"
  );
}

/* =========================
   NOTIFICATIONS
========================= */

function notify(message) {

  if (!toast) return;

  toast.textContent =
    message;

  toast.classList.remove(
    "hidden"
  );

  setTimeout(() => {

    toast.classList.add(
      "hidden"
    );

  }, 3000);
}

/* =========================
   MOVIE CARD CLICK
========================= */

document.addEventListener(
  "click",
  event => {

    const movieCard =
      event.target.closest(
        "[data-watch]"
      );

    if (movieCard) {

      showMovie(
        Number(
          movieCard.dataset.watch
        )
      );
    }
  }
);

/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      document.activeElement?.dataset?.watch
    ) {

      showMovie(
        Number(
          document.activeElement.dataset.watch
        )
      );
    }

    if (
      event.key === "Escape"
    ) {

      closeMovie();

      document
        .getElementById(
          "profileModal"
        )
        ?.classList.add(
          "hidden"
        );

      document
        .getElementById(
          "messageModal"
        )
        ?.classList.add(
          "hidden"
        );
    }
  }
);

/* =========================
   CLOSE MOVIE BUTTON
========================= */

document
  .getElementById(
    "closeMovie"
  )
  ?.addEventListener(
    "click",
    closeMovie
  );

/* =========================
   SEE MORE
========================= */

const seeMoreBtn =
  document.getElementById(
    "seeMoreBtn"
  );

if (seeMoreBtn) {

  seeMoreBtn.onclick =
    () => {

      renderNew(
        movies
      );

      document
        .getElementById(
          "new"
        )
        ?.scrollIntoView({
          behavior: "smooth"
        });

      notify(
        "Showing available results."
      );
    };
}

/* =========================
   CATEGORY BUTTONS
========================= */

document
  .querySelectorAll(
    "[data-category]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        loadCategory(
          button.dataset.category
        );
      }
    );
  });


/* =========================
   SEARCH
========================= */
const searchInput=document.getElementById("searchInput");
if(searchInput){
  searchInput.addEventListener("keydown",event=>{
    if(event.key==="Enter"){event.preventDefault();searchMovies(searchInput.value);}
  });
}

/* =========================
   ACCOUNT / SUPABASE
========================= */
const profileModal=document.getElementById("profileModal");
const profileForm=document.getElementById("profileForm");
const signinForm=document.getElementById("signinForm");
const signupTab=document.getElementById("signupTab");
const signinTab=document.getElementById("signinTab");
const accountTitle=document.getElementById("accountTitle");
const accountSubtitle=document.getElementById("accountSubtitle");
const authStatus=document.getElementById("authStatus");
const accountSubmit=document.getElementById("accountSubmit");
const signoutBtn=document.getElementById("signoutBtn");

function setAuthMode(mode){
  const signup=mode==="signup";
  profileForm?.classList.toggle("hidden",!signup);
  signinForm?.classList.toggle("hidden",signup);
  signupTab?.classList.toggle("active",signup);
  signinTab?.classList.toggle("active",!signup);
  if(accountTitle)accountTitle.textContent=signup?"Create your account":"Welcome back";
  if(accountSubtitle)accountSubtitle.textContent=signup?"Create your FAPRESKI account to save movies, build your profile and start your free trial.":"Sign in to continue watching and use your FAPRESKI account.";
}
function refreshAuthUI(){
  if(!supabaseClient){if(authStatus)authStatus.textContent="Supabase is not connected yet. Add the FAPRESKI project URL and publishable key to supabase-config.js.";return;}
  supabaseClient.auth.getUser().then(({data})=>{
    const user=data?.user;
    if(user){if(authStatus)authStatus.textContent="Signed in as "+(user.email||"FAPRESKI member")+".";signoutBtn?.classList.remove("hidden");}
    else{signoutBtn?.classList.add("hidden");if(authStatus)authStatus.textContent="Your account session stays signed in on this device.";}
  });
}
function openAccount(mode="signup"){profileModal?.classList.remove("hidden");setAuthMode(mode);refreshAuthUI();}
function closeAccount(){profileModal?.classList.add("hidden");}
document.getElementById("loginBtn")?.addEventListener("click",()=>openAccount("signin"));
document.getElementById("mobileLoginBtn")?.addEventListener("click",()=>openAccount("signin"));
document.getElementById("profileBtn")?.addEventListener("click",()=>openAccount("signup"));
document.getElementById("closeProfile")?.addEventListener("click",closeAccount);
signupTab?.addEventListener("click",()=>setAuthMode("signup"));
signinTab?.addEventListener("click",()=>setAuthMode("signin"));

profileForm?.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!supabaseClient){notify("Connect the FAPRESKI Supabase project first.");return;}
  const name=document.getElementById("profileName")?.value.trim();
  const username=document.getElementById("profileUsername")?.value.trim().replace(/^@/,"");
  const email=document.getElementById("profileEmail")?.value.trim();
  const password=document.getElementById("profilePassword")?.value;
  const country=document.getElementById("profileCountry")?.value.trim();
  if(!password||password.length<6){notify("Password must be at least 6 characters.");return;}
  accountSubmit.disabled=true;
  const result=await supabaseClient.auth.signUp({email,password,options:{data:{full_name:name,username,country,language:currentLanguage},emailRedirectTo:window.location.href}});
  accountSubmit.disabled=false;
  if(result.error){notify(result.error.message);return;}
  if(result.data?.session){notify("Account created. You're signed in.");closeAccount();if(pendingTrial){pendingTrial=false;startTrial();}}
  else{notify("Account created. Check your email to confirm your account, then sign in.");setAuthMode("signin");}
});
signinForm?.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!supabaseClient){notify("Connect the FAPRESKI Supabase project first.");return;}
  const email=document.getElementById("signinEmail")?.value.trim();
  const password=document.getElementById("signinPassword")?.value;
  const result=await supabaseClient.auth.signInWithPassword({email,password});
  if(result.error){notify(result.error.message);return;}
  notify("Signed in successfully.");closeAccount();refreshAuthUI();if(pendingTrial){pendingTrial=false;startTrial();}
});
signoutBtn?.addEventListener("click",async()=>{if(supabaseClient)await supabaseClient.auth.signOut();refreshAuthUI();notify("Signed out.");setAuthMode("signin");});
if(supabaseClient){supabaseClient.auth.onAuthStateChange(()=>refreshAuthUI());refreshAuthUI();}

/* =========================
   LANGUAGE
========================= */
function setupLanguageMenu(buttonId,menuId){
  const btn=document.getElementById(buttonId),menu=document.getElementById(menuId);
  if(!btn||!menu)return;
  btn.addEventListener("click",event=>{
    event.stopPropagation();menu.classList.toggle("hidden");btn.setAttribute("aria-expanded",String(!menu.classList.contains("hidden")));
  });
  menu.querySelectorAll("[data-language]").forEach(button=>button.addEventListener("click",event=>{
    event.stopPropagation();currentLanguage=button.dataset.language;localStorage.setItem("fapreskiLanguage",currentLanguage);
    document.querySelectorAll(".language-menu").forEach(m=>m.classList.add("hidden"));
    document.querySelectorAll(".language-button").forEach(b=>b.setAttribute("aria-expanded","false"));
    applyTranslations();loadCatalogue();notify("Language: "+button.textContent.trim());
  }));
}
setupLanguageMenu("languageBtn","languageMenu");setupLanguageMenu("mobileLanguageBtn","mobileLanguageMenu");
document.addEventListener("click",event=>{if(!event.target.closest(".language-wrap"))document.querySelectorAll(".language-menu").forEach(m=>m.classList.add("hidden"));});

/* =========================
   TRIAL
========================= */
async function startTrial(){
  let user=null;
  if(supabaseClient){const result=await supabaseClient.auth.getUser();user=result.data?.user||null;}
  if(!user){pendingTrial=true;openAccount("signup");notify("Create or sign in to your FAPRESKI account to start the 7-day trial.");return;}
  const key="fapreskiTrialStartedAt:"+user.id;
  const existing=localStorage.getItem(key);
  if(existing){const days=Math.max(0,7-Math.floor((Date.now()-Number(existing))/86400000));notify(days>0?"Your 7-day trial is already active ("+days+" day"+(days===1?"":"s")+" remaining).":"Your 7-day trial has ended.");return;}
  localStorage.setItem(key,String(Date.now()));notify("Your 7-day FAPRESKI trial has started.");closeAccount();
}
["trialBtn","mobileTrialBtn","pricingTrial"].forEach(id=>document.getElementById(id)?.addEventListener("click",startTrial));

/* =========================
   MESSAGES
========================= */

function openMessages() {

  document
    .getElementById(
      "messageModal"
    )
    ?.classList.remove(
      "hidden"
    );
}

function closeMessages() {

  document
    .getElementById(
      "messageModal"
    )
    ?.classList.add(
      "hidden"
    );
}

document
  .getElementById(
    "messageBtn"
  )
  ?.addEventListener(
    "click",
    openMessages
  );

document
  .getElementById(
    "closeMessages"
  )
  ?.addEventListener(
    "click",
    closeMessages
  );

document
  .getElementById(
    "searchUsername"
  )
  ?.addEventListener(
    "click",
    () => {

      const username =
        document
          .getElementById(
            "usernameSearch"
          )
          ?.value
          .trim();

      const results =
        document.getElementById(
          "messageResults"
        );

      if (!username) {

        notify(
          "Enter a username to search."
        );

        return;
      }

      if (results) {

        results.innerHTML = `
          <p>
            Searching for
            <strong>
              @${escapeHtml(username)}
            </strong>…
          </p>
        `;

        setTimeout(() => {

          results.innerHTML = `
            <p>
              No connected account found yet.
              Username search will use the
              FAPRESKI database once
              authentication is connected.
            </p>
          `;

        }, 500);
      }
    }
  );

/* =========================
   MY LIST
========================= */
function addCurrentToList(){
  const movie=movies[0];
  if(!movie){notify("No movie selected.");return;}
  const list=JSON.parse(localStorage.getItem("fapreskiMyList")||"[]");
  if(!list.some(m=>m.title===movie.title))list.push({title:movie.title,id:movie.id,poster:movie.poster});
  localStorage.setItem("fapreskiMyList",JSON.stringify(list));notify("Added to My List.");
}
document.getElementById("heroList")?.addEventListener("click",addCurrentToList);
document.getElementById("addList")?.addEventListener("click",addCurrentToList);

/* =========================
   CATEGORY LABELS + PRIVACY
========================= */
const categoryNames={
  en:["Action","Comedy","Drama","Thriller","Romance","Animation","Family","Horror","Documentary","Sci-Fi","Mystery"],
  fr:["Action","Comédie","Drame","Thriller","Romance","Animation","Famille","Horreur","Documentaire","Science-fiction","Mystère"],
  es:["Acción","Comedia","Drama","Thriller","Romance","Animación","Familia","Terror","Documental","Ciencia ficción","Misterio"],
  pt:["Ação","Comédia","Drama","Thriller","Romance","Animação","Família","Terror","Documentário","Ficção científica","Mistério"],
  de:["Action","Komödie","Drama","Thriller","Romantik","Animation","Familie","Horror","Dokumentation","Sci-Fi","Mystery"],
  it:["Azione","Commedia","Drammatico","Thriller","Romantico","Animazione","Famiglia","Horror","Documentario","Fantascienza","Mistero"],
  zh:["动作","喜剧","剧情","惊悚","爱情","动画","家庭","恐怖","纪录片","科幻","悬疑"],
  ar:["أكشن","كوميديا","دراما","إثارة","رومانسية","رسوم متحركة","عائلي","رعب","وثائقي","خيال علمي","غموض"]
};
function applyCategoryLabels(){
  const names=categoryNames[currentLanguage]||categoryNames.en;
  document.querySelectorAll("[data-category]").forEach((b,i)=>{if(names[i])b.textContent=names[i];});
}
const originalApplyTranslations=applyTranslations;
applyTranslations=function(){originalApplyTranslations();applyCategoryLabels();};
document.getElementById("privacyLink")?.addEventListener("click",event=>{
  event.preventDefault();
  notify("FAPRESKI privacy: your account data is used to provide authentication and account features.");
});

/* =========================
   START
========================= */

applyTranslations();
loadCatalogue();
