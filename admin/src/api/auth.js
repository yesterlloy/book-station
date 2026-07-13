import request from '@/utils/request'

// 登录
export const login = (data) => {
  return request({
    url: '/admin/login',
    method: 'post',
    data,
  })
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request({
    url: '/admin/me',
    method: 'get',
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/admin/password',
    method: 'put',
    data,
  })
}
