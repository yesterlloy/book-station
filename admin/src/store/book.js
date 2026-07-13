import { create } from 'zustand'
import dayjs from 'dayjs'

// 模拟小说数据
const mockNovels = [
  { id: 1, title: '斗破苍穹', author: '天蚕土豆', category: '玄幻', status: 'serializing', isHot: true, chapterCount: 1623, wordCount: 5300000, cover: '', description: '这里是属于斗气的世界，没有花俏艳丽的魔法，有的，仅仅是繁衍到巅峰的斗气！', createdAt: '2024-01-01 10:00:00' },
  { id: 2, title: '完美世界', author: '辰东', category: '玄幻', status: 'completed', isHot: true, chapterCount: 1200, wordCount: 4200000, cover: '', description: '一粒尘可填海，一根草斩尽日月星辰，弹指间天翻地覆。', createdAt: '2024-01-02 10:00:00' },
  { id: 3, title: '凡人修仙传', author: '忘语', category: '武侠', status: 'completed', isHot: true, chapterCount: 1800, wordCount: 6100000, cover: '', description: '凡人流开山之作，讲述一个普通山村少年的修仙之路。', createdAt: '2024-01-03 10:00:00' },
  { id: 4, title: '盗墓笔记', author: '南派三叔', category: '悬疑', status: 'completed', isHot: false, chapterCount: 350, wordCount: 1500000, cover: '', description: '五十年前，一群长沙土夫子（盗墓贼）挖到了一件战国古墓。', createdAt: '2024-01-04 10:00:00' },
  { id: 5, title: '三体', author: '刘慈欣', category: '科幻', status: 'completed', isHot: true, chapterCount: 80, wordCount: 300000, cover: '', description: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。', createdAt: '2024-01-05 10:00:00' },
  { id: 6, title: '全职高手', author: '蝴蝶蓝', category: '其他', status: 'completed', isHot: false, chapterCount: 1728, wordCount: 5500000, cover: '', description: '网游荣耀中被誉为教科书级别的顶尖高手叶修，重新返回职业赛场的故事。', createdAt: '2024-01-06 10:00:00' },
]

// 模拟章节数据
const mockChapters = [
  { id: 1, order: 1, title: '第一章 陨落的天才', wordCount: 3500, isFree: true, createdAt: '2024-01-01 10:00:00' },
  { id: 2, order: 2, title: '第二章 斗之气', wordCount: 3200, isFree: true, createdAt: '2024-01-01 10:05:00' },
  { id: 3, order: 3, title: '第三章 客人', wordCount: 3800, isFree: true, createdAt: '2024-01-01 10:10:00' },
  { id: 4, order: 4, title: '第四章 纳兰嫣然', wordCount: 4000, isFree: false, createdAt: '2024-01-01 10:15:00' },
  { id: 5, order: 5, title: '第五章 聚气散', wordCount: 3600, isFree: false, createdAt: '2024-01-01 10:20:00' },
]

export const useBookStore = create((set, get) => ({
  // 小说列表
  novels: [],

  // 当前选中的小说
  selectedNovel: null,

  // 章节列表
  chapters: [],

  // 加载状态
  loading: false,

  // 提交状态
  submitting: false,

  // 分页信息
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },

  // 搜索条件
  searchParams: {
    keyword: '',
    category: '',
    status: '',
  },

  // 模态框状态
  modalVisible: false,
  chapterModalVisible: false,

  // 获取小说列表
  fetchNovels: async () => {
    const { searchParams, pagination } = get()
    set({ loading: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    let filteredNovels = [...mockNovels]

    // 关键词搜索
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase()
      filteredNovels = filteredNovels.filter(
        novel => novel.title.toLowerCase().includes(keyword) ||
                 novel.author.toLowerCase().includes(keyword)
      )
    }

    // 分类筛选
    if (searchParams.category) {
      filteredNovels = filteredNovels.filter(novel => novel.category === searchParams.category)
    }

    // 状态筛选
    if (searchParams.status) {
      filteredNovels = filteredNovels.filter(novel => novel.status === searchParams.status)
    }

    set({
      novels: filteredNovels,
      pagination: {
        ...pagination,
        total: filteredNovels.length,
      },
      loading: false,
    })
  },

  // 设置搜索参数
  setSearchParams: (params) => {
    set(state => ({
      searchParams: { ...state.searchParams, ...params },
      pagination: { ...state.pagination, current: 1 },
    }))
  },

  // 重置搜索
  resetSearch: () => {
    set({
      searchParams: { keyword: '', category: '', status: '' },
      pagination: { current: 1, pageSize: 10, total: 0 },
    })
  },

  // 设置分页
  setPagination: (params) => {
    set(state => ({
      pagination: { ...state.pagination, ...params },
    }))
  },

  // 打开小说编辑模态框
  openModal: (novel = null) => {
    set({
      selectedNovel: novel,
      modalVisible: true,
    })
  },

  // 关闭小说编辑模态框
  closeModal: () => {
    set({
      modalVisible: false,
      selectedNovel: null,
    })
  },

  // 打开章节管理模态框
  openChapterModal: async (novel) => {
    set({
      selectedNovel: novel,
      chapters: mockChapters,
      chapterModalVisible: true,
    })
  },

  // 关闭章节管理模态框
  closeChapterModal: () => {
    set({
      chapterModalVisible: false,
      selectedNovel: null,
      chapters: [],
    })
  },

  // 创建小说
  createNovel: async (novelData) => {
    set({ submitting: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const newNovel = {
      id: Date.now(),
      ...novelData,
      chapterCount: 0,
      wordCount: 0,
      isHot: false,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }

    set(state => ({
      novels: [newNovel, ...state.novels],
      submitting: false,
    }))

    return newNovel
  },

  // 更新小说
  updateNovel: async (id, novelData) => {
    set({ submitting: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set(state => ({
      novels: state.novels.map(novel =>
        novel.id === id ? { ...novel, ...novelData } : novel
      ),
      submitting: false,
    }))
  },

  // 删除小说
  deleteNovel: async (id) => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 300))

    set(state => ({
      novels: state.novels.filter(novel => novel.id !== id),
    }))
  },
}))
