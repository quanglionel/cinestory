import { getHistory, addToHistory, removeFromHistory } from './storage.js';

export function renderCard(item, isHistory = false) {
    return `
        <article class="card" data-id="${item.id}" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
            <div class="thumb" style="background-image: url('${item.thumb}');">
                ${isHistory ? `
                    <button class="remove-history-btn" title="Xóa khỏi lịch sử">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                ` : ''}
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span class="genre-tag">${item.genre}</span>
                    <span class="time-tag">${isHistory ? 'Đang đọc' : (item.updatedAt || 'Vừa xong')}</span>
                </div>
                <h3>${item.title}</h3>
                <p class="chapter-info">
                   ${isHistory && item.lastReadChapter ? `Đọc đến: <strong>Chap ${item.lastReadChapter}</strong>` : `Cập nhật: <strong>${item.chapters || '...'}</strong>`}
                </p>
            </div>
        </article>
    `;
}

export function renderSection(title, items, isHistory = false, isGrid = false) {
    if (items.length === 0) return "";
    const sectionId = `section-${Math.random().toString(36).substr(2, 9)}`;

    return `
        <div class="section-head" style="margin-top: 2rem;">
            <h2>${title}</h2>
        </div>
        <div class="slider-container">
            ${!isGrid ? `
                <button class="slider-nav-btn prev" onclick="scrollSlider('${sectionId}', -1)">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="slider-nav-btn next" onclick="scrollSlider('${sectionId}', 1)">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            ` : ''}
            <div class="card-grid ${isGrid ? 'is-grid' : ''}" id="${sectionId}">
                ${items.map(item => renderCard(item, isHistory)).join("")}
            </div>
        </div>
    `;
}

export function setupCardEvents(currentType, callback) {
    const cards = document.querySelectorAll(".card:not(.is-loading)");
    cards.forEach(card => {
        card.addEventListener("click", (e) => {
            const itemData = JSON.parse(card.dataset.item);
            const id = card.dataset.id;

            if (e.target.closest(".remove-history-btn")) {
                removeFromHistory(id);
                if (callback) callback();
                return;
            }

            addToHistory(itemData);
            window.location.href = `comic-detail.html?slug=${itemData.slug}`;
        });
    });
}
