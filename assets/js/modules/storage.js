import { CONFIG } from './config.js';

const PROGRESS_KEY = 'cineStoryProgress';

export function getHistory() {
    return JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY) || "[]");
}

export function addToHistory(item) {
    if (!item || !item.id) return;

    let history = getHistory();
    // Xóa nếu đã tồn tại để đưa lên đầu
    const existingIndex = history.findIndex(h => h.id === item.id);
    let existingItem = {};

    if (existingIndex !== -1) {
        existingItem = history[existingIndex];
        history.splice(existingIndex, 1);
    }

    const newItem = {
        ...existingItem,
        ...item,
        viewedAt: new Date().toISOString()
    };

    history.unshift(newItem);
    // Giới hạn 20 truyện
    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export function removeFromHistory(id) {
    let history = getHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(history));
}

export function getProgress(slug) {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return allProgress[slug] || null;
}

export function saveProgress(slug, chapterName) {
    const allProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    allProgress[slug] = chapterName;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
}
