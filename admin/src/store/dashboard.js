import { create } from 'zustand'
import dayjs from 'dayjs'

export const useDashboardStore = create((set, get) => ({
  // 统计数据
  stats: {
    totalUsers: 0,
    totalNovels: 0,
    totalChapters: 0,
    totalViews: 0,
    userGrowth: 0,
    novelGrowth: 0,
    chapterGrowth: 0,
    viewGrowth: 0,
  },

  // 最近用户
  recentUsers: [],

  // 最近小说
  recentNovels: [],

  // 加载状态
  loading: false,

  // 模拟数据加载
  fetchStats: async () => {
    set({ loading: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    set({
      stats: {
        totalUsers: 1234,
        totalNovels: 567,
        totalChapters: 89012,
        totalViews: 1234567,
        userGrowth: 12.5,
        novelGrowth: 8.3,
        chapterGrowth: 15.2,
        viewGrowth: 20.1,
      },
      loading: false,
    })
  },

  fetchRecentUsers: async () => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set({
      recentUsers: [
        { id: 1, username: 'user1', email: 'user1@example.com', role: 'user', createdAt: dayjs().subtract(1, 'hour').format() },
        { id: 2, username: 'user2', email: 'user2@example.com', role: 'author', createdAt: dayjs().subtract(2, 'hour').format() },
        { id: 3, username: 'user3', email: 'user3@example.com', role: 'user', createdAt: dayjs().subtract(3, 'hour').format() },
        { id: 4, username: 'user4', email: 'user4@example.com', role: 'user', createdAt: dayjs().subtract(5, 'hour').format() },
        { id: 5, username: 'user5', email: 'user5@example.com', role: 'author', createdAt: dayjs().subtract(8, 'hour').format() },
      ],
    })
  },

  fetchRecentNovels: async () => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set({
      recentNovels: [
        { id: 1, title: '斗破苍穹', author: '天蚕土豆', category: '玄幻', chapters: 1623, views: 123456 },
        { id: 2, title: '完美世界', author: '辰东', category: '玄幻', chapters: 1200, views: 98765 },
        { id: 3, title: '凡人修仙传', author: '忘语', category: '武侠', chapters: 1800, views: 87654 },
        { id: 4, title: '盗墓笔记', author: '南派三叔', category: '悬疑', chapters: 350, views: 76543 },
        { id: 5, title: '三体', author: '刘慈欣', category: '科幻', chapters: 80, views: 65432 },
      ],
    })
  },

  // 初始化所有数据
  init: async () => {
    const { fetchStats, fetchRecentUsers, fetchRecentNovels } = get()
    set({ loading: true })
    await Promise.all([fetchStats(), fetchRecentUsers(), fetchRecentNovels()])
  },
}))
