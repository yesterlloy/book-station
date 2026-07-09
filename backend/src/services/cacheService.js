const { cache, getRedis } = require('../config/redis');

// 缓存键前缀
const PREFIXES = {
  CHAPTER: 'chapter:',
  NOVEL: 'novel:',
  NOVEL_CHAPTERS: 'novel_chapters:',
  CATEGORY: 'category:',
  RANK: 'rank:',
  HOT: 'hot:',
  USER_BOOKSHELF: 'user_bookshelf:',
};

// 缓存 TTL（秒）
const TTL = {
  CHAPTER: 24 * 60 * 60,      // 24 小时
  NOVEL: 60 * 60,              // 1 小时
  NOVEL_CHAPTERS: 30 * 60,     // 30 分钟
  CATEGORY: 2 * 60 * 60,       // 2 小时
  RANK: 60 * 60,                // 1 小时
  HOT: 30 * 60,                 // 30 分钟
  USER_BOOKSHELF: 10 * 60,      // 10 分钟
};

class CacheService {
  /**
   * 获取章节内容缓存
   */
  static async getChapter(chapterId) {
    return await cache.get(`${PREFIXES.CHAPTER}${chapterId}`);
  }

  /**
   * 设置章节内容缓存
   */
  static async setChapter(chapterId, data) {
    await cache.set(`${PREFIXES.CHAPTER}${chapterId}`, data, TTL.CHAPTER);
  }

  /**
   * 删除章节缓存
   */
  static async deleteChapter(chapterId) {
    await cache.del(`${PREFIXES.CHAPTER}${chapterId}`);
  }

  /**
   * 获取小说详情缓存
   */
  static async getNovel(novelId) {
    return await cache.get(`${PREFIXES.NOVEL}${novelId}`);
  }

  /**
   * 设置小说详情缓存
   */
  static async setNovel(novelId, data) {
    await cache.set(`${PREFIXES.NOVEL}${novelId}`, data, TTL.NOVEL);
  }

  /**
   * 删除小说相关缓存
   */
  static async deleteNovelCache(novelId) {
    const redis = getRedis();
    const keys = [
      `${PREFIXES.NOVEL}${novelId}`,
      `${PREFIXES.NOVEL_CHAPTERS}${novelId}`,
    ];
    await redis.del(...keys);
  }

  /**
   * 获取小说章节列表缓存
   */
  static async getNovelChapters(novelId, page = 1) {
    return await cache.get(`${PREFIXES.NOVEL_CHAPTERS}${novelId}:${page}`);
  }

  /**
   * 设置小说章节列表缓存
   */
  static async setNovelChapters(novelId, page, data) {
    await cache.set(
      `${PREFIXES.NOVEL_CHAPTERS}${novelId}:${page}`,
      data,
      TTL.NOVEL_CHAPTERS
    );
  }

  /**
   * 获取分类小说列表缓存
   */
  static async getCategoryList(category, page) {
    return await cache.get(`${PREFIXES.CATEGORY}${category}:${page}`);
  }

  /**
   * 设置分类小说列表缓存
   */
  static async setCategoryList(category, page, data) {
    await cache.set(
      `${PREFIXES.CATEGORY}${category}:${page}`,
      data,
      TTL.CATEGORY
    );
  }

  /**
   * 获取排行榜缓存
   */
  static async getRank(type, page) {
    return await cache.get(`${PREFIXES.RANK}${type}:${page}`);
  }

  /**
   * 设置排行榜缓存
   */
  static async setRank(type, page, data) {
    await cache.set(`${PREFIXES.RANK}${type}:${page}`, data, TTL.RANK);
  }

  /**
   * 获取热门小说缓存
   */
  static async getHotNovels() {
    return await cache.get(`${PREFIXES.HOT}novels`);
  }

  /**
   * 设置热门小说缓存
   */
  static async setHotNovels(data) {
    await cache.set(`${PREFIXES.HOT}novels`, data, TTL.HOT);
  }

  /**
   * 清除用户书架缓存
   */
  static async deleteUserBookshelf(userId) {
    await cache.del(`${PREFIXES.USER_BOOKSHELF}${userId}`);
  }
}

module.exports = CacheService;
