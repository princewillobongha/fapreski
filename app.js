const API_BASE = "https://fapreski-api.princewillobongha.workers.dev";

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
   SEARCH BUTTON
========================= */

const searchInput =
  document.getElementById(
    "searchInput"
  );

const searchBtn =
  document.getElementById(
    "searchBtn"
  );

if (
  searchBtn &&
  searchInput
) {

  searchBtn.addEventListener(
    "click",
    () => {

      searchMovies(
        searchInput.value
      );
    }
  );

  searchInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        searchMovies(
          searchInput.value
        );
      }
    }
  );
}

/* =========================
   LOGIN
========================= */

document
  .getElementById(
    "loginBtn"
  )
  ?.addEventListener(
    "click",
    () => {

      notify(
        "Google and email sign-in will be connected to Supabase."
      );
    }
  );

/* =========================
   LANGUAGE MENU
========================= */

const languageBtn =
  document.getElementById(
    "languageBtn"
  );

const languageMenu =
  document.getElementById(
    "languageMenu"
  );

if (
  languageBtn &&
  languageMenu
) {

  languageBtn.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      languageMenu.classList.toggle(
        "hidden"
      );
    }
  );

  languageMenu
    .querySelectorAll(
      "[data-language]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          const language =
            button.dataset.language;

          currentLanguage =
            language;

          localStorage.setItem(
            "fapreskiLanguage",
            language
          );

          languageBtn.textContent =
            language === "zh"
              ? "中文 ▾"
              : `${language.toUpperCase()} ▾`;

          languageMenu.classList.add(
            "hidden"
          );

          notify(
            language === "en"
              ? "Language changed to English."
              : "Language changed."
          );

          loadCatalogue();
        }
      );
    });

  document.addEventListener(
    "click",
    event => {

      if (
        !event.target.closest(
          ".language-wrap"
        )
      ) {

        languageMenu.classList.add(
          "hidden"
        );
      }
    }
  );
}

/* =========================
   TRIAL BUTTONS
========================= */

[
  "trialBtn",
  "pricingTrial"
].forEach(id => {

  const button =
    document.getElementById(
      id
    );

  if (button) {

    button.onclick =
      () => {

        notify(
          "7-day free trial will be connected to subscriptions."
        );
      };
  }
});

/* =========================
   PROFILE
========================= */

function openProfile() {

  document
    .getElementById(
      "profileModal"
    )
    ?.classList.remove(
      "hidden"
    );
}

function closeProfile() {

  document
    .getElementById(
      "profileModal"
    )
    ?.classList.add(
      "hidden"
    );
}

document
  .getElementById(
    "profileBtn"
  )
  ?.addEventListener(
    "click",
    openProfile
  );

document
  .getElementById(
    "closeProfile"
  )
  ?.addEventListener(
    "click",
    closeProfile
  );

document
  .getElementById(
    "profileForm"
  )
  ?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      notify(
        "Profile form saved locally for now. Database authentication comes next."
      );

      closeProfile();
    }
  );

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

document
  .getElementById(
    "heroList"
  )
  ?.addEventListener(
    "click",
    () => {

      notify(
        "Added to My List. Account syncing comes next."
      );
    }
  );

document
  .getElementById(
    "addList"
  )
  ?.addEventListener(
    "click",
    () => {

      notify(
        "Added to My List. Account syncing comes next."
      );
    }
  );

/* =========================
   START
========================= */

if (
  languageBtn &&
  currentLanguage
) {

  languageBtn.textContent =
    currentLanguage === "zh"
      ? "中文 ▾"
      : `${currentLanguage.toUpperCase()} ▾`;
}

loadCatalogue();

