import { CONFIG } from './config.js';

export function setLabelState(mode) {
    const animeLabel = document.getElementById("animeLabel");
    const comicLabel = document.getElementById("comicLabel");
    const isComicMode = mode === "comic";
    animeLabel?.classList.toggle("is-active", !isComicMode);
    comicLabel?.classList.toggle("is-active", isComicMode);
}

export function navigateWithTransition(targetMode, currentMode) {
    if (targetMode === currentMode) return;

    localStorage.setItem(CONFIG.MODE_KEY, targetMode);
    document.body.classList.add("is-leaving");

    const targetPage = targetMode === "comic" ? "comic.html" : "anime.html";
    setTimeout(() => {
        window.location.href = targetPage;
    }, 190);
}
