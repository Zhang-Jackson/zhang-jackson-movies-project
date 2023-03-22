const dbUrl = "https://productive-bristle-edam.glitch.me/movies/"
const searchUrl ="https://api.themoviedb.org/3/search/movie?api_key={movieKey}&query=Jack+Reacher"
function setMovieList() {
    $('#movieList').html("");
    fetch(dbUrl).then(resp => resp.json())
        .then(data => {
            let html = '';
            for(let i = 0; i < data.length; i++) {
                let databaseRating = data[i].dbRating;
                html += `<div class="card col-auto px-0">`;
                html += `<div class="card-header p-0  img-fluid position-relative">`;
                html += `<span class=" avg-badge badge rounded-pill">${parseFloat(databaseRating).toFixed(1)}</span>`;
                html += `<span class=" usr-badge badge rounded-pill">${data[i].rating}</span>`;
                html += `<img src="https://image.tmdb.org/t/p/w300/${data[i].poster}" alt="movie" class="rounded-top img-fluid">`;
                html += `<button type="button" class="btn btn-primary rounded-circle btn-edit p-2" id="btn-edit${[i]}" data-bs-toggle="modal" data-bs-target="#editModal${i}">`;
                html += `<img src="/assets/pencil.svg" alt="edit icon" style="width: 18px; aspect-ratio: 1;"></button>`;
                html += `</div>`;

                html += `<div class="card-body pt-0 border">`;
                html += `<p class="movieTitle text-center">${data[i].title}</p>`;
                //html += `<p><span>Genre(s): </span>${data[i].genre}</p>`
                html += `</div>`;
                html += `</div>`;//end of card

                html += createModalHtml(data[i], i);
            }
            $('#movieList').append(html);
            $('.movieTitle').each(function() {
                const titleLength = $(this).text().length;
                if(titleLength > 25) {
                    $(this).css("font-size", "13px");
                }
            });
            createSubmitEditsBtn();
            createDeleteBtn();
        })
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
    html += `<button type="button" class="btn btn-danger ms-0" id="btnDelete-${[i]}" data-movieid="${data.id}" data-bs-dismiss="modal">Delete</button>`;
    html += `</div>`//end of deleteBtn
    html += `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>`;
    html += `<button type="button" class="btn btn-primary testEdits" data-bs-dismiss="modal" id="btnSubmitEdit-${[i]}">Submit</button>`;
    html += `</div>`;//end of modal-footer

    html += `</div>`;//end of modal-content
    html += `</div>`;//end of modal-dialog
    html += `</div>`;//end of modal

    submitEditsButtons.push(`#btnSubmitEdit-${[i]}`);
    deleteButtons.push(`#btnDelete-${[i]}`);
    return html;
}

function fetchThis(method, jsonObject, movieId){
    fetch(dbUrl + movieId, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonObject)
    }).then(() => setMovieList())
}

function createSubmitEditsBtn(){
    submitEditsButtons.forEach(function (button){
        let newButton = document.querySelector(button);
        newButton.addEventListener("click",editMovie);
    })
}
function createDeleteBtn(){
    deleteButtons.forEach(function (button){
        let deleteBtn = document.querySelector(button);
        deleteBtn.addEventListener("click",deleteMovie);
    })
}

function deleteMovie(e) {
    let btn = e.target.id.split('-')[1]; // get the index of the button
    let movieId = document.getElementById(`editMovieId-${btn}`).innerText.trim();

    console.log(btn);

    submitEditsButtons.splice(btn,1);
    deleteButtons.splice(btn,1);

    fetch(dbUrl + movieId, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(() => setMovieList());
}

function createSelectMovieBtn(){
    selectMovieButtons.forEach(function (button){
        let newButton = document.querySelector(button);
        newButton.addEventListener("click",selectMovie);
    })
}

function searchMovie(e){
    e.preventDefault();
    setMovieSearchHtml(addTitle.value);
}

function selectMovie(e){
    let btn = (e.target.id).indexOf("-");
    let btnId = (e.target.id).slice(btn + 1);

    let movie = document.getElementById(`selectMovieId-${btnId}`)
    let movieId = movie.innerText;

    let userRating = addRating.value;

    console.log(movieId);
    addMovie(movieId, userRating);
    movieSearchDiv.innerHTML = "";
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

function setMovieSearchHtml(movie){
    $.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&query=${movie}`,
        {}
    ).done(function (data) {
        movieSearchDiv.innerHTML = "";

        let hasImageArray=[];
        for (let i = 0; i < data.results.length; i++){
            let dbImage = data.results[i].backdrop_path;
            if (!dbImage){
            }else{
                hasImageArray.push(i);
            }
        }

        let numberOfDisplayedMovies = 10;
        if (hasImageArray.length < numberOfDisplayedMovies){
            numberOfDisplayedMovies = hasImageArray.length;
        }

        let html = "";
        for (let i = 0; i < numberOfDisplayedMovies; i++){

            html += `<div class="card col-auto p-0 mx-auto my-3 border-0">`
            html += `<div class="card-header p-0 overflow-hidden">`
            html += `<img src="https://image.tmdb.org/t/p/w300/${data.results[(hasImageArray[i])].backdrop_path}" alt="movie"
                        class="img-fluid">`
            html += `</div>`//end of header
            html += `<div class="card-body">`
            html += `<p>${data.results[(hasImageArray[i])].title}</p>`
            html += `<p>${data.results[(hasImageArray[i])].release_date}</p>`
            html += `<p><span>Avg Rating: </span>${data.results[(hasImageArray[i])].vote_average}</p>`
            html += `<p id="selectMovieId-${i}">${data.results[(hasImageArray[i])].id}</p>`
            html += `</div>`//end of body
            html += `<div class="card-footer">`
            html += `<button type="button" class="btn btn-primary" id="btnSelect-${[i]}">`
            html += `Select</button>`
            html += `</div>`//end of footer
            html += `</div>`//end of card

            selectMovieButtons.push(`#btnSelect-${[i]}`);
        }

        movieSearchDiv.innerHTML = html;
        createSelectMovieBtn();
    });
}

let deleteButtons = [];
let submitEditsButtons = [];
let selectMovieButtons = [];
let addTitle = document.getElementById("addMovieName");
let addRating = document.getElementById('addMovieRating');
const movieSearchDiv = document.getElementById("movieSearchDiv");
const addMovieBtn = document.querySelector("#btn-addMovie");
addMovieBtn.addEventListener("click", searchMovie);

setMovieList();

