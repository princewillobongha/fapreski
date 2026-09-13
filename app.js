const API_BASE = "https://fapreski-api.princewillobongha.workers.dev";
let currentLanguage = localStorage.getItem("fapreskiLanguage") || "en";
const demoVideo = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

let movies = [];

const fallbackMovies = [
  {title:"Midnight Horizon",genre:"Action • Thriller",year:"2026",rating:"8.4",desc:"A FAPRESKI demo movie.",tag:"NEW"},
  {title:"The Last Signal",genre:"Sci-Fi • Mystery",year:"2026",rating:"8.7",desc:"A futuristic FAPRESKI demo title.",tag:"NEW"},
  {title:"Whisper in the Dark",genre:"Horror • Mystery",year:"2026",rating:"8.3",desc:"A horror demo title for FAPRESKI.",tag:"HORROR"}
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

function posterUrl(path) {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function convertMovie(movie, tag = "") {
  return {
    id: movie.id,
    title: movie.title || movie.name || "Untitled",
    genre: movie.genre_names?.length ? movie.genre_names.join(" • ") : "Movie",
    year: (movie.release_date || movie.first_air_date || "").substring(0, 4) || "—",
    rating: Number(movie.vote_average || 0).toFixed(1),
    desc: movie.overview || "No description available.",
    poster: posterUrl(movie.poster_path),
    backdrop: posterUrl(movie.backdrop_path),
    tag
  };
}

function card(movie, index) {
  const background = movie.poster
    ? `style="background-image:linear-gradient(0deg,rgba(0,0,0,.85),rgba(0,0,0,.1)),url('${movie.poster}')"`
    : "";

  return `<article class="movie-card" data-watch="${index}" tabindex="0">
    <div class="poster" ${background}><span>${escapeHtml(movie.tag || "MOVIE")}</span></div>
    <div class="movie-body">
      <h3>${escapeHtml(movie.title)}</h3>
      <p>${escapeHtml(movie.genre)} • ${movie.rating} ★</p>
    </div>
  </article>`;
}

function renderNew(list) {
  newGrid.innerHTML = list.slice(0, 10).map((m, i) => card(m, i)).join("");
}

function renderTrending(list) {
  trendingGrid.innerHTML = list.slice(0, 10).map((m, i) => card(m, i)).join("");
}

async function api(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

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

  const tmdbLanguage = languageMap[currentLanguage] || "en-US";

  const separator = endpoint.includes("?") ? "&" : "?";

  const response = await fetch(
    `${API_BASE}${endpoint}${separator}language=${encodeURIComponent(tmdbLanguage)}`
  );

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  return response.json();
}

    const upcoming = (upcomingData.results || []).map(m => convertMovie(m, "NEW"));
    const trending = (trendingData.results || []).map(m => convertMovie(m, "TRENDING"));

    movies = [...upcoming, ...trending];

    if (!movies.length) throw new Error("No movies returned");

    renderNew(upcoming.length ? upcoming : trending);
    renderTrending(trending.length ? trending : upcoming);
  } catch (error) {
    console.error("FAPRESKI API error:", error);
    movies = fallbackMovies;
    renderNew(fallbackMovies);
    renderTrending(fallbackMovies);
    notify("Showing demo movies while the movie service loads.");
  }
}

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

  const tmdbLanguage = languageMap[currentLanguage] || "en-US";
  const separator = endpoint.includes("?") ? "&" : "?";

  const response = await fetch(
    `${API_BASE}${endpoint}${separator}language=${encodeURIComponent(tmdbLanguage)}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

async function loadCatalogue() {
  try {
    const [upcomingData, trendingData] = await Promise.all([
      api("/upcoming"),
      api("/trending")
    ]);

    const upcoming = (upcomingData.results || [])
      .map(m => convertMovie(m, "NEW"));

    const trending = (trendingData.results || [])
      .map(m => convertMovie(m, "TRENDING"));

    movies = [...upcoming, ...trending];

    if (!movies.length) {
      throw new Error("No movies returned");
    }

    renderNew(upcoming.length ? upcoming : trending);
    renderTrending(trending.length ? trending : upcoming);

  } catch (error) {
    console.error("FAPRESKI API error:", error);

    movies = fallbackMovies;

    renderNew(fallbackMovies);
    renderTrending(fallbackMovies);

    notify("Showing demo movies while the movie service loads.");
  }
}

  try {
    notify(`Searching for "${cleanQuery}"...`);

    const data = await api(`/search?q=${encodeURIComponent(cleanQuery)}`);
    const results = (data.results || []).map(m => convertMovie(m, "SEARCH"));

    movies = results;

    if (!results.length) {
      newGrid.innerHTML = `<p class="muted">No movies found for "${escapeHtml(cleanQuery)}".</p>`;
      trendingGrid.innerHTML = "";
      document.querySelector("#new h2").textContent = "Search Results";
      document.getElementById("new").scrollIntoView({behavior:"smooth"});
      notify("No movies found.");
      return;
    }

    renderNew(results);
    trendingGrid.innerHTML = "";
    document.querySelector("#new h2").textContent = `Search Results for "${cleanQuery}"`;
    document.getElementById("new").scrollIntoView({behavior:"smooth"});
    notify(`${results.length} movies found.`);
  } catch (error) {
    console.error("Search error:", error);
    notify("Search is temporarily unavailable.");
  }
}

function showMovie(index) {
  const movie = movies[index];
  if (!movie) return;

  titleEl.textContent = movie.title;
  descEl.textContent = movie.desc;
  genreEl.textContent = movie.genre.toUpperCase();
  metaEl.innerHTML = `<span>${movie.year}</span><span>${movie.rating} ★</span><span>HD</span><span>Subtitles</span>`;

  modal.classList.remove("hidden");
  player.src = demoVideo;
  player.play().catch(() => {});
}

function closeMovie() {
  player.pause();
  player.removeAttribute("src");
  player.load();
  modal.classList.add("hidden");
}

function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2200);
}

document.addEventListener("click", e => {
  const movieCard = e.target.closest("[data-watch]");
  if (movieCard) showMovie(Number(movieCard.dataset.watch));
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement?.dataset?.watch)
    showMovie(Number(document.activeElement.dataset.watch));

  if (e.key === "Escape") {
    closeMovie();
    document.getElementById("profileModal").classList.add("hidden");
    document.getElementById("messageModal").classList.add("hidden");
  }
});

document.getElementById("closeMovie").onclick = closeMovie;

const seeMoreBtn = document.getElementById("seeMoreBtn");
if (seeMoreBtn) {
  seeMoreBtn.onclick = () => {
    renderNew(movies);
    document.getElementById("new").scrollIntoView({behavior:"smooth"});
    notify("Showing available results.");
  };
}

document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => loadCategory(button.dataset.category));
});

// Search button + Enter key
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => searchMovies(searchInput.value));

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchMovies(searchInput.value);
    }
  });
}

document.getElementById("loginBtn").onclick = () =>
  notify("Google and email sign-in will be connected to Supabase.");

const languageBtn = document.getElementById("languageBtn");
const languageMenu = document.getElementById("languageMenu");

if (languageBtn && languageMenu) {
  languageBtn.addEventListener("click", e => {
    e.stopPropagation();
    languageMenu.classList.toggle("hidden");
  });

  languageMenu.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => {
      const language = button.dataset.language;
      applyLanguage(language);
      languageMenu.classList.add("hidden");
    });
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".language-wrap")) {
      languageMenu.classList.add("hidden");
    }
  });
}

["trialBtn","pricingTrial"].forEach(id => {
  const button = document.getElementById(id);
  if (button) button.onclick = () =>
    notify("7-day free trial will be connected to subscriptions.");
});

function openProfile() {
  document.getElementById("profileModal").classList.remove("hidden");
}

function closeProfile() {
  document.getElementById("profileModal").classList.add("hidden");
}

document.getElementById("profileBtn").onclick = openProfile;
document.getElementById("closeProfile").onclick = closeProfile;

document.getElementById("profileForm").addEventListener("submit", e => {
  e.preventDefault();
  notify("Profile form saved locally for now. Database authentication comes next.");
  closeProfile();
});

function openMessages() {
  document.getElementById("messageModal").classList.remove("hidden");
}

function closeMessages() {
  document.getElementById("messageModal").classList.add("hidden");
}

document.getElementById("messageBtn").onclick = openMessages;
document.getElementById("closeMessages").onclick = closeMessages;

document.getElementById("searchUsername").onclick = () => {
  const username = document.getElementById("usernameSearch").value.trim();
  const results = document.getElementById("messageResults");

  if (!username) {
    notify("Enter a username to search.");
    return;
  }

  results.innerHTML = `<p>Searching for <strong>@${escapeHtml(username)}</strong>…</p>`;

  setTimeout(() => {
    results.innerHTML = `<p>No connected account found yet. Username search will use the FAPRESKI database once authentication is connected.</p>`;
  }, 500);
};

document.getElementById("heroList").onclick = () =>
  notify("Added to My List. Account syncing comes next.");

document.getElementById("addList").onclick = () =>
  notify("Added to My List. Account syncing comes next.");

loadCatalogue();
/* =========================
   FAPRESKI FULL INTERFACE LANGUAGE SYSTEM
   ========================= */

const translations = {
  en: {
    navHome:"Home", navNew:"New Releases", navCategories:"Categories",
    navList:"My List", navMessages:"Messages",
    search:"Search movies...", signIn:"Sign in",
    trial:"Start 7-Day Trial",
    eyebrow:"FAPRESKI ORIGINAL EXPERIENCE",
    heroTitle:"Movies at", fingertips:"Your Fingertips.",
    heroText:"Discover movies, stream in HD, save your favourites, and enjoy subtitles in your preferred language.",
    watch:"▶ Watch Now", myList:"＋ My List",
    hd:"HD", subtitles:"Subtitles", global:"Global",
    aboutEyebrow:"ABOUT FAPRESKI",
    aboutTitle:"Movies, Entertainment & More",
    about1:"FAPRESKI is a movie streaming and entertainment platform built for discovering and enjoying movies online. Explore new releases, trending movies, and entertainment across a wide range of categories.",
    about2:"Browse movies by Action, Comedy, Drama, Thriller, Romance, Animation, Family, Horror, Documentary, Sci-Fi, and Mystery. FAPRESKI is designed to make discovering movies simple, enjoyable, and accessible.",
    about3:"Discover your next movie on FAPRESKI — Movies at Your Fingertips.",
    discover:"DISCOVER", newReleases:"New Releases", seeAll:"See all →",
    explore:"EXPLORE", categories:"Browse by Category",
    forYou:"FOR YOU", trending:"Trending Now",
    yourSpace:"YOUR SPACE", listTitle:"My List",
    listText:"Add movies you want to watch later. Your saved list will sync to your FAPRESKI account.",
    createProfile:"Create Profile",
    community:"COMMUNITY", messages:"Messages",
    messageText:"Search for a unique username and message friends. Privacy, block and report controls will be included.",
    openMessages:"Open Messages",
    membership:"MEMBERSHIP",
    membershipTitle:"Start watching with a 7-day free trial.",
    membershipText:"Plans will be connected to real recurring payments after the streaming and licensing setup is ready.",
    startFreeTrial:"Start Free Trial", monthly:"/month starting plan",
    footer:"Movies at Your Fingertips.",
    help:"Help", feedback:"Feedback", report:"Report", privacy:"Privacy",
    movie:"MOVIE", addList:"＋ My List",
    demoNote:"Demo player: production movies will be connected only after appropriate streaming rights are secured.",
    account:"FAPRESKI ACCOUNT", profileTitle:"Create Profile",
    profileText:"Create your FAPRESKI profile. Authentication will be connected to the database next.",
    fullName:"Full name", username:"Unique username",
    email:"Email address", country:"Country",
    createProfileBtn:"Create Profile",
    communityTitle:"FAPRESKI COMMUNITY",
    searchUsername:"Search username", searchBtn:"Search",
    messagingNote:"Messaging will be connected to authenticated FAPRESKI accounts and the database.",
    changed:"Language changed"
  },

  fr: {
    navHome:"Accueil", navNew:"Nouveautés", navCategories:"Catégories",
    navList:"Ma liste", navMessages:"Messages",
    search:"Rechercher des films...", signIn:"Se connecter",
    trial:"Commencer l'essai de 7 jours",
    eyebrow:"EXPÉRIENCE ORIGINALE FAPRESKI",
    heroTitle:"Les films à", fingertips:"portée de main.",
    heroText:"Découvrez des films, regardez-les en HD, enregistrez vos favoris et profitez des sous-titres dans votre langue préférée.",
    watch:"▶ Regarder", myList:"＋ Ma liste",
    hd:"HD", subtitles:"Sous-titres", global:"Monde",
    aboutEyebrow:"À PROPOS DE FAPRESKI",
    aboutTitle:"Films, divertissement et plus",
    about1:"FAPRESKI est une plateforme de streaming et de divertissement conçue pour découvrir et regarder des films en ligne. Explorez les nouveautés, les films tendance et différents genres.",
    about2:"Parcourez les films d'action, de comédie, de drame, de thriller, de romance, d'animation, de famille, d'horreur, de documentaire, de science-fiction et de mystère.",
    about3:"Découvrez votre prochain film sur FAPRESKI — Les films à portée de main.",
    discover:"DÉCOUVRIR", newReleases:"Nouveautés", seeAll:"Tout voir →",
    explore:"EXPLORER", categories:"Parcourir par catégorie",
    forYou:"POUR VOUS", trending:"Tendances",
    yourSpace:"VOTRE ESPACE", listTitle:"Ma liste",
    listText:"Ajoutez des films à regarder plus tard. Votre liste sera synchronisée avec votre compte FAPRESKI.",
    createProfile:"Créer un profil",
    community:"COMMUNAUTÉ", messages:"Messages",
    messageText:"Recherchez un nom d'utilisateur et envoyez un message à vos amis.",
    openMessages:"Ouvrir les messages",
    membership:"ABONNEMENT",
    membershipTitle:"Commencez avec un essai gratuit de 7 jours.",
    membershipText:"Les forfaits seront connectés aux paiements récurrents une fois la configuration terminée.",
    startFreeTrial:"Commencer l'essai gratuit", monthly:"/mois, forfait de départ",
    footer:"Les films à portée de main.",
    help:"Aide", feedback:"Commentaires", report:"Signaler", privacy:"Confidentialité",
    movie:"FILM", addList:"＋ Ma liste",
    demoNote:"Lecteur de démonstration : les films de production seront connectés après obtention des droits de diffusion appropriés.",
    account:"COMPTE FAPRESKI", profileTitle:"Créer un profil",
    profileText:"Créez votre profil FAPRESKI. L'authentification sera bientôt connectée à la base de données.",
    fullName:"Nom complet", username:"Nom d'utilisateur unique",
    email:"Adresse e-mail", country:"Pays",
    createProfileBtn:"Créer un profil",
    communityTitle:"COMMUNAUTÉ FAPRESKI",
    searchUsername:"Rechercher un nom d'utilisateur", searchBtn:"Rechercher",
    messagingNote:"La messagerie sera connectée aux comptes FAPRESKI authentifiés et à la base de données.",
    changed:"Langue changée"
  },

  es: {
    navHome:"Inicio", navNew:"Estrenos", navCategories:"Categorías",
    navList:"Mi lista", navMessages:"Mensajes",
    search:"Buscar películas...", signIn:"Iniciar sesión",
    trial:"Iniciar prueba de 7 días",
    eyebrow:"EXPERIENCIA ORIGINAL FAPRESKI",
    heroTitle:"Películas al", fingertips:"alcance de tu mano.",
    heroText:"Descubre películas, disfruta en HD, guarda tus favoritas y usa subtítulos en tu idioma preferido.",
    watch:"▶ Ver ahora", myList:"＋ Mi lista",
    hd:"HD", subtitles:"Subtítulos", global:"Global",
    aboutEyebrow:"SOBRE FAPRESKI", aboutTitle:"Películas, entretenimiento y más",
    about1:"FAPRESKI es una plataforma de streaming y entretenimiento creada para descubrir y disfrutar películas en línea. Explora estrenos, películas populares y entretenimiento de muchas categorías.",
    about2:"Explora películas de acción, comedia, drama, thriller, romance, animación, familia, terror, documental, ciencia ficción y misterio.",
    about3:"Descubre tu próxima película en FAPRESKI — Películas al alcance de tu mano.",
    discover:"DESCUBRIR", newReleases:"Estrenos", seeAll:"Ver todo →",
    explore:"EXPLORAR", categories:"Explorar por categoría",
    forYou:"PARA TI", trending:"Tendencias",
    yourSpace:"TU ESPACIO", listTitle:"Mi lista",
    listText:"Añade películas para verlas más tarde. Tu lista se sincronizará con tu cuenta de FAPRESKI.",
    createProfile:"Crear perfil",
    community:"COMUNIDAD", messages:"Mensajes",
    messageText:"Busca un nombre de usuario y envía mensajes a tus amigos.",
    openMessages:"Abrir mensajes",
    membership:"MEMBRESÍA",
    membershipTitle:"Empieza a ver con una prueba gratuita de 7 días.",
    membershipText:"Los planes se conectarán a pagos recurrentes cuando la configuración esté lista.",
    startFreeTrial:"Iniciar prueba gratuita", monthly:"/mes, plan inicial",
    footer:"Películas al alcance de tu mano.",
    help:"Ayuda", feedback:"Comentarios", report:"Reportar", privacy:"Privacidad",
    movie:"PELÍCULA", addList:"＋ Mi lista",
    demoNote:"Reproductor de demostración: las películas de producción se conectarán después de obtener los derechos de transmisión adecuados.",
    account:"CUENTA FAPRESKI", profileTitle:"Crear perfil",
    profileText:"Crea tu perfil de FAPRESKI. La autenticación se conectará a la base de datos próximamente.",
    fullName:"Nombre completo", username:"Nombre de usuario único",
    email:"Correo electrónico", country:"País",
    createProfileBtn:"Crear perfil",
    communityTitle:"COMUNIDAD FAPRESKI",
    searchUsername:"Buscar nombre de usuario", searchBtn:"Buscar",
    messagingNote:"La mensajería se conectará a las cuentas autenticadas de FAPRESKI y a la base de datos.",
    changed:"Idioma cambiado"
  },

  pt: {
    navHome:"Início", navNew:"Lançamentos", navCategories:"Categorias",
    navList:"Minha lista", navMessages:"Mensagens",
    search:"Pesquisar filmes...", signIn:"Entrar",
    trial:"Iniciar teste de 7 dias",
    eyebrow:"EXPERIÊNCIA ORIGINAL FAPRESKI",
    heroTitle:"Filmes ao", fingertips:"alcance das suas mãos.",
    heroText:"Descubra filmes, assista em HD, salve seus favoritos e aproveite legendas no seu idioma preferido.",
    watch:"▶ Assistir agora", myList:"＋ Minha lista",
    hd:"HD", subtitles:"Legendas", global:"Global",
    aboutEyebrow:"SOBRE A FAPRESKI", aboutTitle:"Filmes, entretenimento e muito mais",
    about1:"A FAPRESKI é uma plataforma de streaming e entretenimento criada para descobrir e aproveitar filmes online. Explore lançamentos, filmes em alta e entretenimento de várias categorias.",
    about2:"Navegue por filmes de ação, comédia, drama, thriller, romance, animação, família, terror, documentário, ficção científica e mistério.",
    about3:"Descubra seu próximo filme na FAPRESKI — Filmes ao alcance das suas mãos.",
    discover:"DESCOBRIR", newReleases:"Lançamentos", seeAll:"Ver tudo →",
    explore:"EXPLORAR", categories:"Navegar por categoria",
    forYou:"PARA VOCÊ", trending:"Em alta",
    yourSpace:"SEU ESPAÇO", listTitle:"Minha lista",
    listText:"Adicione filmes para assistir depois. Sua lista será sincronizada com sua conta FAPRESKI.",
    createProfile:"Criar perfil",
    community:"COMUNIDADE", messages:"Mensagens",
    messageText:"Pesquise um nome de usuário e envie mensagens aos seus amigos.",
    openMessages:"Abrir mensagens",
    membership:"ASSINATURA",
    membershipTitle:"Comece a assistir com um teste grátis de 7 dias.",
    membershipText:"Os planos serão conectados a pagamentos recorrentes quando a configuração estiver pronta.",
    startFreeTrial:"Iniciar teste grátis", monthly:"/mês, plano inicial",
    footer:"Filmes ao alcance das suas mãos.",
    help:"Ajuda", feedback:"Feedback", report:"Denunciar", privacy:"Privacidade",
    movie:"FILME", addList:"＋ Minha lista",
    demoNote:"Player de demonstração: os filmes de produção serão conectados após os direitos de transmissão apropriados serem garantidos.",
    account:"CONTA FAPRESKI", profileTitle:"Criar perfil",
    profileText:"Crie seu perfil FAPRESKI. A autenticação será conectada ao banco de dados em breve.",
    fullName:"Nome completo", username:"Nome de usuário único",
    email:"Endereço de e-mail", country:"País",
    createProfileBtn:"Criar perfil",
    communityTitle:"COMUNIDADE FAPRESKI",
    searchUsername:"Pesquisar nome de usuário", searchBtn:"Pesquisar",
    messagingNote:"As mensagens serão conectadas às contas autenticadas da FAPRESKI e ao banco de dados.",
    changed:"Idioma alterado"
  },

  ar: {
    navHome:"الرئيسية", navNew:"إصدارات جديدة", navCategories:"الفئات",
    navList:"قائمتي", navMessages:"الرسائل",
    search:"ابحث عن الأفلام...", signIn:"تسجيل الدخول",
    trial:"ابدأ تجربة مجانية لمدة 7 أيام",
    eyebrow:"تجربة FAPRESKI الأصلية",
    heroTitle:"الأفلام", fingertips:"في متناول يدك.",
    heroText:"اكتشف الأفلام وشاهدها بدقة HD واحفظ المفضلة واستمتع بالترجمة بلغتك المفضلة.",
    watch:"▶ شاهد الآن", myList:"＋ قائمتي",
    hd:"HD", subtitles:"الترجمة", global:"عالمي",
    aboutEyebrow:"عن FAPRESKI", aboutTitle:"أفلام وترفيه وأكثر",
    about1:"FAPRESKI هي منصة لمشاهدة الأفلام والترفيه عبر الإنترنت، مصممة لاكتشاف الأفلام والاستمتاع بها. استكشف الإصدارات الجديدة والأفلام الرائجة ومختلف الفئات.",
    about2:"تصفح أفلام الأكشن والكوميديا والدراما والإثارة والرومانسية والرسوم المتحركة والعائلة والرعب والوثائقي والخيال العلمي والغموض.",
    about3:"اكتشف فيلمك القادم على FAPRESKI — الأفلام في متناول يدك.",
    discover:"اكتشف", newReleases:"إصدارات جديدة", seeAll:"عرض الكل ←",
    explore:"استكشف", categories:"تصفح حسب الفئة",
    forYou:"لك", trending:"الأكثر رواجًا",
    yourSpace:"مساحتك", listTitle:"قائمتي",
    listText:"أضف الأفلام التي تريد مشاهدتها لاحقًا. ستتم مزامنة قائمتك مع حساب FAPRESKI.",
    createProfile:"إنشاء ملف شخصي",
    community:"المجتمع", messages:"الرسائل",
    messageText:"ابحث عن اسم مستخدم وأرسل رسائل إلى أصدقائك.",
    openMessages:"فتح الرسائل",
    membership:"العضوية",
    membershipTitle:"ابدأ المشاهدة مع تجربة مجانية لمدة 7 أيام.",
    membershipText:"سيتم ربط الخطط بالدفع المتكرر بعد اكتمال إعداد البث والتراخيص.",
    startFreeTrial:"ابدأ التجربة المجانية", monthly:"/شهريًا، الخطة الأساسية",
    footer:"الأفلام في متناول يدك.",
    help:"المساعدة", feedback:"ملاحظات", report:"إبلاغ", privacy:"الخصوصية",
    movie:"فيلم", addList:"＋ قائمتي",
    demoNote:"مشغل تجريبي: سيتم ربط الأفلام الفعلية بعد الحصول على حقوق البث المناسبة.",
    account:"حساب FAPRESKI", profileTitle:"إنشاء ملف شخصي",
    profileText:"أنشئ ملف FAPRESKI الخاص بك. سيتم ربط المصادقة بقاعدة البيانات لاحقًا.",
    fullName:"الاسم الكامل", username:"اسم مستخدم فريد",
    email:"عنوان البريد الإلكتروني", country:"الدولة",
    createProfileBtn:"إنشاء ملف شخصي",
    communityTitle:"مجتمع FAPRESKI",
    searchUsername:"ابحث عن اسم المستخدم", searchBtn:"بحث",
    messagingNote:"سيتم ربط المراسلة بحسابات FAPRESKI الموثقة وقاعدة البيانات.",
    changed:"تم تغيير اللغة"
  },

  de: {
    navHome:"Startseite", navNew:"Neuerscheinungen", navCategories:"Kategorien",
    navList:"Meine Liste", navMessages:"Nachrichten",
    search:"Filme suchen...", signIn:"Anmelden",
    trial:"7-Tage-Testversion starten",
    eyebrow:"DAS FAPRESKI ORIGINAL-ERLEBNIS",
    heroTitle:"Filme", fingertips:"direkt zur Hand.",
    heroText:"Entdecke Filme, streame in HD, speichere deine Favoriten und genieße Untertitel in deiner bevorzugten Sprache.",
    watch:"▶ Jetzt ansehen", myList:"＋ Meine Liste",
    hd:"HD", subtitles:"Untertitel", global:"Global",
    aboutEyebrow:"ÜBER FAPRESKI", aboutTitle:"Filme, Unterhaltung & mehr",
    about1:"FAPRESKI ist eine Streaming- und Unterhaltungsplattform zum Entdecken und Genießen von Filmen online. Entdecke Neuerscheinungen, Trends und viele Kategorien.",
    about2:"Durchsuche Filme aus Action, Komödie, Drama, Thriller, Romantik, Animation, Familie, Horror, Dokumentation, Science-Fiction und Mystery.",
    about3:"Entdecke deinen nächsten Film auf FAPRESKI — Filme direkt zur Hand.",
    discover:"ENTDECKEN", newReleases:"Neuerscheinungen", seeAll:"Alle ansehen →",
    explore:"ERKUNDEN", categories:"Nach Kategorie durchsuchen",
    forYou:"FÜR DICH", trending:"Jetzt im Trend",
    yourSpace:"DEIN BEREICH", listTitle:"Meine Liste",
    listText:"Füge Filme hinzu, die du später ansehen möchtest. Deine Liste wird mit deinem FAPRESKI-Konto synchronisiert.",
    createProfile:"Profil erstellen",
    community:"COMMUNITY", messages:"Nachrichten",
    messageText:"Suche nach einem Benutzernamen und sende deinen Freunden Nachrichten.",
    openMessages:"Nachrichten öffnen",
    membership:"MITGLIEDSCHAFT",
    membershipTitle:"Starte mit einer kostenlosen 7-Tage-Testversion.",
    membershipText:"Die Abonnements werden nach Abschluss der Streaming- und Lizenzierungseinrichtung mit wiederkehrenden Zahlungen verbunden.",
    startFreeTrial:"Kostenlose Testversion starten", monthly:"/Monat, Einstiegsplan",
    footer:"Filme direkt zur Hand.",
    help:"Hilfe", feedback:"Feedback", report:"Melden", privacy:"Datenschutz",
    movie:"FILM", addList:"＋ Meine Liste",
    demoNote:"Demo-Player: Produktionsfilme werden nach Sicherung der entsprechenden Streamingrechte verbunden.",
    account:"FAPRESKI-KONTO", profileTitle:"Profil erstellen",
    profileText:"Erstelle dein FAPRESKI-Profil. Die Authentifizierung wird als Nächstes mit der Datenbank verbunden.",
    fullName:"Vollständiger Name", username:"Eindeutiger Benutzername",
    email:"E-Mail-Adresse", country:"Land",
    createProfileBtn:"Profil erstellen",
    communityTitle:"FAPRESKI COMMUNITY",
    searchUsername:"Benutzernamen suchen", searchBtn:"Suchen",
    messagingNote:"Messaging wird mit authentifizierten FAPRESKI-Konten und der Datenbank verbunden.",
    changed:"Sprache geändert"
  },

  it: {
    navHome:"Home", navNew:"Nuove uscite", navCategories:"Categorie",
    navList:"La mia lista", navMessages:"Messaggi",
    search:"Cerca film...", signIn:"Accedi",
    trial:"Inizia prova gratuita di 7 giorni",
    eyebrow:"ESPERIENZA ORIGINALE FAPRESKI",
    heroTitle:"Film a", fingertips:"portata di mano.",
    heroText:"Scopri film, guarda in HD, salva i tuoi preferiti e goditi i sottotitoli nella tua lingua preferita.",
    watch:"▶ Guarda ora", myList:"＋ La mia lista",
    hd:"HD", subtitles:"Sottotitoli", global:"Globale",
    aboutEyebrow:"INFORMAZIONI SU FAPRESKI", aboutTitle:"Film, intrattenimento e altro",
    about1:"FAPRESKI è una piattaforma di streaming e intrattenimento creata per scoprire e guardare film online. Esplora nuove uscite, film di tendenza e diverse categorie.",
    about2:"Sfoglia film d'azione, commedia, drammatici, thriller, romantici, animazione, famiglia, horror, documentari, fantascienza e mistero.",
    about3:"Scopri il tuo prossimo film su FAPRESKI — Film a portata di mano.",
    discover:"SCOPRI", newReleases:"Nuove uscite", seeAll:"Vedi tutto →",
    explore:"ESPLORA", categories:"Sfoglia per categoria",
    forYou:"PER TE", trending:"Di tendenza",
    yourSpace:"IL TUO SPAZIO", listTitle:"La mia lista",
    listText:"Aggiungi film da guardare più tardi. La tua lista verrà sincronizzata con il tuo account FAPRESKI.",
    createProfile:"Crea profilo",
    community:"COMMUNITY", messages:"Messaggi",
    messageText:"Cerca un nome utente e invia messaggi ai tuoi amici.",
    openMessages:"Apri messaggi",
    membership:"ABBONAMENTO",
    membershipTitle:"Inizia a guardare con una prova gratuita di 7 giorni.",
    membershipText:"I piani saranno collegati ai pagamenti ricorrenti dopo la configurazione dello streaming e delle licenze.",
    startFreeTrial:"Inizia prova gratuita", monthly:"/mese, piano iniziale",
    footer:"Film a portata di mano.",
    help:"Aiuto", feedback:"Feedback", report:"Segnala", privacy:"Privacy",
    movie:"FILM", addList:"＋ La mia lista",
    demoNote:"Lettore demo: i film di produzione saranno collegati dopo aver ottenuto i diritti di streaming appropriati.",
    account:"ACCOUNT FAPRESKI", profileTitle:"Crea profilo",
    profileText:"Crea il tuo profilo FAPRESKI. L'autenticazione sarà collegata al database successivamente.",
    fullName:"Nome completo", username:"Nome utente univoco",
    email:"Indirizzo email", country:"Paese",
    createProfileBtn:"Crea profilo",
    communityTitle:"COMMUNITY FAPRESKI",
    searchUsername:"Cerca nome utente", searchBtn:"Cerca",
    messagingNote:"La messaggistica sarà collegata agli account FAPRESKI autenticati e al database.",
    changed:"Lingua cambiata"
  },

  zh: {
    navHome:"首页", navNew:"新片", navCategories:"分类",
    navList:"我的片单", navMessages:"消息",
    search:"搜索电影...", signIn:"登录",
    trial:"开始7天免费试用",
    eyebrow:"FAPRESKI 原创体验",
    heroTitle:"电影", fingertips:"尽在指尖。",
    heroText:"发现电影、享受高清播放、收藏喜欢的影片，并使用你喜欢的字幕语言。",
    watch:"▶ 立即观看", myList:"＋ 我的片单",
    hd:"HD", subtitles:"字幕", global:"全球",
    aboutEyebrow:"关于 FAPRESKI", aboutTitle:"电影、娱乐及更多",
    about1:"FAPRESKI 是一个电影流媒体和娱乐平台，帮助你在线发现和欣赏电影。探索新片、热门电影以及各种娱乐分类。",
    about2:"浏览动作、喜剧、剧情、惊悚、爱情、动画、家庭、恐怖、纪录片、科幻和悬疑电影。",
    about3:"在 FAPRESKI 发现你的下一部电影——电影尽在指尖。",
    discover:"发现", newReleases:"新片", seeAll:"查看全部 →",
    explore:"探索", categories:"按分类浏览",
    forYou:"为你推荐", trending:"热门影片",
    yourSpace:"你的空间", listTitle:"我的片单",
    listText:"添加以后想看的电影。你的片单会同步到 FAPRESKI 账户。",
    createProfile:"创建个人资料",
    community:"社区", messages:"消息",
    messageText:"搜索用户名并向朋友发送消息。",
    openMessages:"打开消息",
    membership:"会员",
    membershipTitle:"开始7天免费试用。",
    membershipText:"流媒体和授权设置完成后，套餐将连接到自动续费付款。",
    startFreeTrial:"开始免费试用", monthly:"/月，基础套餐",
    footer:"电影尽在指尖。",
    help:"帮助", feedback:"反馈", report:"举报", privacy:"隐私",
    movie:"电影", addList:"＋ 我的片单",
    demoNote:"演示播放器：获得适当的流媒体版权后才会连接正式电影。",
    account:"FAPRESKI 账户", profileTitle:"创建个人资料",
    profileText:"创建你的 FAPRESKI 个人资料。身份验证将在下一步连接到数据库。",
    fullName:"姓名", username:"唯一用户名",
    email:"电子邮件地址", country:"国家",
    createProfileBtn:"创建个人资料",
    communityTitle:"FAPRESKI 社区",
    searchUsername:"搜索用户名", searchBtn:"搜索",
    messagingNote:"消息功能将连接到经过身份验证的 FAPRESKI 账户和数据库。",
    changed:"语言已更改"
  }
};

const categoryTranslations = {
  en:["Action","Comedy","Drama","Thriller","Romance","Animation","Family","Horror","Documentary","Sci-Fi","Mystery"],
  fr:["Action","Comédie","Drame","Thriller","Romance","Animation","Famille","Horreur","Documentaire","Science-fiction","Mystère"],
  es:["Acción","Comedia","Drama","Thriller","Romance","Animación","Familia","Terror","Documental","Ciencia ficción","Misterio"],
  pt:["Ação","Comédia","Drama","Thriller","Romance","Animação","Família","Terror","Documentário","Ficção científica","Mistério"],
  ar:["أكشن","كوميديا","دراما","إثارة","رومانسية","رسوم متحركة","عائلي","رعب","وثائقي","خيال علمي","غموض"],
  de:["Action","Komödie","Drama","Thriller","Romantik","Animation","Familie","Horror","Dokumentation","Science-Fiction","Mystery"],
  it:["Azione","Commedia","Drammatico","Thriller","Romantico","Animazione","Famiglia","Horror","Documentario","Fantascienza","Mistero"],
  zh:["动作","喜剧","剧情","惊悚","爱情","动画","家庭","恐怖","纪录片","科幻","悬疑"]
};

function applyLanguage(language) {
  const t = translations[language] || translations.en;

  document.documentElement.lang = language;
  document.body.dir = language === "ar" ? "rtl" : "ltr";

  const text = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  const attr = (selector, name, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(name, value);
  };

  const nav = document.querySelectorAll(".topbar nav a");
  [t.navHome,t.navNew,t.navCategories,t.navList,t.navMessages]
    .forEach((value,i) => { if (nav[i]) nav[i].textContent = value; });

  attr("#searchInput","placeholder",t.search);
  attr("#searchInput","aria-label",t.search);

  text("#loginBtn",t.signIn);
  text("#trialBtn",t.trial);
  text("#pricingTrial",t.startFreeTrial);

  const heroEyebrow = document.querySelector(".hero .eyebrow");
  if (heroEyebrow) heroEyebrow.textContent = t.eyebrow;

  const heroTitle = document.querySelector(".hero h1");
  if (heroTitle) heroTitle.innerHTML = `${t.heroTitle}<br><span>${t.fingertips}</span>`;

  text(".hero-content > p",t.heroText);

  const heroButtons = document.querySelectorAll(".hero-buttons button");
  if (heroButtons[0]) heroButtons[0].textContent = t.watch;
  if (heroButtons[1]) heroButtons[1].textContent = t.myList;

  const heroMeta = document.querySelector(".hero-content .hero-meta");
  if (heroMeta) {
    heroMeta.innerHTML =
      `<span>${t.hd}</span><span>${t.subtitles}</span><span>${t.global}</span>`;
  }

  text(".about-fapreski .eyebrow",t.aboutEyebrow);
  text(".about-fapreski h2",t.aboutTitle);

  const aboutParagraphs = document.querySelectorAll(".about-content p");
  if (aboutParagraphs[0]) aboutParagraphs[0].textContent = t.about1;
  if (aboutParagraphs[1]) aboutParagraphs[1].textContent = t.about2;
  if (aboutParagraphs[2]) aboutParagraphs[2].textContent = t.about3;

  const heads = document.querySelectorAll(".section-head");

  if (heads[0]) {
    text(".section-head:nth-of-type(1) .eyebrow",t.discover);
    text("#new h2",t.newReleases);
    text("#seeMoreBtn",t.seeAll);
  }

  if (heads[1]) {
    text("#categories .eyebrow",t.explore);
    text("#categories h2",t.categories);
  }

  if (heads[2]) {
    text("#trending .eyebrow",t.forYou);
    text("#trending h2",t.trending);
  }

  const categories = document.querySelectorAll("[data-category]");
  const names = categoryTranslations[language] || categoryTranslations.en;
  categories.forEach((button,i) => {
    if (names[i]) button.textContent = names[i];
  });

  const panels = document.querySelectorAll(".feature-panel");

  if (panels[0]) {
    panels[0].querySelector(".eyebrow").textContent = t.yourSpace;
    panels[0].querySelector("h2").textContent = t.listTitle;
    panels[0].querySelector("p").textContent = t.listText;
    panels[0].querySelector("button").textContent = t.createProfile;
  }

  if (panels[1]) {
    panels[1].querySelector(".eyebrow").textContent = t.community;
    panels[1].querySelector("h2").textContent = t.messages;
    panels[1].querySelector("p").textContent = t.messageText;
    panels[1].querySelector("button").textContent = t.openMessages;
  }

  const pricing = document.querySelector(".pricing");
  if (pricing) {
    pricing.querySelector(".eyebrow").textContent = t.membership;
    pricing.querySelector("h2").textContent = t.membershipTitle;
    pricing.querySelector(".muted").textContent = t.membershipText;
    pricing.querySelector(".price-card span").textContent = t.monthly;
  }

  const footerLinks = document.querySelectorAll(".footer-links a");
  if (footerLinks[0]) footerLinks[0].textContent = t.help;
  if (footerLinks[1]) footerLinks[1].textContent = t.feedback;
  if (footerLinks[2]) footerLinks[2].textContent = t.report;
  if (footerLinks[3]) footerLinks[3].textContent = t.privacy;

  const footerBrand = document.querySelector("footer strong + span");
  if (footerBrand) footerBrand.textContent = t.footer;

  text("#modalGenre",t.movie);
  text(".demo-note",t.demoNote);
  text("#addList",t.addList);

  const profileModal = document.getElementById("profileModal");
  if (profileModal) {
    text("#profileModal .eyebrow",t.account);
    text("#profileModal h2",t.profileTitle);
    text("#profileModal > .modal-card > p",t.profileText);
    attr("#profileName","placeholder",t.fullName);
    attr("#profileUsername","placeholder",t.username);
    attr("#profileEmail","placeholder",t.email);
    attr("#profileCountry","placeholder",t.country);
    text("#profileForm button",t.createProfileBtn);
  }

  const messageModal = document.getElementById("messageModal");
  if (messageModal) {
    text("#messageModal .eyebrow",t.communityTitle);
    text("#messageModal h2",t.messages);
    attr("#usernameSearch","placeholder",t.searchUsername);
    text("#searchUsername",t.searchBtn);
    text("#messageModal .demo-note",t.messagingNote);
  }

  document.querySelectorAll("[data-language]").forEach(button => {
    const code = button.dataset.language;
    const clean = button.textContent.replace(/\s*✓/g,"").trim();
    button.textContent = code === language ? `${clean} ✓` : clean;
    button.classList.toggle("active",code === language);
  });

  const languageNames = {
    en:"EN", fr:"FR", es:"ES", pt:"PT",
    ar:"AR", de:"DE", it:"IT", zh:"中文"
  };

  if (languageBtn) {
    languageBtn.textContent = `${languageNames[language] || "EN"} ▾`;
  }

  currentLanguage = language;
  localStorage.setItem("fapreskiLanguage",language);
}

const savedLanguage = localStorage.getItem("fapreskiLanguage") || "en";
applyLanguage(savedLanguage);
            
