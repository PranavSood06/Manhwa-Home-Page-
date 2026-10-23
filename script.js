const series = [
  { title: 'Solo Leveling', genres: ['Action', 'Fantasy', 'Adventure'], cover: 1, chapters: ['200', '199'], rating: '9.2' },
  { title: 'The Beginning After The End', genres: ['Action', 'Adventure', 'Fantasy'], cover: 2, chapters: ['180', '179'], rating: '9.0' },
  { title: "Omniscient Reader's Viewpoint", genres: ['Action', 'Drama', 'Fantasy'], cover: 3, chapters: ['73', '72'], rating: '9.1' },
  { title: 'The Great Mage Returns After 4000 Years', genres: ['Action', 'Fantasy'], cover: 4, chapters: ['135', '134'], rating: '8.7' },
  { title: 'Solo Leveling: Ragnarok', genres: ['Action', 'Fantasy', 'Adventure'], cover: 5, chapters: ['79', '78'], rating: '8.5' },
  { title: 'The Hashtag is First Love', genres: ['Romance', 'Drama'], cover: 1, chapters: ['20', '19'], rating: '8.3' },
  { title: 'I Humbly Dare To Ask', genres: ['Romance', 'Drama'], cover: 2, chapters: ['29', '28'], rating: '8.2' },
  { title: 'The Runaway Countess Has Returned', genres: ['Romance', 'Drama', 'Adventure'], cover: 3, chapters: ['43', '42'], rating: '8.1' },
  { title: 'Perfection is Everything', genres: ['Romance', 'Comedy'], cover: 4, chapters: ['55', '54'], rating: '8.0' },
  { title: 'Your Ryan', genres: ['Romance', 'Drama'], cover: 5, chapters: ['12', '11'], rating: '7.9' },
  { title: "I've Probably Made a Mistake in Getting Married", genres: ['Romance', 'Comedy', 'Drama'], cover: 1, chapters: ['38', '37'], rating: '7.8' },
  { title: 'I Want To Be Fooled', genres: ['Romance', 'Comedy'], cover: 2, chapters: ['21', '20'], rating: '7.7' }
].map((item, index) => ({ ...item, id: `series-${index + 1}` }));

const rankings = {
  weekly: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  monthly: [2, 4, 0, 7, 1, 5, 3, 9, 6, 8],
  all: [0, 2, 1, 3, 4, 7, 5, 6, 8, 9]
};
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const coverURL = item => `Images/box ${item.cover}.jpeg`;
const byId = id => document.getElementById(id);
let bookmarks = new Set();
try { bookmarks = new Set(JSON.parse(localStorage.getItem('shadow-scans-bookmarks') || '[]')); } catch { /* Browsing still works when storage is unavailable. */ }
let currentRanking = 'weekly';
let returnHash = '#catalog';

function renderPicks() {
  byId('top-picks-list').innerHTML = series.slice(0, 5).map(item => `
    <a class="latest-item" href="#series/${item.id}">
      <img src="${coverURL(item)}" alt="">
      <span class="latest-title">${escapeHTML(item.title)}</span>
    </a>`).join('');
}

function renderCatalog(mode = 'all', value = '') {
  const query = value.trim().toLocaleLowerCase();
  const matches = series.filter(item => {
    if (mode === 'bookmarks') return bookmarks.has(item.id);
    if (mode === 'genre') return item.genres.some(genre => genre.toLocaleLowerCase() === query);
    if (mode === 'search') return `${item.title} ${item.genres.join(' ')}`.toLocaleLowerCase().includes(query);
    return true;
  });
  byId('catalog-title').textContent = mode === 'bookmarks' ? 'Bookmarks' : mode === 'genre' ? `${value} Series` : mode === 'search' ? 'Search Results' : 'Latest Updates';
  byId('result-status').textContent = mode === 'all' ? '' : mode === 'bookmarks' ? (matches.length ? `${matches.length} saved series` : 'No bookmarks yet. Open a series to save it here.') : mode === 'search' ? (matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'} for “${value}”` : `No series found for “${value}”.`) : `${matches.length} ${value} series`;
  byId('manga-grid').innerHTML = matches.map(item => `
    <a class="manga-card" href="#series/${item.id}" aria-label="View details for ${escapeHTML(item.title)}">
      <span class="manga-cover"><img src="${coverURL(item)}" alt="" loading="lazy"><span class="color-badge">COLOR</span></span>
      <span class="manga-info"><span class="manga-title">${escapeHTML(item.title)}</span>
        <span class="chapter-row"><span>Ch. ${item.chapters[0]}</span><span class="chapter-time">Latest listed</span></span>
        <span class="chapter-row"><span>Ch. ${item.chapters[1]}</span><span class="chapter-time">Previous</span></span>
      </span>
    </a>`).join('');
}

function renderRanking() {
  document.querySelectorAll('.tab').forEach(tab => {
    const active = tab.dataset.ranking === currentRanking;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  });
  byId('popular-list').innerHTML = rankings[currentRanking].map((index, rank) => {
    const item = series[index];
    return `<li class="popular-item"><a href="#series/${item.id}" aria-label="Rank ${rank + 1}: ${escapeHTML(item.title)}, details">
      <span class="pop-rank">${rank + 1}</span><img class="pop-cover" src="${coverURL(item)}" alt="" loading="lazy">
      <span class="pop-details"><span class="pop-title">${escapeHTML(item.title)}</span><span class="pop-genres">${escapeHTML(item.genres.join(', '))}</span><span class="stars">★ ${item.rating}</span></span>
    </a></li>`;
  }).join('');
}

function renderDetail(item) {
  byId('dialog-content').innerHTML = `<div class="detail-layout">
    <img src="${coverURL(item)}" alt="Cover art for ${escapeHTML(item.title)}">
    <div><h2 id="detail-title">${escapeHTML(item.title)}</h2>
      <p><strong>Genres:</strong> ${escapeHTML(item.genres.join(', '))}</p>
      <p><strong>Listed chapters:</strong> ${item.chapters.map(chapter => `Ch. ${chapter}`).join(', ')}</p>
      <p><strong>Catalog rating:</strong> ${item.rating} / 10</p>
      <button class="button button-primary" id="bookmark-button" type="button" aria-pressed="${bookmarks.has(item.id)}">${bookmarks.has(item.id) ? 'Remove bookmark' : 'Save bookmark'}</button>
    </div></div>`;
  byId('bookmark-button').addEventListener('click', () => {
    if (bookmarks.has(item.id)) bookmarks.delete(item.id); else bookmarks.add(item.id);
    try { localStorage.setItem('shadow-scans-bookmarks', JSON.stringify([...bookmarks])); } catch { /* The bookmark works until the page is closed. */ }
    renderDetail(item);
  });
}

function route() {
  const hash = location.hash || '#home';
  const dialog = byId('series-dialog');
  if (hash.startsWith('#series/')) {
    const item = series.find(entry => entry.id === hash.slice(8));
    if (!item) { location.hash = '#catalog'; return; }
    renderDetail(item);
    if (!dialog.open) dialog.showModal();
    return;
  }
  if (dialog.open) dialog.close();
  if (hash === '#bookmarks') renderCatalog('bookmarks');
  else if (hash.startsWith('#genre/')) {
    const genre = decodeURIComponent(hash.slice(7));
    renderCatalog('genre', genre.charAt(0).toUpperCase() + genre.slice(1));
  } else if (hash.startsWith('#search/')) {
    const query = decodeURIComponent(hash.slice(8));
    byId('search-input').value = query;
    renderCatalog('search', query);
  } else renderCatalog();
  if (hash === '#bookmarks' || hash.startsWith('#genre/') || hash.startsWith('#search/')) byId('catalog').scrollIntoView();
}

byId('search-form').addEventListener('submit', event => {
  event.preventDefault();
  const query = byId('search-input').value.trim();
  const destination = query ? `#search/${encodeURIComponent(query)}` : '#catalog';
  if (location.hash === destination) route(); else location.hash = destination;
});

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  currentRanking = tab.dataset.ranking;
  renderRanking();
}));

const dropdown = document.querySelector('.dropdown');
const toggle = document.querySelector('.dropdown-toggle');
function closeMenu() { dropdown.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => {
  const open = dropdown.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
dropdown.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeMenu(); toggle.focus(); }
});
dropdown.addEventListener('focusout', () => {
  setTimeout(() => { if (!dropdown.contains(document.activeElement)) closeMenu(); }, 0);
});
document.addEventListener('click', event => { if (!dropdown.contains(event.target)) closeMenu(); });
dropdown.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#series/"]');
  if (link && !byId('series-dialog').open) returnHash = location.hash.startsWith('#series/') ? '#catalog' : (location.hash || '#catalog');
});
function closeDetail() { location.hash = returnHash; }
byId('dialog-close').addEventListener('click', closeDetail);
byId('series-dialog').addEventListener('cancel', event => { event.preventDefault(); closeDetail(); });
byId('series-dialog').addEventListener('click', event => { if (event.target === byId('series-dialog')) closeDetail(); });
window.addEventListener('hashchange', route);
renderPicks();
renderRanking();
route();
