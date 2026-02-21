import { CONFIG } from './modules/config.js';
import { debounce } from './modules/utils.js';
import { fetchAndRender } from './modules/content.js';
import { setupMobileSearch, showSuggestions } from './modules/search.js';
import { setLabelState, navigateWithTransition } from './modules/mode.js';
import { registerServiceWorker } from './modules/pwa.js';

registerServiceWorker();

document.addEventListener("DOMContentLoaded", () => {
    const modeSwitch = document.getElementById("modeSwitch");
    const currentMode = document.body.dataset.mode === "comic" ? "comic" : "anime";
    const isAnimeDisabled = document.body.dataset.disabled === "true";

    const searchInput = document.getElementById("headerSearchInput");
    const searchBtn = document.getElementById("headerSearchBtn");
    const suggestionsBox = document.getElementById("searchSuggestions");
    const navLinks = document.querySelectorAll(".nav-link, .nav-item[data-type]");

    // --- INIT ---
    if (isAnimeDisabled) localStorage.setItem(CONFIG.MODE_KEY, "comic");
    if (modeSwitch) modeSwitch.checked = currentMode === "comic";
    setLabelState(currentMode);

    // --- EVENTS ---
    modeSwitch?.addEventListener("change", (e) => {
        const nextMode = e.target.checked ? "comic" : "anime";
        navigateWithTransition(nextMode, currentMode);
    });

    setupMobileSearch(searchBtn, searchInput, suggestionsBox, fetchAndRender);

    searchInput?.addEventListener("input", debounce((e) => {
        showSuggestions(e.target.value.trim(), suggestionsBox, searchInput, fetchAndRender);
    }, 300));

    searchInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            fetchAndRender(searchInput.value.trim());
            suggestionsBox.classList.remove("is-visible");
        }
    });

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const type = link.dataset.type;
            if (!type) return;
            e.preventDefault();

            navLinks.forEach(l => {
                l.classList.remove("active", "is-active");
            });
            link.classList.add(link.classList.contains("nav-link") ? "active" : "is-active");

            if (searchInput) searchInput.value = "";
            fetchAndRender("", type);

            if (window.innerWidth < 680) window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // --- PAGE LIFECYCLE ---
    requestAnimationFrame(() => {
        document.body.classList.add("is-ready");

        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get("category");
        const q = urlParams.get("q");

        if (cat) fetchAndRender("", "", cat);
        else if (q) fetchAndRender(q);
        else fetchAndRender();
    });

    // --- GESTURES ---
    let touchStartX = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    document.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX - touchStartX > 100 && touchStartX < 50) {
            if (window.history.length > 1) window.history.back();
            else window.location.href = 'comic.html';
        }
    }, { passive: true });
});
