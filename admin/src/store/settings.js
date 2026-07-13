import { create } from 'zustand'

export const useSettingsStore = create((set, get) => ({
  // 通用设置
  generalSettings: {
    siteName: 'BookStation',
    siteDescription: '纯净、极速、无广告的小说阅读平台',
    siteUrl: 'https://bookstation.com',
    enableRegistration: true,
    enableComment: true,
    enableRecommend: true,
    defaultAvatar: '',
  },

  // 内容设置
  contentSettings: {
    hotNovelCount: 10,
    newNovelCount: 20,
    recommendNovelCount: 15,
    freeChapterCount: 10,
    chapterPerPage: 50,
    enableCrawler: true,
    autoCrawl: false,
    crawlInterval: 24,
  },

  // 安全设置
  securitySettings: {
    enableCaptcha: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 24,
    passwordMinLength: 6,
    passwordPolicy: 'medium',
    enableTwoFactor: false,
    ipWhitelist: '',
  },

  // 加载状态
  loading: false,

  // 提交状态
  submitting: false,

  // 获取通用设置
  fetchGeneralSettings: async () => {
    set({ loading: true })
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ loading: false })
  },

  // 获取内容设置
  fetchContentSettings: async () => {
    set({ loading: true })
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ loading: false })
  },

  // 获取安全设置
  fetchSecuritySettings: async () => {
    set({ loading: true })
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 300))
    set({ loading: false })
  },

  // 更新通用设置
  updateGeneralSettings: async (settings) => {
    set({ submitting: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set(state => ({
      generalSettings: { ...state.generalSettings, ...settings },
      submitting: false,
    }))
  },

  // 更新内容设置
  updateContentSettings: async (settings) => {
    set({ submitting: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set(state => ({
      contentSettings: { ...state.contentSettings, ...settings },
      submitting: false,
    }))
  },

  // 更新安全设置
  updateSecuritySettings: async (settings) => {
    set({ submitting: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set(state => ({
      securitySettings: { ...state.securitySettings, ...settings },
      submitting: false,
    }))
  },

  // 初始化所有设置
  init: async () => {
    const { fetchGeneralSettings, fetchContentSettings, fetchSecuritySettings } = get()
    set({ loading: true })
    await Promise.all([fetchGeneralSettings(), fetchContentSettings(), fetchSecuritySettings()])
    set({ loading: false })
  },
}))
