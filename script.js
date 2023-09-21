const instance = axios.create({
    baseURL: 'https://tmdb-proxy.cubos-academy.workers.dev',
    timeout: 10000,
    headers: { 'Content-type': 'Application/json' }
});
let index = 0;
let pageIndex = 0;
let page0 = [];
let page1 = [];
let page2 = [];
let theme = 'light';

async function getMovies(endpoint) {
    try {
        const movies = await instance.get(endpoint);
        index = 0;
        pageIndex = 0;
        page0 = [];
        page1 = [];
        page2 = [];

        for (const defaultMovie of document.querySelectorAll('.movie')) {
            defaultMovie.remove();
        }
        for (const movie of movies.data.results) {
            const movieDiv = document.createElement('div');
            const infoDiv = document.createElement('div');
            const titleSpan = document.createElement('span');
            const ratingSpan = document.createElement('span');
            const star = document.createElement('img');

            movieDiv.classList.add('movie');
            movieDiv.style.backgroundImage = `url('${movie.poster_path}')`;

            infoDiv.classList.add('movie__info');
            titleSpan.classList.add('movie__title');
            titleSpan.textContent = movie.title;
            ratingSpan.classList.add('movie__rating');
            ratingSpan.textContent = movie.vote_average.toFixed(1);
            star.alt = 'estrela';
            star.src = './assets/estrela.svg';

            ratingSpan.appendChild(star);
            infoDiv.appendChild(titleSpan);
            infoDiv.appendChild(ratingSpan);
            movieDiv.appendChild(infoDiv);
            movieDiv.addEventListener('click', async (event) => {
                const modalInfo = await instance.get(`/3/movie/${movie.id}?language=pt-BR`);

                for (let genre of modalInfo.data.genres) {
                    const genreSpan = document.createElement('span');

                    genreSpan.classList.add('modal__genre');
                    genreSpan.textContent = genre.name;
                    document.querySelector('.modal__genres').appendChild(genreSpan);
                }
                document.querySelector('.modal__title').textContent = modalInfo.data.title;
                document.querySelector('.modal__img').src = modalInfo.data.backdrop_path;
                document.querySelector('.modal__description').textContent = modalInfo.data.overview;
                document.querySelector('.modal__average').textContent = String(modalInfo.data.vote_average.toFixed(1));
                document.querySelector('.modal').classList.remove('hidden');
            })
            document.querySelector('.movies').appendChild(movieDiv);
            index++;
        }
        for (index = 0; index < document.getElementsByClassName('movie').length; index++) {
            if (index < 6) {
                document.getElementsByClassName('movie')[index].style.display = 'flex';
            } else {
                document.getElementsByClassName('movie')[index].style.display = 'none';
            }
            pageIndex = 0;
        }
        for (index = 0; index < 6; index++) {
            page0.push(document.getElementsByClassName('movie')[index]);
        }
        for (index = 6; index < 12; index++) {
            page1.push(document.getElementsByClassName('movie')[index]);
        }
        for (index = 12; index < 18; index++) {
            page2.push(document.getElementsByClassName('movie')[index]);
        }

    } catch {
        alert('Erro ao recuperar os filmes! :(');
    }
    document.querySelector('.input').value = '';

    if (document.querySelectorAll('.movie').length < 1) {
        alert('Não encontramos resultados para a sua busca!');
    }
}
async function getHighlight() {
    try {
        const movieData = await instance.get('/3/movie/436969?language=pt-BR');
        const movieVideo = await instance.get('/3/movie/436969/videos?language=pt-BR');
        let genres = '';
        const data = new Date(movieData.data.release_date).toLocaleDateString("pt-BR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
        });

        for (let genre of movieData.data.genres) {
            genres += genre.name;
            if (movieData.data.genres.indexOf(genre) < (movieData.data.genres.length - 1)) {
                genres += ', ';
            }
        }

        document.querySelector('.highlight__video').style.backgroundImage = `url(${movieData.data.backdrop_path})`;
        document.querySelector('.highlight__video').style.backgroundSize = '100%';
        document.querySelector('.highlight__title').textContent = movieData.data.title;
        document.querySelector('.highlight__rating').textContent = movieData.data.vote_average.toFixed(1);
        document.querySelector('.highlight__genres').textContent = genres;
        document.querySelector('.highlight__launch').textContent = data;
        document.querySelector('.highlight__description').textContent = movieData.data.overview;
        document.querySelector('.highlight__video-link').href = `https://www.youtube.com/watch?v=${movieVideo.data.results[0].key}`
    } catch {
        alert('O filme do dia desapareceu! :O');
    }
}

getMovies('/3/discover/movie?language=pt-BR&include_adult=false');
getHighlight();

document.querySelector('.btn-next').addEventListener('click', (event) => {
    if (pageIndex == 0) {
        for (let movie of page0) {
            movie.style.display = 'none';
        }
        for (let movie of page1) {
            movie.style.display = 'flex';
        }
        pageIndex++;
    } else if (pageIndex == 1) {
        for (let movie of page1) {
            movie.style.display = 'none';
        }
        for (let movie of page2) {
            movie.style.display = 'flex';
        }
        pageIndex++;
    } else {
        for (let movie of page2) {
            movie.style.display = 'none';
        }
        for (let movie of page0) {
            movie.style.display = 'flex';
        }
        pageIndex = 0;
    }
})
document.querySelector('.btn-prev').addEventListener('click', (event) => {
    if (pageIndex == 0) {
        for (let movie of page0) {
            movie.style.display = 'none';
        }
        for (let movie of page2) {
            movie.style.display = 'flex';
        }
        pageIndex = 2;
    } else if (pageIndex == 1) {
        for (let movie of page1) {
            movie.style.display = 'none';
        }
        for (let movie of page0) {
            movie.style.display = 'flex';
        }
        pageIndex--;
    } else {
        for (let movie of page2) {
            movie.style.display = 'none';
        }
        for (let movie of page1) {
            movie.style.display = 'flex';
        }
        pageIndex--;
    }
})
document.querySelector('.input').addEventListener('keypress', (event) => {
    event.stopPropagation();

    if (event.key == 'Enter') {
        if (!document.querySelector('.input').value) {
            getMovies('/3/discover/movie?language=pt-BR&include_adult=false');
        } else {
            try {
                getMovies(`/3/search/movie?language=pt-BR&include_adult=false&query=${document.querySelector('.input').value}`);
            } catch {
                alert('Tivemos um problema com a busca, sentimos muito :(');
            }
        }
    }
})
document.querySelector('.modal').addEventListener('click', (event) => {
    document.querySelector('.modal').classList.add('hidden');
    for (let genre of document.querySelectorAll('.modal__genre')) {
        genre.remove();
    }
})
document.querySelector('.btn-theme').addEventListener('click', (event) => {
    if (theme == 'light') {
        document.querySelector('.btn-theme').src = './assets/dark-mode.svg';
        document.querySelector('body').style.backgroundColor = 'var(--text-color)';
        document.querySelector('header').style.backgroundColor = 'var(--text-color)';
        document.querySelector('img').src = './assets/logo.svg';
        document.querySelector('.header__title').style.color = 'var(--background)';
        document.querySelector('input').style.color = 'var(--background)';
        document.querySelector('.input').style.backgroundColor = 'var(--input-color-dark)';
        document.querySelector('.movies-container').style.backgroundColor = 'var(--bg-dark-secondary)';
        document.querySelector('.highlight').style.backgroundColor = 'var(--bg-dark-secondary)';
        document.querySelector('.highlight__genre-launch').style.color = 'var(--background)';
        document.querySelector('.highlight__title').style.color = 'var(--background)';
        document.querySelector('.highlight__description').style.color = 'var(--background)';
        document.querySelector('.modal__body').style.backgroundColor = 'var(--bg-dark-secondary)';
        document.querySelector('.modal__title').style.color = 'var(--background)';
        document.querySelector('.modal__description').style.color = 'var(--background)';
        document.querySelector('.btn-prev').src = './assets/arrow-left-light.svg';
        document.querySelector('.btn-next').src = './assets/arrow-right-light.svg';
        theme = 'dark';
    } else {
        document.querySelector('.btn-theme').src = './assets/light-mode.svg';
        document.querySelector('body').style.backgroundColor = 'var(--background)';
        document.querySelector('header').style.backgroundColor = 'var(--background)';
        document.querySelector('img').src = './assets/logo-dark.png';
        document.querySelector('.header__title').style.color = 'var(--text-color)';
        document.querySelector('input').style.color = 'var(--text-color)';
        document.querySelector('.input').style.backgroundColor = 'var(--background)';
        document.querySelector('.movies-container').style.backgroundColor = 'var(--bg-secondary)';
        document.querySelector('.highlight').style.backgroundColor = 'var(--bg-secondary)';
        document.querySelector('.highlight__genre-launch').style.color = 'var(--text-color)';
        document.querySelector('.highlight__title').style.color = 'var(--text-color)';
        document.querySelector('.highlight__description').style.color = 'var(--text-color)';
        document.querySelector('.modal__body').style.backgroundColor = 'var(--bg-secondary)';
        document.querySelector('.modal__title').style.color = 'var(--text-color)';
        document.querySelector('.modal__description').style.color = 'var(--text-color)';
        document.querySelector('.btn-prev').src = './assets/arrow-left-dark.svg';
        document.querySelector('.btn-next').src = './assets/arrow-right-dark.svg';
        theme = 'light';
    }
})