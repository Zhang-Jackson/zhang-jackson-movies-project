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
    console.log(selectSortType.value);
    switch (selectSortType.value){
        case '1': //rating low to high
            userMovieList.sort(
                (a, b) => (parseInt(a.dbRating) > parseInt(b.dbRating)) ? 1 : (parseInt(a.dbRating) < parseInt(b.dbRating) ? -1 : 0)
            );
            sortMe();
            break;
        case '2': //rating high to low
            console.log(userMovieList);
            userMovieList.sort(
                (a, b) => (parseInt(a.dbRating) < parseInt(b.dbRating)) ? 1 : (parseInt(a.dbRating) > parseInt(b.dbRating) ? -1 : 0)
            );
            console.log(userMovieList);
            sortMe();
            break;
        case '3': // sort alpa a-Z
            userMovieList.sort(
                (a, b) => ((a.title) > (b.title)) ? 1 : ((a.title) < (b.title) ? -1 : 0)
            );
            sortMe();
            break;
        case '4': //sort alpha z-a
            userMovieList.sort(
                (a, b) => ((a.title) < (b.title)) ? 1 : ((a.title) > (b.title) ? -1 : 0)
            );
            sortMe();
            break;
        default: //sort by id low to high
            userMovieList.sort(
                (a, b) => (parseInt(a.id) > parseInt(b.id)) ? 1 : (parseInt(a.id) < parseInt(b.id) ? -1 : 0)
            );
            sortMe();
            break;
    }

}

function sortMe(){
    emptyButtonArrays();
    let html = "";
    html = createMovieListHtml(userMovieList);
    $('#movieList').html(html);

    $('.movieTitle').each(function() {
        const titleLength = $(this).text().length;
        if(titleLength > 25) {
            $(this).css("font-size", "13px");
        }
    });

    console.log(`submit buttons: ${editSubmitBtns}`);
    createButtons(editSubmitBtns, editMovie);
    createButtons(editDeleteBtns, deleteMovie);
}

function createMovieListArray(data){
    for(let movie of data){
        userMovieList.push(makeMovieObject2(movie));
    }
    sortMe();
    console.log("called");
    console.log(userMovieList);
}

function makeMovieObject2(data){
    return {
        title: data.title,
        poster: data.poster,
        rating: data.rating,
        dbRating: data.dbRating,
        dbId: data.dbId,
        id: data.id
    };
}

function setMovieList(data){
    userMovieList = [];
    setTimeout(() => {
        createMovieListArray(data);
        $('.movieTitle').each(function() {
            const titleLength = $(this).text().length;
            if(titleLength <= 50 && titleLength > 23) {
                $(this).css("font-size", "13px");
            } else if (titleLength > 50 ) {
                $(this).css("font-size", "11px");
            }
        });
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

        let newMovie = {
            title:data.title,
            rating:userRating,
            poster:data.poster_path,
            dbRating:data.vote_average,
            dbId:data.id
        }

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
}

function deleteMovie(e) {
    e.preventDefault();
    let btn = (e.target.id).indexOf("-");
    let btnId = (e.target.id).slice(btn + 1);

    let movie = document.getElementById(`editMovieId-${btnId}`)
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

    console.log(`Db id: ${dbId}`);
    addMovie(dbId, userRating);
    movieSearchDiv.innerHTML = "";
}

function editMovie(e){
    let btn = (e.target.id).indexOf("-");
    let btnId = (e.target.id).slice(btn + 1);

    let movie = document.getElementById(`editMovieId-${btnId}`)
    let movieId = movie.innerText;

    let db = document.getElementById(`editMovieDbId-${btnId}`)
    let dbId = db.innerText;

    console.log("db ID:");
    console.log(dbId);
    getMovieObjectData(movieId, dbId, btnId);
}

function getMovieObjectData(movieId, dbId, btnId){
    $.get(
        `https://api.themoviedb.org/3/movie/${dbId}?api_key=${movieKey}`,
        {}
    ).done(function (data) {
        console.log(data);
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
    return {
        title: data.title,
        poster: data.poster_path,
        rating: 0,
        dbRating: data.vote_average,
        dbId: data.id
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

function createMovieListHtml(data){
    let html = '';
    for(let i = 0; i < data.length; i++) {
        let databaseRating = data[i].dbRating;
        html += `<div class="card col-auto px-0 mx-3">`;
        html += `<div class="card-header p-0  img-fluid position-relative">`;
        html += `<span class=" avg-badge badge rounded-pill">${parseFloat(databaseRating).toFixed(1)}</span>`;
        html += `<span class=" usr-badge badge rounded-pill">${data[i].rating}</span>`;
        html += `<img src="https://image.tmdb.org/t/p/w300/${data[i].poster}" alt="movie" class="rounded-top img-fluid">`;
        html += `<button type="button" class="btn-edit rounded-circle p-2" id="btn-edit${[i]}" data-bs-toggle="modal" data-bs-target="#editModal${i}">`;
        //html += `<img src="/assets/pencil.svg" alt="edit icon" style="width: 18px; aspect-ratio: 1;"></button>`;
        html += `<i class="fa-solid fa-pen-to-square fa-xl" alt="edit icon"></i></button>`;
        html += `</div>`;

        html += `<div class="card-title p=0 d-flex align-items-center text-center">`;
        html += `<p class="movieTitle mx-auto my-1 text-center text-bold">${data[i].title}</p>`;
        html += `</div>`;
        html += `</div>`;//end of card

        html += createModalHtml(data[i], i);
    }
    return html;
}

function createModalHtml(data, i){
    let html ='';
    html += `<div class="modal fade" id="editModal${i}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editModalLabel${i}" aria-hidden="true">`;
    html += `<div class="modal-dialog">`;
    html += `<div class="modal-content">`;

    html += `<div class="modal-header">`;
    html += `<p id="editModalLabel${i}" class="modal-title fs-5">Edit Movie`;
    html += `<span id="editMovieId-${i}" class="visually-hidden"> ${data.id}</span></p>`;
    html += `<span id="editMovieDbId-${i}" class="visually-hidden"> ${data.dbId}</span></p>`;
    html += `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`;
    html += `</div>`;//end of modal header

    html += `<div class="modal-body">`;
    html += `<form>`;
    html += `<h2 id="editMovieName${i}">${data.title}</h2>`;
    html += `<br>`;
    html += `<label for="editMovieRating${i}" class="">Your Rating</label>`;
    html += `<br>`;
    html += `<input type="text" id="editMovieRating${i}" class="input-group-text" value="${data.rating}"`;
    html += `<br>`;
    html += `</form>`;
    html += `</div>`;//end modal body

    html += `<div class="modal-footer">`;
    html += `<div class="me-auto">`
    html += `<button type="button" class="btn-delete btn-danger ms-0" id="btnDelete-${[i]}" data-movieid="${data.id}" data-bs-dismiss="modal">Delete</button>`;
    html += `</div>`//end of deleteBtn
    //html += `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>`;
    html += `<button type="button" class="btn btn-primary testEdits" data-bs-dismiss="modal" id="btnSubmitEdit-${[i]}">Submit</button>`;
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

            html += `<div class="card-search col-auto mx-auto my-3 p-0 text-center">`
            html += `<div class="card-header-search p-0 ms-0 overflow-hidden">`
            html += `<img src="https://image.tmdb.org/t/p/w300/${data.results[(hasImageArray[i])].backdrop_path}" alt="movie"
                        class="img-fluid">`
            html += `</div>`//end of header
            html += `<div class="card-body">`
            html += `<p class="h5">${data.results[(hasImageArray[i])].title}</p>`
            html += `<p><span>Premiere: </span>${data.results[(hasImageArray[i])].release_date}</p>`
            html += `<p><span>Avg Rating: </span>${data.results[(hasImageArray[i])].vote_average}</p>`
            html += `<p id="selectMovieId-${i}">${data.results[(hasImageArray[i])].id}</p>`
            html += `</div>`//end of body
            html += `<div class="card-footer">`
            html += `<button type="button" class="btn mb-1" id="btnSelect-${[i]}">`
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

let addTitle = document.getElementById("addMovieName");
let addRating = document.getElementById('addMovieRating');
const movieSearchDiv = document.getElementById("movieSearchDiv");
const searchMovieBtn = document.querySelector("#btn-addMovie");
const selectSortType = document.querySelector("#select-sort")

searchMovieBtn.addEventListener("click", searchMovie);
selectSortType.addEventListener("change", sortByRatings);

getMovieListDbData();