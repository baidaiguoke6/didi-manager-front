<template>
  <div class="layout">
    <Sidebar />
    <div class="main-content">
      <div class="header">
        <h3>{{ currentRouteName }}</h3>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-icon><User /></el-icon>
              管理员
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './Sidebar.vue'
import { auth } from '@/utils/auth'

export default {
  name: 'Layout',
  components: { Sidebar },
  computed: {
    currentRouteName() {
      return this.$route.name
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        auth.removeToken()
        this.$router.push('/login')
        this.$message.success('已退出登录')
      }
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e6e6;
  background: white;
}

.content {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
  overflow-y: auto;
}

.user-info {
  cursor: pointer;
}
</style>