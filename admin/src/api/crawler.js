import request from '@/utils/request'

// 获取爬虫状态
export const getCrawlerStatus = () => {
  return request({
    url: '/admin/crawler/status',
    method: 'get',
  })
}

// 获取爬虫列表
export const getCrawlerList = (params) => {
  return request({
    url: '/admin/crawlers',
    method: 'get',
    params,
  })
}

// 获取爬虫详情
export const getCrawler = (id) => {
  return request({
    url: `/admin/crawlers/${id}`,
    method: 'get',
  })
}

// 创建爬虫
export const createCrawler = (data) => {
  return request({
    url: '/admin/crawlers',
    method: 'post',
    data,
  })
}

// 更新爬虫
export const updateCrawler = (id, data) => {
  return request({
    url: `/admin/crawlers/${id}`,
    method: 'put',
    data,
  })
}

// 删除爬虫
export const deleteCrawler = (id) => {
  return request({
    url: `/admin/crawlers/${id}`,
    method: 'delete',
  })
}

// 启动爬虫
export const startCrawler = (id) => {
  return request({
    url: `/admin/crawlers/${id}/start`,
    method: 'post',
  })
}

// 停止爬虫
export const stopCrawler = (id) => {
  return request({
    url: `/admin/crawlers/${id}/stop`,
    method: 'post',
  })
}

// 获取爬虫任务列表
export const getCrawlerTasks = (params) => {
  return request({
    url: '/admin/crawler/tasks',
    method: 'get',
    params,
  })
}

// 获取任务日志
export const getTaskLogs = (taskId, params) => {
  return request({
    url: `/admin/crawler/tasks/${taskId}/logs`,
    method: 'get',
    params,
  })
}

// 获取数据源列表
export const getSourceList = () => {
  return request({
    url: '/admin/crawler/sources',
    method: 'get',
  })
}

// 测试数据源
export const testSource = (id) => {
  return request({
    url: `/admin/crawler/sources/${id}/test`,
    method: 'post',
  })
}

// 获取爬虫统计
export const getCrawlerStats = () => {
  return request({
    url: '/admin/crawler/stats',
    method: 'get',
  })
}
