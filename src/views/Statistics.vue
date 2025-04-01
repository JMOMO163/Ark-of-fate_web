<template>
  <div class="statistics">
    <!-- 添加筛选表单 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="记录类型">
          <el-radio-group 
            v-model="filterForm.recordType"
            @change="handleFilter"
          >
            <el-radio-button label="current">本周记录</el-radio-button>
            <el-radio-button label="history">历史记录</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="游戏账号">
          <el-select 
            v-model="filterForm.gameAccountId" 
            placeholder="选择游戏账号"
            clearable
            style="width: 240px"
            @change="handleFilter"
          >
            <el-option
              v-for="account in gameAccounts"
              :key="account._id"
              :label="`${account.accountNumber} (${account.accountName})`"
              :value="account._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <!-- 概览卡片 -->
      <el-col :span="24">
        <el-card class="overview-card">
          <el-row :gutter="20">
            <el-col :span="4" v-for="item in overviewItems" :key="item.label">
              <div class="stat-card">
                <div class="stat-title">{{ item.label }}</div>
                <div class="stat-value-container">
                  <span class="stat-value" :style="{ color: item.color }">
                    {{ formatValue(item.value) }}
                  </span>
                  <span v-if="item.rmb !== undefined" class="stat-rmb">
                    ≈{{ formatRMB(item.rmb) }}元
                  </span>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 装等分布图表 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>装等分布</h3>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="itemLevelChartOption" autoresize />
          </div>
        </el-card>
      </el-col>

      <!-- 副本使用次数图表 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>副本使用次数及收益</h3>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="dungeonUsageChartOption" autoresize />
          </div>
        </el-card>
      </el-col>

      <!-- 副本收益图表 -->
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>副本收益统计</h3>
              <div class="chart-header-info">
                <el-tooltip content="根据账户设置的金价比例计算">
                  <span class="rmb-rate">1 RMB = {{ goldRate }} 金</span>
                </el-tooltip>
              </div>
            </div>
          </template>
          <div class="chart-container">
            <v-chart :option="dungeonIncomeChartOption" autoresize />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { getStatistics, StatisticsData } from '@/api/statistics'
import { ElMessage } from 'element-plus'
import { getGameAccounts } from '@/api/gameAccount'
import { useStore } from 'vuex'

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default defineComponent({
  name: 'Statistics',
  components: {
    VChart
  },
  setup() {
    const loading = ref(false)
    const statistics = ref<StatisticsData | null>(null)
    const gameAccounts = ref<any[]>([])
    const store = useStore()
    const goldRate = computed(() => store.state.user?.goldRate || 0)
    
    // 筛选表单
    const filterForm = ref({
      gameAccountId: '',
      dateRange: [] as string[],
      recordType: 'current' as 'current' | 'history'
    })

    // 格式化数值
    const formatValue = (value: number) => {
      if (value >= 10000) {
        return `${(value / 10000).toFixed(1)}w`
      }
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    // 格式化 RMB 值
    const formatRMB = (value: number) => {
      return value.toFixed(2)
    }

    // 计算 RMB 值
    const calculateRMB = (goldValue: number) => {
      return goldValue / goldRate.value
    }

    // 概览数据
    const overviewItems = computed(() => [
      { 
        label: '游戏账号', 
        value: statistics.value?.overview.accountCount || 0, 
        color: '#409EFF' 
      },
      { 
        label: '角色数量', 
        value: statistics.value?.overview.characterCount || 0, 
        color: '#67C23A' 
      },
      { 
        label: '副本记录', 
        value: statistics.value?.overview.recordCount || 0, 
        color: '#E6A23C' 
      },
      { 
        label: '总收益', 
        value: statistics.value?.overview.totalIncome || 0, 
        color: '#F56C6C' 
      },
      { 
        label: '绑金收益', 
        value: statistics.value?.overview.boundIncome || 0, 
        color: '#909399' 
      },
      { 
        label: '交易金收益', 
        value: statistics.value?.overview.tradeableIncome || 0, 
        rmb: calculateRMB(statistics.value?.overview.tradeableIncome || 0),
        color: '#409EFF' 
      }
    ])

    // 装等分布图表配置
    const itemLevelChartOption = computed(() => ({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: statistics.value?.itemLevelDistribution.map(item => item.range) || []
      },
      yAxis: {
        type: 'value',
        name: '角色数量'
      },
      series: [{
        name: '角色数量',
        type: 'bar',
        data: statistics.value?.itemLevelDistribution.map(item => item.count) || [],
        label: {
          show: true,
          position: 'top'
        }
      }]
    }))

    // 副本使用次数图表配置
    const dungeonUsageChartOption = computed(() => ({
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any[]) {
          const goldRate = store.state.user?.goldRate || 1500
          let result = `${params[0].name}<br/>`
          params.forEach(param => {
            if (param.seriesName === '使用次数') {
              result += `${param.seriesName}: ${param.value} 次<br/>`
            } else if (param.seriesName === '交易金收益') {
              const rmbValue = (param.value / goldRate).toFixed(2)
              result += `${param.seriesName}: ${param.value} 金 ≈${rmbValue}元<br/>`
            } else {
              result += `${param.seriesName}: ${param.value} 金<br/>`
            }
          })
          return result
        }
      },
      legend: {
        data: [
          '使用次数',
          '绑金收益',
          '交易金收益'
        ]
      },
      xAxis: {
        type: 'category',
        data: statistics.value?.dungeonUsage.map(item => item.name) || [],
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '次数',
          position: 'left'
        },
        {
          type: 'value',
          name: '收益',
          position: 'right'
        }
      ],
      series: [
        {
          name: '使用次数',
          type: 'bar',
          data: statistics.value?.dungeonUsage.map(item => item.count) || [],
          yAxisIndex: 0,
          label: {
            show: true,
            position: 'top'
          }
        },
        {
          name: '绑金收益',
          type: 'bar',
          data: statistics.value?.dungeonUsage.map(item => item.boundIncome) || [],
          yAxisIndex: 1,
          label: {
            show: true,
            position: 'top'
          }
        },
        {
          name: '交易金收益',
          type: 'bar',
          data: statistics.value?.dungeonUsage.map(item => item.tradeableIncome) || [],
          yAxisIndex: 1,
          label: {
            show: true,
            formatter: (params: any) => {
              const rmbValue = (params.value / goldRate.value).toFixed(2)
              return `${params.value}\n≈${rmbValue}元`
            },
            position: 'top'
          }
        }
      ]
    }))

    // 副本收益图表配置
    const dungeonIncomeChartOption = computed(() => ({
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any[]) {
          const goldRate = store.state.user?.goldRate || 1500
          let result = `${params[0].name}<br/>`
          params.forEach(param => {
            const goldValue = param.value
            if (param.seriesName === '交易金收益') {
              const rmbValue = (goldValue / goldRate).toFixed(2)
              result += `${param.seriesName}: ${goldValue} 金 ≈${rmbValue}元<br/>`
            } else {
              result += `${param.seriesName}: ${goldValue} 金<br/>`
            }
          })
          return result
        }
      },
      legend: {
        data: ['绑金收益', '交易金收益']
      },
      xAxis: {
        type: 'category',
        data: statistics.value?.dungeonIncome.map(item => item.name) || [],
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: '收益'
      },
      series: [
        {
          name: '绑金收益',
          type: 'bar',
          data: statistics.value?.dungeonIncome.map(item => item.bound) || [],
          label: {
            show: true,
            formatter: '{c}',
            position: 'top'
          }
        },
        {
          name: '交易金收益',
          type: 'bar',
          data: statistics.value?.dungeonIncome.map(item => item.tradeable) || [],
          label: {
            show: true,
            formatter: (params: any) => {
              const rmbValue = (params.value / goldRate.value).toFixed(2)
              return `${params.value} ≈${rmbValue}元`
            },
            position: 'top'
          }
        }
      ]
    }))

    // 获取游戏账号列表
    const fetchGameAccounts = async () => {
      try {
        const res = await getGameAccounts()
        if (res.code === 200) {
          gameAccounts.value = res.data.gameAccounts
        }
      } catch (error) {
        console.error('获取游戏账号列表失败:', error)
      }
    }

    // 处理筛选
    const handleFilter = async () => {
      await fetchStatistics()
    }

    // 重置筛选
    const handleReset = () => {
      filterForm.value = {
        gameAccountId: '',
        dateRange: [],
        recordType: 'current'
      }
      fetchStatistics()
    }

    // 修改获取统计数据的方法
    const fetchStatistics = async () => {
      try {
        loading.value = true
        const params = {
          gameAccountId: filterForm.value.gameAccountId,
          startDate: filterForm.value.dateRange[0],
          endDate: filterForm.value.dateRange[1],
          recordType: filterForm.value.recordType
        }
        const res = await getStatistics(params)
        if (res.code === 200) {
          statistics.value = res.data
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        ElMessage.error('获取统计数据失败')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchGameAccounts()
      fetchStatistics()
    })

    return {
      loading,
      statistics,
      overviewItems,
      itemLevelChartOption,
      dungeonUsageChartOption,
      dungeonIncomeChartOption,
      formatValue,
      gameAccounts,
      filterForm,
      handleFilter,
      handleReset,
      goldRate,
      formatRMB
    }
  }
})
</script>

<style scoped>
.statistics {
  height: 100%;
  overflow-y: auto;
}

.overview-card {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-rmb {
  font-size: 14px;
  color: #909399;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.echarts) {
  width: 100%;
  height: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.chart-header-info {
  display: flex;
  align-items: center;
}

.rmb-rate {
  font-size: 14px;
  color: #909399;
  margin-left: 12px;
}

:deep(.el-tooltip__trigger) {
  cursor: help;
}

.el-radio-group {
  margin-right: 16px;
}
</style> 