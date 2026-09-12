const demoVideo = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const movies = [
  {title:"Midnight Horizon",genre:"Action • Thriller",year:"2026",rating:"8.4",desc:"A cinematic demo title for the FAPRESKI catalogue. Select Watch Now to test the working player.",tag:"NEW"},
  {title:"Golden Skies",genre:"Drama",year:"2026",rating:"8.1",desc:"A dramatic demo title showing how movie details and playback will work.",tag:"NEW"},
  {title:"The Last Signal",genre:"Sci-Fi • Mystery",year:"2026",rating:"8.7",desc:"A futuristic demo entry for testing the FAPRESKI movie experience.",tag:"NEW"},
  {title:"Summer in Lagos",genre:"Romance • Drama",year:"2026",rating:"7.9",desc:"A sample catalogue entry. Production titles will come from authorized content partners.",tag:"NEW"},
  {title:"Wild Run",genre:"Adventure",year:"2026",rating:"8.0",desc:"A high-energy demo movie card with playable sample video.",tag:"NEW"},
  {title:"The Quiet Room",genre:"Mystery",year:"2026",rating:"7.8",desc:"A sample movie for testing search, details and playback.",tag:"TRENDING"},
  {title:"Beyond Earth",genre:"Sci-Fi",year:"2026",rating:"8.6",desc:"A sample title demonstrating the FAPRESKI discovery experience.",tag:"TRENDING"},
  {title:"City Lights",genre:"Comedy • Drama",year:"2026",rating:"7.6",desc:"A demo entry for the trending section.",tag:"TRENDING"},
  {title:"Family Day",genre:"Family • Comedy",year:"2026",rating:"7.5",desc:"A family-friendly sample catalogue title.",tag:"TRENDING"},
  {title:"Final Chase",genre:"Action",year:"2026",rating:"8.2",desc:"A sample action title for testing FAPRESKI.",tag:"TRENDING"}
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

function card(movie, index){
  return `<article class="movie-card" data-watch="${index}" tabindex="0">
    <div class="poster"><span>${movie.tag}</span></div>
    <div class="movie-body"><h3>${movie.title}</h3><p>${movie.genre} • ${movie.rating} ★</p></div>
  </article>`;
}
newGrid.innerHTML = movies.slice(0,5).map((m,i)=>card(m,i)).join("");
trendingGrid.innerHTML = movies.slice(5).map((m,i)=>card(m,i+5)).join("");

function showMovie(index){
  const m = movies[index];
  titleEl.textContent = m.title;
  descEl.textContent = m.desc;
  genreEl.textContent = m.genre.toUpperCase();
  metaEl.innerHTML = `<span>${m.year}</span><span>${m.rating} ★</span><span>HD</span><span>Subtitles</span>`;
  player.src = demoVideo;
  modal.classList.remove("hidden");
  player.play().catch(()=>{});
}
document.addEventListener("click", e=>{
  const target = e.target.closest("[data-watch]");
  if(target) showMovie(Number(target.dataset.watch));
});
document.addEventListener("keydown", e=>{
  if(e.key==="Enter" && document.activeElement?.dataset?.watch) showMovie(Number(document.activeElement.dataset.watch));
  if(e.key==="Escape") closeMovie();
});
function closeMovie(){ player.pause(); player.removeAttribute("src"); player.load(); modal.classList.add("hidden"); }
document.getElementById("closeMovie").onclick = closeMovie;

function notify(message){
  toast.textContent = message; toast.classList.remove("hidden");
  setTimeout(()=>toast.classList.add("hidden"),2200);
}
["trialBtn","pricingTrial"].forEach(id=>document.getElementById(id).onclick=()=>notify("7-day trial flow will be connected to the subscription system."));
document.getElementById("loginBtn").onclick=()=>notify("Google and email sign-in will be connected here.");
document.getElementById("languageBtn").onclick=()=>notify("Language selector ready for the multilingual system.");
document.getElementById("profileBtn").onclick=()=>notify("Profile creation will include a unique username.");
document.getElementById("messageBtn").onclick=()=>notify("Messaging will be connected to user accounts.");
document.getElementById("heroList").onclick=()=>notify("Added to My List (demo).");
document.getElementById("addList").onclick=()=>notify("Added to My List (demo).");
