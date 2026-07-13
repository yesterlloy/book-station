import request from '@/utils/request'

// 获取用户列表
export const getUserList = (params) => {
  return request({
    url: '/admin/users',
    method: 'get',
    params,
  })
}

// 获取用户详情
export const getUser = (id) => {
  return request({
    url: `/admin/users/${id}`,
    method: 'get',
  })
}

// 创建用户
export const createUser = (data) => {
  return request({
    url: '/admin/users',
    method: 'post',
    data,
  })
}

// 更新用户
export const updateUser = (id, data) => {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data,
  })
}

// 删除用户
export const deleteUser = (id) => {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete',
  })
}

// 批量删除用户
export const batchDeleteUsers = (ids) => {
  return request({
    url: '/admin/users/batch',
    method: 'delete',
    data: { ids },
  })
}

// 修改用户状态
export const updateUserStatus = (id, status) => {
  return request({
    url: `/admin/users/${id}/status`,
    method: 'put',
    data: { status },
  })
}

// 重置用户密码
export const resetUserPassword = (id, newPassword) => {
  return request({
    url: `/admin/users/${id}/password`,
    method: 'put',
    data: { password: newPassword },
  })
}
