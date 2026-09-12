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

function renderTrending(list) {
  trendingGrid.innerHTML = list.slice(0, 10).map((m, i) => card(m, i)).join("");
}

async function api(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

async function loadCatalogue() {
  try {
    const [upcomingData, trendingData] = await Promise.all([
      api("/upcoming"),
      api("/trending")
    ]);

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

async function loadCategory(category) {
  const endpointMap = {
    action:"/action", comedy:"/comedy", romance:"/romance",
    animation:"/animation", horror:"/horror",
    drama:"/drama", thriller:"/thriller", family:"/family",
    documentary:"/documentary", scifi:"/scifi", mystery:"/mystery"
  };

  const endpoint = endpointMap[category];
  if (!endpoint) return;

  try {
    notify(`Loading ${category} movies...`);
    const data = await api(endpoint);
    const results = (data.results || []).map(m => convertMovie(m, category.toUpperCase()));

    if (!results.length) {
      notify(`No ${category} movies found.`);
      return;
    }

    movies = results;
    renderNew(results);
    renderTrending(results);
    document.getElementById("new").scrollIntoView({behavior:"smooth"});
  } catch (error) {
    console.error(error);
    notify(`${category} movies could not be loaded.`);
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
    document.getElementById("new").scrollIntoView({behavior:"smooth"});
    notify(results.length ? `${results.length} movies found.` : "No movies found.");
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

document.getElementById("seeMoreBtn").onclick = () => {
  renderNew(movies);
  document.getElementById("new").scrollIntoView({behavior:"smooth"});
  notify("Showing more movies.");
};

document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => loadCategory(button.dataset.category));
});

document.getElementById("loginBtn").onclick = () =>
  notify("Google and email sign-in will be connected to Supabase.");

document.getElementById("languageBtn").onclick = () =>
  notify("Language selection will be connected to your account.");

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
