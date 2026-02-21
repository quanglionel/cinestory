import { CONFIG } from './modules/config.js';
import { registerServiceWorker } from './modules/pwa.js';
import { addToHistory, getProgress, saveProgress } from './modules/storage.js';

registerServiceWorker();

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

let currentChapters = [];
let isDescending = false;

async function loadDetail() {
  if (!slug) {
    window.location.href = 'comic.html';
    return;
  }

  try {
    const response = await fetch(`/api/detail/${slug}`);
    const data = await response.json();
    currentChapters = data.chapters;

    document.title = `${data.title} | CineStory`;

    // Add to history
    addToHistory({
      id: slug,
      title: data.title,
      thumb: data.thumb,
      genre: data.categories[0]?.name || "Truyện tranh",
      lastChapter: data.chapters[data.chapters.length - 1]?.name || ""
    });

    const lastRead = getProgress(slug);
    const firstChapter = data.chapters[0]?.name;
    const continueChapter = lastRead || firstChapter;

    const infoHtml = `
          <div class="detail-header">
            <div class="detail-poster">
              <img src="${data.thumb}" alt="${data.title}">
            </div>
            <div class="detail-info">
              <h1>${data.title}</h1>
              <div class="info-meta">
                <div class="meta-row">
                    <span class="meta-label">Tác giả:</span>
                    <span class="meta-value">${data.author}</span>
                </div>
                <div class="meta-row">
                    <span class="meta-label">Trạng thái:</span>
                    <span class="meta-value">${data.status === 'ongoing' ? 'Đang ra' : (data.status === 'completed' ? 'Hoàn thành' : data.status)}</span>
                </div>
                <div class="meta-row" style="align-items: flex-start; flex-direction: column; gap: 5px;">
                    <span class="meta-label">Thể loại:</span>
                    <div class="genre-list">
                        ${data.categories.map(c => `<a href="comic.html?category=${c.slug}" class="genre-item">${c.name}</a>`).join("")}
                    </div>
                </div>
              </div>
              
              <div class="detail-actions">
                <button class="btn-read btn-main" id="btnContinue">
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                   <span>${lastRead ? `Đọc tiếp (Chap ${lastRead})` : 'Bắt đầu đọc'}</span>
                </button>
                ${lastRead ? `
                   <button class="btn-read btn-sub" id="btnStartOver">
                      Đọc từ đầu
                   </button>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="chapter-section">
            <div class="chapter-header">
              <div class="chapter-title-group">
                <h2 style="margin: 0;">Danh sách chương</h2>
                <span class="chapter-badge">${data.chapters.length} chương</span>
              </div>
              <button class="btn-sort" id="btnToggleSort">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" id="sortIcon">
                    <polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline>
                </svg>
                <span id="sortText">Sắp xếp: Cũ nhất</span>
              </button>
            </div>
            <div class="chapter-list" id="chapterList"></div>
          </div>
        `;

    document.getElementById('detailContent').innerHTML = infoHtml;

    // Attach events
    document.getElementById('btnContinue')?.addEventListener('click', () => handleChapterClick(slug, continueChapter));
    document.getElementById('btnStartOver')?.addEventListener('click', () => handleChapterClick(slug, firstChapter));
    document.getElementById('btnToggleSort')?.addEventListener('click', () => {
      isDescending = !isDescending;
      renderChapters();
    });

    renderChapters();
  } catch (error) {
    console.error(error);
    document.getElementById('detailContent').innerHTML = '<p>Lỗi tải thông tin truyện.</p>';
  }
}

function renderChapters() {
  const container = document.getElementById('chapterList');
  const lastRead = getProgress(slug);

  let chaptersToDisplay = [...currentChapters];
  if (isDescending) chaptersToDisplay.reverse();

  container.innerHTML = chaptersToDisplay.map(ch => `
        <a href="#" class="chapter-item ${lastRead === ch.name ? 'active-chapter' : ''}" data-ch="${ch.name}">
          Chap ${ch.name}
        </a>
    `).join("");

  container.querySelectorAll('.chapter-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      handleChapterClick(slug, item.dataset.ch);
    });
  });

  const sortText = document.getElementById('sortText');
  if (sortText) sortText.textContent = isDescending ? 'Sắp xếp: Mới nhất' : 'Sắp xếp: Cũ nhất';
}

function handleChapterClick(slug, chapterName) {
  saveProgress(slug, chapterName);
  const chapter = currentChapters.find(ch => ch.name === chapterName);
  if (chapter && chapter.api_data) {
    const apiUrl = encodeURIComponent(chapter.api_data);
    window.location.href = `read.html?comic=${slug}&chapter=${chapterName}&api=${apiUrl}`;
  } else {
    alert('Không tìm thấy dữ liệu chương này.');
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadDetail();

  // Ready animation
  requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
});
