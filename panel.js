const result = document.getElementById('result');
const loginBtn = document.getElementById('login');

const backendURL = "https://anilistprofile.onrender.com";

const token = new URLSearchParams(window.location.search).get("token");

if (token) {
  fetch(`${backendURL}/list`, {
    headers: {
      Authorization: token
    }
  })
  .then(res => res.json())
  .then(data => {
    const user = data.data.Viewer;
    result.innerHTML = `<h2>Lista di ${user.name}</h2>`;
    user.animeList.lists.forEach(list => {
      result.innerHTML += `<h3>${list.name}</h3>`;
      list.entries.forEach(entry => {
        const anime = entry.media;
        result.innerHTML += `
          <div>
            <img src="${anime.coverImage.medium}" alt="cover">
            ${anime.title.english || anime.title.romaji}
          </div>
        `;
      });
    });
  });
} else {
  loginBtn.addEventListener('click', () => {
    window.location.href = `${backendURL}/auth/login`;
  });
}
