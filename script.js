const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12; // 一頁只顯示12部電影

const movies = [];
// 建立變數filteredMovies存放過濾(比對)過的電影
let filteredMovies = [];
// 宣告變數記錄當前頁數, 以便切換模式時可以直接顯示該頁內容
let currentPage = 1;

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const movieList = document.querySelector("#movie-list");
const switchModeBtn = document.querySelector("#switch-mode-btn");

// 函式: 渲染已收藏過電影的收藏按鈕樣式, 避免重新整理或是跳轉模式、切換分頁時又變成+號
function renderFavoriteMovieBtn() {
  // 從localStorge獲取已收藏電影清單
  const favoriteMoviesList =
    JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const favoriteMoivesId = []; // 宣告空陣列用來存放已收藏過電影id
  let addtoFavoriteBtns = document.querySelectorAll(".btn-add-favorite"); // 選出所有收藏按鈕
  // 將收藏電影id加入favoriteMoivesId陣列
  for (movie of favoriteMoviesList) {
    favoriteMoivesId.push(movie.id);
  }

  // 若收藏按鈕中data-id有在favoriteMoivesId中, 更改按鈕樣式
  for (btn of addtoFavoriteBtns) {
    favoriteMoivesId.forEach((id) => {
      if (id === Number(btn.dataset.id)) {
        btn.className = "btn added-to-favorite btn-add-favorite";
        btn.innerHTML = "♡";
      }
    });
  }
}

// 函式: 渲染Movie List, 根據不同模式產生HTML
function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card") {
    let rawHTML = "";
    data.forEach((item) => {
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
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-id="${
            item.id
          }"
          data-bs-target="#movie-modal">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${
            item.id
          }">+</button>
        </div>
      </div>
    </div>
  </div >`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === "list") {
    let rawHTML = `<ul class="list-group list-group-flush" id="movie-list" data-mode="list-mode">`;
    data.forEach((item) => {
      rawHTML += `
          <li class="list-group-item d-flex justify-content-between">
            <h5 class="my-auto"> ${item.title} </h5>
            <div  style="display:inline">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-id="${item.id}"
          data-bs-target="#movie-modal">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </li>`;
    });
    rawHTML += `</ul>`;
    dataPanel.innerHTML = rawHTML;
  }
}

// 函式:切換模式
function switchMode(mode) {
  if (dataPanel.dataset.mode === mode) return;
  dataPanel.dataset.mode = mode;
}

// 函式: 渲染分頁器(動態產生頁數)
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`;
  }

  paginator.innerHTML = rawHTML;
}

// 函式: 分頁顯示電影
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 函式: 彈出頁面顯示電影詳情
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  // 先設為空, 避免圖片切換出現殘影
  modalTitle.innerText = "";
  modalDate.innerText = "";
  modalDescription.innerText = "";
  modalImage.innerHTML = "";

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    // 渲染modal中的data
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

// 函式: 新增收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  // 避免重複加入收藏
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  // 將list存入localStorge
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 在dataPanel設置監聽器; More按鈕顯示電影資訊, +按鈕加入收藏清單
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    // 收藏電影
    addToFavorite(Number(event.target.dataset.id));
    renderFavoriteMovieBtn(); //渲染已收藏過電影的收藏按鈕樣式
  }
});

// 在分頁器設置監聽器, 點擊分頁按鈕時渲染該頁電影清單
paginator.addEventListener("click", function onPaginatorClicked(event) {
  // 排除不是點在分頁按鈕(<a>)上的狀況
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  currentPage = page;
  // 重新渲染頁面
  renderMovieList(getMoviesByPage(currentPage));
  renderFavoriteMovieBtn(); //渲染已收藏過電影的收藏按鈕樣式
});

// 搜尋功能
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  // 防止默認重整動作
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert("Cannot find movie with keyword:" + keyword);
  }
  currentPage = 1;
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(currentPage));
  renderFavoriteMovieBtn(); //渲染已收藏過電影的收藏按鈕樣式
});

// 設置監聽器, 切換不同模式
switchModeBtn.addEventListener("click", (event) => {
  if (event.target.classList.contains("card-mode-btn")) {
    // 點擊該模式時, 按鈕變色
    event.target.classList.toggle("pressed");
    // 如另一個按鈕已變色, 清除class
    if (event.target.nextElementSibling.classList.contains("pressed")) {
      event.target.nextElementSibling.classList.remove("pressed");
    }
    switchMode("card");
    renderMovieList(getMoviesByPage(currentPage));
    renderFavoriteMovieBtn(); //渲染已收藏過電影的收藏按鈕樣式
  } else if (event.target.classList.contains("list-mode-btn")) {
    event.target.classList.toggle("pressed");
    if (event.target.previousElementSibling.classList.contains("pressed")) {
      event.target.previousElementSibling.classList.remove("pressed");
    }
    switchMode("list");
    renderMovieList(getMoviesByPage(currentPage));
    renderFavoriteMovieBtn(); //渲染已收藏過電影的收藏按鈕樣式
  }
});

// 串接API取得資料
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage));
    renderFavoriteMovieBtn(); //渲染已收藏過電影的收藏按鈕樣式
  })
  .catch((err) => console.log(err));