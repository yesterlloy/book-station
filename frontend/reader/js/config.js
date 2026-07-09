/**
 * 阅读器配置文件
 */
const READER_CONFIG = {
    // API 基础配置
    api: {
        baseUrl: '/api',
        timeout: 10000,
    },

    // 阅读设置默认值
    defaults: {
        fontSize: 18,
        lineHeight: 1.8,
        theme: 'light',
        bgColor: '#ffffff',
        autoSaveProgress: true,
    },

    // 字体大小范围
    fontSize: {
        min: 14,
        max: 28,
        step: 1,
    },

    // 行高范围
    lineHeight: {
        min: 1.4,
        max: 2.5,
        step: 0.1,
    },

    // 滚动相关配置
    scroll: {
        // 滚动隐藏工具栏阈值（像素）
        hideToolbarThreshold: 50,
        // 自动保存进度间隔（毫秒）
        saveProgressInterval: 5000,
    },

    // 预加载配置
    preload: {
        // 阅读到多少百分比时预加载下一章
        threshold: 0.8,
        // 预加载多少章
        chapters: 1,
    },

    // 本地存储键名
    storageKeys: {
        settings: 'reader_settings',
        progress: 'reader_progress_',
        history: 'reader_history',
        bookmarks: 'reader_bookmarks',
    },

    // 主题配置
    themes: {
        light: {
            name: '日间',
            class: 'theme-light',
            bgColors: ['#ffffff', '#f5f5dc', '#e8f4e8', '#f0e8d9'],
        },
        dark: {
            name: '夜间',
            class: 'theme-dark',
            bgColors: ['#1a1a1a'],
        },
        sepia: {
            name: '护眼',
            class: 'theme-sepia',
            bgColors: ['#f5f0e6', '#f0e8d9'],
        },
    },
};

// 初始化默认配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = READER_CONFIG;
}
