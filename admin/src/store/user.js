import { create } from 'zustand'
import dayjs from 'dayjs'

// 模拟用户数据
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@bookstation.com', role: 'admin', status: 'active', nickname: '超级管理员', createdAt: '2024-01-01 10:00:00' },
  { id: 2, username: 'author1', email: 'author1@bookstation.com', role: 'author', status: 'active', nickname: '天蚕土豆', createdAt: '2024-01-02 10:00:00' },
  { id: 3, username: 'author2', email: 'author2@bookstation.com', role: 'author', status: 'active', nickname: '刘慈欣', createdAt: '2024-01-03 10:00:00' },
  { id: 4, username: 'user1', email: 'user1@example.com', role: 'user', status: 'active', nickname: '读者1号', createdAt: '2024-01-04 10:00:00' },
  { id: 5, username: 'user2', email: 'user2@example.com', role: 'user', status: 'active', nickname: '读者2号', createdAt: '2024-01-05 10:00:00' },
  { id: 6, username: 'user3', email: 'user3@example.com', role: 'user', status: 'banned', nickname: '违规用户', createdAt: '2024-01-06 10:00:00' },
  { id: 7, username: 'user4', email: 'user4@example.com', role: 'user', status: 'active', nickname: '用户4', createdAt: '2024-01-07 10:00:00' },
  { id: 8, username: 'user5', email: 'user5@example.com', role: 'user', status: 'active', nickname: '用户5', createdAt: '2024-01-08 10:00:00' },
]

export const useUserStore = create((set, get) => ({
  // 用户列表
  users: [],

  // 选中的用户
  selectedUser: null,

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
    role: '',
    status: '',
  },

  // 模态框状态
  modalVisible: false,
  modalType: 'create', // create | edit | resetPassword

  // 获取用户列表
  fetchUsers: async () => {
    const { searchParams, pagination } = get()
    set({ loading: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    let filteredUsers = [...mockUsers]

    // 关键词搜索
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase()
      filteredUsers = filteredUsers.filter(
        user => user.username.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword) ||
                user.nickname.toLowerCase().includes(keyword)
      )
    }

    // 角色筛选
    if (searchParams.role) {
      filteredUsers = filteredUsers.filter(user => user.role === searchParams.role)
    }

    // 状态筛选
    if (searchParams.status) {
      filteredUsers = filteredUsers.filter(user => user.status === searchParams.status)
    }

    set({
      users: filteredUsers,
      pagination: {
        ...pagination,
        total: filteredUsers.length,
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
      searchParams: { keyword: '', role: '', status: '' },
      pagination: { current: 1, pageSize: 10, total: 0 },
    })
  },

  // 设置分页
  setPagination: (params) => {
    set(state => ({
      pagination: { ...state.pagination, ...params },
    }))
  },

  // 打开模态框
  openModal: (type, user = null) => {
    set({
      modalType: type,
      selectedUser: user,
      modalVisible: true,
    })
  },

  // 关闭模态框
  closeModal: () => {
    set({
      modalVisible: false,
      selectedUser: null,
    })
  },

  // 创建用户
  createUser: async (userData) => {
    set({ submitting: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    const newUser = {
      id: Date.now(),
      ...userData,
      status: 'active',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    }

    set(state => ({
      users: [newUser, ...state.users],
      submitting: false,
    }))

    return newUser
  },

  // 更新用户
  updateUser: async (id, userData) => {
    set({ submitting: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set(state => ({
      users: state.users.map(user =>
        user.id === id ? { ...user, ...userData } : user
      ),
      submitting: false,
    }))
  },

  // 删除用户
  deleteUser: async (id) => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 300))

    set(state => ({
      users: state.users.filter(user => user.id !== id),
    }))
  },

  // 更新用户状态
  updateUserStatus: async (id, status) => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 300))

    set(state => ({
      users: state.users.map(user =>
        user.id === id ? { ...user, status } : user
      ),
    }))
  },

  // 重置密码
  resetPassword: async (id, newPassword) => {
    set({ submitting: true })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 500))

    set({ submitting: false })
  },
}))
