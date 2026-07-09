/**
 * API 请求封装
 */

class ApiClient {
    constructor(baseUrl, timeout = 10000) {
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }

    // 生成请求选项
    getOptions(method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        return options;
    }

    // 处理响应
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        if (data.code !== 0) {
            throw new Error(data.message || '请求失败');
        }

        return data.data;
    }

    // GET 请求
    async get(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint);

        // 添加查询参数
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url.toString(), {
                ...this.getOptions('GET'),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return this.handleResponse(response);
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            throw error;
        }
    }

    // POST 请求
    async post(endpoint, data = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(this.baseUrl + endpoint, {
                ...this.getOptions('POST', data),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return this.handleResponse(response);
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            throw error;
        }
    }

    // 章节相关 API
    chapters = {
        get: (chapterId) => this.get(`/chapters/${chapterId}`),
        getByOrder: (novelId, order) => this.get(`/novels/${novelId}/chapters/${order}`),
    };

    // 小说相关 API
    novels = {
        get: (novelId) => this.get(`/novels/${novelId}`),
        chapters: (novelId, page = 1, limit = 100) =>
            this.get(`/novels/${novelId}/chapters`, { page, limit }),
    };

    // 阅读进度相关 API
    progress = {
        sync: (data) => this.post('/history/progress', data),
        get: (novelId) => this.get(`/history/${novelId}`),
    };
}

// 创建全局 API 实例
const api = new ApiClient(READER_CONFIG.api.baseUrl, READER_CONFIG.api.timeout);

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, api };
}
