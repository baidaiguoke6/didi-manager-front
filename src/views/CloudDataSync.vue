<template>
  <div class="sync-container">
    <div class="sync-controls">
      <el-button type="primary" @click="startSync" :loading="syncLoading">
        {{ syncLoading ? '同步中...' : '开始同步数据到后端' }}
      </el-button>
      <div class="sync-status">
        <span v-if="lastSyncTime">上次同步: {{ formatTime(lastSyncTime) }}</span>
        <span v-else>从未同步</span>
      </div>
    </div>

    <div class="sync-log">
      <h3>同步日志</h3>
      <div class="log-content">
        <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
          [{{ log.time }}] {{ log.message }}
        </div>
        <div v-if="logs.length === 0" class="empty-log">暂无日志</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { wechatApi } from '@/api/wechat.js'

// 响应式数据
const syncLoading = ref(false)
const lastSyncTime = ref(null)
const logs = ref([])

// 添加日志
const addLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.unshift({ time, message, type })
  console.log(`[${type.toUpperCase()}] ${message}`)
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '从未同步'
  return new Date(time).toLocaleString('zh-CN')
}

// 加载微信云SDK
const loadWechatCloudSDK = () => {
  return new Promise((resolve, reject) => {
    if (typeof cloud !== 'undefined') {
      addLog('微信云SDK已加载', 'info')
      resolve()
      return
    }

    addLog('开始加载微信云开发SDK...', 'info')
    const script = document.createElement('script')
    script.src = 'https://web-9gikcbug35bad3a8-1304825656.tcloudbaseapp.com/sdk/1.3.0/cloud.js'

    script.onload = () => {
      addLog('✅ 微信云开发SDK加载成功', 'success')
      resolve()
    }

    script.onerror = (error) => {
      addLog('❌❌ 微信云开发SDK加载失败', 'error')
      reject(new Error('SDK加载失败'))
    }

    document.head.appendChild(script)
  })
}

// 初始化微信云环境
const initWechatCloud = () => {
  return new Promise((resolve, reject) => {
    addLog('初始化微信云环境...', 'info')

    try {
      const cloudInstance = new cloud.Cloud({
        identityless: true,
        resourceAppid: 'wxa2800d2472a1cfea',
        resourceEnv: 'cloud1-7gfzjlxqd3a9a341',
      })

      cloudInstance.init()
          .then(() => {
            addLog('✅ 微信云环境初始化成功', 'success')
            resolve(cloudInstance)
          })
          .catch(error => {
            addLog(`❌❌ 微信云环境初始化失败: ${error.message}`, 'error')
            reject(error)
          })
    } catch (error) {
      addLog(`❌❌ 创建云实例失败: ${error.message}`, 'error')
      reject(error)
    }
  })
}

const queryCollection = async (cloudInstance, collectionName, pageSize = 100) => {
  const db = cloudInstance.database()
  let allData = []
  let lastTime = 0

  while (true) {
    const res = await db.collection(collectionName)
        .where({ createTime: db.command.gt(lastTime) })
        .orderBy('createTime', 'asc')
        .limit(pageSize)
        .get()

    if (res.data.length === 0) break

    allData = allData.concat(res.data)
    lastTime = res.data[res.data.length - 1].createTime
  }

  addLog(`✅ ${collectionName} 数据获取完成: ${allData.length} 条`, 'success')
  return allData
}

// 转换数据格式以适应后端实体
const transformDataForBackend = (originalData, dataType) => {
  addLog(`开始转换 ${dataType} 数据格式...`, 'info')
  // console.log("这是从小程序获取的所有原始数据：", originalData)
  // console.log("JSON格式的原始数据：", JSON.stringify(originalData, null, 2))

  // // 或者详细打印每个对象
  // originalData.forEach((item, index) => {
  //   console.log(`${dataType} ${index}:`, JSON.stringify(item, null, 2))
  // })

  try {
    let transformedData = []

    if (dataType === 'user') {
      // 转换用户数据（对应Passenger实体）
      transformedData = originalData.map(item => ({
        _id: item._id, // 保留原始ID用于调试
        username: item.username || `user_${item._id.substring(0, 8)}`,
        password: item.password || 'default123', // 需要设置默认密码
        nickname: item.nickname || item.username,
        phone: item.phone || '00000000000',
        status: item.status !== undefined ? item.status : 1,//正常：1 禁用：0
        createTime: item.createTime
      }))
    }
    else if (dataType === 'driver') {
      // 转换司机数据（对应Driver实体）
      transformedData = originalData.map(item => ({
        _id: item._id,
        username: item.username || `driver_${item._id.substring(0, 8)}`,
        password: item.password || 'default123',
        nickname: item.nickname || item.username,
        phone: item.phone || '00000000000',
        carNumber: item.car_number || '苏A66666',
        carType: item.car_type || '小米苏7',
        status: item.status !== undefined ? item.status : 1,//正常（在线）：1  禁用：2  离线：0
        createTime: item.createTime
      }))
    }
    else if (dataType === 'order') {
      // 转换订单数据（对应OrderInfo实体）
      transformedData = originalData.map(item => {
        return {
          _id: item._id,
          orderNo: item.orderNo || `order_${item._id.substring(0, 8)}`,
          car:item.car || '无类型',
          passengerId: item.userid, // 注意：这里是字符串，后端需要转换为Long
          driverId: item.driver_id,
          startAddress: item.mybackfill || item.from || '未知地址',
          endAddress: item.tobackfill || item.to || '未知地址',
          distance: item.distance || 0,
          platformFee: (item.price || 0) * 0.1, // 假设平台费10%
          driverAmount: (item.price || 0) * 0.9, // 假设司机得90%
          status: item.status || 0,//已完成 3    取消 4  行进中 2（还未设置） 待接单 0
          startTime: item.startTime ||null ,
          endTime: item.endTime || null,
          createTime: item.createTime ||null,
          acceptTime: item.acceptTime ||null,
          username: item.username || '未知用户',
        }
      })
    }

    addLog(`✅ ${dataType} 数据转换完成: ${transformedData.length} 条`, 'success')
    return transformedData
  } catch (error) {
    addLog(`❌❌ ${dataType} 数据转换失败: ${error.message}`, 'error')
    throw error
  }
}

// 主同步函数
const startSync = async () => {
  if (syncLoading.value) return

  syncLoading.value = true
  addLog('=== 开始同步数据到后端 ===', 'info')

  try {
    // 1. 加载SDK
    await loadWechatCloudSDK()

    // 2. 初始化云环境
    const cloudInstance = await initWechatCloud()

    // 3. 查询数据
    addLog('开始查询微信云数据...', 'info')

    const users = await queryCollection(cloudInstance, 'user')
    const drivers = await queryCollection(cloudInstance, 'driver')
    const orders = await queryCollection(cloudInstance, 'order')

    addLog(`数据查询完成: 用户${users.length}条, 司机${drivers.length}条, 订单${orders.length}条`, 'success')

    // 4. 转换数据格式
    const transformedUsers = transformDataForBackend(users, 'user')
    const transformedDrivers = transformDataForBackend(drivers, 'driver')
    const transformedOrders = transformDataForBackend(orders, 'order')

    // 5. 发送到后端
    addLog('开始发送数据到后端...', 'info')


    const syncData = {
      users: transformedUsers,
      drivers: transformedDrivers,
      orders: transformedOrders,
      syncTime: new Date().toISOString()
    }

    const response = await wechatApi.syncData(syncData)

    addLog('✅ 数据同步到后端成功', 'success')
    addLog(`后端响应: ${JSON.stringify(response.data)}`, 'info')

    // 更新同步时间
    lastSyncTime.value = new Date().toISOString()
    ElMessage.success('数据同步成功！')

  } catch (error) {
    addLog(`❌❌ 同步失败: ${error.message}`, 'error')
    ElMessage.error(`同步失败: ${error.message}`)
  } finally {
    syncLoading.value = false
  }
}

// 页面加载时预加载SDK
onMounted(() => {
  addLog('页面加载完成，点击按钮开始同步数据', 'info')
})
</script>

<style scoped>
.sync-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.sync-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.sync-log {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.sync-log h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}

.log-content {
  height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 15px;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 5px;
  line-height: 1.4;
}

.log-item.info {
  color: #569cd6;
}

.log-item.success {
  color: #4ec9b0;
}

.log-item.error {
  color: #f48771;
}

.empty-log {
  text-align: center;
  color: #888;
  padding: 20px;
}
</style>