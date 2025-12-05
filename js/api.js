// js/api.js
const API_KEY = "360ff4bc19123f8e594043f1413440e6";
const BASE_URL = "https://api.themoviedb.org/3";

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("API request failed");
    }
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
}

// گرفتن لیست ژانرها
export async function getGenres() {
  const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`;
  return fetchJson(url);
}

// گرفتن فیلم‌ها بر اساس ژانر
export async function getMoviesByGenre(genreId, page = 1) {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`;
  return fetchJson(url);
}
// جستجوی فیلم‌ها
export async function searchMovies(query, page = 1) {
  if (!query) return { results: [] };

  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
    query
  )}&page=${page}&include_adult=false`;

  return fetchJson(url);
}
export async function getTrendingMovies() {
  const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=en-US`;
  return fetchJson(url);
}

export async function getPopularMovies(page = 1) {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;
  return fetchJson(url);
}
// گرفتن جزئیات اصلی فیلم
export async function getMovieDetails(id) {
  const url = `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`;
  return fetchJson(url);
}

// گرفتن لیست بازیگران و عوامل
export async function getMovieCredits(id) {
  const url = `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=en-US`;
  return fetchJson(url);
}

// گرفتن عکس‌ها (backdrops و posters)
export async function getMovieImages(id) {
  const url = `${BASE_URL}/movie/${id}/images?api_key=${API_KEY}`;
  return fetchJson(url);
}
