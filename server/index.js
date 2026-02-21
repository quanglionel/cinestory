const express = require('express');
const cors = require('cors');
const path = require('path');
const { getFromCache, setToCache } = require('./services/cache');
const otruyen = require('./services/otruyen');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API: Lấy chi tiết truyện
app.get('/api/detail/:slug', async (req, res) => {
    const slug = req.params.slug;
    const cacheKey = `detail_${slug}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await otruyen.getDetail(slug);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Lấy danh sách truyện theo thể loại
app.get('/api/category/:slug', async (req, res) => {
    const slug = req.params.slug;
    const cacheKey = `category_${slug}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await otruyen.getCategory(slug);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Lấy ảnh chương
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

// API: Lấy danh sách truyện (Home/Completed)
app.get('/api/content', async (req, res) => {
    const type = req.query.type || 'truyen-moi';
    const cacheKey = `content_${type}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await otruyen.getList(type);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Tìm kiếm
app.get('/api/search', async (req, res) => {
    const q = req.query.q || '';
    const cacheKey = `search_${q}`;
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await otruyen.search(q);
        setToCache(cacheKey, data);
        res.json(data);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// API: Lấy danh sách tất cả thể loại
app.get('/api/categories', async (req, res) => {
    const cacheKey = 'categories_list';
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        const data = await otruyen.getCategories();
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
