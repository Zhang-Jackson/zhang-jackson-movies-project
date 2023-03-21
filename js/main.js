const dbUrl = "https://productive-bristle-edam.glitch.me/movies"
const searchUrl ="https://api.themoviedb.org/3/search/movie?api_key={api_key}&query=Jack+Reacher"
function setMovieList() {
    console.log('hi');
    fetch(dbUrl).then(resp => resp.json())
        .then(data => {
            let html = '';
            for(let i=0; i <data.length; i++) {
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

                html += `<div class="modal fade" id="editModal${i}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editModalLabel${i}" aria-hidden="true">`;
                html +=`<div class="modal-dialog">`;
                html +=`<div class="modal-content">`;
                html +=`<div class="modal-header">`;
                html +=`<p id="editModalLabel${i}" class="modal-title fs-5">Edit Movie</p>`;
                html +=`<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>`;
                html +=`</div>`;//end of modal header

                html +=`<div class="modal-body">`;
                html +=`<form>`;
                html +=`<label for="addMovieName" class="">Name of Movie</label>`;
                html +=`<br>`;
                html +=`<input type="text" id="addMovieName" class="input-group-text" value="${data[i].title}">`;
                html +=`<br>`;
                html +=`<label for="addMovieDirector" class="">Movie Director</label>`;
                html +=`<br>`;
                html +=`<input type="text" id="addMovieDirector" class="input-group-text " value="${data[i].director}">`;
                html +=`<br>`;
                html +=`<label for="addMovieRating" class="">Your Rating</label>`;
                html +=`<br>`;
                html +=`<input type="text" id="addMovieRating" class="input-group-text" value="${data[i].rating}"`;
                html +=`<br>`;
                html +=`</form>`;
                html +=`</div>`;//end modal body

                html +=`<div class="modal-footer">`;
                html +=`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>`;
                html +=`<button type="button" class="btn btn-primary testEdits" id="btn-SubmitEdit${[i]}">Submit</button>`;
                html +=` </div>`;//end of modal-footer
                html +=` </div>`;//end of modal-content
                html +=` </div>`;//end of modal-dialog
                html +=` </div>`;//end of modal

                submitEditsButtons.push(`#btn-SubmitEdit${[i]}`);
            }
            $('#movieList').append(html);
            createSubmitEditsBtn()
        })
}

function createSubmitEditsBtn(){
    // for (let button of submitEditsButtons){
    //     console.log(button);
    //     let test = document.querySelector(`${button}`)
    //     console.log(test);
    //     test.click(function (e){
    //         e.preventDefault();
    //         console.log(button);
    //     })
    // }

    submitEditsButtons.forEach(function (button){
        let newButton = document.querySelector(button);
        newButton.addEventListener("click",editMovie);
    })
}

function editMovie(e){
    console.log(e.target.id);
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