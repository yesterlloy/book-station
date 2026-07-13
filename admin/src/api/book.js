import request from '@/utils/request'

// 获取小说列表
export const getNovelList = (params) => {
  return request({
    url: '/admin/novels',
    method: 'get',
    params,
  })
}

// 获取小说详情
export const getNovel = (id) => {
  return request({
    url: `/admin/novels/${id}`,
    method: 'get',
  })
}

// 创建小说
export const createNovel = (data) => {
  return request({
    url: '/admin/novels',
    method: 'post',
    data,
  })
}

// 更新小说
export const updateNovel = (id, data) => {
  return request({
    url: `/admin/novels/${id}`,
    method: 'put',
    data,
  })
}

// 删除小说
export const deleteNovel = (id) => {
  return request({
    url: `/admin/novels/${id}`,
    method: 'delete',
  })
}

// 批量删除小说
export const batchDeleteNovels = (ids) => {
  return request({
    url: '/admin/novels/batch',
    method: 'delete',
    data: { ids },
  })
}

// 更新小说状态
export const updateNovelStatus = (id, status) => {
  return request({
    url: `/admin/novels/${id}/status`,
    method: 'put',
    data: { status },
  })
}

// 获取章节列表
export const getChapterList = (novelId, params) => {
  return request({
    url: `/admin/novels/${novelId}/chapters`,
    method: 'get',
    params,
  })
}

// 获取章节详情
export const getChapter = (novelId, chapterId) => {
  return request({
    url: `/admin/novels/${novelId}/chapters/${chapterId}`,
    method: 'get',
  })
}

// 创建章节
export const createChapter = (novelId, data) => {
  return request({
    url: `/admin/novels/${novelId}/chapters`,
    method: 'post',
    data,
  })
}

// 更新章节
export const updateChapter = (novelId, chapterId, data) => {
  return request({
    url: `/admin/novels/${novelId}/chapters/${chapterId}`,
    method: 'put',
    data,
  })
}

// 删除章节
export const deleteChapter = (novelId, chapterId) => {
  return request({
    url: `/admin/novels/${novelId}/chapters/${chapterId}`,
    method: 'delete',
  })
}

// 获取分类列表
export const getCategoryList = () => {
  return request({
    url: '/admin/categories',
    method: 'get',
  })
}
