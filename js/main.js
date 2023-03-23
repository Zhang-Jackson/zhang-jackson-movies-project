function getMovieListDbData() {
    showLoading();
    $('#movieList').html("");
    fetch(dbUrl).then(resp => resp.json())
        .then(data => {
            setMovieList(data)
        })
        .finally(() => {
            hideLoading();
        });
}
function sortByRatings(){
    switch (selectSortType.value){
        case '1': //rating low to high
            userMovieList.sort(
                (a, b) => (parseInt(a.dbRating) > parseInt(b.dbRating)) ? 1 : (parseInt(a.dbRating) < parseInt(b.dbRating) ? -1 : 0)
            );
            sortMe(userMovieList);
            break;
        case '2': //rating high to low
            userMovieList.sort(
                (a, b) => (parseInt(a.dbRating) < parseInt(b.dbRating)) ? 1 : (parseInt(a.dbRating) > parseInt(b.dbRating) ? -1 : 0)
            );
            sortMe(userMovieList);
            break;
        case '3': // sort alpa a-Z
            userMovieList.sort(
                (a, b) => ((a.title) > (b.title)) ? 1 : ((a.title) < (b.title) ? -1 : 0)
            );
            sortMe(userMovieList);
            break;
        case '4': //sort alpha z-a
            userMovieList.sort(
                (a, b) => ((a.title) < (b.title)) ? 1 : ((a.title) > (b.title) ? -1 : 0)
            );
            sortMe(userMovieList);
            break;
        default: //sort by id low to high
            userMovieList.sort(
                (a, b) => (parseInt(a.id) > parseInt(b.id)) ? 1 : (parseInt(a.id) < parseInt(b.id) ? -1 : 0)
            );
            sortMe(userMovieList);
            break;
    }
}

function sortMe(movieSet){
    emptyButtonArrays();
    let html = "";
    html = createMovieListHtml(movieSet);
    $('#movieList').html(html);

    setGenreSelector();

    $('.movieTitle').each(function() {
        const titleLength = $(this).text().length;
        if(titleLength > 25) {
            $(this).css("font-size", "13px");
        }
    });

    createButtons(editSubmitBtns, editMovie);
    createButtons(editDeleteBtns, deleteMovie);
    createButtons(cardList, cardThing);
}

function createMovieListArray(data){
    for(let movie of data){
        userMovieList.push(makeMovieObject2(movie));
    }
    sortMe(userMovieList);
}

function makeMovieObject2(data){
    return {
        title: data.title,
        poster: data.poster,
        rating: data.rating,
        dbRating: data.dbRating,
        dbId: data.dbId,
        id: data.id,
        genres: data.genres,
        runtime: data.runtime,
        release: data.release,
        overview: data.overview
    };
}

function setMovieList(data){
    userMovieList = [];
    setTimeout(() => {
        createMovieListArray(data);
    },1500)
}

function createButtons(btnArray, btnFunction){
    for(let button of btnArray){
        let newButton = document.querySelector(button);
        newButton.addEventListener("click",btnFunction);
    }
}

function fetchThis(method, jsonObject, movieId){
    showLoading();
    if(method === 'DELETE'){
        fetch(dbUrl + movieId, {
            method: method,
        }).then(() => {
            emptyButtonArrays();
            getMovieListDbData();
            hideLoading();
        });

    } else {
        fetch(dbUrl + movieId, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonObject)
        }).then(() => {
            emptyButtonArrays();
            getMovieListDbData();
            hideLoading();
        });
    }
}

function addMovie(movieId, userRating){
    $.get(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${movieKey}`,
        {}
    ).done(function (data) {
        console.log(data);

        let newMovie = makeMovieObject(data);

        if(userRating >= 1 && userRating <= 10){
            newMovie.rating = userRating;
        } else {
            newMovie.rating = "N/A";
        }

        fetchThis("POST", newMovie, "");

        addTitle.value = "";
        addRating.value = "";
    });
}

function emptyButtonArrays(){
    editSubmitBtns = [];
    editDeleteBtns = [];
    selectMovieBtns = [];
    cardList = [];
}

function deleteMovie(e) {
    e.preventDefault();
    let btn = (e.target.id).indexOf("-");
    let btnId = (e.target.id).slice(btn + 1);
    console.log(btn);
    console.log(btnId);
    let movie = document.getElementById(`editMovieId-${btnId}`)
    console.log(movie);
    let movieId = movie.innerText;

    fetchThis("DELETE",null,movieId)
}

function searchMovie(e){
    e.preventDefault();
    searchTheMovieDB(addTitle.value);
}

function selectMovie(e){
    let btn = (e.target.id).indexOf("-");
    let btnId = (e.target.id).slice(btn + 1);

    let db = document.getElementById(`selectMovieId-${btnId}`)
    let dbId = db.innerText;

    let userRating = addRating.value;

    addMovie(dbId, userRating);
    movieSearchDiv.innerHTML = "";
}

function cardThing(e){
    let back = (e.target.parentNode.parentNode.id).indexOf("-");
    let backId = (e.target.parentNode.parentNode.id).slice(back + 1);
    let back2 = (e.target.id).indexOf("-");
    let backId2 = (e.target.id).slice(back2 + 1);

    let clickedBackText = document.getElementById(`cardBack-${backId}`);
    let clickedBackText2 = document.getElementById(`cardBack-${backId2}`);

    if (clickedBackText){
        clickedBackText.hidden = !clickedBackText.hidden;
    } else {
        clickedBackText2.hidden = !clickedBackText2.hidden;
    }
}

function editMovie(e){
    let btn = (e.target.id).indexOf("-");
    let btnId = (e.target.id).slice(btn + 1);

    let movie = document.getElementById(`editMovieId-${btnId}`)
    let movieId = movie.innerText;

    let db = document.getElementById(`editMovieDbId-${btnId}`)
    let dbId = db.innerText;

    getMovieObjectData(movieId, dbId, btnId);
}

function getMovieObjectData(movieId, dbId, btnId){
    $.get(
        `https://api.themoviedb.org/3/movie/${dbId}?api_key=${movieKey}`,
        {}
    ).done(function (data) {
        let movieObject = makeMovieObject(data);

        let editRating = document.getElementById(`editMovieRating${btnId}`);

        let userRating = editRating.value;
        if(userRating >= 1 && userRating <= 10){
            movieObject.rating = userRating;
        } else {
            movieObject.rating = "N/A";
        }

        fetchThis("PUT", movieObject, movieId);
    });
}

function makeMovieObject(data){
    let genreArray = [];
    for(let genre of data.genres){
        genreArray.push(genre.name);
    }
    return {
        title: data.title,
        poster: data.poster_path,
        rating: 0,
        dbRating: data.vote_average,
        dbId: data.id,
        genres: genreArray,
        runtime: data.runtime,
        release: data.release_date,
        overview: data.overview
    };
}

function searchTheMovieDB(movie){
    $.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${movie}`,
        {}
    ).done(function (data) {
        createMovieSearchHtml(data);
    });
}
function getMoviesWithImages(data){
    let hasImageArray=[];
    for (let i = 0; i < data.results.length; i++){
        let dbImage = data.results[i].backdrop_path;
        if (!dbImage){
        }else{
            hasImageArray.push(i);
        }
    }
    return hasImageArray;
}

function showLoading() {
        document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    },1500)
}

function createGenreHtml(data){
    let html = "";
    console.log(data);
    if(!data){
        data = ["genres"]
    }
    for(let genre of data){
        html += `<div class="badge bg-accent-normal col-auto">`
        html += `<span>${genre}</span>`
        html += `</div>`

        if(!genreList.includes(genre)){
            genreList.push(genre);
        }
    }
    return html;
}

function setGenreSelector(){
    let html =``;
    html += `<option selected value="0">select genre</option>`
    for(let genre of genreList){
        html += `<option value="${genre}">${genre}</option>`
    }
    selectGenre.innerHTML = html;
}

function sortByGenre(){
    moviesByGenre = [];
    let selectedGenre = selectGenre.value;
    for(let movie of userMovieList){
        let isMatch = false;
        for(let genre of movie.genres){
            if(selectedGenre === genre){
                isMatch = true;
            }
        }
        if(isMatch){
            moviesByGenre.push(movie);
        }
    }
    sortMe(moviesByGenre);
}

function createMovieListHtml(data){
    let html = '';
    for(let i = 0; i < data.length; i++) {
        let databaseRating = data[i].dbRating;
        html += `<div class="card col-auto px-0 border-0" id="cardFront-${[i]}" data-front-hidden="false">`;
        html += `<div class="card-header p-0  img-fluid position-relative">`;
        html += `<span class=" avg-badge badge rounded-pill">${parseFloat(databaseRating).toFixed(1)}</span>`;
        html += `<span class=" usr-badge badge rounded-pill">${data[i].rating}</span>`;
        html += `<img src="https://image.tmdb.org/t/p/w300/${data[i].poster}" alt="movie" class="rounded img-fluid" id="image-${[i]}">`;
        html += `<button type="button" class="btn bg-accent-normal rounded-circle btn-edit p-2" id="btn-edit${[i]}" data-bs-toggle="modal" data-bs-target="#editModal${i}">`;
        html += `<img src="/assets/pencil.svg" alt="edit icon" style="width: 18px; aspect-ratio: 1;"></button>`;
        html += `</div>`;



        html += `<div class="card overflow-scroll position-absolute p-2 border-0" data-back-hidden="true" id="cardBack-${[i]}" hidden="hidden">`;
        html += `<p class="movieTitle text-center notSelectable">${data[i].title}</p>`

        html += `<div class="row mx-auto d-flex justify-content-center gap-1 mb-3">`
        html += createGenreHtml(data[i].genres);
        html += `</div>`

        html += `<p class="notSelectable">${data[i].overview}</p>`
        html += `<p class="notSelectable"><span class="fw-bold">Release: </span>${data[i].release}`;
        html += `<p class="notSelectable" ><span class="fw-bold">Runtime: </span>${data[i].runtime} minutes</p>`
        html += `</div>`;//end card2
        html += `</div>`;//end of card set
        html += createModalHtml(data[i], i);
        cardList.push(`#cardFront-${[i]}`);
    }
    return html;
}

function createModalHtml(data, i){
    let html ='';
    html += `<div class="modal fade" id="editModal${i}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editModalLabel${i}" aria-hidden="true">`;
    html += `<div class="modal-dialog">`;
    html += `<div class="modal-content">`;

    html += `<div class="modal-header bg-primary-dark text-light border-0">`;
    html += `<p id="editModalLabel${i}" class="modal-title fs-5 fw-bold color-primary-ark">Edit Movie`;
    html += `<span id="editMovieId-${i}" class="visually-hidden"> ${data.id}</span></p>`;
    html += `<span id="editMovieDbId-${i}" class="visually-hidden"> ${data.dbId}</span></p>`;
    html += `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`;
    html += `</div>`;//end of modal header

    html += `<div class="modal-body bg-primary-dark text-light border-0">`;
    html += `<form>`;
    html += `<h2 id="editMovieName${i}">${data.title}</h2>`;
    html += `<br>`;
    html += `<label for="editMovieRating${i}" class="">Your Rating</label>`;
    html += `<br>`;
    html += `<input type="text" id="editMovieRating${i}" class="input-group-text" value="${data.rating}"`;
    html += `<br>`;
    html += `</form>`;
    html += `</div>`;//end modal body

    html += `<div class="modal-footer bg-accent-dark border-0">`;
    html += `<div class="me-auto">`
    html += `<button type="button" class="btn bg-primary-dark color-accent-normal ms-0" id="btnDelete-${[i]}" data-movieid="${data.id}" data-bs-dismiss="modal">Delete</button>`;
    html += `</div>`//end of deleteBtn
    html += `<button type="button" class="btn bg-accent-normal text-light" data-bs-dismiss="modal">Cancel</button>`;
    html += `<button type="button" class="btn bg-accent-normal text-light" data-bs-dismiss="modal" id="btnSubmitEdit-${[i]}">Submit</button>`;
    html += `</div>`;//end of modal-footer

    html += `</div>`;//end of modal-content
    html += `</div>`;//end of modal-dialog
    html += `</div>`;//end of modal

    editSubmitBtns.push(`#btnSubmitEdit-${[i]}`);
    editDeleteBtns.push(`#btnDelete-${[i]}`);
    return html;
}

function createMovieSearchHtml(data){
    let hasImageArray = getMoviesWithImages(data);
    let numberOfDisplayedMovies = 10;
    if (hasImageArray.length < numberOfDisplayedMovies){
        numberOfDisplayedMovies = hasImageArray.length;
    }
        let html = "";
        for (let i = 0; i < numberOfDisplayedMovies; i++){

            html += `<div class="card searchedCards col-auto p-0 mx-auto my-3 border-0 h-100">`
            html += `<div class="card-header p-0 overflow-hidden position-relative">`
            html += `<img src="https://image.tmdb.org/t/p/w300/${data.results[(hasImageArray[i])].backdrop_path}" alt="movie"
                        class="img-fluid">`
            html += `<span class=" search-badge badge rounded-pill">${(data.results[(hasImageArray[i])].vote_average).toFixed(1)}</span>`;
            html += `</div>`//end of header
            // html += `<div class="card-body border-0">`
            //
            // html += `</div>`//end of body
            html += `<div class="card-footer bg-accent-dark text-light border-0">`
            html += `<p>${data.results[(hasImageArray[i])].title}</p>`
            html += `<p id="selectMovieId-${i}" class="visually-hidden">${data.results[(hasImageArray[i])].id}</p>`
            html += `<button type="button" class="btn bg-accent-normal text-light" id="btnSelect-${[i]}">`
            html += `Select</button>`
            html += `</div>`//end of footer
            html += `</div>`//end of card

            selectMovieBtns.push(`#btnSelect-${[i]}`);
        }

    movieSearchDiv.innerHTML = html;
    createButtons(selectMovieBtns, selectMovie);
}

const dbUrl = "https://productive-bristle-edam.glitch.me/movies/"
let userMovieList = [];
let editDeleteBtns = [];
let editSubmitBtns = [];
let selectMovieBtns = [];
let genreList = [];
let cardList = [];
let moviesByGenre = [];

let addTitle = document.getElementById("addMovieName");
let addRating = document.getElementById('addMovieRating');
const movieSearchDiv = document.getElementById("movieSearchDiv");
const searchMovieBtn = document.querySelector("#btn-addMovie");
const selectSortType = document.querySelector("#select-sort");
const selectGenre = document.querySelector("#select-genre");

searchMovieBtn.addEventListener("click", searchMovie);
selectSortType.addEventListener("change", sortByRatings);
selectGenre.addEventListener("change", sortByGenre);

getMovieListDbData();

