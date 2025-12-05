remember for api to work u have to use a VPN okay or els it gonna error so pls use VPN Thanks
# movieFinder
https://movie-finder-task.vercel.app/
demo website
MovieFinder is a movie discovery web application built using
TheMovieDB (TMDB) API. Users can browse trending movies, search for films,
filter by genres, view detailed movie information, and explore casts,
posters, and backdrops in a clean and modern UI.
## ✨ Features
- Browse trending and popular movies
- Genre filtering + dynamic genre page
- Movie detail pages (cast, images, plots, directors)
- Search with autocomplete suggestions
- Pagination system (dynamic pages)
- Fully responsive design (mobile, tablet, desktop)
- Modular JavaScript + clean architecture
## 🛠 Tech Stack
- HTML5
- CSS3 (Modular: base/layout/components/pages)
- JavaScript (ES6 Modules)
- TMDB API
- Responsive Web Design
project/
│── index.html
│── movie.html
│── genre.html
│── search.html
│── README.md
│
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── component.css
│   ├── pages.css
│
├── js/
│   ├── api.js
│   ├── home.js
│   ├── movie.js
│   ├── genre.js
│   ├── search.js
│
└── assets/
    ├── icons/


## 🚀 How to Run Locally

1. Download or clone the project:
   git clone https://github.com/username/MovieFinder.git

2. Open the project folder.

3. Run a local server (because of ES6 modules):
   - VS Code → Live Server extension  
   - OR run:  npx serve

4. Open:
   http://localhost:3000
## 🔐 API Key
This project uses TMDB API.
To run the project, create an `api.js` file or replace the API_KEY
with your own TMDB key.

