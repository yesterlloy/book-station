/**
 * 轻量级 DOM 工具库 - 类似 jQuery 的 API
 * 让 DOM 操作更简洁、链式调用
 */

(function(global) {
    'use strict';

    /**
     * DomQuery 类
     * @param {string|Element|Element[]} selector - CSS 选择器或 DOM 元素
     * @param {Element|Document} context - 上下文
     */
    function DomQuery(selector, context) {
        if (!(this instanceof DomQuery)) {
            return new DomQuery(selector, context);
        }

        this.elements = [];

        // 如果是 DomQuery 实例
        if (selector instanceof DomQuery) {
            return selector;
        }

        // 如果是字符串（选择器）
        if (typeof selector === 'string') {
            const ctx = context || document;
            this.elements = Array.from(ctx.querySelectorAll(selector));
        }
        // 如果是单个 DOM 元素
        else if (selector instanceof Element || selector === document || selector === window) {
            this.elements = [selector];
        }
        // 如果是元素数组
        else if (Array.isArray(selector)) {
            this.elements = selector.filter(el => el instanceof Element);
        }
        // 如果是 NodeList
        else if (selector instanceof NodeList) {
            this.elements = Array.from(selector);
        }

        this.length = this.elements.length;
    }

    // ============================================
    // 遍历方法
    // ============================================

    /**
     * 遍历所有元素
     */
    DomQuery.prototype.each = function(callback) {
        this.elements.forEach((el, index) => callback.call(el, index, el));
        return this;
    };

    /**
     * 获取指定索引的元素
     */
    DomQuery.prototype.get = function(index) {
        if (index === undefined) {
            return this.elements.slice();
        }
        return this.elements[index < 0 ? this.length + index : index];
    };

    /**
     * 获取第一个元素包装成 DomQuery
     */
    DomQuery.prototype.first = function() {
        return new DomQuery(this.elements[0]);
    };

    /**
     * 获取最后一个元素包装成 DomQuery
     */
    DomQuery.prototype.last = function() {
        return new DomQuery(this.elements[this.length - 1]);
    };

    // ============================================
    // 选择器方法
    // ============================================

    /**
     * 在当前元素内查找
     */
    DomQuery.prototype.find = function(selector) {
        const results = [];
        this.each(function() {
            const found = this.querySelectorAll(selector);
            results.push(...found);
        });
        return new DomQuery(results);
    };

    /**
     * 获取父元素
     */
    DomQuery.prototype.parent = function() {
        const parents = [];
        this.each(function() {
            if (this.parentNode && !parents.includes(this.parentNode)) {
                parents.push(this.parentNode);
            }
        });
        return new DomQuery(parents);
    };

    /**
     * 获取所有子元素
     */
    DomQuery.prototype.children = function(selector) {
        const children = [];
        this.each(function() {
            Array.from(this.children).forEach(child => {
                if (!selector || child.matches(selector)) {
                    children.push(child);
                }
            });
        });
        return new DomQuery(children);
    };

    /**
     * 获取最近的匹配祖先
     */
    DomQuery.prototype.closest = function(selector) {
        const results = [];
        this.each(function() {
            let el = this;
            while (el && el !== document) {
                if (el.matches(selector)) {
                    if (!results.includes(el)) {
                        results.push(el);
                    }
                    break;
                }
                el = el.parentElement;
            }
        });
        return new DomQuery(results);
    };

    // ============================================
    // 类名操作
    // ============================================

    DomQuery.prototype.addClass = function(className) {
        return this.each(function() {
            this.classList.add(className);
        });
    };

    DomQuery.prototype.removeClass = function(className) {
        return this.each(function() {
            this.classList.remove(className);
        });
    };

    DomQuery.prototype.toggleClass = function(className, force) {
        return this.each(function() {
            if (force !== undefined) {
                this.classList.toggle(className, force);
            } else {
                this.classList.toggle(className);
            }
        });
    };

    DomQuery.prototype.hasClass = function(className) {
        return this.elements.some(el => el.classList.contains(className));
    };

    // ============================================
    // 属性操作
    // ============================================

    DomQuery.prototype.attr = function(name, value) {
        if (value === undefined) {
            return this.elements[0]?.getAttribute(name);
        }
        return this.each(function() {
            this.setAttribute(name, value);
        });
    };

    DomQuery.prototype.removeAttr = function(name) {
        return this.each(function() {
            this.removeAttribute(name);
        });
    };

    // ============================================
    // 样式操作
    // ============================================

    DomQuery.prototype.css = function(prop, value) {
        // 获取样式
        if (typeof prop === 'string' && value === undefined) {
            const el = this.elements[0];
            if (!el) return undefined;
            return window.getComputedStyle(el)[prop];
        }

        // 设置单个样式
        if (typeof prop === 'string') {
            return this.each(function() {
                this.style[prop] = value;
            });
        }

        // 设置多个样式
        if (typeof prop === 'object') {
            return this.each(function() {
                Object.keys(prop).forEach(key => {
                    this.style[key] = prop[key];
                });
            });
        }

        return this;
    };

    // ============================================
    // 内容操作
    // ============================================

    DomQuery.prototype.html = function(content) {
        if (content === undefined) {
            return this.elements[0]?.innerHTML;
        }
        return this.each(function() {
            this.innerHTML = content;
        });
    };

    DomQuery.prototype.text = function(content) {
        if (content === undefined) {
            return this.elements[0]?.textContent;
        }
        return this.each(function() {
            this.textContent = content;
        });
    };

    DomQuery.prototype.val = function(value) {
        if (value === undefined) {
            return this.elements[0]?.value;
        }
        return this.each(function() {
            this.value = value;
        });
    };

    // ============================================
    // 显示/隐藏
    // ============================================

    DomQuery.prototype.show = function() {
        return this.each(function() {
            this.style.display = '';
        });
    };

    DomQuery.prototype.hide = function() {
        return this.each(function() {
            this.style.display = 'none';
        });
    };

    DomQuery.prototype.toggle = function(force) {
        return this.each(function() {
            const isHidden = window.getComputedStyle(this).display === 'none';
            this.style.display = (force !== undefined ? !force : isHidden) ? 'none' : '';
        });
    };

    // ============================================
    // 插入/移除元素
    // ============================================

    DomQuery.prototype.append = function(content) {
        return this.each(function() {
            if (typeof content === 'string') {
                this.insertAdjacentHTML('beforeend', content);
            } else if (content instanceof DomQuery) {
                content.each(() => {
                    this.appendChild(content);
                });
            } else if (content instanceof Element) {
                this.appendChild(content);
            }
        });
    };

    DomQuery.prototype.prepend = function(content) {
        return this.each(function() {
            if (typeof content === 'string') {
                this.insertAdjacentHTML('afterbegin', content);
            } else if (content instanceof DomQuery) {
                content.each(() => {
                    this.insertBefore(content, this.firstChild);
                });
            } else if (content instanceof Element) {
                this.insertBefore(content, this.firstChild);
            }
        });
    };

    DomQuery.prototype.after = function(content) {
        return this.each(function() {
            if (typeof content === 'string') {
                this.insertAdjacentHTML('afterend', content);
            } else if (content instanceof Element) {
                this.parentNode.insertBefore(content, this.nextSibling);
            }
        });
    };

    DomQuery.prototype.before = function(content) {
        return this.each(function() {
            if (typeof content === 'string') {
                this.insertAdjacentHTML('beforebegin', content);
            } else if (content instanceof Element) {
                this.parentNode.insertBefore(content, this);
            }
        });
    };

    DomQuery.prototype.remove = function() {
        return this.each(function() {
            this.parentNode?.removeChild(this);
        });
    };

    DomQuery.prototype.empty = function() {
        return this.each(function() {
            this.innerHTML = '';
        });
    };

    // ============================================
    // 事件绑定
    // ============================================

    DomQuery.prototype.on = function(event, handler) {
        return this.each(function() {
            this.addEventListener(event, handler);
        });
    };

    DomQuery.prototype.off = function(event, handler) {
        return this.each(function() {
            this.removeEventListener(event, handler);
        });
    };

    DomQuery.prototype.one = function(event, handler) {
        return this.each(function() {
            const el = this;
            const wrapper = function(e) {
                el.removeEventListener(event, wrapper);
                handler.call(el, e);
            };
            this.addEventListener(event, wrapper);
        });
    };

    DomQuery.prototype.trigger = function(eventName, data) {
        return this.each(function() {
            const event = new CustomEvent(eventName, { detail: data, bubbles: true });
            this.dispatchEvent(event);
        });
    };

    // 常用事件快捷方法
    const events = ['click', 'dblclick', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout',
                    'keydown', 'keyup', 'keypress', 'change', 'focus', 'blur', 'submit',
                    'scroll', 'resize', 'load', 'touchstart', 'touchend', 'touchmove'];

    events.forEach(event => {
        DomQuery.prototype[event] = function(handler) {
            return handler ? this.on(event, handler) : this.trigger(event);
        };
    });

    // ============================================
    // 动画效果
    // ============================================

    DomQuery.prototype.fadeIn = function(duration = 300, callback) {
        return this.each(function() {
            this.style.opacity = '0';
            this.style.display = '';
            const start = performance.now();

            const animate = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                this.style.opacity = progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else if (callback) {
                    callback.call(this);
                }
            };

            requestAnimationFrame(animate);
        });
    };

    DomQuery.prototype.fadeOut = function(duration = 300, callback) {
        return this.each(function() {
            const start = performance.now();
            const startOpacity = parseFloat(window.getComputedStyle(this).opacity) || 1;

            const animate = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                this.style.opacity = startOpacity * (1 - progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.style.display = 'none';
                    if (callback) callback.call(this);
                }
            };

            requestAnimationFrame(animate);
        });
    };

    DomQuery.prototype.slideDown = function(duration = 300, callback) {
        return this.each(function() {
            const el = this;
            el.style.overflow = 'hidden';
            const height = el.scrollHeight;
            el.style.height = '0';
            el.style.display = '';

            const start = performance.now();
            const animate = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                el.style.height = `${progress * height}px`;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.style.overflow = '';
                    el.style.height = '';
                    if (callback) callback.call(el);
                }
            };

            requestAnimationFrame(animate);
        });
    };

    DomQuery.prototype.slideUp = function(duration = 300, callback) {
        return this.each(function() {
            const el = this;
            const height = el.offsetHeight;
            el.style.overflow = 'hidden';

            const start = performance.now();
            const animate = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                el.style.height = `${height * (1 - progress)}px`;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.style.display = 'none';
                    el.style.overflow = '';
                    el.style.height = '';
                    if (callback) callback.call(el);
                }
            };

            requestAnimationFrame(animate);
        });
    };

    // ============================================
    // 位置/尺寸
    // ============================================

    DomQuery.prototype.offset = function() {
        const el = this.elements[0];
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX
        };
    };

    DomQuery.prototype.position = function() {
        const el = this.elements[0];
        if (!el) return null;
        return {
            top: el.offsetTop,
            left: el.offsetLeft
        };
    };

    DomQuery.prototype.width = function(value) {
        if (value === undefined) {
            const el = this.elements[0];
            if (!el) return 0;
            return el.clientWidth;
        }
        return this.each(function() {
            this.style.width = typeof value === 'number' ? `${value}px` : value;
        });
    };

    DomQuery.prototype.height = function(value) {
        if (value === undefined) {
            const el = this.elements[0];
            if (!el) return 0;
            return el.clientHeight;
        }
        return this.each(function() {
            this.style.height = typeof value === 'number' ? `${value}px` : value;
        });
    };

    DomQuery.prototype.scrollTop = function(value) {
        if (value === undefined) {
            const el = this.elements[0];
            if (!el) return 0;
            return el === window ? window.scrollY : el.scrollTop;
        }
        return this.each(function() {
            if (this === window) {
                window.scrollTo(0, value);
            } else {
                this.scrollTop = value;
            }
        });
    };

    DomQuery.prototype.scrollLeft = function(value) {
        if (value === undefined) {
            const el = this.elements[0];
            if (!el) return 0;
            return el === window ? window.scrollX : el.scrollLeft;
        }
        return this.each(function() {
            if (this === window) {
                window.scrollTo(value, window.scrollY);
            } else {
                this.scrollLeft = value;
            }
        });
    };

    // ============================================
    // 数据存储
    // ============================================

    DomQuery.prototype.data = function(key, value) {
        if (value === undefined) {
            const el = this.elements[0];
            if (!el) return undefined;
            if (key === undefined) {
                return el.dataset;
            }
            return el.dataset[key];
        }
        return this.each(function() {
            this.dataset[key] = value;
        });
    };

    DomQuery.prototype.removeData = function(key) {
        return this.each(function() {
            delete this.dataset[key];
        });
    };

    // ============================================
    // 工具方法
    // ============================================

    /**
     * 判断元素是否匹配选择器
     */
    DomQuery.prototype.is = function(selector) {
        return this.elements.some(el => el.matches(selector));
    };

    /**
     * 过滤元素
     */
    DomQuery.prototype.filter = function(selector) {
        const filtered = typeof selector === 'function'
            ? this.elements.filter((el, i) => selector.call(el, i, el))
            : this.elements.filter(el => el.matches(selector));
        return new DomQuery(filtered);
    };

    /**
     * 元素在兄弟中的索引
     */
    DomQuery.prototype.index = function() {
        const el = this.elements[0];
        if (!el) return -1;
        return Array.from(el.parentNode.children).indexOf(el);
    };

    /**
     * 元素是否包含另一个元素
     */
    DomQuery.prototype.contains = function(child) {
        const el = this.elements[0];
        if (!el) return false;
        if (child instanceof DomQuery) {
            child = child.elements[0];
        }
        return el.contains(child);
    };

    // ============================================
    // 静态工具方法
    // ============================================

    /**
     * DOM 就绪事件
     */
    DomQuery.ready = function(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    /**
     * Ajax 请求（简化版）
     */
    DomQuery.ajax = function(url, options = {}) {
        const {
            method = 'GET',
            data = null,
            headers = {},
            timeout = 10000,
            responseType = 'json'
        } = options;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.responseType = responseType;
            xhr.timeout = timeout;

            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(new Error(`HTTP ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network error'));
            xhr.ontimeout = () => reject(new Error('Request timeout'));

            if (data && (method === 'POST' || method === 'PUT')) {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(data));
            } else {
                xhr.send();
            }
        });
    };

    /**
     * 函数防抖
     */
    DomQuery.debounce = function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    /**
     * 函数节流
     */
    DomQuery.throttle = function(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /**
     * 扩展对象
     */
    DomQuery.extend = function(target, ...sources) {
        sources.forEach(source => {
            Object.keys(source).forEach(key => {
                target[key] = source[key];
            });
        });
        return target;
    };

    // ============================================
    // 导出到全局
    // ============================================

    // 创建快捷入口
    const $ = function(selector, context) {
        return new DomQuery(selector, context);
    };

    // 复制静态方法
    Object.keys(DomQuery).forEach(key => {
        if (typeof DomQuery[key] === 'function') {
            $[key] = DomQuery[key];
        }
    });

    // 导出
    global.$ = $;
    global.DomQuery = DomQuery;

    // 兼容 AMD/CommonJS
    if (typeof define === 'function' && define.amd) {
        define(function() { return $; });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = $;
    }

})(typeof window !== 'undefined' ? window : this);
