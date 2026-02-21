export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function scrollSlider(id, direction) {
    const el = document.getElementById(id);
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
}

// Global expose if needed for inline onclick
window.scrollSlider = scrollSlider;
