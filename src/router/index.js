import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/views/Dashboard.vue'
import UserManagement from '@/views/UserManagement.vue'
import OrderManagement from '@/views/OrderManagement.vue'
import CloudDataSync from "@/views/CloudDataSync.vue";

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: Dashboard
            },
            {
                path: 'users',
                name: 'UserManagement',
                component: UserManagement
            },
            {
                path: 'orders',
                name: 'OrderManagement',
                component: OrderManagement
            },
            {
                path: 'cloud-sync',
                name: 'CloudDataSync',
                component: CloudDataSync
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('admin_token')
    if (to.path !== '/login' && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router