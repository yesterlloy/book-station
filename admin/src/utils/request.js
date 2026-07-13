import axios from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/store/auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, data, message: msg } = response.data

    if (code === 0) {
      return data
    }

    message.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        message.error('登录已过期，请重新登录')
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (status === 403) {
        message.error('没有权限执行此操作')
        return Promise.reject(error)
      }

      if (status === 404) {
        message.error('请求的资源不存在')
        return Promise.reject(error)
      }

      if (status === 500) {
        message.error('服务器错误，请稍后重试')
        return Promise.reject(error)
      }

      message.error(data?.message || error.message || '请求失败')
    } else if (error.request) {
      message.error('网络错误，请检查网络连接')
    } else {
      message.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

export default request
