import request from './request'

// 微信云数据同步API
export const wechatApi = {
    // 同步数据到后端
    syncData: (data) => {
        console.log("正在调用wechat.js发送到后端")
        return request.post('/wechat/sync', data)
    }
}