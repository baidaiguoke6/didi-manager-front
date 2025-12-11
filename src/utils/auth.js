// 认证相关工具函数
export const auth = {
    // 保存token
    setToken: (token) => {
        localStorage.setItem('admin_token', token)
    },

    // 获取token
    getToken: () => {
        return localStorage.getItem('admin_token')
    },

    // 移除token
    removeToken: () => {
        localStorage.removeItem('admin_token')
    },

    // 检查是否登录
    isLoggedIn: () => {
        return !!localStorage.getItem('admin_token')
    }
}