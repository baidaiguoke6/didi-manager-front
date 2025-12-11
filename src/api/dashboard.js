import request from './request'

export const dashboardApi = {
    // 获取仪表板统计数据
    getStats: () => request.get('/dashboard/stats')
}