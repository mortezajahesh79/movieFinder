// js/home.js
import {
  getGenres,
  searchMovies,
  getTrendingMovies,
  getPopularMovies,
} from "./api.js";

const genreBtn = document.querySelector("#genreButton");
const genreList = document.querySelector("#genreList");

const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");
const suggestionsBox = document.querySelector("#searchSuggestions");
const heroSlider = document.querySelector("#heroSlider");
const moviesGrid = document.querySelector(".movies-grid");
const paginationEl = document.querySelector("#homePagination");

let currentPage = 1;
let totalPages = 1;

// نقشه‌ی ژانرها: { 28: "Action", 12: "Adventure", ... }
let genreMap = {};

// -------------------------
// ژانرها (dropdown + map)
// -------------------------

// باز و بسته شدن منوی ژانر
genreBtn?.addEventListener("click", () => {
  genreList?.classList.toggle("active");
});

// لود کردن ژانرها از API و ساخت آیتم‌ها + ساخت genreMap
async function loadGenres() {
  try {
    const data = await getGenres();
    const genres = data.genres || [];

    // ساخت map برای تبدیل genre_ids به اسم ژانر
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
  } catch (error) {
    console.error("Error loading genres:", error);
    if (genreList) {
      genreList.innerHTML = `<div class="dropdown-error">Failed to load genres</div>`;
    }
  }
}

// هندل کلیک روی هر ژانر
genreList?.addEventListener("click", (event) => {
  const item = event.target.closest(".genre-item");
  if (!item) return;

  const genreId = item.dataset.id;
  const genreName = item.dataset.name;

  const url = `genre.html?genreId=${genreId}&name=${encodeURIComponent(
    genreName
  )}`;
  window.location.href = url;
});

// -------------------------
// Hero slider (trending movies)
// -------------------------

async function loadHeroSlider() {
  if (!heroSlider) return;

  try {
    const data = await getTrendingMovies();
    const movies = (data.results || []).slice(0, 5); // ۵ تا اسلاید

    if (!movies.length) {
      heroSlider.innerHTML = "<p>No trending movies available.</p>";
      return;
    }

    // ساخت اسلایدها
    const slidesHtml = movies
      .map((movie, index) => {
        const backdropUrl = movie.backdrop_path
          ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
          : movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "";

        const genreNames =
          movie.genre_ids
            ?.map((id) => genreMap[id])
            .filter(Boolean)
            .slice(0, 3) || [];

        const overview =
          movie.overview || "No description available for this movie.";

        return `
          <div
            class="hero-slide ${index === 0 ? "active" : ""}"
            style="background-image: url('${backdropUrl}')"
            data-id="${movie.id}"
          >
            <div class="hero-overlay">
              <div class="hero-content">
                <h1 class="hero-title">${movie.title}</h1>

                <div class="hero-genres">
                  ${genreNames
                    .map((name) => `<span class="genre-pill">${name}</span>`)
                    .join("")}
                </div>

                <p class="hero-description">${overview}</p>
                <div class="hero-extra">In theaters</div>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // ساخت نقاط پایین
    const dotsHtml = `
      <div class="hero-dots">
        ${movies
          .map(
            (_, index) =>
              `<button class="hero-dot ${
                index === 0 ? "active" : ""
              }" data-index="${index}"></button>`
          )
          .join("")}
      </div>
    `;

    heroSlider.innerHTML = slidesHtml + dotsHtml;

    const slides = heroSlider.querySelectorAll(".hero-slide");
    const dots = heroSlider.querySelectorAll(".hero-dot");

    if (slides.length <= 1) return;

    let currentIndex = 0;

    function goToSlide(index) {
      slides[currentIndex].classList.remove("active");
      dots[currentIndex].classList.remove("active");

      currentIndex = index;

      slides[currentIndex].classList.add("active");
      dots[currentIndex].classList.add("active");
    }

    // auto-slide هر ۶ ثانیه
    setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      goToSlide(nextIndex);
    }, 6000);

    // کلیک روی نقطه‌ها
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const idx = Number(dot.dataset.index);
        goToSlide(idx);
      });
    });
  } catch (err) {
    console.error("Error loading hero slider:", err);
    heroSlider.innerHTML =
      "<p>Failed to load trending movies for the hero slider.</p>";
  }
}

// -------------------------
// Popular movies grid + pagination
// -------------------------

async function loadPopularMovies(page = 1) {
  if (!moviesGrid) return;

  try {
    const data = await getPopularMovies(page);
    const movies = data.results || [];

    currentPage = data.page || page;
    totalPages = data.total_pages || 1;

    if (!movies.length) {
      moviesGrid.innerHTML = "<p>No movies found.</p>";
      if (paginationEl) paginationEl.innerHTML = "";
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
            <img
              src="${posterUrl}"
              alt="${movie.title}"
              class="movie-poster"
            />
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

    // کلیک روی کارت → رفتن به صفحه جزئیات فیلم
    moviesGrid.onclick = (e) => {
      const card = e.target.closest(".movie-card");
      if (!card) return;

      const movieId = card.dataset.id;
      window.location.href = `movie.html?id=${movieId}`;
    };

    // بعد از رندر گرید، pagination را بساز
    buildPagination();
  } catch (err) {
    console.error("Error loading popular movies:", err);
    moviesGrid.innerHTML = "<p>Failed to load movies.</p>";
    if (paginationEl) paginationEl.innerHTML = "";
  }
}

// ساخت دکمه‌های pagination
function buildPagination() {
  if (!paginationEl || totalPages <= 1) {
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  const items = [];

  if (totalPages <= 7) {
    // همه صفحات را نشان بده
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

// کلیک روی pagination
paginationEl?.addEventListener("click", (e) => {
  const btn = e.target.closest(".page-btn");
  if (!btn || !btn.dataset.page) return;

  const page = Number(btn.dataset.page);
  if (page === currentPage) return;

  loadPopularMovies(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// -------------------------
// Search autocomplete
// -------------------------

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

      const genreNames =
        movie.genre_ids
          ?.map((id) => genreMap[id])
          .filter(Boolean)
          .slice(0, 2)
          .join(", ") || "No genre";

      return `
        <div class="search-suggestion-item" data-id="${movie.id}">
          <img src="${posterUrl}" alt="${movie.title}" class="search-suggestion-poster" />
          <div class="search-suggestion-text">
            <span class="search-suggestion-title">${movie.title}</span>
            <span class="search-suggestion-meta">${genreNames}</span>
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
  if (
    suggestionsBox &&
    !suggestionsBox.contains(e.target) &&
    !searchForm.contains(e.target)
  ) {
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

// -------------------------
// Init home page
// -------------------------

async function initHome() {
  await loadGenres(); // اول ژانرها بیاد که genreMap آماده باشه
  await loadHeroSlider(); // بعد slider
  await loadPopularMovies(); // بعد گرید فیلم‌ها (صفحه ۱)
}

initHome();
