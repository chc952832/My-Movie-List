const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// 函式: 動態產生電影的HTML, 渲染Movie List
// 這邊雖然可以直接使用movies這個資料, 但是為了讓函式更獨立、降低耦合性，選擇之後再將movies作為參數(data)傳入函式
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    // console.log(item)
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img
          src="${POSTER_URL + item.image}"
          class="card-img-top" alt="Movie Poster" />
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-id="${item.id}"
          data-bs-target="#movie-modal">More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
        </div>
      </div>
    </div>
  </div >`
  })

  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    console.log(modalTitle)
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

// 函式: 刪除收藏清單中的電影
function removeFromFavorite(id) {
  // 錯誤處理: 如果收藏清單是空的, 直接結束函式
  if (!movies || !movies.length) return
  // findIndex會回傳尋找目標的index值
  const movieIndex = movies.findIndex(movie => movie.id === id)
  // 錯誤處理: 傳入的 id 在收藏清單中不存在，直接結束函式
  if (movieIndex === -1) return

  // 刪除陣列中元素-> Array.splice(index, 從index起刪除幾個元素)
  movies.splice(movieIndex, 1)
  // 再存回localStorage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  // 重新渲染, 把刪除效果即時顯示在頁面
  renderMovieList(movies)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  // *matches()內要放選擇器形式
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    // *注意: .dataset傳出的陣列中, id的value是字串, 所以要用Number()轉成數字
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    // 刪除收藏電影
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)