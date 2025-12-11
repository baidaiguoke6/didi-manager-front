import request from './request'

export const orderApi = {
    // 获取订单列表
    getOrders: () => request.get('/order/list'),

    // 获取今日订单数
    getTodayOrderCount: () => request.get('/order/count/today'),

    // 获取今日收入
    getTodayIncome: () => request.get('/order/income/today'),

    // 获取总收入
    getTotalIncome: () => request.get('/order/income/total')
}