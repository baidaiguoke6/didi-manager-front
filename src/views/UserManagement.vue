<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="loadUsers" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <span class="data-count">共 {{ getTotalCount() }} 个用户</span>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="user-tabs" @tab-change="handleTabChange">
      <!-- 乘客管理 -->
      <el-tab-pane label="乘客管理" name="passenger">
        <div class="tab-content">
          <div class="tab-header">
            <h3>乘客管理</h3>
            <div class="tab-stats">
              <span class="stat-item">总乘客: {{ passengerPagination.total }} 人</span>
              <span class="stat-item normal">正常: {{ getNormalPassengerCount() }} 人</span>
              <span class="stat-item disabled">禁用: {{ getDisabledPassengerCount() }} 人</span>
            </div>
          </div>

          <div class="table-container">
            <el-table
                :data="passengers"
                stripe
                class="user-table"
                v-loading="loading"
                :default-sort="{ prop: 'id', order: 'ascending' }"
            >
              <el-table-column prop="id" label="ID" width="80" align="center" sortable />
              <el-table-column prop="username" label="账号" min-width="100" show-overflow-tooltip />
              <el-table-column prop="nickname" label="昵称" min-width="100" show-overflow-tooltip />
              <el-table-column prop="phone" label="手机号" min-width="120" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="90" align="center">
                <template #default="scope">
                  <el-tag
                      :type="scope.row.status === 1 ? 'success' : 'danger'"
                      class="status-tag"
                      size="small"
                  >
                    {{ scope.row.status === 1 ? '正常' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="注册时间" width="160">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" align="center">
                <template #default="scope">
                  <div class="action-buttons">
                    <el-button
                        v-if="scope.row.status === 1"
                        type="danger"
                        size="small"
                        @click="handleDisablePassenger(scope.row)"
                        :loading="scope.row.disabling"
                        plain
                    >
                      禁用
                    </el-button>
                    <el-button
                        v-else
                        type="success"
                        size="small"
                        @click="handleEnablePassenger(scope.row)"
                        :loading="scope.row.enabling"
                        plain
                    >
                      启用
                    </el-button>
                    <el-button
                        type="info"
                        size="small"
                        @click="showPassengerDetail(scope.row)"
                        plain
                    >
                      详情
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 乘客分页 -->
            <div class="pagination-container">
              <el-pagination
                  v-model:current-page="passengerPagination.current"
                  v-model:page-size="passengerPagination.size"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="passengerPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handlePassengerSizeChange"
                  @current-change="handlePassengerPageChange"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 司机管理 -->
      <el-tab-pane label="司机管理" name="driver">
        <div class="tab-content">
          <div class="tab-header">
            <h3>司机管理</h3>
            <div class="tab-stats">
              <span class="stat-item">总司机: {{ driverPagination.total }} 人</span>
              <span class="stat-item online">在线: {{ getOnlineDriverCount() }} 人</span>
              <span class="stat-item offline">离线: {{ getOfflineDriverCount() }} 人</span>
              <span class="stat-item disabled">禁用: {{ getDisabledDriverCount() }} 人</span>
            </div>
          </div>

          <div class="table-container">
            <el-table
                :data="drivers"
                stripe
                class="user-table"
                v-loading="loading"
                :default-sort="{ prop: 'id', order: 'ascending' }"
            >
              <el-table-column prop="id" label="ID" width="80" align="center" sortable />
              <el-table-column prop="username" label="账号" min-width="100" show-overflow-tooltip />
              <el-table-column prop="nickname" label="昵称" min-width="100" show-overflow-tooltip />
              <el-table-column prop="phone" label="手机号" min-width="120" show-overflow-tooltip />
              <el-table-column prop="carNumber" label="车牌号" min-width="100" show-overflow-tooltip />
              <el-table-column prop="driverCountsToday" label="今日盈利" width="100" align="right">
                <template #default="scope">
                  <span class="balance">¥{{ scope.row.driverCountsToday || 0 }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="driverAllCounts" label="总盈利" width="100" align="right">
                <template #default="scope">
                  <span class="balance">¥{{ scope.row.driverAllCounts || 0 }}</span>
                </template>
              </el-table-column>

              <el-table-column prop="status" label="状态" width="90" align="center">
                <template #default="scope">
                  <el-tag
                      :type="getDriverStatusType(scope.row.status)"
                      class="status-tag"
                      size="small"
                  >
                    {{ getDriverStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="注册时间" width="160">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="220" align="center">
                <template #default="scope">
                  <div class="action-buttons">
                    <el-button
                        v-if="scope.row.status === 2"
                        type="success"
                        size="small"
                        @click="handleEnableDriver(scope.row, 0)"
                        :loading="scope.row.enabling0"
                        plain
                    >
                      离线
                    </el-button>
                    <el-button
                        v-if="scope.row.status === 2"
                        type="success"
                        size="small"
                        @click="handleEnableDriver(scope.row, 1)"
                        :loading="scope.row.enabling1"
                        plain
                    >
                      在线
                    </el-button>
                    <el-button
                        v-if="scope.row.status !== 2"
                        type="danger"
                        size="small"
                        @click="handleDisableDriver(scope.row)"
                        :loading="scope.row.disabling"
                        plain
                    >
                      禁用
                    </el-button>
                    <el-button
                        type="info"
                        size="small"
                        @click="showDriverDetail(scope.row)"
                        plain
                    >
                      详情
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 司机分页 -->
            <div class="pagination-container">
              <el-pagination
                  v-model:current-page="driverPagination.current"
                  v-model:page-size="driverPagination.size"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="driverPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleDriverSizeChange"
                  @current-change="handleDriverPageChange"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 乘客详情对话框 -->
    <el-dialog
        v-model="passengerDialogVisible"
        title="乘客详情"
        width="400"
    >
      <div v-if="selectedPassenger" class="user-detail">
        <div class="detail-item">
          <span class="label">ID：</span>
          <span class="value">{{ selectedPassenger.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">账号：</span>
          <span class="value">{{ selectedPassenger.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">昵称：</span>
          <span class="value">{{ selectedPassenger.nickname || '未设置' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">手机号：</span>
          <span class="value">{{ selectedPassenger.phone || '未设置' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="selectedPassenger.status === 1 ? 'success' : 'danger'">
            {{ selectedPassenger.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">注册时间：</span>
          <span class="value">{{ formatDate(selectedPassenger.createTime) }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 司机详情对话框 -->
    <el-dialog
        v-model="driverDialogVisible"
        title="司机详情"
        width="500"
    >
      <div v-if="selectedDriver" class="user-detail">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">ID：</span>
            <span class="value">{{ selectedDriver.id }}</span>
          </div>
          <div class="detail-item">
            <span class="label">账号：</span>
            <span class="value">{{ selectedDriver.username }}</span>
          </div>
          <div class="detail-item">
            <span class="label">昵称：</span>
            <span class="value">{{ selectedDriver.nickname || '未设置' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">手机号：</span>
            <span class="value">{{ selectedDriver.phone || '未设置' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">车牌号：</span>
            <span class="value">{{ selectedDriver.carNumber || '未设置' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">今日盈利：</span>
            <span class="value balance">¥{{ selectedDriver.driverCountsToday || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="label">总盈利：</span>
            <span class="value balance">¥{{ selectedDriver.driverAllCounts || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="label">状态：</span>
            <el-tag :type="getDriverStatusType(selectedDriver.status)">
              {{ getDriverStatusText(selectedDriver.status) }}
            </el-tag>
          </div>
          <div class="detail-item full-width">
            <span class="label">注册时间：</span>
            <span class="value">{{ formatDate(selectedDriver.createTime) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'UserManagement',
  data() {
    return {
      activeTab: 'passenger',
      passengers: [],
      drivers: [],
      loading: false,
      passengerDialogVisible: false,
      driverDialogVisible: false,
      selectedPassenger: null,
      selectedDriver: null,
      // 分页配置
      passengerPagination: {
        current: 1,
        size: 10,
        total: 0
      },
      driverPagination: {
        current: 1,
        size: 10,
        total: 0
      }
    }
  },
  mounted() {
    this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        // 同时获取乘客和司机数据
        const [passengerRes, driverRes] = await Promise.all([
          userApi.getPassengers({
            page: this.passengerPagination.current,
            size: this.passengerPagination.size
          }),
          userApi.getDrivers({
            page: this.driverPagination.current,
            size: this.driverPagination.size
          })
        ])

        // 处理乘客数据
        if (passengerRes.code === 200) {
          // 根据后端返回的数据结构调整
          const passengerData = passengerRes.data;
          if (passengerData && passengerData.content) {
            // Spring Data Page 对象结构
            this.passengers = (passengerData.content || []).map(p => ({
              ...p,
              disabling: false,
              enabling: false
            }))
            this.passengerPagination.total = passengerData.totalElements || 0
          } else if (Array.isArray(passengerData)) {
            // 如果是普通数组
            this.passengers = passengerData.map(p => ({
              ...p,
              disabling: false,
              enabling: false
            }))
            this.passengerPagination.total = passengerData.length
          } else if (passengerData && passengerData.records) {
            // 如果是 records 结构
            this.passengers = (passengerData.records || []).map(p => ({
              ...p,
              disabling: false,
              enabling: false
            }))
            this.passengerPagination.total = passengerData.total || 0
          } else {
            console.warn('乘客数据结构未知:', passengerData)
            this.passengers = []
            this.passengerPagination.total = 0
          }
        }

        // 处理司机数据
        if (driverRes.code === 200) {
          // 根据后端返回的数据结构调整
          const driverData = driverRes.data;
          if (driverData && driverData.content) {
            // Spring Data Page 对象结构
            this.drivers = (driverData.content || []).map(d => ({
              ...d,
              disabling: false,
              enabling0: false,
              enabling1: false
            }))
            this.driverPagination.total = driverData.totalElements || 0
          } else if (Array.isArray(driverData)) {
            // 如果是普通数组
            this.drivers = driverData.map(d => ({
              ...d,
              disabling: false,
              enabling0: false,
              enabling1: false
            }))
            this.driverPagination.total = driverData.length
          } else if (driverData && driverData.records) {
            // 如果是 records 结构
            this.drivers = (driverData.records || []).map(d => ({
              ...d,
              disabling: false,
              enabling0: false,
              enabling1: false
            }))
            this.driverPagination.total = driverData.total || 0
          } else {
            console.warn('司机数据结构未知:', driverData)
            this.drivers = []
            this.driverPagination.total = 0
          }
        }
      } catch (error) {
        ElMessage.error('获取用户数据失败')
        console.error('获取用户数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    async loadPassengers() {
      this.loading = true
      try {
        const response = await userApi.getPassengers({
          page: this.passengerPagination.current,
          size: this.passengerPagination.size
        })

        if (response.code === 200) {
          const data = response.data;
          // 根据不同的数据结构处理
          if (data && data.content) {
            // Spring Data Page 结构
            this.passengers = (data.content || []).map(p => ({
              ...p,
              disabling: false,
              enabling: false
            }))
            this.passengerPagination.total = data.totalElements || 0
          } else if (data && data.records) {
            // records 结构
            this.passengers = (data.records || []).map(p => ({
              ...p,
              disabling: false,
              enabling: false
            }))
            this.passengerPagination.total = data.total || 0
          } else if (Array.isArray(data)) {
            // 普通数组
            this.passengers = data.map(p => ({
              ...p,
              disabling: false,
              enabling: false
            }))
            this.passengerPagination.total = data.length
          } else {
            console.error('未知的乘客数据结构:', data)
            this.passengers = []
            this.passengerPagination.total = 0
          }
        }
      } catch (error) {
        ElMessage.error('获取乘客数据失败')
        console.error('获取乘客数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    async loadDrivers() {
      this.loading = true
      try {
        const response = await userApi.getDrivers({
          page: this.driverPagination.current,
          size: this.driverPagination.size
        })

        if (response.code === 200) {
          const data = response.data;
          // 根据不同的数据结构处理
          if (data && data.content) {
            // Spring Data Page 结构
            this.drivers = (data.content || []).map(d => ({
              ...d,
              disabling: false,
              enabling0: false,
              enabling1: false
            }))
            this.driverPagination.total = data.totalElements || 0
          } else if (data && data.records) {
            // records 结构
            this.drivers = (data.records || []).map(d => ({
              ...d,
              disabling: false,
              enabling0: false,
              enabling1: false
            }))
            this.driverPagination.total = data.total || 0
          } else if (Array.isArray(data)) {
            // 普通数组
            this.drivers = data.map(d => ({
              ...d,
              disabling: false,
              enabling0: false,
              enabling1: false
            }))
            this.driverPagination.total = data.length
          } else {
            console.error('未知的司机数据结构:', data)
            this.drivers = []
            this.driverPagination.total = 0
          }
        }
      } catch (error) {
        ElMessage.error('获取司机数据失败')
        console.error('获取司机数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 标签切换事件
    handleTabChange(tabName) {
      if (tabName === 'passenger') {
        this.loadPassengers()
      } else if (tabName === 'driver') {
        this.loadDrivers()
      }
    },

    // 乘客分页事件
    handlePassengerSizeChange(size) {
      this.passengerPagination.size = size
      this.passengerPagination.current = 1
      this.loadPassengers()
    },

    handlePassengerPageChange(page) {
      this.passengerPagination.current = page
      this.loadPassengers()
    },

    // 司机分页事件
    handleDriverSizeChange(size) {
      this.driverPagination.size = size
      this.driverPagination.current = 1
      this.loadDrivers()
    },

    handleDriverPageChange(page) {
      this.driverPagination.current = page
      this.loadDrivers()
    },

    getDriverStatusType(status) {
      const types = {
        1: 'success', // 在线
        0: 'warning', // 离线
        2: 'danger'   // 禁用
      }
      return types[status] || 'info'
    },

    getDriverStatusText(status) {
      const texts = {
        1: '在线',
        0: '离线',
        2: '禁用'
      }
      return texts[status] || '未知'
    },

    formatDate(dateStr) {
      if (!dateStr) return '--'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    },

    getTotalCount() {
      return this.passengerPagination.total + this.driverPagination.total
    },

    getNormalPassengerCount() {
      return this.passengers.filter(p => p.status === 1).length
    },

    getDisabledPassengerCount() {
      return this.passengers.filter(p => p.status === 0).length
    },

    getOnlineDriverCount() {
      return this.drivers.filter(d => d.status === 1).length
    },

    getOfflineDriverCount() {
      return this.drivers.filter(d => d.status === 0).length
    },

    getDisabledDriverCount() {
      return this.drivers.filter(d => d.status === 2).length
    },

    async handleDisablePassenger(passenger) {
      try {
        await ElMessageBox.confirm(
            `确定要禁用乘客 "${passenger.nickname || passenger.username}" 吗？`,
            '确认禁用',
            {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning',
            }
        )

        passenger.disabling = true
        const response = await userApi.updatePassengerStatus(passenger.id, 0)

        if (response.code === 200) {
          ElMessage.success('乘客已禁用')
          passenger.status = 0
          // 重新加载当前页数据
          this.loadPassengers()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('禁用失败')
        }
      } finally {
        passenger.disabling = false
      }
    },

    async handleEnablePassenger(passenger) {
      try {
        await ElMessageBox.confirm(
            `确定要启用乘客 "${passenger.nickname || passenger.username}" 吗？`,
            '确认启用',
            {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning',
            }
        )

        passenger.enabling = true
        const response = await userApi.updatePassengerStatus(passenger.id, 1)

        if (response.code === 200) {
          ElMessage.success('乘客已启用')
          passenger.status = 1
          // 重新加载当前页数据
          this.loadPassengers()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('启用失败')
        }
      } finally {
        passenger.enabling = false
      }
    },

    async handleDisableDriver(driver) {
      try {
        await ElMessageBox.confirm(
            `确定要禁用司机 "${driver.nickname || driver.username}" 吗？`,
            '确认禁用',
            {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning',
            }
        )

        driver.disabling = true
        const response = await userApi.updateDriverStatus(driver.id, 2)

        if (response.code === 200) {
          ElMessage.success('司机已禁用')
          driver.status = 2
          // 重新加载当前页数据
          this.loadDrivers()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('禁用失败')
        }
      } finally {
        driver.disabling = false
      }
    },

    async handleEnableDriver(driver, status) {
      const statusText = status === 1 ? '在线' : '离线'
      try {
        await ElMessageBox.confirm(
            `确定要将司机 "${driver.nickname || driver.username}" 设置为${statusText}状态吗？`,
            '确认启用',
            {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning',
            }
        )

        if (status === 1) {
          driver.enabling1 = true
        } else {
          driver.enabling0 = true
        }

        const response = await userApi.updateDriverStatus(driver.id, status)

        if (response.code === 200) {
          ElMessage.success(`司机已启用（${statusText}）`)
          driver.status = status
          // 重新加载当前页数据
          this.loadDrivers()
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('启用失败')
        }
      } finally {
        driver.enabling0 = false
        driver.enabling1 = false
      }
    },

    showPassengerDetail(passenger) {
      this.selectedPassenger = passenger
      this.passengerDialogVisible = true
    },

    showDriverDetail(driver) {
      this.selectedDriver = driver
      this.driverDialogVisible = true
    }
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.data-count {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.user-tabs {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.user-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.user-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

.user-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  padding: 0 20px;
  height: 48px;
  line-height: 48px;
}

.user-tabs :deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: 600;
}

.tab-content {
  padding: 20px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.tab-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.tab-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.stat-item {
  font-size: 12px;
  color: #606266;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  white-space: nowrap;
}

.stat-item.normal {
  color: #67C23A;
  background: rgba(103, 194, 58, 0.1);
}

.stat-item.disabled {
  color: #F56C6C;
  background: rgba(245, 108, 108, 0.1);
}

.stat-item.online {
  color: #409EFF;
  background: rgba(64, 158, 255, 0.1);
}

.stat-item.offline {
  color: #E6A23C;
  background: rgba(230, 162, 60, 0.1);
}

/* 表格容器 */
.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.user-table {
  min-width: 100%;
  width: auto;
}

.user-table :deep(.el-table__header-wrapper) th {
  background: #f5f7fa;
  font-weight: 600;
  color: #606266;
  white-space: nowrap;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  background: white;
  border-top: 1px solid #ebeef5;
}

.balance {
  color: #409EFF;
  font-weight: 500;
}

.status-tag {
  font-weight: 500;
  justify-content: center;
  margin: 0 auto;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  margin: 2px;
}

.user-detail {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-item .label {
  width: 80px;
  font-weight: 500;
  color: #606266;
  flex-shrink: 0;
}

.detail-item .value {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

.detail-item.full-width {
  display: block;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* 加载动画 */
.user-table :deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .tab-stats {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .el-button {
    width: 100%;
    margin: 2px 0;
  }

  .user-management {
    padding: 10px;
  }

  .tab-content {
    padding: 10px;
  }

  .page-header {
    padding: 15px;
  }
}
</style>