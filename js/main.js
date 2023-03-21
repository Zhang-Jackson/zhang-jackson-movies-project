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
                html += `<p><span>Genre(s): </span>${data[i].genre}</p>`
                html += `</div>`//end of body
                html += `<div class="card-footer">`
                html += `<button class="btn btn-primary">Edit</button>`
                html += `</div>`//end of footer
                html += `</div>`//end of card
            }
            $('#movieList').append(html);

        })
}


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