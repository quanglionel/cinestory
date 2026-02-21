import { getHistory } from './storage.js';
import { renderSection, setupCardEvents } from './renderer.js';

export async function fetchAndRender(query = "", type = "", category = "") {
    const mode = document.body.dataset.mode === "comic" ? "comic" : "anime";
    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

    // Default types
    const defaultType = mode === 'comic' ? 'truyen-moi' : 'phim-moi-cap-nhat';
    const activeType = type || defaultType;

    // Loading State
    mainContent.innerHTML = `
        <div class="section-head"><h2>Đang tải...</h2></div>
        <div class="card-grid">
            ${Array(4).fill(0).map(() => `
                <article class="card is-loading">
                    <div class="thumb skeleton"></div>
                    <div class="card-content">
                        <div class="card-meta"><span class="genre-tag skeleton">...</span></div>
                        <h3 class="skeleton">...</h3>
                    </div>
                </article>
            `).join("")}
        </div>
    `;

    try {
        if (category) {
            const response = await fetch(`/api/category/${category}?mode=${mode}`);
            const data = await response.json();
            mainContent.innerHTML = renderSection(data.title || `Thể loại: ${category}`, data.items, false, true);
            setupCardEvents();
            return;
        }

        if (query) {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=${mode}`);
            const data = await response.json();
            mainContent.innerHTML = renderSection(`Kết quả cho: "${query}"`, data, false, true);
            setupCardEvents();
            return;
        }

        if (activeType !== defaultType) {
            let data = [];
            if (activeType === 'history') {
                data = getHistory().filter(h => h.mode === mode);
                mainContent.innerHTML = renderSection(mode === 'comic' ? "Lịch sử đọc" : "Lịch sử xem", data, true);
            } else if (activeType === 'categories') {
                const response = await fetch(`/api/categories?mode=${mode}`);
                const categories = await response.json();

                mainContent.innerHTML = `
                    <div class="section-head"><h2>Tất cả thể loại</h2></div>
                    <div class="genre-grid">
                        ${categories.map(c => `
                            <a href="${mode}.html?category=${c.slug}" class="genre-card">
                                <span>${c.name}</span>
                            </a>
                        `).join("")}
                    </div>
                `;
                return;
            } else {
                const response = await fetch(`/api/content?type=${activeType}&mode=${mode}`);
                data = await response.json();
                const labels = {
                    'hoan-thanh': 'Đã hoàn thành',
                    'dang-phat-hanh': 'Mới cập nhật',
                    'phim-le': 'Phim lẻ mới',
                    'phim-bo': 'Phim bộ mới',
                    'hoat-hinh': 'Hoạt hình mới'
                };
                mainContent.innerHTML = renderSection(labels[activeType] || "Danh sách", data);
            }
            setupCardEvents(activeType, () => fetchAndRender("", "history"));
            return;
        }

        const history = getHistory().filter(h => h.mode === mode);
        const response = await fetch(`/api/content?type=${defaultType}&mode=${mode}`);
        const listData = await response.json();

        let suggestions = [];
        if (history.length > 0) {
            const genres = history.map(h => h.genre);
            const topGenre = genres.sort((a, b) =>
                genres.filter(v => v === a).length - genres.filter(v => v === b).length
            ).pop();
            suggestions = listData.filter(t => t.genre === topGenre);
        }

        let html = "";
        if (history.length > 0) html += renderSection("Tiếp tục xem", history, true);
        html += renderSection(mode === 'comic' ? "Truyện mới cập nhật" : "Phim mới cập nhật", listData);
        if (suggestions.length > 0) html += renderSection("Đề cử cho bạn", suggestions);

        mainContent.innerHTML = html;
        setupCardEvents();

    } catch (error) {
        console.error("Lỗi:", error);
        mainContent.innerHTML = "<p>Lỗi kết nối server.</p>";
    }
}
