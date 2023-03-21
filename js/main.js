const dbUrl = "https://productive-bristle-edam.glitch.me/movies/"
const searchUrl ="https://api.themoviedb.org/3/search/movie?api_key={api_key}&query=Jack+Reacher"
function setMovieList() {
    $('#movieList').html("");
    fetch(dbUrl).then(resp => resp.json())
        .then(data => {
            let html = '';
            for(let i = 0; i < data.length; i++) {
                html += `<div class="card col-auto p-0">`
                html += `<div class="card-header">${data[i].title}</div>`
                html += `<div class="card-body">`
                html += `<p><span>Director: </span>${data[i].director}</p>`
                html += `<p><span>Rating: </span>${data[i].rating}</p>`
                //html += `<p><span>Genre(s): </span>${data[i].genre}</p>`
                html += `</div>`//end of body
                html += `<div class="card-footer">`
                html += `<button type="button" class="btn btn-primary" id="btn-edit${[i]}" data-bs-toggle="modal" data-bs-target="#editModal${i}">`
                html += `Edit</button>`
                html += `</div>`//end of footer
                html += `</div>`//end of card

                html += createModalHtml(data[i], i);
            }
            $('#movieList').append(html);
            createSubmitEditsBtn();
        })

}

function createSubmitEditsBtn(){
    submitEditsButtons.forEach(function (button){
        let newButton = document.querySelector(button);
        newButton.addEventListener("click",editMovie);
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
    html += `<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`;
    html += `</div>`;//end of modal header

    html += `<div class="modal-body">`;
    html += `<form>`;
    html += `<label for="editMovieName${i}" class="">Name of Movie</label>`;
    html += `<br>`;
    html += `<input type="text" id="editMovieName${i}" class="input-group-text" value="${data.title}">`;
    html += `<br>`;
    html += `<label for="editMovieDirector${i}" class="">Movie Director</label>`;
    html += `<br>`;
    html += `<input type="text" id="editMovieDirector${i}" class="input-group-text " value="${data.director}">`;
    html += `<br>`;
    html += `<label for="editMovieRating${i}" class="">Your Rating</label>`;
    html += `<br>`;
    html += `<input type="text" id="editMovieRating${i}" class="input-group-text" value="${data.rating}"`;
    html += `<br>`;
    html += `</form>`;
    html += `</div>`;//end modal body

    html += `<div class="modal-footer">`;
    html += `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>`;
    html += `<button type="button" class="btn btn-primary testEdits" data-bs-dismiss="modal" id="btnSubmitEdit-${[i]}">Submit</button>`;
    html += `</div>`;//end of modal-footer
    html += `</div>`;//end of modal-content
    html += `</div>`;//end of modal-dialog
    html += `</div>`;//end of modal

    submitEditsButtons.push(`#btnSubmitEdit-${[i]}`);
    return html;
}

function editMovie(e){
    let btn = (e.target.id).indexOf("-");
    let btnId = (e.target.id).slice(btn + 1);

    let movie = document.getElementById(`editMovieId-${btnId}`)
    let movieId = movie.innerText;

    let editTitle = document.getElementById(`editMovieName${btnId}`);
    let editDirector = document.getElementById(`editMovieDirector${btnId}`);
    let editRating = document.getElementById(`editMovieRating${btnId}`);

    let editedMovie = {
        title:editTitle.value,
        director:editDirector.value,
        rating:editRating.value
    }

    fetch(dbUrl + movieId, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedMovie)
    }).then(() => setMovieList())
}

let submitEditsButtons = [];
let addTitle = document.getElementById("addMovieName");
let addDirector = document.getElementById('addMovieDirector');
let addRating = document.getElementById('addMovieRating');
const addMovieBtn = $('#btn-addMovie').click(function (e) {
    e.preventDefault();
    let newMovie = {
        title:addTitle.value,
        director:addDirector.value,
        rating:addRating.value
    }
    console.log(newMovie);
    fetch(dbUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify(newMovie),
    }).then(() => setMovieList())
})
setMovieList();