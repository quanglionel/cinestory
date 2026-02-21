export async function showSuggestions(query, suggestionsBox, searchInput, fetchAndRender) {
    if (!query) {
        suggestionsBox.classList.remove("is-visible");
        return;
    }

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.length > 0) {
            suggestionsBox.innerHTML = data.slice(0, 6).map(item => `
                <div class="suggestion-item" data-title="${item.title}">
                    <div class="suggestion-thumb" style="background-image: url('${item.thumb}')"></div>
                    <div class="suggestion-info">
                        <h4>${item.title}</h4>
                        <p>${item.genre} • ${item.chapters}</p>
                    </div>
                </div>
            `).join("");
            suggestionsBox.classList.add("is-visible");

            document.querySelectorAll(".suggestion-item").forEach(el => {
                el.addEventListener("click", () => {
                    searchInput.value = el.dataset.title;
                    suggestionsBox.classList.remove("is-visible");
                    fetchAndRender(el.dataset.title);
                });
            });
        } else {
            suggestionsBox.classList.remove("is-visible");
        }
    } catch (error) {
        console.error("Lỗi gợi ý:", error);
    }
}

export function setupMobileSearch(searchBtn, searchInput, suggestionsBox, fetchAndRender) {
    searchBtn?.addEventListener("click", () => {
        const isMobile = window.innerWidth < 680;
        const parent = searchBtn.closest(".header-search");
        const header = searchBtn.closest(".site-header");

        if (isMobile && parent) {
            if (!parent.classList.contains("active")) {
                parent.classList.add("active");
                header?.classList.add("search-active");
                searchInput.focus();
                return;
            }
        }

        const query = searchInput.value.trim();
        if (query) {
            fetchAndRender(query);
        }
        suggestionsBox.classList.remove("is-visible");
    });

    document.addEventListener("click", (e) => {
        if (window.innerWidth < 680) {
            const parent = document.querySelector(".header-search");
            const header = document.querySelector(".site-header");
            if (parent && parent.classList.contains("active") && !parent.contains(e.target)) {
                parent.classList.remove("active");
                header?.classList.remove("search-active");
            }
        }
        if (!e.target.closest(".header-search")) {
            suggestionsBox.classList.remove("is-visible");
        }
    });
}
