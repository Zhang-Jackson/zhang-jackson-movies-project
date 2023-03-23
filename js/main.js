(function() {
    "use strict"

/*
/////////////////////////////////////////////////////////////////////////////
Main Library Section
/////////////////////////////////////////////////////////////////////////////
*/
    function createLibrary(movieSet){
        emptyButtonArrays();
        let html = "";
        html = createMovieLibraryHtml(movieSet);
        $('#movieLibrary').html(html);

        setGenreSelector();

        resizeLongTitles();

        createButtons(editSubmitBtns, editMovie);
        createButtons(editDeleteBtns, deleteMovie);
        createButtons(cardList, flipCard);
    }

    function getMovieLibrary(data){
        userMovieLibrary = [];
        setTimeout(() => {
            createMovieLibraryArray(data);
        },1500)
    }

    function createMovieLibraryArray(data){
        for(let movie of data){
            userMovieLibrary.push(createMovieObject(movie));
        }
        createLibrary(userMovieLibrary);
    }

    function createMovieObject(data){
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

    function resizeLongTitles(){
        $('.movieTitle').each(function() {
            const titleLength = $(this).text().length;
            if(titleLength > 25) {
                $(this).css("font-size", "13px");
            }
        });
    }

    function flipCard(e){
        let backId = findBtnId(e.target.parentNode.parentNode.id);
        let backId2 = findBtnId(e.target.id);

        let clickedBackText = document.getElementById(`cardBack-${backId}`);
        let clickedBackText2 = document.getElementById(`cardBack-${backId2}`);

        if (clickedBackText){
            clickedBackText.hidden = !clickedBackText.hidden;
        } else {
            clickedBackText2.hidden = !clickedBackText2.hidden;
        }
    }

/*
/////////////////////////////////////////////////////////////////////////////
Utility Functions Section
/////////////////////////////////////////////////////////////////////////////
*/
    function fetchThis(method, jsonObject, movieId){
        showLoading();
        if(method === 'DELETE'){
            fetch(dbUrl + movieId, {
                method: method,
            }).then(() => {
                emptyButtonArrays();
                getDbData();
                hideLoading();
            })
            .catch(() => {
                console.log("error");
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
                getDbData();
                hideLoading();
            })
            .catch(() => {
                console.log("error");
            });
        }
    }

    function createButtons(btnArray, btnFunction){
        for(let button of btnArray){
            let newButton = document.querySelector(button);
            newButton.addEventListener("click",btnFunction);
        }
    }

    function emptyButtonArrays(){
        editSubmitBtns = [];
        editDeleteBtns = [];
        selectMovieBtns = [];
        cardList = [];
    }

    function findBtnId(targetId){
        let index = targetId.indexOf("-")
        return targetId.slice(index +1);
    }

/*
/////////////////////////////////////////////////////////////////////////////
Edit Modal Section
/////////////////////////////////////////////////////////////////////////////
*/
    function editMovie(e){
        let btnId = findBtnId(e.target.id);

        let movie = document.getElementById(`editMovieId-${btnId}`)
        let movieId = movie.innerText;

        let db = document.getElementById(`editMovieDbId-${btnId}`)
        let dbId = db.innerText;

        selectMovieToEdit(movieId, dbId, btnId);
    }

    function selectMovieToEdit(movieId, dbId, btnId){
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

    function deleteMovie(e) {
        e.preventDefault();
        let btnId = findBtnId(e.target.id);
        let movie = document.getElementById(`editMovieId-${btnId}`)
        let movieId = movie.innerText;

        fetchThis("DELETE",null,movieId)
    }
/*
/////////////////////////////////////////////////////////////////////////////
Movie Search Section
/////////////////////////////////////////////////////////////////////////////
*/
    function searchMovie(e){
        e.preventDefault();
        searchTheMovieDB(addTitle.value);
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

    function selectMovie(e){
        let btnId = findBtnId(e.target.id);

        let db = document.getElementById(`selectMovieId-${btnId}`)
        let dbId = db.innerText;

        let userRating = 0;

        addMovie(dbId, userRating);
        movieSearchDiv.innerHTML = "";
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
        });
    }
/*
/////////////////////////////////////////////////////////////////////////////
Fetch & Loading Logic
/////////////////////////////////////////////////////////////////////////////
*/
    function getDbData() {
        showLoading();
        $('#movieLibrary').html("");
        fetch(dbUrl).then(resp => resp.json())
            .then(data => {
                getMovieLibrary(data);
            })
            .catch(() => {
                console.log("error");
            })
            .finally(() => {
                hideLoading();
            });
    }

    function showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    function hideLoading() {
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        },1500)
    }

/*
/////////////////////////////////////////////////////////////////////////////
Movie Library Sorting Section
/////////////////////////////////////////////////////////////////////////////
 */
    function setGenreSelector(){
        let html =``;
        html += `<option value="0">select genre</option>`
        for(let i = 0; i < genreList.length; i++){
            if(currentGenreSelected === genreList[i]){
                html += `<option selected value="${genreList[i]}">${genreList[i]}</option>`
            } else {
                html += `<option value="${genreList[i]}">${genreList[i]}</option>`
            }
        }
        selectGenre.innerHTML = html;
    }

    function sortByGenre(){
        moviesByGenre = [];
        let selectedGenre = selectGenre.value;
        currentGenreSelected = selectedGenre;

        if(selectedGenre === 0 || selectedGenre === '0'){
            createLibrary(userMovieLibrary);
        }else {
            for(let movie of userMovieLibrary){
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
            createLibrary(moviesByGenre);
        }
    }

    function sortByRatings(){
        switch (selectSortType.value){
            case '1': //rating low to high
                userMovieLibrary.sort(
                    (a, b) => {
                        if (a.rating === 'N/A') {
                            return -1; // treat 'N/A' as the highest value, so 'a' comes before 'b'
                        } else if (b.rating === 'N/A') {
                            return 1; // treat 'N/A' as the highest value, so 'b' comes before 'a'
                        } else {
                            // compare the numeric values of the dbRating property
                            return parseInt(a.rating) > parseInt(b.rating) ? 1 : parseInt(a.rating) < parseInt(b.rating) ? -1 : 0;
                        }
                    }
                );
                createLibrary(userMovieLibrary);
                break;
            case '2': //rating high to low
                userMovieLibrary.sort(
                    (a, b) => {
                        if (a.rating === 'N/A') {
                            return -1; // treat 'N/A' as the highest value, so 'a' comes before 'b'
                        } else if (b.rating === 'N/A') {
                            return 1; // treat 'N/A' as the highest value, so 'b' comes before 'a'
                        } else {
                            // compare the numeric values of the dbRating property
                            return parseInt(a.rating) < parseInt(b.rating) ? 1 : parseInt(a.rating) > parseInt(b.rating) ? -1 : 0;
                        }
                    }
                );
                createLibrary(userMovieLibrary);
                break;
            case '3': // sort alpha a-Z
                userMovieLibrary.sort(
                    (a, b) => ((a.title) > (b.title)) ? 1 : ((a.title) < (b.title) ? -1 : 0)
                );
                createLibrary(userMovieLibrary);
                break;
            case '4': //sort alpha z-a
                userMovieLibrary.sort(
                    (a, b) => ((a.title) < (b.title)) ? 1 : ((a.title) > (b.title) ? -1 : 0)
                );
                createLibrary(userMovieLibrary);
                break;
            default: //sort by id low to high
                userMovieLibrary.sort(
                    (a, b) => (parseInt(a.id) > parseInt(b.id)) ? 1 : (parseInt(a.id) < parseInt(b.id) ? -1 : 0)
                );
                createLibrary(userMovieLibrary);
                break;
        }
    }

/*
/////////////////////////////////////////////////////////////////////////////
HTML Builder Sections
/////////////////////////////////////////////////////////////////////////////
 */
    function createMovieLibraryHtml(data){
        let html = '';
        for(let i = 0; i < data.length; i++) {
            let databaseRating = data[i].dbRating;
            html += `<div id="cardFront-${[i]}" class="card col-auto px-0 border-0" data-front-hidden="false">`;
            html += `<div class="card-header p-0 position-relative img-fluid">`;
            html += `<span class="badge avg-badge rounded-pill">${parseFloat(databaseRating).toFixed(1)}</span>`;
            html += `<span class="badge usr-badge rounded-pill">${data[i].rating}</span>`;
            html += `<img id="image-${[i]}" src="https://image.tmdb.org/t/p/w300/${data[i].poster}" alt="${data[i].title}'s movie poster" class="img-fluid rounded" >`;
            html += `<button id="btn-edit${[i]}" type="button" class="btn bg-accent-normal rounded-circle btn-edit p-2" data-bs-toggle="modal" data-bs-target="#editModal${i}">`;
            html += `<img src="/assets/pencil.svg" alt="${data[i].title}'s edit icon" style="width: 18px; aspect-ratio: 1;"></button>`;
            html += `</div>`;//end card head



            html += `<div id="cardBack-${[i]}" class="card position-absolute p-2 overflow-scroll border-0" data-back-hidden="true" hidden="hidden">`;
            html += `<p class="text-center movieTitle notSelectable">${data[i].title}</p>`

            html += `<div class="row d-flex justify-content-center gap-1 mx-auto mb-3">`
            html += createGenreHtml(data[i].genres);
            html += `</div>`//end genre pills

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
        html += `<div id="editModal${i}" class="modal fade" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editModalLabel${i}" aria-hidden="true">`;
        html += `<div class="modal-dialog">`;
        html += `<div class="modal-content">`;

        html += `<div class="modal-header bg-primary-dark text-light border-0">`;
        html += `<p id="editModalLabel${i}" class="modal-title fs-5 fw-bold">Edit Movie`;
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
        html += `<input id="editMovieRating${i}"  type="text" class="input-group-text" value="${data.rating}"`;
        html += `<br>`;
        html += `</form>`;
        html += `</div>`;//end modal body

        html += `<div class="modal-footer bg-accent-dark border-0">`;
        html += `<div class="me-auto">`
        html += `<button id="btnDelete-${[i]}" type="button" class="btn bg-primary-dark color-accent-normal ms-0" data-movieid="${data.id}" data-bs-dismiss="modal">Delete</button>`;
        html += `</div>`//end of deleteBtn
        html += `<button type="button" class="btn bg-accent-normal text-light" data-bs-dismiss="modal">Cancel</button>`;
        html += `<button id="btnSubmitEdit-${[i]}" type="button" class="btn bg-accent-normal text-light" data-bs-dismiss="modal">Submit</button>`;
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

                html += `<div class="card col-auto mx-auto my-3 p-0 searchedCards border-0 h-100">`
                html += `<div class="card-header position-relative p-0 overflow-hidden ">`
                html += `<img src="https://image.tmdb.org/t/p/w300/${data.results[(hasImageArray[i])].backdrop_path}" alt="${data.results[(hasImageArray[i])].title}'s image"
                            class="img-fluid">`
                html += `<span class="badge search-badge rounded-pill">${(data.results[(hasImageArray[i])].vote_average).toFixed(1)}</span>`;
                html += `</div>`//end of header
                html += `<div class="card-footer bg-accent-dark text-light text-center border-0">`
                html += `<p class="h5">${data.results[(hasImageArray[i])].title}</p>`
                html += `<p id="selectMovieId-${i}" class="visually-hidden">${data.results[(hasImageArray[i])].id}</p>`
                html += `<button id="btnSelect-${[i]}" type="button" class="btn bg-accent-normal text-light">`
                html += `Select</button>`
                html += `</div>`//end of footer
                html += `</div>`//end of card

                selectMovieBtns.push(`#btnSelect-${[i]}`);
            }

        movieSearchDiv.innerHTML = html;
        createButtons(selectMovieBtns, selectMovie);
    }

    function createGenreHtml(data){
        let html = "";
        if(!data){
            data = ["genres"]
        }
        for(let genre of data){
            html += `<div class="badge col-auto bg-accent-normal">`
            html += `<span>${genre}</span>`
            html += `</div>`

            if(!genreList.includes(genre)){
                genreList.push(genre);
            }
        }
        genreList.sort();
        return html;
    }

    /*
    /////////////////////////////////////////////////////////////////////////////
    Global variables and listeners
    /////////////////////////////////////////////////////////////////////////////
    */
    const dbUrl = "https://productive-bristle-edam.glitch.me/movies/"
    let userMovieLibrary = [];
    let editDeleteBtns = [];
    let editSubmitBtns = [];
    let selectMovieBtns = [];
    let genreList = [];
    let cardList = [];
    let moviesByGenre = [];
    let currentGenreSelected = 0;

    let addTitle = document.getElementById("addMovieName");
    let addRating = document.getElementById('addMovieRating');
    const movieSearchDiv = document.getElementById("movieSearchDiv");
    const searchMovieBtn = document.querySelector("#btn-addMovie");
    const selectSortType = document.querySelector("#select-sort");
    const selectGenre = document.querySelector("#select-genre");

    searchMovieBtn.addEventListener("click", searchMovie);
    selectSortType.addEventListener("change", sortByRatings);
    selectGenre.addEventListener("change", sortByGenre);

    getDbData();

})();