import { registerServiceWorker } from './modules/pwa.js';
import { addToHistory, getProgress, saveProgress } from './modules/storage.js';

registerServiceWorker();

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

let currentEpisodes = [];
let isDescending = false;

async function loadDetail() {
    if (!slug) {
        window.location.href = 'anime.html';
        return;
    }

    try {
        const response = await fetch(`/api/detail/${slug}?mode=anime`);
        const data = await response.json();
        currentEpisodes = data.episodes;

        document.title = `${data.title} | CineStory`;

        // Add to history
        addToHistory({
            id: slug,
            title: data.title,
            thumb: data.thumb,
            genre: data.categories[0]?.name || "Anime",
            lastChapter: data.episode_current || "",
            mode: 'anime'
        });

        const lastRead = getProgress(slug);
        const firstEpisode = data.episodes[0]?.slug;
        const continueEpisode = lastRead || firstEpisode;

        const infoHtml = `
          <div class="detail-header">
            <div class="detail-poster">
              <img src="${data.thumb}" alt="${data.title}">
            </div>
            <div class="detail-info">
              <h1>${data.title}</h1>
              <p class="origin-name">${data.origin_name}</p>
              <div class="info-meta">
                <div class="meta-row">
                    <span class="meta-label">Chất lượng:</span>
                    <span class="meta-value">${data.quality} (${data.lang})</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Trạng thái:</span>
                    <span class="meta-value">${data.status === 'ongoing' ? 'Đang ra' : (data.status === 'completed' ? 'Hoàn thành' : data.status)}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Thể loại:</span>
                    <div class="genre-list">
                        ${data.categories.map(c => `<a href="anime.html?category=${c.slug}" class="genre-item">${c.name}</a>`).join("")}
                    </div>
                </div>
              </div>
              
              <div class="detail-actions">
                <button class="btn-read btn-main" id="btnContinue">
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                   <span>${lastRead ? `Xem tiếp (Tập ${lastRead})` : 'Bắt đầu xem'}</span>
                </button>
              </div>
              
              <div class="detail-desc">
                 <p>${data.content.replace(/<[^>]*>?/gm, '')}</p>
              </div>
            </div>
          </div>

          <div class="chapter-section">
            <div class="chapter-header">
              <div class="chapter-title-group">
                <h2 style="margin: 0;">Danh sách tập</h2>
                <span class="chapter-badge">${data.episodes.length} tập</span>
              </div>
              <button class="btn-sort" id="btnToggleSort">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" id="sortIcon">
                    <polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline>
                </svg>
                <span id="sortText">Sắp xếp: Tập 1</span>
              </button>
            </div>
            <div class="chapter-list" id="chapterList"></div>
          </div>
        `;

        document.getElementById('detailContent').innerHTML = infoHtml;

        // Attach events
        document.getElementById('btnContinue')?.addEventListener('click', () => handleEpisodeClick(slug, continueEpisode));
        document.getElementById('btnToggleSort')?.addEventListener('click', () => {
            isDescending = !isDescending;
            renderEpisodes();
        });

        renderEpisodes();
    } catch (error) {
        console.error(error);
        document.getElementById('detailContent').innerHTML = '<p>Lỗi tải thông tin phim.</p>';
    }
}

function renderEpisodes() {
    const container = document.getElementById('chapterList');
    const lastRead = getProgress(slug);

    let episodesToDisplay = [...currentEpisodes];
    if (isDescending) episodesToDisplay.reverse();

    container.innerHTML = episodesToDisplay.map(ep => `
        <a href="#" class="chapter-item ${lastRead === ep.slug ? 'active-chapter' : ''}" data-slug="${ep.slug}">
          Tập ${ep.name}
        </a>
    `).join("");

    container.querySelectorAll('.chapter-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            handleEpisodeClick(slug, item.dataset.slug);
        });
    });

    const sortText = document.getElementById('sortText');
    if (sortText) sortText.textContent = isDescending ? 'Sắp xếp: Mới nhất' : 'Sắp xếp: Tập 1';
}

function handleEpisodeClick(slug, episodeSlug) {
    saveProgress(slug, episodeSlug);
    window.location.href = `watch.html?slug=${slug}&episode=${episodeSlug}`;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadDetail();
});
