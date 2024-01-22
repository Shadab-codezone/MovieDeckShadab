
    const apiKey = 'f531333d637d0c44abc85b3e74db2186';
    const moviesList = document.getElementById('movies');
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('search-btn');
    const sortDateButton = document.getElementById('sort-date-btn');
    const sortRatingButton = document.getElementById('sort-rating-btn');
    const allTab = document.getElementById('all-tab');
    const favoritesTab = document.getElementById('favorites-tab');
    const prevButton = document.getElementById('prev');
    const nextPage = document.getElementById('next');
    
    
    let moviesData = [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let currentPage = 1;
    let totalPages = 3;
    let currentTab = 'all';

    function addFav(movieId, isCurrentlyFavorite) {
        const foundIndex = favorites.findIndex(item => item.id === movieId);
    
        if (foundIndex > -1 && isCurrentlyFavorite) {
            // Movie is already in favorites and the button is currently active, remove it
            favorites.splice(foundIndex, 1);
        } else {
            // Movie is not in favorites or the button is not currently active, add it
            const movie = moviesData.find(item => item.id === movieId);
            if (movie) {
                favorites.push(movie);
            }
        }
    
        localStorage.setItem('favorites', JSON.stringify(favorites));
    
        // Update the icon immediately in the current movie list
        const movieCard = document.querySelector(`.movie-card[data-movie-id="${movieId}"]`);
        if (movieCard) {
            const favoriteButton = movieCard.querySelector('.favorite-btn');
            if (favoriteButton) {
                favoriteButton.classList.toggle('active', foundIndex === -1);
            }
        }
    }
    
    // Fetch movies from API
    async function fetchMovies(page) {
        const response = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=en-US&page=${page}`);
        const data = await response.json();
        return data.results;
    }

    

    // Render movies
    function renderMovies(movies) {
        moviesList.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = document.createElement('li');
            movieCard.classList.add('movie-card');
            movieCard.setAttribute('data-movie-id',movie.id);
            const isFavorite = favorites.some(item => item.id === movie.id);
            movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/original/${movie.poster_path || 'placeholder.jpg'}" alt="${movie.title}">
            <h3>${movie.title || 'movie-title'}</h3> 
            <span>Vote Count: ${movie.vote_count || 'vote-count'} &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp</span>
            <span class="favorite-btn ${isFavorite ? 'active' : ''}" onclick="addFav(${movie.id}, ${isFavorite})">
                <i class="${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </span>
            <p>Vote Average: ${movie.vote_average || 'vote-average'}</p>
            <p>Release Date: ${movie.release_date || 'release_date'}</p> 
        `;
            moviesList.appendChild(movieCard);
        });
    }

    sortDateButton.addEventListener('click', () => {
        sortMovies('date');
    });
    
    sortRatingButton.addEventListener('click', () => {
        sortMovies('rating');
    });
    // Sorting movies
    function sortMovies(property) {
        if (property === 'date') {
                moviesData.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
             
        } else if (property === 'rating') {
                moviesData.sort((a, b) => a.vote_average - b.vote_average);
        }
        renderMovies(moviesData);
    }
    

    // Search functionality
    searchButton.addEventListener('click', async () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredMovies = moviesData.filter(movie => movie.title.toLowerCase().includes(searchTerm));
        renderMovies(filteredMovies);
    });
    
    // Display favorite movies
    favoritesTab.addEventListener('click', () => {
        document.getElementsByClassName('favorite-btn').innerHTML = '<i class="fa-solid fa-heart"></i>';
        renderMovies(favorites);
    });

    allTab.addEventListener('click', () => {
        renderMovies(moviesData);
    });
    // Pagination
    function updatePaginationButtons() {
        prevButton.disabled = currentPage === 1; 
        nextPage.disabled = currentPage === totalPages;
    }

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchMovies(currentPage).then(movies => {
                moviesData = movies;
                renderMovies(moviesData);
                updatePaginationButtons();
                 document.getElementById('current-page').textContent = `Current Page: ${currentPage}`;
            });
        }
    });

    nextPage.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchMovies(currentPage).then(movies => {
                moviesData = movies;
                renderMovies(moviesData);
                updatePaginationButtons();
                document.getElementById('current-page').textContent = `Current Page: ${currentPage}`;
            });
        }
    });

    // Initial page load
    fetchMovies(currentPage).then(movies => {
        moviesData = movies;
        renderMovies(moviesData);
        updatePaginationButtons();
        document.getElementById('current-page').textContent = `Current Page: ${currentPage}`;
    });

