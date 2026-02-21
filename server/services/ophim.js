const axios = require('axios');

const OPHIM_API = 'https://ophim1.com';
const OPHIM_API_V1 = 'https://ophim1.com/v1/api';

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
    const response = await axios.get(`${OPHIM_API}/phim/${slug}`);
    if (!response.data?.status) throw new Error('Phim không tồn tại');

    const info = response.data.movie;
    const episodes = response.data.episodes?.[0]?.server_data || [];

    return {
        id: info._id,
        title: info.name,
        origin_name: info.origin_name,
        content: info.content,
        status: info.status,
        thumb: info.thumb_url,
        poster: info.poster_url,
        time: info.time,
        episode_total: info.episode_total,
        episode_current: info.episode_current,
        quality: info.quality,
        lang: info.lang,
        year: info.year,
        categories: info.category?.map(c => ({ name: c.name, slug: c.slug })) || [],
        actors: info.actor || [],
        episodes: episodes.map(ep => ({
            name: ep.name,
            slug: ep.slug,
            link_embed: ep.link_embed,
            link_m3u8: ep.link_m3u8
        }))
    };
}

async function getList(type = 'phim-moi-cap-nhat', page = 1) {
    // Note: OPhim has some special lists like 'phim-le', 'phim-bo', 'hoat-hinh'
    const response = await axios.get(`${OPHIM_API}/danh-sach/${type}?page=${page}`);
    const items = response.data.items || [];

    return items.map(item => ({
        id: item._id,
        title: item.name,
        slug: item.slug,
        origin_name: item.origin_name,
        poster: item.poster_url,
        thumb: item.thumb_url,
        year: item.year,
        updatedAt: timeAgo(item.modified.time),
        episode_current: item.episode_current,
        quality: item.quality,
        lang: item.lang
    }));
}

async function search(q) {
    const response = await axios.get(`${OPHIM_API_V1}/tim-kiem?keyword=${encodeURIComponent(q)}`);
    const items = response.data.data.items || [];

    return items.map(item => ({
        id: item._id,
        title: item.name,
        slug: item.slug,
        origin_name: item.origin_name,
        thumb: `${response.data.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/${item.thumb_url}`,
        poster: `${response.data.data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/${item.poster_url}`,
        year: item.year,
        updatedAt: timeAgo(item.modified.time)
    }));
}

async function getCategories() {
    const response = await axios.get(`${OPHIM_API_V1}/the-loai`);
    return response.data.data.items.map(c => ({
        name: c.name,
        slug: c.slug
    }));
}

async function getCategoryList(slug, page = 1) {
    const response = await axios.get(`${OPHIM_API_V1}/the-loai/${slug}?page=${page}`);
    const data = response.data.data;
    const items = data.items.map(item => ({
        id: item._id,
        title: item.name,
        slug: item.slug,
        origin_name: item.origin_name,
        thumb: `${data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/${item.thumb_url}`,
        poster: `${data.APP_DOMAIN_CDN_IMAGE}/uploads/movies/${item.poster_url}`,
        year: item.year,
        updatedAt: timeAgo(item.modified.time)
    }));
    return { title: data.titlePage, items };
}

module.exports = { getDetail, getList, search, getCategories, getCategoryList };
