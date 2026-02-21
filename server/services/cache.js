const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

function getFromCache(key) {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }
    return null;
}

function setToCache(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

module.exports = { getFromCache, setToCache };
