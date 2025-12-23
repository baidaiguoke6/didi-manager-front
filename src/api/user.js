import request from './request'

export const userApi = {
    // 管理员登录
    login: (data) => request.post('/admin/login', null, { params: data }),

    // 管理员注册
    register: (data) => request.post('/admin/register', null, { params: data }),

    // 获取乘客列表（分页）
    getPassengers: (params) => request.get('/passenger/list', { params }),

    // 获取司机列表（分页）
    getDrivers: (params) => request.get('/driver/list', { params }),

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