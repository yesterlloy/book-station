/**
 * 工具函数 - 使用 DOM 工具库优化版
 */

// 本地存储工具 - 已在 dom.js 中有 $.extend，这里我们扩展 Storage
const Storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    },
};

// 显示提示消息
function showToast(message, duration = 2000) {
    const $toast = $('#toast');
    if (!$toast.length) return;

    $toast.text(message).addClass('show');

    setTimeout(() => {
        $toast.removeClass('show');
    }, duration);
}

// 获取滚动进度百分比
function getScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight <= clientHeight) return 100;

    return Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
}

// 平滑滚动到指定位置
function smoothScrollTo(targetY, duration = 300) {
    const startY = window.scrollY || document.documentElement.scrollTop;
    const difference = targetY - startY;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutQuart 缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentY = startY + difference * easeProgress;

        window.scrollTo(0, currentY);

        if (elapsed < duration) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// 滚动到章节顶部
function scrollToChapterTop() {
    const $chapterTitle = $('#chapterTitleContainer');
    if ($chapterTitle.length) {
        const targetY = $chapterTitle.offset().top - 10;
        smoothScrollTo(targetY, 200);
    }
}

// 获取 URL 参数
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 格式化章节序号
function formatChapterOrder(order) {
    return `第 ${order} 章`;
}

// 字数统计
function countCharacters(text) {
    return text.replace(/\s/g, '').length;
}

// 估算阅读时间（分钟）
function estimateReadingTime(text, wordsPerMinute = 500) {
    const charCount = countCharacters(text);
    return Math.ceil(charCount / wordsPerMinute);
}

// 简单的 HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 段落格式化
function formatContent(content) {
    if (!content) return '';

    // 按换行分割
    const lines = content.split(/\r?\n/);
    const paragraphs = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
            paragraphs.push(`<p>${escapeHtml(trimmed)}</p>`);
        }
    }

    return paragraphs.join('');
}

// 设备检测
const Device = {
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },

    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    },

    isTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
};

// 导出到全局
window.Storage = Storage;
window.showToast = showToast;
window.getScrollProgress = getScrollProgress;
window.smoothScrollTo = smoothScrollTo;
window.scrollToChapterTop = scrollToChapterTop;
window.getUrlParam = getUrlParam;
window.formatChapterOrder = formatChapterOrder;
window.countCharacters = countCharacters;
window.estimateReadingTime = estimateReadingTime;
window.formatContent = formatContent;
window.Device = Device;
