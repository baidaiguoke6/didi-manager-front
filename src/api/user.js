import request from './request'

export const userApi = {
    // 管理员登录
    login: (data) => request.post('/admin/login', null, { params: data }),

    // 管理员注册
    register: (data) => request.post('/admin/register', null, { params: data }),

    // 获取乘客列表
    getPassengers: () => request.get('/passenger/list'),

    // 获取司机列表
    getDrivers: () => request.get('/driver/list'),

    // 更新乘客状态
    updatePassengerStatus: (id, status) => request.put(`/passenger/${id}/status`, null, { params: { status } }),

    // 更新司机状态
    updateDriverStatus: (id, status) => request.put(`/driver/${id}/status`, null, { params: { status } }),

    // 获取今日乘客数
    getTodayPassengerCount: () => request.get('/passenger/count/today'),

    // 获取总乘客数
    getTotalPassengerCount: () => request.get('/passenger/count/total'),

    // 获取今日司机数
    getTodayDriverCount: () => request.get('/driver/count/today'),

    // 获取总司机数
    getTotalDriverCount: () => request.get('/driver/count/total')
}