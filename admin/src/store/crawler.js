import { create } from 'zustand'
import dayjs from 'dayjs'

// 模拟爬虫数据
const mockCrawlers = [
  { id: 1, name: '起点中文网爬虫', source: 'qidian', status: 'running', concurrency: 5, delay: 1000, totalBooks: 156, totalChapters: 45632, lastRun: '2024-01-10 15:30:00', createdAt: '2024-01-01 10:00:00' },
  { id: 2, name: '笔趣阁爬虫', source: 'biquge', status: 'stopped', concurrency: 3, delay: 1500, totalBooks: 89, totalChapters: 23456, lastRun: '2024-01-09 18:20:00', createdAt: '2024-01-02 10:00:00' },
  { id: 3, name: '番茄小说爬虫', source: 'fanqie', status: 'running', concurrency: 8, delay: 800, totalBooks: 234, totalChapters: 67890, lastRun: '2024-01-10 16:00:00', createdAt: '2024-01-03 10:00:00' },
  { id: 4, name: '纵横中文网爬虫', source: 'zongheng', status: 'error', concurrency: 4, delay: 1200, totalBooks: 45, totalChapters: 12345, lastRun: '2024-01-08 12:00:00', createdAt: '2024-01-04 10:00:00' },
]

// 模拟任务数据
const mockTasks = [
  { id: 1, crawlerId: 1, crawlerName: '起点中文网爬虫', status: 'completed', progress: 100, total: 500, success: 495, failed: 5, createdAt: '2024-01-10 15:30:00', completedAt: '2024-01-10 16:45:00' },
  { id: 2, crawlerId: 3, crawlerName: '番茄小说爬虫', status: 'running', progress: 68, total: 1000, success: 680, failed: 0, createdAt: '2024-01-10 16:00:00', completedAt: null },
  { id: 3, crawlerId: 2, crawlerName: '笔趣阁爬虫', status: 'failed', progress: 35, total: 800, success: 280, failed: 120, createdAt: '2024-01-09 18:20:00', completedAt: null },
  { id: 4, crawlerId: 1, crawlerName: '起点中文网爬虫', status: 'completed', progress: 100, total: 300, success: 298, failed: 2, createdAt: '2024-01-09 10:00:00', completedAt: '2024-01-09 11:30:00' },
]

// 模拟日志数据
const mockLogs = [
  { time: '2024-01-10 16:00:00', level: 'info', message: '爬虫任务开始执行' },
  { time: '2024-01-10 16:00:05', level: 'info', message: '正在抓取小说列表...' },
  { time: '2024-01-10 16:00:10', level: 'info', message: '已获取 100 本小说信息' },
  { time: '2024-01-10 16:00:15', level: 'success', message: '成功抓取: 斗破苍穹' },
  { time: '2024-01-10 16:00:20', level: 'success', message: '成功抓取: 完美世界' },
  { time: '2024-01-10 16:00:25', level: 'warning', message: '小说《测试小说》内容为空，跳过' },
  { time: '2024-01-10 16:00:30', level: 'success', message: '成功抓取: 凡人修仙传' },
  { time: '2024-01-10 16:00:35', level: 'info', message: '正在抓取章节内容...' },
  { time: '2024-01-10 16:00:40', level: 'success', message: '成功抓取章节: 第1章 陨落的天才' },
  { time: '2024-01-10 16:00:45', level: 'success', message: '成功抓取章节: 第2章 斗之气' },
]

export const useCrawlerStore = create((set, get) => ({
  // 爬虫列表
  crawlers: [],

  // 任务列表
  tasks: [],

  // 当前选中的爬虫
  selectedCrawler: null,

  // 当前查看日志的任务
  currentTask: null,

  // 日志列表
  logs: [],

  // 加载状态
  loading: false,

  // 搜索条件
  searchParams: {
    keyword: '',
    status: '',
  },

  // 模态框状态
  modalVisible: false,
  logModalVisible: false,

  // 统计数据
  stats: {
    runningCount: 0,
    totalBooks: 0,
    totalChapters: 0,
    todayTasks: 0,
  },

  // 获取爬虫列表
  fetchCrawlers: async () => {
    const { searchParams } = get()
    set({ loading: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    let filteredCrawlers = [...mockCrawlers]

    // 关键词搜索
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase()
      filteredCrawlers = filteredCrawlers.filter(
        crawler => crawler.name.toLowerCase().includes(keyword)
      )
    }

    // 状态筛选
    if (searchParams.status) {
      filteredCrawlers = filteredCrawlers.filter(crawler => crawler.status === searchParams.status)
    }

    // 计算统计数据
    const runningCount = filteredCrawlers.filter(c => c.status === 'running').length
    const totalBooks = filteredCrawlers.reduce((sum, c) => sum + c.totalBooks, 0)
    const totalChapters = filteredCrawlers.reduce((sum, c) => sum + c.totalChapters, 0)
    const todayTasks = mockTasks.filter(t => dayjs(t.createdAt).isSame(dayjs(), 'day')).length

    set({
      crawlers: filteredCrawlers,
      tasks: mockTasks,
      stats: { runningCount, totalBooks, totalChapters, todayTasks },
      loading: false,
    })
  },

  // 设置搜索参数
  setSearchParams: (params) => {
    set(state => ({
      searchParams: { ...state.searchParams, ...params },
    }))
  },

  // 刷新数据
  refresh: async () => {
    await get().fetchCrawlers()
  },

  // 打开爬虫编辑模态框
  openModal: (crawler = null) => {
    set({
      selectedCrawler: crawler,
      modalVisible: true,
    })
  },

  // 关闭爬虫编辑模态框
  closeModal: () => {
    set({
      modalVisible: false,
      selectedCrawler: null,
    })
  },

  // 查看任务日志
  openLogModal: (task) => {
    set({
      currentTask: task,
      logs: mockLogs,
      logModalVisible: true,
    })
  },

  // 关闭日志模态框
  closeLogModal: () => {
    set({
      logModalVisible: false,
      currentTask: null,
      logs: [],
    })
  },

  // 启动爬虫
  startCrawler: async (id) => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set(state => ({
      crawlers: state.crawlers.map(crawler =>
        crawler.id === id ? { ...crawler, status: 'running' } : crawler
      ),
    }))
  },

  // 停止爬虫
  stopCrawler: async (id) => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set(state => ({
      crawlers: state.crawlers.map(crawler =>
        crawler.id === id ? { ...crawler, status: 'stopped' } : crawler
      ),
    }))
  },

  // 测试爬虫连接
  testCrawler: async (id) => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  },

  // 创建爬虫
  createCrawler: async (crawlerData) => {
    set({ loading: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const newCrawler = {
      id: Date.now(),
      ...crawlerData,
      status: 'stopped',
      totalBooks: 0,
      totalChapters: 0,
      lastRun: null,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }

    set(state => ({
      crawlers: [newCrawler, ...state.crawlers],
      loading: false,
    }))

    return newCrawler
  },

  // 更新爬虫
  updateCrawler: async (id, crawlerData) => {
    set({ loading: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set(state => ({
      crawlers: state.crawlers.map(crawler =>
        crawler.id === id ? { ...crawler, ...crawlerData } : crawler
      ),
      loading: false,
    }))
  },

  // 删除爬虫
  deleteCrawler: async (id) => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 300))

    set(state => ({
      crawlers: state.crawlers.filter(crawler => crawler.id !== id),
    }))
  },
}))
