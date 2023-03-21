const dbUrl = "https://productive-bristle-edam.glitch.me/movies"
const searchUrl ="https://api.themoviedb.org/3/search/movie?api_key={api_key}&query=Jack+Reacher"

// $.get(dbUrl,{
//
// }).done(function(data){
//     console.log(data);
//     let buildHtml = "";
//     data.forEach(function (data){
//         buildHtml += '<p>' + data.title +
//                     data.rating +
//                     data.director +
//             data.genre + '</p>'
//     })
//     $('#movieList').append(buildHtml);
// });

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
