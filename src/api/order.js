import request from './request'

export const orderApi = {
    // 获取订单列表（分页） - 添加排序参数
    getOrders: (page = 0, size = 20, sort = 'createTime', direction = 'desc') =>
        request.get(`/order/list?page=${page}&size=${size}&sort=${sort}&direction=${direction}`),

    // 获取今日订单数
    getTodayOrderCount: () => request.get('/order/count/today'),

    // 获取今日收入
    getTodayIncome: () => request.get('/order/income/today'),

    // 获取总收入
    getTotalIncome: () => request.get('/order/income/total')
}