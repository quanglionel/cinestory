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

export async function onRequest(context) {
    const { request, params } = context;
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/', '');

    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // --- ROUTER ---

        // 1. Detail: api/detail/:slug
        if (path.startsWith('detail/')) {
            const slug = path.split('/')[1];
            const res = await fetch(`${OTRUYEN_API}/truyen-tranh/${slug}`);
            const json = await res.json();
            const info = json.data.item;

            const data = {
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
            return new Response(JSON.stringify(data), { headers: corsHeaders });
        }

        // 2. Category: api/category/:slug
        if (path.startsWith('category/')) {
            const slug = path.split('/')[1];
            const res = await fetch(`${OTRUYEN_API}/the-loai/${slug}`);
            const json = await res.json();
            const items = json.data.items.map(item => ({
                id: item._id,
                title: item.name,
                slug: item.slug,
                genre: item.category[0]?.name || 'Truyện',
                chapters: 'Mới cập nhật',
                thumb: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
            }));
            return new Response(JSON.stringify({ title: json.data.titlePage, items }), { headers: corsHeaders });
        }

        // 3. Chapter Images: api/chapter-images?url=...
        if (path === 'chapter-images') {
            const apiUrl = url.searchParams.get('url');
            const res = await fetch(apiUrl);
            const json = await res.json();
            const data = json.data.item;
            const result = {
                comic_name: data.comic_name,
                chapter_name: data.chapter_name,
                chapter_title: data.chapter_title,
                domain: json.data.domain_cdn,
                images: data.chapter_path ? data.chapter_image.map(img => `${json.data.domain_cdn}/${data.chapter_path}/${img.image_file}`) : []
            };
            return new Response(JSON.stringify(result), { headers: corsHeaders });
        }

        // 4. Content List: api/content?type=...
        if (path === 'content') {
            const type = url.searchParams.get('type') || 'truyen-moi';
            const res = await fetch(`${OTRUYEN_API}/danh-sach/${type}`);
            const json = await res.json();
            const items = json.data.items.map(item => {
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
            return new Response(JSON.stringify(items), { headers: corsHeaders });
        }

        // 5. Search: api/search?q=...
        if (path === 'search') {
            const q = url.searchParams.get('q') || '';
            const res = await fetch(`${OTRUYEN_API}/tim-kiem?keyword=${encodeURIComponent(q)}`);
            const json = await res.json();
            const items = json.data.items.map(item => ({
                id: item._id,
                title: item.name,
                slug: item.slug,
                genre: item.category[0]?.name || 'Truyện',
                chapters: 'Kết quả tìm kiếm',
                thumb: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`
            }));
            return new Response(JSON.stringify(items), { headers: corsHeaders });
        }

        // 6. All Categories: api/categories
        if (path === 'categories') {
            const res = await fetch(`${OTRUYEN_API}/the-loai`);
            const json = await res.json();
            const items = json.data.items.map(c => ({
                name: c.name,
                slug: c.slug
            }));
            return new Response(JSON.stringify(items), { headers: corsHeaders });
        }

        return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers: corsHeaders });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
}
