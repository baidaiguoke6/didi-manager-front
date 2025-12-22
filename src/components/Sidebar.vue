<template>
  <div class="sidebar">
    <div class="logo">
      <h2>滴滴管理</h2>
    </div>
    <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <span>数据概览</span>
      </el-menu-item>
      <el-menu-item index="/users">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="/orders">
        <el-icon><Document /></el-icon>
        <span>订单管理</span>
      </el-menu-item>
      <el-menu-item index="/cloud-sync">
        <el-icon><Cloudy /></el-icon>
        <span>云数据同步</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import {Cloudy, Document, Odometer, User} from "@element-plus/icons-vue";

export default {
  name: 'Sidebar',
  components: {Odometer, User, Document, Cloudy}
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  background-color: #304156;
  height: 100vh;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-bottom: 1px solid #1f2d3d;
}

.sidebar-menu {
  border: none;
}
</style>