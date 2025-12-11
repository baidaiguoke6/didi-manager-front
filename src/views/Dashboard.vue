<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>数据概览</h2>
      <div class="header-actions">
        <el-button type="primary" @click="loadStats" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <span class="last-update">最后更新: {{ lastUpdateTime }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card passenger">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalPassengerCount || 0 }}</div>
            <div class="stat-label">总乘客数</div>
            <div class="stat-today">今日新增: {{ stats.todayPassengerCount || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="stat-card driver">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Van /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalDriverCount || 0 }}</div>
            <div class="stat-label">总司机数</div>
            <div class="stat-today">今日新增: {{ stats.todayDriverCount || 0 }}</div>
          </div>
        </div>
      </div>

      <div class="stat-card order">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayOrderCount || 0 }}</div>
            <div class="stat-label">今日订单</div>
            <div class="stat-today">完成率: {{ getCompletionRate() }}%</div>
          </div>
        </div>
      </div>

      <div class="stat-card income">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatNumber(stats.todayIncome) }}</div>
            <div class="stat-label">今日收入</div>
            <div class="stat-today">累计: ¥{{ formatNumber(stats.totalIncome) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <el-card class="chart-card pie-chart">
        <template #header>
          <div class="chart-header">
            <h3>用户分布</h3>
            <el-select v-model="timeRange" size="small" style="width: 100px">
              <el-option label="今日" value="today" />
              <el-option label="本周" value="week" />
              <el-option label="本月" value="month" />
            </el-select>
          </div>
        </template>
        <div class="chart-container">
          <div class="chart-wrapper">
            <!-- 饼状图 -->
            <div class="pie-chart-container" ref="pieChartRef"></div>
          </div>
          <div class="chart-legend">
            <div class="legend-item passenger">
              <div class="legend-color"></div>
              <span>乘客</span>
              <span class="legend-value">{{ stats.totalPassengerCount || 0 }}</span>
            </div>
            <div class="legend-item driver">
              <div class="legend-color"></div>
              <span>司机</span>
              <span class="legend-value">{{ stats.totalDriverCount || 0 }}</span>
            </div>
            <div class="legend-item order">
              <div class="legend-color"></div>
              <span>今日订单</span>
              <span class="legend-value">{{ stats.todayOrderCount || 0 }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="chart-card data-chart">
        <template #header>
          <div class="chart-header">
            <h3>订单统计</h3>
            <div class="time-selector">
              <el-button-group>
                <el-button :type="timeRange === 'day' ? 'primary' : ''" @click="timeRange = 'day'">日</el-button>
                <el-button :type="timeRange === 'week' ? 'primary' : ''" @click="timeRange = 'week'">周</el-button>
                <el-button :type="timeRange === 'month' ? 'primary' : ''" @click="timeRange = 'month'">月</el-button>
              </el-button-group>
            </div>
          </div>
        </template>
        <div class="data-stats">
          <div class="data-item">
            <div class="data-label">待接单</div>
            <div class="data-value">{{ pendingOrders || 0 }}</div>
            <div class="data-percent">{{ getPendingPercent() }}%</div>
          </div>
          <div class="data-item">
            <div class="data-label">进行中</div>
            <div class="data-value">{{ processingOrders || 0 }}</div>
            <div class="data-percent">{{ getProcessingPercent() }}%</div>
          </div>
          <div class="data-item">
            <div class="data-label">已完成</div>
            <div class="data-value">{{ completedOrders || 0 }}</div>
            <div class="data-percent">{{ getCompletedPercent() }}%</div>
          </div>
          <div class="data-item">
            <div class="data-label">已取消</div>
            <div class="data-value">{{ cancelledOrders || 0 }}</div>
            <div class="data-percent">{{ getCancelledPercent() }}%</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { dashboardApi } from '@/api/dashboard'
import * as echarts from 'echarts'

export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {},
      loading: false,
      lastUpdateTime: '--',
      timeRange: 'today',
      pieChart: null,
      pendingOrders: 2,    // 示例数据
      processingOrders: 1,  // 示例数据
      completedOrders: 2,   // 示例数据
      cancelledOrders: 0    // 示例数据
    }
  },
  mounted() {
    this.loadStats()
    this.initPieChart()
    this.autoRefresh = setInterval(this.loadStats, 30000)
  },
  beforeUnmount() {
    if (this.autoRefresh) {
      clearInterval(this.autoRefresh)
    }
    if (this.pieChart) {
      this.pieChart.dispose()
    }
  },
  methods: {
    async loadStats() {
      this.loading = true
      try {
        const response = await dashboardApi.getStats()
        this.stats = response.data
        this.lastUpdateTime = new Date().toLocaleTimeString()
        this.updatePieChart()
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    initPieChart() {
      this.pieChart = echarts.init(this.$refs.pieChartRef)
      this.updatePieChart()
    },

    updatePieChart() {
      if (!this.pieChart) return

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: '用户分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 18,
                fontWeight: 'bold'
              }
            },
            data: [
              { value: this.stats.totalPassengerCount || 0, name: '乘客', itemStyle: { color: '#409EFF' } },
              { value: this.stats.totalDriverCount || 0, name: '司机', itemStyle: { color: '#67C23A' } },
              { value: this.stats.todayOrderCount || 0, name: '今日订单', itemStyle: { color: '#E6A23C' } }
            ]
          }
        ]
      }

      this.pieChart.setOption(option)
    },

    formatNumber(num) {
      if (!num) return '0'
      return Number(num).toFixed(2)
    },

    getCompletionRate() {
      const total = this.pendingOrders + this.processingOrders + this.completedOrders + this.cancelledOrders
      if (total === 0) return 0
      return Math.round((this.completedOrders / total) * 100)
    },

    getPendingPercent() {
      const total = this.pendingOrders + this.processingOrders + this.completedOrders + this.cancelledOrders
      if (total === 0) return 0
      return Math.round((this.pendingOrders / total) * 100)
    },

    getProcessingPercent() {
      const total = this.pendingOrders + this.processingOrders + this.completedOrders + this.cancelledOrders
      if (total === 0) return 0
      return Math.round((this.processingOrders / total) * 100)
    },

    getCompletedPercent() {
      const total = this.pendingOrders + this.processingOrders + this.completedOrders + this.cancelledOrders
      if (total === 0) return 0
      return Math.round((this.completedOrders / total) * 100)
    },

    getCancelledPercent() {
      const total = this.pendingOrders + this.processingOrders + this.completedOrders + this.cancelledOrders
      if (total === 0) return 0
      return Math.round((this.cancelledOrders / total) * 100)
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.last-update {
  color: #909399;
  font-size: 14px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.stat-card.passenger {
  border-left-color: #409EFF;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
}

.stat-card.driver {
  border-left-color: #67C23A;
  background: linear-gradient(135deg, #f0f9eb 0%, #ffffff 100%);
}

.stat-card.order {
  border-left-color: #E6A23C;
  background: linear-gradient(135deg, #fdf6ec 0%, #ffffff 100%);
}

.stat-card.income {
  border-left-color: #F56C6C;
  background: linear-gradient(135deg, #fef0f0 0%, #ffffff 100%);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.stat-card.passenger .stat-icon {
  background: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.stat-card.driver .stat-icon {
  background: #67C23A;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.stat-card.order .stat-icon {
  background: #E6A23C;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}

.stat-card.income .stat-icon {
  background: #F56C6C;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.stat-today {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.chart-container {
  display: flex;
  height: calc(100% - 40px);
  padding: 10px;
}

.pie-chart-container {
  width: 200px;
  height: 200px;
  margin: auto;
}

.chart-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-legend {
  width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding-left: 20px;
  border-left: 1px solid #ebeef5;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-item.passenger .legend-color {
  background: #409EFF;
}

.legend-item.driver .legend-color {
  background: #67C23A;
}

.legend-item.order .legend-color {
  background: #E6A23C;
}

.legend-value {
  font-weight: bold;
  color: #303133;
  margin-left: auto;
}

.data-chart .chart-container {
  display: block;
  padding: 20px;
}

.data-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  height: 100%;
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.data-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
}

.data-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.data-percent {
  font-size: 12px;
  color: #909399;
  padding: 2px 8px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
}

.time-selector {
  display: flex;
  gap: 4px;
}

.time-selector .el-button {
  width: 40px;
  padding: 8px 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>