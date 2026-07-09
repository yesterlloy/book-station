/**
 * 阅读器核心逻辑 - 使用 DOM 工具库优化版
 */

$(function() {
    'use strict';

    class NovelReader {
        constructor() {
            this.currentNovelId = null;
            this.currentChapterId = null;
            this.currentChapterOrder = 1;
            this.totalChapters = 0;
            this.chapters = [];
            this.nextChapterPreloaded = false;
            this.settings = {};
            this.isToolbarVisible = true;
            this.lastScrollY = 0;
            this.autoSaveTimer = null;

            // 缓存 DOM 元素
            this.cacheElements();
            this.loadSettings();
            this.applySettings();
            this.bindEvents();
            this.loadFromUrl();
            this.startAutoSaveProgress();
        }

        /**
         * 缓存 DOM 元素
         */
        cacheElements() {
            this.$header = $('#header');
            this.$footer = $('#footer');
            this.$novelTitle = $('#novelTitle');
            this.$chapterTitle = $('#chapterTitle');
            this.$contentInner = $('#contentInner');
            this.$progressFill = $('#progressFill');
            this.$settingsPanel = $('#settingsPanel');
            this.$chapterPanel = $('#chapterPanel');
            this.$chapterList = $('#chapterList');
            this.$fontSizeSlider = $('#fontSizeSlider');
            this.$fontSizeValue = $('#fontSizeValue');
            this.$lineHeightSlider = $('#lineHeightSlider');
            this.$lineHeightValue = $('#lineHeightValue');
            this.$autoSaveCheckbox = $('#autoSaveProgress');
        }

        /**
         * 加载设置
         */
        loadSettings() {
            const savedSettings = Storage.get(READER_CONFIG.storageKeys.settings);
            this.settings = { ...READER_CONFIG.defaults, ...savedSettings };
        }

        /**
         * 保存设置
         */
        saveSettings() {
            Storage.set(READER_CONFIG.storageKeys.settings, this.settings);
        }

        /**
         * 应用设置
         */
        applySettings() {
            const { fontSize, lineHeight, theme, bgColor } = this.settings;

            // 应用字体大小
            $('body').removeClass(/font-size-\d+/g);
            $('body').addClass(`font-size-${fontSize}`);

            // 应用行高
            $('body').removeClass(/line-height-\d+-\d+/g);
            $('body').addClass(`line-height-${lineHeight.toString().replace('.', '-')}`);

            // 应用主题
            $('body').removeClass(/theme-\w+/g);
            $('body').addClass(`theme-${theme}`);

            // 应用背景颜色
            document.body.setAttribute('data-bg', bgColor);

            // 更新 UI
            this.$fontSizeSlider.val(fontSize);
            this.$fontSizeValue.text(fontSize);
            this.$lineHeightSlider.val(lineHeight);
            this.$lineHeightValue.text(lineHeight);
            this.$autoSaveCheckbox.get(0).checked = this.settings.autoSaveProgress;

            // 更新主题按钮状态
            $('.theme-btn').each(function() {
                $(this).toggleClass('active', $(this).data('theme') === theme);
            });

            // 更新背景按钮状态
            $('.bg-btn').each(function() {
                $(this).toggleClass('active', $(this).data('bg') === bgColor);
            });
        }

        /**
         * 从 URL 加载
         */
        loadFromUrl() {
            const chapterId = getUrlParam('chapter');
            const novelId = getUrlParam('novel');

            if (novelId) {
                this.currentNovelId = novelId;
            }

            if (chapterId) {
                this.loadChapter(chapterId);
            } else if (novelId) {
                // 如果只有小说 ID，加载第一章或上次阅读位置
                this.loadLastReadPosition(novelId);
            }
        }

        /**
         * 加载上次阅读位置
         */
        async loadLastReadPosition(novelId) {
            try {
                // 先从本地存储查找
                const progressKey = READER_CONFIG.storageKeys.progress + novelId;
                const savedProgress = Storage.get(progressKey);

                if (savedProgress && savedProgress.chapterId) {
                    await this.loadChapter(savedProgress.chapterId);
                    // 延迟恢复滚动位置
                    setTimeout(() => {
                        if (savedProgress.scrollPosition) {
                            smoothScrollTo(savedProgress.scrollPosition, 0);
                        }
                    }, 500);
                    return;
                }

                // 本地没有，尝试从 API 获取
                await this.loadNovelChapters(novelId);
                if (this.chapters.length > 0) {
                    await this.loadChapter(this.chapters[0]._id);
                }
            } catch (error) {
                console.error('Failed to load last read position:', error);
                showToast('加载阅读位置失败');
            }
        }

        /**
         * 加载章节内容
         */
        async loadChapter(chapterId) {
            if (!chapterId) return;

            try {
                showToast('加载中...');

                const chapterData = await api.chapters.get(chapterId);

                this.currentChapterId = chapterId;
                this.currentChapterOrder = chapterData.order;
                this.nextChapterPreloaded = false;

                // 更新小说标题
                if (chapterData.novelTitle) {
                    this.$novelTitle.text(chapterData.novelTitle);
                }

                // 更新章节标题
                this.$chapterTitle.text(chapterData.title);

                // 渲染内容
                const contentHtml = formatContent(chapterData.content);
                this.$contentInner.html(contentHtml);

                // 滚动到顶部
                scrollToChapterTop();

                // 更新导航按钮状态
                this.updateNavButtons();

                // 保存阅读记录
                this.saveReadingHistory(chapterData);

                showToast('加载完成');
            } catch (error) {
                console.error('Failed to load chapter:', error);
                showToast('加载失败，请重试');
            }
        }

        /**
         * 加载小说章节列表
         */
        async loadNovelChapters(novelId) {
            try {
                const result = await api.novels.chapters(novelId);
                this.chapters = result.list || [];
                this.totalChapters = result.total || 0;
                this.renderChapterList();
            } catch (error) {
                console.error('Failed to load chapter list:', error);
            }
        }

        /**
         * 渲染章节列表
         */
        renderChapterList() {
            const html = this.chapters.map(chapter => `
                <div class="chapter-item ${chapter._id === this.currentChapterId ? 'current' : ''}"
                     data-chapter-id="${chapter._id}" data-order="${chapter.order}">
                    <div class="chapter-item-title">${chapter.title}</div>
                    <div class="chapter-item-number">第 ${chapter.order} 章</div>
                </div>
            `).join('');

            this.$chapterList.html(html);
        }

        /**
         * 更新导航按钮状态
         */
        updateNavButtons() {
            $('#prevChapter').get(0).disabled = this.currentChapterOrder <= 1;
            $('#nextChapter').get(0).disabled = this.currentChapterOrder >= this.totalChapters;
        }

        /**
         * 上一章
         */
        async prevChapter() {
            if (this.currentChapterOrder <= 1) {
                showToast('已经是第一章了');
                return;
            }

            const targetOrder = this.currentChapterOrder - 1;
            const chapter = this.chapters.find(c => c.order === targetOrder);

            if (chapter) {
                await this.loadChapter(chapter._id);
            }
        }

        /**
         * 下一章
         */
        async nextChapter() {
            if (this.currentChapterOrder >= this.totalChapters) {
                showToast('已经是最后一章了');
                return;
            }

            const targetOrder = this.currentChapterOrder + 1;
            const chapter = this.chapters.find(c => c.order === targetOrder);

            if (chapter) {
                await this.loadChapter(chapter._id);
            }
        }

        /**
         * 预加载下一章
         */
        async preloadNextChapter() {
            if (this.nextChapterPreloaded) return;
            if (this.currentChapterOrder >= this.totalChapters) return;

            const nextOrder = this.currentChapterOrder + 1;
            const nextChapter = this.chapters.find(c => c.order === nextOrder);

            if (nextChapter) {
                try {
                    console.log('Preloading next chapter...');
                    await api.chapters.get(nextChapter._id);
                    this.nextChapterPreloaded = true;
                    showToast('下一章已预加载', 1000);
                } catch (error) {
                    console.error('Preload failed:', error);
                }
            }
        }

        /**
         * 保存阅读历史
         */
        saveReadingHistory(chapterData) {
            const history = Storage.get(READER_CONFIG.storageKeys.history, []);
            const record = {
                novelId: this.currentNovelId,
                chapterId: chapterData._id,
                chapterTitle: chapterData.title,
                chapterOrder: chapterData.order,
                timestamp: Date.now(),
            };

            // 去重并添加到开头
            const filtered = history.filter(h => h.novelId !== this.currentNovelId);
            filtered.unshift(record);

            // 只保留最近 50 条
            Storage.set(READER_CONFIG.storageKeys.history, filtered.slice(0, 50));
        }

        /**
         * 保存阅读进度
         */
        saveReadProgress() {
            if (!this.settings.autoSaveProgress) return;
            if (!this.currentNovelId) return;

            const progressKey = READER_CONFIG.storageKeys.progress + this.currentNovelId;
            const scrollY = window.scrollY || document.documentElement.scrollTop;

            Storage.set(progressKey, {
                chapterId: this.currentChapterId,
                chapterOrder: this.currentChapterOrder,
                scrollPosition: scrollY,
                timestamp: Date.now(),
            });

            // 同步到服务器（如果已登录）
            this.syncProgressToServer();
        }

        /**
         * 同步进度到服务器
         */
        async syncProgressToServer() {
            try {
                await api.progress.sync({
                    novelId: this.currentNovelId,
                    chapterId: this.currentChapterId,
                    chapterOrder: this.currentChapterOrder,
                    scrollPosition: window.scrollY || document.documentElement.scrollTop,
                });
            } catch (error) {
                // 静默失败
            }
        }

        /**
         * 自动保存进度
         */
        startAutoSaveProgress() {
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
            }

            this.autoSaveTimer = setInterval(() => {
                this.saveReadProgress();
            }, READER_CONFIG.scroll.saveProgressInterval);
        }

        /**
         * 滚动处理
         */
        handleScroll() {
            const currentScrollY = window.scrollY || document.documentElement.scrollTop;
            const scrollDiff = currentScrollY - this.lastScrollY;

            // 更新进度条
            const progress = getScrollProgress();
            this.$progressFill.css('width', `${progress}%`);

            // 自动隐藏/显示工具栏
            if (Math.abs(scrollDiff) > READER_CONFIG.scroll.hideToolbarThreshold) {
                if (scrollDiff > 0 && this.isToolbarVisible) {
                    // 向下滚动，隐藏工具栏
                    this.toggleToolbar(false);
                } else if (scrollDiff < 0 && !this.isToolbarVisible) {
                    // 向上滚动，显示工具栏
                    this.toggleToolbar(true);
                }
            }

            this.lastScrollY = currentScrollY;

            // 检查是否需要预加载下一章
            if (progress >= READER_CONFIG.preload.threshold * 100) {
                this.preloadNextChapter();
            }
        }

        /**
         * 切换工具栏显示/隐藏
         */
        toggleToolbar(show) {
            if (show) {
                this.$header.removeClass('hidden');
                this.$footer.removeClass('hidden');
                this.isToolbarVisible = true;
            } else {
                this.$header.addClass('hidden');
                this.$footer.addClass('hidden');
                this.isToolbarVisible = false;
            }
        }

        /**
         * 切换设置面板
         */
        toggleSettingsPanel(show) {
            const overlay = this.$settingsPanel.find('.panel-overlay');
            const content = this.$settingsPanel.find('.panel-content');

            if (show) {
                this.$settingsPanel.css('display', 'block');
                // 强制重绘以触发动画
                requestAnimationFrame(() => {
                    overlay.addClass('active');
                    content.addClass('active');
                });
            } else {
                overlay.removeClass('active');
                content.removeClass('active');
                setTimeout(() => {
                    this.$settingsPanel.css('display', 'none');
                }, 300);
            }
        }

        /**
         * 切换章节列表面板
         */
        toggleChapterPanel(show) {
            const overlay = this.$chapterPanel.find('.panel-overlay');
            const content = this.$chapterPanel.find('.panel-content');

            if (show) {
                // 如果章节列表为空，先加载
                if (this.chapters.length === 0 && this.currentNovelId) {
                    this.loadNovelChapters(this.currentNovelId);
                }
                this.$chapterPanel.css('display', 'block');
                requestAnimationFrame(() => {
                    overlay.addClass('active');
                    content.addClass('active');
                });
            } else {
                overlay.removeClass('active');
                content.removeClass('active');
                setTimeout(() => {
                    this.$chapterPanel.css('display', 'none');
                }, 300);
            }
        }

        /**
         * 调整字体大小
         */
        adjustFontSize(delta) {
            const newSize = Math.max(
                READER_CONFIG.fontSize.min,
                Math.min(READER_CONFIG.fontSize.max, this.settings.fontSize + delta)
            );

            if (newSize !== this.settings.fontSize) {
                this.setFontSize(newSize);
            }
        }

        /**
         * 设置字体大小
         */
        setFontSize(size) {
            size = Math.max(READER_CONFIG.fontSize.min,
                Math.min(READER_CONFIG.fontSize.max, parseInt(size)));

            if (size !== this.settings.fontSize) {
                this.settings.fontSize = size;
                this.applySettings();
                this.saveSettings();
            }
        }

        /**
         * 设置行高
         */
        setLineHeight(height) {
            height = Math.max(READER_CONFIG.lineHeight.min,
                Math.min(READER_CONFIG.lineHeight.max, parseFloat(height)));

            if (height !== this.settings.lineHeight) {
                this.settings.lineHeight = height;
                this.applySettings();
                this.saveSettings();
            }
        }

        /**
         * 设置主题
         */
        setTheme(theme) {
            if (theme !== this.settings.theme) {
                this.settings.theme = theme;
                this.applySettings();
                this.saveSettings();
            }
        }

        /**
         * 设置背景颜色
         */
        setBgColor(color) {
            if (color !== this.settings.bgColor) {
                this.settings.bgColor = color;
                this.applySettings();
                this.saveSettings();
            }
        }

        /**
         * 切换自动保存进度
         */
        toggleAutoSaveProgress(enabled) {
            this.settings.autoSaveProgress = enabled;
            this.saveSettings();
        }

        /**
         * 绑定事件
         */
        bindEvents() {
            const self = this;

            // 返回按钮
            $('#backBtn').click(function() {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = '../index.html';
                }
            });

            // 菜单按钮
            $('#menuBtn').click(function() {
                self.toggleSettingsPanel(true);
            });

            // 上一章/下一章
            $('#prevChapter').click(function() { self.prevChapter(); });
            $('#nextChapter').click(function() { self.nextChapter(); });

            // 目录按钮
            $('#chapterListBtn').click(function() {
                self.toggleChapterPanel(true);
            });

            // 设置按钮
            $('#settingsBtn').click(function() {
                self.toggleSettingsPanel(true);
            });

            // 关闭设置面板
            $('#closeSettings').click(function() {
                self.toggleSettingsPanel(false);
            });

            $('#settingsOverlay').click(function() {
                self.toggleSettingsPanel(false);
            });

            // 关闭章节列表
            $('#closeChapter').click(function() {
                self.toggleChapterPanel(false);
            });

            $('#chapterOverlay').click(function() {
                self.toggleChapterPanel(false);
            });

            // 章节列表点击
            $('#chapterList').on('click', '.chapter-item', function() {
                const chapterId = $(this).data('chapter-id');
                self.loadChapter(chapterId);
                self.toggleChapterPanel(false);
            });

            // 字体大小滑块
            this.$fontSizeSlider.on('input', function() {
                self.setFontSize(this.value);
            });

            // 字体大小按钮
            $('.control-btn').click(function() {
                const action = $(this).data('action');
                if (action === 'decreaseFont') {
                    self.adjustFontSize(-1);
                } else if (action === 'increaseFont') {
                    self.adjustFontSize(1);
                }
            });

            // 行高滑块
            this.$lineHeightSlider.on('input', function() {
                self.setLineHeight(this.value);
            });

            // 主题切换
            $('.theme-btn').click(function() {
                self.setTheme($(this).data('theme'));
            });

            // 背景颜色切换
            $('.bg-btn').click(function() {
                self.setBgColor($(this).data('bg'));
            });

            // 自动保存开关
            this.$autoSaveCheckbox.on('change', function() {
                self.toggleAutoSaveProgress(this.checked);
            });

            // 滚动事件 - 使用节流优化
            $(window).scroll($.throttle(() => this.handleScroll(), 100));

            // 键盘快捷键
            $(document).keydown(function(e) {
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'PageUp':
                        e.preventDefault();
                        self.prevChapter();
                        break;
                    case 'ArrowRight':
                    case 'PageDown':
                    case ' ':
                        e.preventDefault();
                        self.nextChapter();
                        break;
                    case 'Escape':
                        self.toggleSettingsPanel(false);
                        self.toggleChapterPanel(false);
                        break;
                }
            });

            // 触摸滑动
            let touchStartX = 0;
            let touchStartY = 0;

            $(document).touchstart(function(e) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });

            $(document).touchend(function(e) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const diffX = touchEndX - touchStartX;
                const diffY = touchEndY - touchStartY;

                // 只处理水平滑动，且滑动距离足够
                if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 0) {
                        // 向右滑动，上一章
                        self.prevChapter();
                    } else {
                        // 向左滑动，下一章
                        self.nextChapter();
                    }
                }
            });

            // 页面可见性变化时保存进度
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.saveReadProgress();
                }
            });

            // 页面卸载前保存进度
            window.addEventListener('beforeunload', () => {
                this.saveReadProgress();
            });
        }
    }

    // 初始化阅读器
    window.reader = new NovelReader();
});
