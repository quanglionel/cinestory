const axios = require('axios');

const OTRUYEN_API = 'https://otruyenapi.com/v1/api';

const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays} ngày trước`;
    if (diffInHours > 0) return `${diffInHours} giờ trước`;
    if (diffInMins > 0) return `${diffInMins} phút trước`;
    return 'Vừa cập nhật';
};

async function getDetail(slug) {
    const response = await axios.get(`${OTRUYEN_API}/truyen-tranh/${slug}`);
    if (!response.data?.data?.item) throw new Error('Dữ liệu không hợp lệ');
    const info = response.data.data.item;
    return {
        id: info._id,
        title: info.name,
        content: info.content,
        status: info.status,
        thumb: `https://otruyenapi.com/uploads/comics/${info.thumb_url}`,
        poster: `https://otruyenapi.com/uploads/comics/${info.poster_url}`,
        author: info.author?.[0] || 'Đang cập nhật',
        categories: info.category?.map(c => ({ name: c.name, slug: c.slug })) || [],
        chapters: info.chapters?.[0]?.server_data?.map(ch => ({
            name: ch.chapter_name,
            title: ch.chapter_title,
            slug: ch.chapter_name,
            api_data: ch.chapter_api_data
        })) || []
    };
}

async function getCategory(slug) {
    const response = await axios.get(`${OTRUYEN_API}/the-loai/${slug}`);
    const items = response.data.data.items.map(item => ({
        id: item._id,
        title: item.name,
        slug: item.slug,
        genre: item.category[0]?.name || 'Truyện',
        chapters: 'Mới cập nhật',
        thumb: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
    }));
    return { title: response.data.data.titlePage, items };
}

async function getChapterImages(apiUrl) {
    const response = await axios.get(apiUrl);
    const data = response.data.data.item;
    return {
        comic_name: data.comic_name,
        chapter_name: data.chapter_name,
        chapter_title: data.chapter_title,
        domain: response.data.data.domain_cdn,
        images: data.chapter_path ? data.chapter_image.map(img => `${response.data.data.domain_cdn}/${data.chapter_path}/${img.image_file}`) : []
    };
}

async function getList(type) {
    const response = await axios.get(`${OTRUYEN_API}/danh-sach/${type}`);
    return response.data.data.items.map(item => {
        let rawChapter = item.chaptersLatest?.[0]?.filename || '';
        let chapterFinal = 'Mới cập nhật';
        const match = rawChapter.match(/(\d+(\.\d+)?)/);
        if (match) chapterFinal = `[Chap ${match[1]}]`;

        return {
            id: item._id,
            title: item.name,
            slug: item.slug,
            genre: item.category[0]?.name || 'Truyện',
            chapters: chapterFinal,
            updatedAt: timeAgo(item.updatedAt),
            thumb: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
        };
    });
}

async function search(q) {
    const response = await axios.get(`${OTRUYEN_API}/tim-kiem?keyword=${encodeURIComponent(q)}`);
    return response.data.data.items.map(item => ({
        id: item._id,
        title: item.name,
        slug: item.slug,
        genre: item.category[0]?.name || 'Truyện',
        chapters: 'Kết quả tìm kiếm',
        thumb: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
    }));
}

async function getCategories() {
    const response = await axios.get(`${OTRUYEN_API}/the-loai`);
    return response.data.data.items.map(c => ({
        name: c.name,
        slug: c.slug
    }));
}

module.exports = { getDetail, getCategory, getChapterImages, getList, search, getCategories };
