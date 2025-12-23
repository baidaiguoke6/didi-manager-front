<template>
  <div class="order-management">
    <h3>订单管理</h3>

    <!-- 顶部分页控件 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <el-table
        :data="orders"
        stripe
        style="width: 100%"
        v-loading="loading"
        @sort-change="handleSortChange"
    >
      <el-table-column prop="id" label="ID" width="80" sortable="custom" />
      <el-table-column prop="orderNo" label="订单号" width="180" sortable="custom" />

      <!-- 乘客信息列 -->
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

      <!-- 司机信息列 -->
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

      <el-table-column prop="actualAmount" label="实付金额" width="100" sortable="custom">
        <template #default="scope">
          ¥{{ formatAmount(scope.row.actualAmount) }}
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createTime" label="创建时间" width="180" sortable="custom">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部分页控件 -->
    <div class="pagination-container">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { orderApi } from '@/api/order'

export default {
  name: 'OrderManagement',
  data() {
    return {
      orders: [],
      loading: false,
      currentPage: 1, // Element UI 页码从1开始
      pageSize: 20,
      total: 0,
      sort: 'createTime',  // 排序字段
      direction: 'desc'    // 排序方向
    }
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      this.loading = true
      try {
        // 注意：后端页码从0开始，前端currentPage从1开始
        const backendPage = this.currentPage - 1

        const response = await orderApi.getOrders(backendPage, this.pageSize, this.sort, this.direction)
        const pageData = response.data

        if (pageData) {
          this.orders = pageData.content || []
          this.total = pageData.totalElements || 0
        } else {
          console.error('分页数据格式错误:', response)
          this.$message.error('数据格式异常')
        }
      } catch (error) {
        console.error('获取订单数据失败:', error)
        this.$message.error('获取订单数据失败: ' + (error.message || '请检查网络连接'))
      } finally {
        this.loading = false
      }
    },

    // 每页大小改变
    handleSizeChange(newSize) {
      this.pageSize = newSize
      this.currentPage = 1 // 重置到第一页
      this.loadOrders()
    },

    // 当前页码改变
    handleCurrentChange(newPage) {
      this.currentPage = newPage
      this.loadOrders()
    },

    // 表格排序改变
    handleSortChange({ prop, order }) {
      if (prop) {
        this.sort = prop
        this.direction = order === 'ascending' ? 'asc' : 'desc'
        this.currentPage = 1 // 排序后回到第一页
        this.loadOrders()
      }
    },

    // 格式化金额
    formatAmount(amount) {
      if (amount === null || amount === undefined) return '0.00'
      return parseFloat(amount).toFixed(2)
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return ''
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr

        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-')
      } catch (error) {
        console.error('日期格式化错误:', error, dateStr)
        return dateStr
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
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.pagination-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-container:last-of-type {
  margin-top: 20px;
  margin-bottom: 0;
}

/* 添加鼠标悬停样式 */
.hover-show {
  cursor: pointer;
  transition: all 0.2s;
  padding: 2px 4px;
  border-radius: 3px;
}

.hover-show:hover {
  color: #409eff;
  text-decoration: underline;
  text-decoration-style: dotted;
  background: rgba(64, 158, 255, 0.1);
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-table th) {
  background: #fafafa;
  font-weight: 600;
  color: #303133;
}

:deep(.el-table .cell) {
  padding: 8px 12px;
}
</style>