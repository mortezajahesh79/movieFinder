// js/search.js
import { getGenres, searchMovies } from "./api.js";

// --- DOM refs ---
const genreBtn = document.querySelector("#genreButton");
const genreList = document.querySelector("#genreList");

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const suggestionsBox = document.querySelector("#searchSuggestions");

const titleEl = document.querySelector("#searchTitle");
const loadingEl = document.querySelector("#search-loading");
const errorEl = document.querySelector("#search-error");
const moviesGrid = document.querySelector("#searchMovies");
const paginationEl = document.querySelector("#searchPagination");

let genreMap = {};
let currentPage = 1;
let totalPages = 1;
let currentQuery = "";

// ---------- helpers URL ----------
function getSearchParams() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

// ---------- dropdown ژانرها ----------
console.log("search.js loaded", { genreBtn, genreList });

if (genreBtn && genreList) {
  genreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    genreList.classList.toggle("active");
  });
} else {
  console.warn("Genre dropdown elements not found in DOM (search page)");
}

// بستن dropdown با کلیک بیرون
document.addEventListener("click", (e) => {
  if (!genreList || !genreBtn) return;
  const clickedInside =
    genreList.contains(e.target) || genreBtn.contains(e.target);
  if (!clickedInside) {
    genreList.classList.remove("active");
  }
});

// لود ژانرها برای dropdown
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

// ---------- UI helpers ----------
function showLoading() {
  if (loadingEl) loadingEl.style.display = "block";
  if (errorEl) errorEl.style.display = "none";
  if (moviesGrid) moviesGrid.style.display = "none";
}

function showError(message) {
  if (loadingEl) loadingEl.style.display = "none";
  if (moviesGrid) moviesGrid.style.display = "none";
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function showMovies() {
  if (loadingEl) loadingEl.style.display = "none";
  if (errorEl) errorEl.style.display = "none";
  if (moviesGrid) moviesGrid.style.display = "grid";
}

// ---------- لود نتایج سرچ + pagination ----------
async function loadSearchResults(page = 1) {
  if (!currentQuery || !moviesGrid) {
    showError("No search query.");
    return;
  }

  showLoading();

  try {
    const data = await searchMovies(currentQuery, page);
    const movies = data.results || [];

    currentPage = data.page || page;
    totalPages = data.total_pages || 1;

    if (titleEl) {
      titleEl.textContent = `Search results for "${currentQuery}"`;
    }

    if (!movies.length) {
      moviesGrid.innerHTML = "<p>No movies found for this search.</p>";
      if (paginationEl) paginationEl.innerHTML = "";
      showMovies();
      return;
    }

    moviesGrid.innerHTML = movies
      .map((movie) => {
        const posterUrl = movie.poster_path
          ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
          : "https://via.placeholder.com/200x300?text=No+Image";

        const year = movie.release_date
          ? movie.release_date.slice(0, 4)
          : "N/A";

        const rating =
          typeof movie.vote_average === "number"
            ? movie.vote_average.toFixed(1)
            : "N/A";

        return `
          <article class="movie-card" data-id="${movie.id}">
            <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" />
            <div class="movie-info">
              <h3 class="movie-title">${movie.title}</h3>
              <div class="movie-meta">
                <span>${year}</span>
                <span>•</span>
                <span>★ ${rating}</span>
              </div>
              <button class="movie-more-btn">More info</button>
            </div>
          </article>
        `;
      })
      .join("");

    // کلیک روی کارت → صفحه جزئیات
    moviesGrid.onclick = (e) => {
      const card = e.target.closest(".movie-card");
      if (!card) return;
      const movieId = card.dataset.id;
      window.location.href = `movie.html?id=${movieId}`;
    };

    buildPagination();
    showMovies();
  } catch (err) {
    console.error("Error loading search results:", err);
    showError("Failed to load search results.");
  }
}

// ---------- pagination ----------
function buildPagination() {
  if (!paginationEl || totalPages <= 1) {
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  const items = [];

  if (totalPages <= 7) {
    // اگر تعداد صفحات کم بود، کل صفحات را نشان بده
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // الگوریتم: 1, ..., current-1, current, current+1, ..., last
    items.push(1);

    if (currentPage > 3) items.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (currentPage < totalPages - 2) items.push("...");
    items.push(totalPages);
  }

  paginationEl.innerHTML = items
    .map((val) => {
      if (val === "...") {
        return `<button class="page-btn page-btn-ellipsis" disabled>•••</button>`;
      }
      const isActive = val === currentPage ? "active" : "";
      return `<button class="page-btn ${isActive}" data-page="${val}">${val}</button>`;
    })
    .join("");
}

// ---------- autocomplete سرچ ----------
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
  const query = searchInput?.value.trim() ?? "";
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
  const query = searchInput?.value.trim() ?? "";
  if (!query) return;
  renderSuggestions([]);

  // رفتن به URL جدید با q
  window.location.href = `search.html?q=${encodeURIComponent(query)}`;
});

// ---------- Init ----------
async function initSearchPage() {
  currentQuery = getSearchParams().trim();

  if (!currentQuery) {
    showError("No search query provided.");
    return;
  }

  // میدان سرچ را با query پر کن
  if (searchInput) {
    searchInput.value = currentQuery;
  }

  await loadGenres();
  await loadSearchResults(1);
}

initSearchPage();
