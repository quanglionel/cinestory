const express = require('express');
const cors = require('cors');
const path = require('path');
const { getFromCache, setToCache } = require('./services/cache');
const otruyen = require('./services/otruyen');
const ophim = require('./services/ophim');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to get service based on mode
const getService = (mode) => (mode === 'anime' ? ophim : otruyen);

// API: Lấy chi tiết (Truyện hoặc Phim)
app.get('/api/detail/:slug', async (req, res) => {
    const { slug } = req.params;
    const mode = req.query.mode || 'comic';
    const cacheKey = `detail_${mode}_${slug}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const service = getService(mode);
        const data = await service.getDetail(slug);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Lấy danh sách theo thể loại
app.get('/api/category/:slug', async (req, res) => {
    const { slug } = req.params;
    const mode = req.query.mode || 'comic';
    const cacheKey = `category_${mode}_${slug}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const service = getService(mode);
        const data = await service.getCategory ? await service.getCategory(slug) : await service.getCategoryList(slug);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Lấy ảnh chương (Chỉ cho Comic)
app.get('/api/chapter-images', async (req, res) => {
    const apiUrl = req.query.url;
    if (!apiUrl) return res.status(400).json({ message: 'Missing URL' });
    const cacheKey = `chapter_${Buffer.from(apiUrl).toString('base64')}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await otruyen.getChapterImages(apiUrl);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Lấy danh sách (Home/Completed/etc)
app.get('/api/content', async (req, res) => {
    const type = req.query.type || (req.query.mode === 'anime' ? 'phim-moi-cap-nhat' : 'truyen-moi');
    const mode = req.query.mode || 'comic';
    const cacheKey = `content_${mode}_${type}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const service = getService(mode);
        const data = await service.getList(type);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Tìm kiếm
app.get('/api/search', async (req, res) => {
    const q = req.query.q || '';
    const mode = req.query.mode || 'comic';
    const cacheKey = `search_${mode}_${q}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const service = getService(mode);
        const data = await service.search(q);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Lấy danh sách tất cả thể loại
app.get('/api/categories', async (req, res) => {
    const mode = req.query.mode || 'comic';
    const cacheKey = `categories_list_${mode}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const service = getService(mode);
        const data = await service.getCategories();
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Phục vụ file tĩnh
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/pages', express.static(path.join(__dirname, '../pages')));
app.use(express.static(path.join(__dirname, '../')));

app.listen(PORT, () => {
    console.log(`Backend server running at: http://localhost:${PORT}`);
});
