import { getHistory } from './storage.js';
import { renderSection, setupCardEvents } from './renderer.js';

export async function fetchAndRender(query = "", type = "truyen-moi", category = "") {
    const currentMode = document.body.dataset.mode === "comic" ? "comic" : "anime";
    if (currentMode !== "comic") return;

    const mainContent = document.getElementById("mainContent");
    if (!mainContent) return;

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
            const response = await fetch(`/api/category/${category}`);
            const data = await response.json();
            mainContent.innerHTML = renderSection(data.title || `Thể loại: ${category}`, data.items, false, true);
            setupCardEvents();
            return;
        }

        if (query) {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            mainContent.innerHTML = renderSection(`Kết quả cho: "${query}"`, data, false, true);
            setupCardEvents();
            return;
        }

        if (type !== 'truyen-moi') {
            let data = [];
            if (type === 'history') {
                data = getHistory();
                mainContent.innerHTML = renderSection("Lịch sử thiết bị", data, true);
            } else if (type === 'categories') {
                const response = await fetch('/api/categories');
                const categories = await response.json();

                mainContent.innerHTML = `
                    <div class="section-head"><h2>Tất cả thể loại</h2></div>
                    <div class="genre-grid">
                        ${categories.map(c => `
                            <a href="comic.html?category=${c.slug}" class="genre-card">
                                <span>${c.name}</span>
                            </a>
                        `).join("")}
                    </div>
                `;
                return;
            } else {
                const response = await fetch(`/api/content?type=${type}`);
                data = await response.json();
                const labels = { 'hoan-thanh': 'Truyện đã hoàn thành', 'dang-phat-hanh': 'Truyện mới' };
                mainContent.innerHTML = renderSection(labels[type] || "Danh sách", data);
            }
            setupCardEvents(type, () => fetchAndRender("", "history"));
            return;
        }

        const history = getHistory();
        const response = await fetch(`/api/content?type=truyen-moi`);
        const truyenMoi = await response.json();

        let suggestions = [];
        if (history.length > 0) {
            const genres = history.map(h => h.genre);
            const topGenre = genres.sort((a, b) =>
                genres.filter(v => v === a).length - genres.filter(v => v === b).length
            ).pop();
            suggestions = truyenMoi.filter(t => t.genre === topGenre);
        }

        let html = "";
        if (history.length > 0) html += renderSection("Tiếp tục theo dõi", history, true);
        html += renderSection("Truyện mới cập nhật", truyenMoi);
        if (suggestions.length > 0) html += renderSection("Đề cử cho bạn", suggestions);

        mainContent.innerHTML = html;
        setupCardEvents();

    } catch (error) {
        console.error("Lỗi:", error);
        mainContent.innerHTML = "<p>Lỗi kết nối server.</p>";
    }
}
