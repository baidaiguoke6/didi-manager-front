<template>
  <div class="order-management">
    <h3>订单管理</h3>

    <el-table :data="orders" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="orderNo" label="订单号" width="180" />

      <!-- 乘客信息列 - 悬浮显示ID -->
      <el-table-column label="乘客信息">
        <template #default="scope">
          <el-tooltip
              v-if="scope.row.passengerName"
              :content="`乘客ID: ${scope.row.passengerId || '暂无'}`"
              placement="top"
          >
            <div class="hover-show">
              {{ scope.row.passengerName }}
            </div>
          </el-tooltip>
          <el-tooltip
              v-else
              :content="`乘客ID: ${scope.row.passengerId || '暂无'}`"
              placement="top"
          >
            <span style="color: #999">暂无乘客</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <!-- 司机信息列 - 悬浮显示ID -->
      <el-table-column label="司机信息">
        <template #default="scope">
          <el-tooltip
              v-if="scope.row.driverName"
              :content="`司机ID: ${scope.row.driverId || '暂无'}`"
              placement="top"
          >
            <div class="hover-show">
              {{ scope.row.driverName }}
            </div>
          </el-tooltip>
          <el-tooltip
              v-else
              :content="`司机ID: ${scope.row.driverId || '暂无'}`"
              placement="top"
          >
            <span style="color: #999">未分配</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="startAddress" label="出发地" show-overflow-tooltip />
      <el-table-column prop="endAddress" label="目的地" show-overflow-tooltip />
      <el-table-column prop="actualAmount" label="实付金额" width="100">
        <template #default="scope">
          ¥{{ scope.row.actualAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
    </el-table>
  </div>
</template>

<script>
import { orderApi } from '@/api/order'

export default {
  name: 'OrderManagement',
  data() {
    return {
      orders: [],
      loading: false
    }
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      this.loading = true
      try {
        const response = await orderApi.getOrders()
        this.orders = response.data || []
      } catch (error) {
        this.$message.error('获取订单数据失败')
      } finally {
        this.loading = false
      }
    },

    getStatusType(status) {
      const types = {
        0: 'info',    // 待接单
        1: 'warning', // 已接单
        2: 'primary', // 行程中
        3: 'success', // 已完成
        4: 'danger',  // 已取消
        5: 'danger'   // 异常
      }
      return types[status] || 'info'
    },

    getStatusText(status) {
      const texts = {
        0: '待接单',
        1: '已接单',
        2: '行程中',
        3: '已完成',
        4: '已取消',
        5: '异常'
      }
      return texts[status] || '未知'
    }
  }
}
</script>

<style scoped>
.order-management {
  padding: 20px;
}

/* 添加鼠标悬停样式 */
.hover-show {
  cursor: pointer;
  transition: all 0.2s;
}

.hover-show:hover {
  color: #409eff;
  text-decoration: underline;
  text-decoration-style: dotted;
}
</style>