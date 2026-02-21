import { saveProgress, addToHistory } from './modules/storage.js';

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');
const episodeSlug = urlParams.get('episode');

async function initWatch() {
    if (!slug || !episodeSlug) {
        window.location.href = 'anime.html';
        return;
    }

    try {
        const response = await fetch(`/api/detail/${slug}?mode=anime`);
        const data = await response.json();

        const currentEpisode = data.episodes.find(ep => ep.slug === episodeSlug);
        if (!currentEpisode) {
            alert('Không tìm thấy tập phim này.');
            return;
        }

        document.title = `Tập ${currentEpisode.name} - ${data.title}`;

        // Update Reader UI
        const playerWrapper = document.getElementById('playerWrapper');
        playerWrapper.innerHTML = `
            <iframe src="${currentEpisode.link_embed}" allowfullscreen></iframe>
        `;

        const infoContainer = document.getElementById('videoInfo');
        infoContainer.innerHTML = `
            <h1>${data.title}</h1>
            <p style="opacity: 0.7; margin-bottom: 1.5rem;">Đang xem: Tập ${currentEpisode.name}</p>
            
            <div class="ep-section">
                <h3>Danh sách tập</h3>
                <div class="episode-grid">
                    ${data.episodes.map(ep => `
                        <a href="watch.html?slug=${slug}&episode=${ep.slug}" class="ep-link ${ep.slug === episodeSlug ? 'active' : ''}">
                            ${ep.name}
                        </a>
                    `).join('')}
                </div>
            </div>
            
            <div class="movie-desc" style="margin-top: 2rem; font-size: 0.95rem; line-height: 1.6; opacity: 0.8;">
                <p>${data.content.replace(/<[^>]*>?/gm, '').substring(0, 300)}...</p>
            </div>
        `;

        saveProgress(slug, episodeSlug);
        addToHistory({
            id: slug,
            title: data.title,
            thumb: data.thumb,
            genre: data.categories[0]?.name || "Anime",
            lastReadChapter: currentEpisode.name,
            mode: 'anime'
        });

    } catch (error) {
        console.error(error);
        alert('Lỗi tải dữ liệu phim.');
    }
}

document.addEventListener('DOMContentLoaded', initWatch);
