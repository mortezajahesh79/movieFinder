// js/movie.js
import {
  getGenres,
  searchMovies,
  getMovieDetails,
  getMovieCredits,
  getMovieImages,
} from "./api.js";

const genreBtn = document.querySelector("#genreButton");
const genreList = document.querySelector("#genreList");

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const suggestionsBox = document.querySelector("#searchSuggestions");

// ✅ مطابق movie.html
const loadingEl = document.querySelector("#movie-loading");
const errorEl = document.querySelector("#movie-error");
const movieDetailSection = document.querySelector("#movie-content");

let genreMap = {};

// ---- helper: گرفتن id از URL ----
function getMovieIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// --------------------
// Dropdown ژانرها
// --------------------
genreBtn?.addEventListener("click", () => {
  genreList?.classList.toggle("active");
});

async function loadGenres() {
  try {
    const data = await getGenres();
    const genres = data.genres || [];
    genreMap = Object.fromEntries(genres.map((g) => [g.id, g.name]));

    if (genreList) {
      genreList.innerHTML = genres
        .map(
          (genre) => `
          <button class="genre-item" data-id="${genre.id}" data-name="${genre.name}">
            ${genre.name}
          </button>
        `
        )
        .join("");
    }
  } catch (err) {
    console.error("Error loading genres:", err);
  }
}

genreList?.addEventListener("click", (event) => {
  const item = event.target.closest(".genre-item");
  if (!item) return;
  const genreId = item.dataset.id;
  const genreName = item.dataset.name;
  window.location.href = `genre.html?genreId=${genreId}&name=${encodeURIComponent(
    genreName
  )}`;
});

// --------------------
// helpers UI برای loading / error
// --------------------
function showLoading() {
  if (loadingEl) loadingEl.style.display = "block";
  if (errorEl) errorEl.style.display = "none";
  if (movieDetailSection) movieDetailSection.style.display = "none";
}

function showError(message) {
  if (loadingEl) loadingEl.style.display = "none";
  if (movieDetailSection) movieDetailSection.style.display = "none";
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function showContent() {
  if (loadingEl) loadingEl.style.display = "none";
  if (errorEl) errorEl.style.display = "none";
  if (movieDetailSection) movieDetailSection.style.display = "block";
}

// --------------------
// لود جزئیات فیلم
// --------------------
async function loadMovieDetails() {
  const movieId = getMovieIdFromUrl();
  console.log("movieId from URL:", movieId);

  if (!movieId) {
    showError("Movie not found.");
    return;
  }
  if (!movieDetailSection) {
    console.error("#movie-content not found in DOM");
    return;
  }

  showLoading();

  try {
    // موازی گرفتن دیتیل، کاست و عکس‌ها
    const [movie, credits, images] = await Promise.all([
      getMovieDetails(movieId),
      getMovieCredits(movieId),
      getMovieImages(movieId),
    ]);

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Image";

    const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
    const runtime = movie.runtime
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : "N/A";
    const vote =
      typeof movie.vote_average === "number"
        ? movie.vote_average.toFixed(1)
        : "N/A";
    const voteCount = movie.vote_count
      ? `(${movie.vote_count.toLocaleString()})`
      : "";

    // ✅ امن‌تر: اگر crew/cast نداشت، کرش نکنه
    const crew = Array.isArray(credits?.crew) ? credits.crew : [];
    const cast = Array.isArray(credits?.cast) ? credits.cast : [];

    const director = crew.find((p) => p.job === "Director");
    const writers = crew.filter((p) =>
      ["Writer", "Screenplay", "Story", "Characters"].includes(p.job)
    );
    const topCast = cast.slice(0, 12);

    const backdrops = Array.isArray(images?.backdrops)
      ? images.backdrops.slice(0, 4)
      : [];

    movieDetailSection.innerHTML = `
      <div class="movie-detail-header">
        <div class="movie-detail-submeta">
          <span>${year}</span>
          ${movie.adult === false ? `<span>• PG-13</span>` : ""}
          <span>• ${runtime}</span>

          <span class="movie-detail-rating-pill">
            ★ ${vote}/10
            <span>${voteCount}</span>
          </span>
        </div>
        <h1 class="movie-detail-title">${movie.title}</h1>
      </div>

      <div class="movie-detail-main">
        <div>
          <img
            src="${posterUrl}"
            alt="${movie.title}"
            class="movie-detail-poster"
          />
        </div>

        <div class="movie-detail-info-table">
          <div class="movie-detail-row">
            <div class="movie-detail-label">Genre</div>
            <div class="movie-detail-value movie-detail-genres">
              ${movie.genres
                ?.map(
                  (g) =>
                    `<button 
          class="movie-detail-genre-pill movie-detail-genre-btn" 
          data-id="${g.id}" 
          data-name="${g.name}"
      >
        ${g.name}
      </button>`
                )
                .join("")}
            </div>
          </div>

          <div class="movie-detail-row">
            <div class="movie-detail-label">Plot</div>
            <div class="movie-detail-value">
              ${movie.overview || "No description available."}
            </div>
          </div>

          <div class="movie-detail-row">
            <div class="movie-detail-label">Director</div>
            <div class="movie-detail-value">
              ${director ? director.name : "—"}
            </div>
          </div>

          <div class="movie-detail-row">
            <div class="movie-detail-label">Writers</div>
            <div class="movie-detail-value">
              ${
                writers.length
                  ? writers
                      .slice(0, 4)
                      .map((w) => w.name)
                      .join(" • ")
                  : "—"
              }
            </div>
          </div>

          <div class="movie-detail-row">
            <div class="movie-detail-label">Stars</div>
            <div class="movie-detail-value">
              ${
                topCast.length
                  ? topCast
                      .slice(0, 4)
                      .map((c) => c.name)
                      .join(" • ")
                  : "—"
              }
            </div>
          </div>
        </div>
      </div>

      <div class="movie-detail-stills">
        ${
          backdrops.length
            ? backdrops
                .map(
                  (img) => `
              <div class="movie-detail-still">
                <img src="https://image.tmdb.org/t/p/w500${img.file_path}" alt="${movie.title}" />
              </div>
            `
                )
                .join("")
            : ""
        }
      </div>

      <h2 class="movie-detail-section-title">Cast</h2>
      <div class="movie-detail-cast-grid">
        ${
          topCast.length
            ? topCast
                .map((actor) => {
                  const profile = actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : "https://via.placeholder.com/185x278?text=No+Image";
                  return `
                  <article class="cast-card">
                    <img src="${profile}" alt="${actor.name}" />
                    <div class="cast-card-body">
                      <div class="cast-card-name">${actor.name}</div>
                      <div class="cast-card-role">${actor.character || ""}</div>
                    </div>
                  </article>
                `;
                })
                .join("")
            : "<p>No cast information available.</p>"
        }
      </div>
    `;

    showContent();
  } catch (err) {
    console.error("Error loading movie details:", err);
    showError("Failed to load movie details. Please try again later.");
  }
}

// --------------------
// autocomplete سرچ (نسخه سبک)
// --------------------
function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function renderSuggestions(movies) {
  if (!suggestionsBox) return;

  if (!movies.length) {
    suggestionsBox.classList.remove("visible");
    suggestionsBox.innerHTML = "";
    return;
  }

  suggestionsBox.innerHTML = movies
    .slice(0, 8)
    .map((movie) => {
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
        : "https://via.placeholder.com/32x48?text=No+Img";

      return `
        <div class="search-suggestion-item" data-id="${movie.id}">
          <img src="${posterUrl}" alt="${movie.title}" class="search-suggestion-poster" />
          <div class="search-suggestion-text">
            <span class="search-suggestion-title">${movie.title}</span>
          </div>
        </div>
      `;
    })
    .join("");

  suggestionsBox.classList.add("visible");
}

const handleSearchInput = debounce(async () => {
  const query = searchInput.value.trim();
  if (query.length < 2) {
    renderSuggestions([]);
    return;
  }

  try {
    const data = await searchMovies(query);
    renderSuggestions(data.results || []);
  } catch (err) {
    console.error("Search error:", err);
    renderSuggestions([]);
  }
}, 400);

searchInput?.addEventListener("input", handleSearchInput);

suggestionsBox?.addEventListener("click", (e) => {
  const item = e.target.closest(".search-suggestion-item");
  if (!item) return;
  const movieId = item.dataset.id;
  renderSuggestions([]);
  window.location.href = `movie.html?id=${movieId}`;
});

document.addEventListener("click", (e) => {
  if (!suggestionsBox) return;

  const clickedInsideSuggestions = suggestionsBox.contains(e.target);
  const clickedInsideSearchForm = searchForm
    ? searchForm.contains(e.target)
    : false;

  if (!clickedInsideSuggestions && !clickedInsideSearchForm) {
    renderSuggestions([]);
  }
});

searchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  renderSuggestions([]);
  window.location.href = `search.html?q=${encodeURIComponent(query)}`;
});

// --------------------
// Init
// --------------------
console.log("movie.js loaded");

async function initMoviePage() {
  console.log("initMoviePage called");
  await loadGenres();
  await loadMovieDetails();
}
// کلیک روی ژانر در Movie Detail → رفتن به صفحه ژانر
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".movie-detail-genre-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  const name = btn.dataset.name;

  window.location.href = `genre.html?genreId=${id}&name=${encodeURIComponent(
    name
  )}`;
});

initMoviePage();
