const API_BASE = "https://fapreski-api.princewillobongha.workers.dev";
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
  return String(value).replace(/[&<>"']/g, character => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[character]));
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
    <div class="poster" ${background}><span>${movie.tag || "MOVIE"}</span></div>
    <div class="movie-body">
      <h3>${escapeHtml(movie.title)}</h3>
      <p>${escapeHtml(movie.genre)} • ${movie.rating} ★</p>
    </div>
  </article>`;
}

function renderNew(list) {
  newGrid.innerHTML = list.slice(0, 10).map((m, i) => card(m, i)).join("");
}

function renderTrending(list, offset = 0) {
  trendingGrid.innerHTML = list.slice(0, 10).map((m, i) => card(m, i + offset)).join("");
}

async function api(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

async function loadCatalogue() {
  try {
    notify("Loading FAPRESKI movies...");

    const [upcomingData, trendingData] = await Promise.all([
      api("/upcoming"),
      api("/trending")
    ]);

    const upcoming = (upcomingData.results || []).map(m => convertMovie(m, "NEW"));
    const trending = (trendingData.results || []).map(m => convertMovie(m, "TRENDING"));

    if (!upcoming.length && !trending.length) throw new Error("No movies returned");

    movies = [...upcoming, ...trending];
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

async function loadGenreMovies(endpoint, title) {
  try {
    const data = await api(endpoint);
    const results = (data.results || []).map(m => convertMovie(m, title.toUpperCase()));
    movies = results;
    renderNew(results);
    renderTrending(results);
    if (!results.length) notify(`No ${title} movies found.`);
  } catch (error) {
    console.error(error);
    notify(`${title} movies could not be loaded.`);
  }
}

async function searchMovies(query) {
  if (!query.trim()) return;

  try {
    const data = await api(`/search?q=${encodeURIComponent(query.trim())}`);
    const results = (data.results || []).map(m => convertMovie(m, "SEARCH"));
    movies = results;
    renderNew(results);
    renderTrending(results);
    if (!results.length) notify("No movies found.");
  } catch (error) {
    console.error(error);
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
  const target = e.target.closest("[data-watch]");
  if (target) showMovie(Number(target.dataset.watch));
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.activeElement?.dataset?.watch)
    showMovie(Number(document.activeElement.dataset.watch));
  if (e.key === "Escape") closeMovie();
});

document.getElementById("closeMovie").onclick = closeMovie;

["trialBtn","pricingTrial"].forEach(id => {
  const button = document.getElementById(id);
  if (button) button.onclick = () => notify("7-day free trial will be connected to subscriptions.");
});

document.getElementById("loginBtn").onclick = () =>
  notify("Google and email sign-in will be connected here.");

document.getElementById("languageBtn").onclick = () =>
  notify("Multilingual support will be connected here.");

document.getElementById("profileBtn").onclick = () =>
  notify("Profile creation will be connected here.");

document.getElementById("messageBtn").onclick = () =>
  notify("Messaging will be connected here.");

document.getElementById("heroList").onclick = () =>
  notify("Added to My List.");

document.getElementById("addList").onclick = () =>
  notify("Added to My List.");

loadCatalogue();
