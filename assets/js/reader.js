import { registerServiceWorker } from './modules/pwa.js';
import { saveProgress, addToHistory, getHistory } from './modules/storage.js';

registerServiceWorker();

const params = new URLSearchParams(window.location.search);
const comicSlug = params.get('comic');
const chapterName = params.get('chapter');
const apiUrl = params.get('api');

let allChapters = [];

async function initReader() {
    if (!comicSlug || !chapterName || !apiUrl) {
        window.location.href = 'comic.html';
        return;
    }

    try {
        const res = await fetch(`/api/chapter-images?url=${encodeURIComponent(apiUrl)}`);
        const data = await res.json();

        document.title = `${data.comic_name} - Chap ${data.chapter_name} | CineStory`;
        document.getElementById('comicTitle').textContent = data.comic_name;
        document.getElementById('chapterTitle').textContent = `Chap ${data.chapter_name}${data.chapter_title ? ': ' + data.chapter_title : ''}`;

        const container = document.getElementById('imageContainer');
        container.innerHTML = data.images.map(img => `
            <img src="${img}" class="reader-image" loading="lazy" alt="Trang truyện">
        `).join('');

        await setupNavigation();
        renderDrawer();

        const loading = document.getElementById('loading');
        loading.style.opacity = '0';
        setTimeout(() => loading.style.display = 'none', 400);

        saveProgress(comicSlug, chapterName);

        // Update history with current chapter
        addToHistory({
            id: comicSlug,
            lastReadChapter: chapterName
        });

    } catch (error) {
        console.error(error);
        alert('Khôi tải được chương truyện. Vui lòng thử lại.');
    }
}

async function setupNavigation() {
    const res = await fetch(`/api/detail/${comicSlug}`);
    const detail = await res.json();

    allChapters = detail.chapters.sort((a, b) => {
        const numA = parseFloat(a.name.replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat(b.name.replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
    });

    const currentIndex = allChapters.findIndex(ch => ch.name === chapterName);
    const prevChapter = allChapters[currentIndex - 1];
    const nextChapter = allChapters[currentIndex + 1];

    const backToDetailUrl = `comic-detail.html?slug=${comicSlug}`;
    document.getElementById('backBtn').href = backToDetailUrl;
    document.getElementById('backToDetail').href = backToDetailUrl;

    updateNavBtn('prevBtn', prevChapter);
    updateNavBtn('footerPrev', prevChapter);
    updateNavBtn('nextBtn', nextChapter);
    updateNavBtn('footerNext', nextChapter);

    const nextBox = document.getElementById('nextChapterTrigger');
    let isNavigating = false;

    if (nextChapter) {
        nextBox.style.display = 'block';
        document.getElementById('nextChapterName').textContent = `Chuẩn bị: Chap ${nextChapter.name}`;

        const navigateToNext = () => {
            if (isNavigating) return;
            isNavigating = true;
            nextBox.querySelector('h3').textContent = 'Đang chuyển chương...';
            nextBox.querySelector('.icon').innerHTML = '<div class="spinner" style="width:24px; height:24px; margin: 0 auto;"></div>';
            window.location.href = `read.html?comic=${comicSlug}&chapter=${nextChapter.name}&api=${encodeURIComponent(nextChapter.api_data)}`;
        };

        nextBox.onclick = navigateToNext;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isNavigating) {
                navigateToNext();
            }
        }, { threshold: 0.7 });
        observer.observe(nextBox);
    } else {
        nextBox.style.display = 'none';
    }
}

function updateNavBtn(btnId, chapter) {
    const btn = document.getElementById(btnId);
    if (chapter) {
        btn.classList.remove('disabled');
        btn.href = `read.html?comic=${comicSlug}&chapter=${chapter.name}&api=${encodeURIComponent(chapter.api_data)}`;
    } else {
        btn.classList.add('disabled');
        btn.href = '#';
    }
}


function toggleDrawer(open) {
    const drawer = document.getElementById('chapterDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (open) {
        drawer.classList.add('is-active');
        overlay.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.remove('is-active');
        overlay.classList.remove('is-active');
        document.body.style.overflow = '';
    }
}

function renderDrawer() {
    const list = document.getElementById('drawerList');
    const displayList = [...allChapters].reverse();

    list.innerHTML = displayList.map(ch => {
        const isActive = ch.name === chapterName;
        const url = `read.html?comic=${comicSlug}&chapter=${ch.name}&api=${encodeURIComponent(ch.api_data)}`;
        return `
            <a href="${url}" class="drawer-item ${isActive ? 'active' : ''}">
                Chap ${ch.name} ${ch.title ? '- ' + ch.title : ''}
            </a>
        `;
    }).join('');
}

// Global expose for inline onclick
window.toggleDrawer = toggleDrawer;

// Header & BackToTop Logic
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const header = document.getElementById('readerHeader');
    const btt = document.getElementById('backToTop');

    if (currentScroll > 100 && currentScroll > lastScroll) {
        header.classList.add('is-hidden');
    } else {
        header.classList.remove('is-hidden');
    }

    if (currentScroll > 1000) btt.classList.add('show');
    else btt.classList.remove('show');

    lastScroll = currentScroll;
});

document.addEventListener('DOMContentLoaded', initReader);
