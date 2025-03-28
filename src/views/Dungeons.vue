<template>
  <div class="dungeons">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>副本管理</h3>
          <div class="header-buttons">
            <el-button type="success" @click="showCalculator">收益计算</el-button>
            <el-button type="primary" @click="handleAdd">添加副本</el-button>
          </div>
        </div>
      </template>

      <!-- 添加筛选表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="最低装等">
            <el-input
              v-model.number="searchForm.minItemLevel"
              placeholder="请输入装等"
              type="number"
              :min="0"
              style="width: 160px"
              @input="handleSearch"
            />
          </el-form-item>
          <el-form-item label="单人模式">
            <el-select
              v-model="searchForm.hasSoloMode"
              placeholder="请选择"
              clearable
              style="width: 120px"
              @change="handleSearch"
            >
              <el-option label="有" :value="true" />
              <el-option label="无" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="刷新间隔">
            <el-select
              v-model="searchForm.refreshInterval"
              placeholder="请选择"
              clearable
              style="width: 120px"
              @change="handleSearch"
            >
              <el-option label="1周" :value="1" />
              <el-option label="2周" :value="2" />
              <el-option label="4周" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="card-content">
        <el-table
          v-loading="loading"
          :data="filteredDungeons"
          style="width: 100%"
          border
        >
          <el-table-column prop="name" label="副本名称" min-width="120" />
          <el-table-column prop="itemLevel" label="装等" width="100" />
          <el-table-column prop="totalIncome" label="总收益" width="120">
            <template #default="scope">
              {{ formatNumber(scope.row.totalIncome) }}
            </template>
          </el-table-column>
          <el-table-column prop="boundGoldIncome" label="绑金收益" width="120">
            <template #default="scope">
              {{ formatNumber(scope.row.boundGoldIncome) }}
            </template>
          </el-table-column>
          <el-table-column prop="tradeableGoldIncome" label="交易金收益" width="120">
            <template #default="scope">
              {{ formatNumber(scope.row.tradeableGoldIncome) }}
            </template>
          </el-table-column>
          <el-table-column prop="hasEster" label="有无艾斯特" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.hasEster ? 'success' : 'info'">
                {{ scope.row.hasEster ? '有' : '无' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="hasSoloMode" label="有无单人" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.hasSoloMode ? 'success' : 'info'">
                {{ scope.row.hasSoloMode ? '有' : '无' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="soloIncome" label="单人收益" width="120">
            <template #default="scope">
              {{ scope.row.hasSoloMode ? formatNumber(scope.row.soloIncome) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="refreshInterval" label="刷新间隔" width="100">
            <template #default="scope">
              {{ scope.row.refreshInterval }} 周
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            background
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加副本' : '编辑副本'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="副本名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入副本名称" />
        </el-form-item>
        <el-form-item label="装等" prop="itemLevel">
          <el-input-number v-model="form.itemLevel" :min="0" placeholder="请输入装等" />
        </el-form-item>
        <el-form-item label="总收益" prop="totalIncome">
          <el-input-number v-model="form.totalIncome" :min="0" placeholder="请输入总收益" />
        </el-form-item>
        <el-form-item label="绑金收益" prop="boundGoldIncome">
          <el-input-number v-model="form.boundGoldIncome" :min="0" placeholder="请输入绑金收益" />
        </el-form-item>
        <el-form-item label="交易金收益" prop="tradeableGoldIncome">
          <el-input-number v-model="form.tradeableGoldIncome" :min="0" placeholder="请输入交易金收益" />
        </el-form-item>
        <el-form-item label="有无艾斯特" prop="hasEster">
          <el-switch v-model="form.hasEster" />
        </el-form-item>
        <el-form-item label="有无单人模式" prop="hasSoloMode">
          <el-switch v-model="form.hasSoloMode" />
        </el-form-item>
        <el-form-item 
          v-if="form.hasSoloMode" 
          label="单人收益" 
          prop="soloIncome"
        >
          <el-input-number v-model="form.soloIncome" :min="0" placeholder="请输入单人收益" />
        </el-form-item>
        <el-form-item label="刷新间隔(周)" prop="refreshInterval">
          <el-input-number v-model="form.refreshInterval" :min="1" placeholder="请输入刷新间隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加收益计算对话框 -->
    <el-dialog
      v-model="calculatorVisible"
      title="收益计算"
      width="600px"
    >
      <div class="calculator-content">
        <el-form>
          <el-form-item label="选择副本">
            <el-select
              v-model="selectedDungeonIds"
              multiple
              filterable
              placeholder="请选择副本"
              style="width: 100%"
              @change="calculateIncome"
            >
              <el-option
                v-for="dungeon in allDungeons"
                :key="dungeon._id"
                :label="`${dungeon.name} (装等${dungeon.itemLevel})`"
                :value="dungeon._id"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 收益统计结果 -->
        <div class="income-stats">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">总收益</div>
                <div class="stat-value">{{ formatNumber(calculatedIncome.total) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">绑金收益</div>
                <div class="stat-value">{{ formatNumber(calculatedIncome.bound) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">交易金收益</div>
                <div class="stat-value">{{ formatNumber(calculatedIncome.tradeable) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 选中的副本列表 -->
        <div class="selected-dungeons" v-if="selectedDungeonsList.length > 0">
          <h4>已选择的副本：</h4>
          <el-table :data="selectedDungeonsList" style="width: 100%" border>
            <el-table-column prop="name" label="副本名称" />
            <el-table-column prop="itemLevel" label="装等" width="100" />
            <el-table-column label="总收益" width="120">
              <template #default="scope">
                {{ formatNumber(scope.row.totalIncome) }}
              </template>
            </el-table-column>
            <el-table-column width="80">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click="removeDungeon(scope.row)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { 
  getDungeons,
  getAllDungeons,
  createDungeon,
  updateDungeon,
  deleteDungeon,
  DungeonData
} from '@/api/dungeon'
import { Delete } from '@element-plus/icons-vue'

interface Dungeon extends DungeonData {
  _id: string;
  createdAt: string;
}

export default defineComponent({
  name: 'Dungeons',
  components: {
    Delete
  },
  setup() {
    const loading = ref(false)
    const submitLoading = ref(false)
    const dungeons = ref<Dungeon[]>([])
    const allDungeons = ref<Dungeon[]>([])
    const dialogVisible = ref(false)
    const dialogType = ref<'add' | 'edit'>('add')
    const currentId = ref('')
    const formRef = ref<FormInstance>()
    
    const form = reactive<DungeonData>({
      name: '',
      itemLevel: 0,
      totalIncome: 0,
      boundGoldIncome: 0,
      tradeableGoldIncome: 0,
      hasEster: false,
      hasSoloMode: false,
      soloIncome: 0,
      refreshInterval: 1
    })
    
    // 监听单人模式变化，如果没有单人模式，则重置单人收益
    watch(() => form.hasSoloMode, (newVal) => {
      if (!newVal) {
        form.soloIncome = 0
      }
    })
    
    const rules = {
      name: [
        { required: true, message: '请输入副本名称', trigger: 'blur' }
      ],
      itemLevel: [
        { required: true, message: '请输入装等', trigger: 'blur' }
      ],
      totalIncome: [
        { required: true, message: '请输入总收益', trigger: 'blur' }
      ],
      boundGoldIncome: [
        { required: true, message: '请输入绑金收益', trigger: 'blur' }
      ],
      tradeableGoldIncome: [
        { required: true, message: '请输入交易金收益', trigger: 'blur' }
      ],
      soloIncome: [
        { 
          required: true, 
          message: '请输入单人收益', 
          trigger: 'blur',
          validator: (rule, value, callback) => {
            if (form.hasSoloMode && (value === undefined || value === null)) {
              callback(new Error('请输入单人收益'))
            } else {
              callback()
            }
          }
        }
      ],
      refreshInterval: [
        { required: true, message: '请输入刷新间隔', trigger: 'blur' }
      ]
    }
    
    // 添加分页相关的响应式变量
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    // 获取副本列表
    const fetchDungeons = async () => {
      try {
        loading.value = true
        const res = await getDungeons({
          page: currentPage.value,
          limit: pageSize.value
        })
        
        if (res.code === 200) {
          dungeons.value = res.data.dungeons
          total.value = res.data.total
        }
      } catch (error) {
        console.error('获取副本列表失败:', error)
        ElMessage.error('获取副本列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 格式化数字
    const formatNumber = (num: number) => {
      return num.toLocaleString()
    }
    
    // 添加副本
    const handleAdd = () => {
      dialogType.value = 'add'
      currentId.value = ''
      form.name = ''
      form.itemLevel = 0
      form.totalIncome = 0
      form.boundGoldIncome = 0
      form.tradeableGoldIncome = 0
      form.hasEster = false
      form.hasSoloMode = false
      form.soloIncome = 0
      form.refreshInterval = 1
      dialogVisible.value = true
    }
    
    // 编辑副本
    const handleEdit = (row: Dungeon) => {
      dialogType.value = 'edit'
      currentId.value = row._id
      form.name = row.name
      form.itemLevel = row.itemLevel
      form.totalIncome = row.totalIncome
      form.boundGoldIncome = row.boundGoldIncome
      form.tradeableGoldIncome = row.tradeableGoldIncome
      form.hasEster = row.hasEster
      form.hasSoloMode = row.hasSoloMode || false
      form.soloIncome = row.soloIncome || 0
      form.refreshInterval = row.refreshInterval
      dialogVisible.value = true
    }
    
    // 删除副本
    const handleDelete = (row: Dungeon) => {
      ElMessageBox.confirm(
        `确定要删除副本 ${row.name} 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          const res = await deleteDungeon(row._id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchDungeons()
          }
        } catch (error) {
          console.error('删除副本失败:', error)
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            submitLoading.value = true
            
            if (dialogType.value === 'add') {
              // 添加副本
              const res = await createDungeon({
                name: form.name,
                itemLevel: form.itemLevel,
                totalIncome: form.totalIncome,
                boundGoldIncome: form.boundGoldIncome,
                tradeableGoldIncome: form.tradeableGoldIncome,
                hasEster: form.hasEster,
                hasSoloMode: form.hasSoloMode,
                soloIncome: form.hasSoloMode ? form.soloIncome : 0,
                refreshInterval: form.refreshInterval
              })
              
              if (res.code === 200) {
                ElMessage.success('添加成功')
                dialogVisible.value = false
                fetchDungeons()
              }
            } else {
              // 编辑副本
              const res = await updateDungeon(currentId.value, {
                name: form.name,
                itemLevel: form.itemLevel,
                totalIncome: form.totalIncome,
                boundGoldIncome: form.boundGoldIncome,
                tradeableGoldIncome: form.tradeableGoldIncome,
                hasEster: form.hasEster,
                hasSoloMode: form.hasSoloMode,
                soloIncome: form.hasSoloMode ? form.soloIncome : 0,
                refreshInterval: form.refreshInterval
              })
              
              if (res.code === 200) {
                ElMessage.success('更新成功')
                dialogVisible.value = false
                fetchDungeons()
              }
            }
          } catch (error) {
            console.error('提交副本失败:', error)
          } finally {
            submitLoading.value = false
          }
        }
      })
    }
    
    // 添加搜索表单
    const searchForm = ref({
      minItemLevel: null as number | null,
      hasSoloMode: null as boolean | null,
      refreshInterval: null as number | null
    })

    // 过滤后的副本列表
    const filteredDungeons = computed(() => {
      let result = dungeons.value

      // 按装等筛选
      if (searchForm.value.minItemLevel) {
        result = result.filter(dungeon => 
          dungeon.itemLevel >= searchForm.value.minItemLevel!
        )
      }

      // 按单人模式筛选
      if (searchForm.value.hasSoloMode !== null) {
        result = result.filter(dungeon => 
          dungeon.hasSoloMode === searchForm.value.hasSoloMode
        )
      }

      // 按刷新间隔筛选
      if (searchForm.value.refreshInterval) {
        result = result.filter(dungeon => 
          dungeon.refreshInterval === searchForm.value.refreshInterval
        )
      }

      return result
    })

    // 搜索处理
    const handleSearch = () => {
      // 验证装等输入
      if (searchForm.value.minItemLevel !== null && searchForm.value.minItemLevel < 0) {
        ElMessage.warning('装等不能小于0')
        searchForm.value.minItemLevel = 0
      }
    }

    // 重置搜索条件
    const handleReset = () => {
      searchForm.value = {
        minItemLevel: null,
        hasSoloMode: null,
        refreshInterval: null
      }
    }

    // 处理每页显示数量变化
    const handleSizeChange = (val: number) => {
      pageSize.value = val
      currentPage.value = 1 // 重置到第一页
      fetchDungeons()
    }

    // 处理页码变化
    const handleCurrentChange = (val: number) => {
      currentPage.value = val
      fetchDungeons()
    }

    // 监听搜索条件变化，重置分页
    watch([() => searchForm.value.minItemLevel, 
           () => searchForm.value.hasSoloMode, 
           () => searchForm.value.refreshInterval], 
    () => {
      currentPage.value = 1
      fetchDungeons()
    })
    
    // 收益计算相关
    const calculatorVisible = ref(false)
    const selectedDungeonIds = ref<string[]>([])
    const calculatedIncome = reactive({
      total: 0,
      bound: 0,
      tradeable: 0
    })

    // 计算选中的副本列表
    const selectedDungeonsList = computed(() => {
      return selectedDungeonIds.value.map(id => 
        allDungeons.value.find(d => d._id === id)
      ).filter(Boolean)
    })

    // 获取所有副本（用于收益计算）
    const fetchAllDungeons = async () => {
      try {
        const res = await getAllDungeons()
        if (res.code === 200) {
          allDungeons.value = res.data.dungeons
        }
      } catch (error) {
        console.error('获取所有副本列表失败:', error)
        ElMessage.error('获取所有副本列表失败')
      }
    }

    // 显示计算器
    const showCalculator = async () => {
      await fetchAllDungeons() // 获取所有副本数据
      calculatorVisible.value = true
      selectedDungeonIds.value = []
      calculateIncome()
    }

    // 计算收益
    const calculateIncome = () => {
      let total = 0
      let bound = 0
      let tradeable = 0

      selectedDungeonsList.value.forEach(dungeon => {
        total += dungeon.totalIncome
        bound += dungeon.boundGoldIncome
        tradeable += dungeon.tradeableGoldIncome
      })

      calculatedIncome.total = total
      calculatedIncome.bound = bound
      calculatedIncome.tradeable = tradeable
    }

    // 移除选中的副本
    const removeDungeon = (dungeon: Dungeon) => {
      const index = selectedDungeonIds.value.indexOf(dungeon._id)
      if (index !== -1) {
        selectedDungeonIds.value.splice(index, 1)
        calculateIncome()
      }
    }
    
    onMounted(() => {
      fetchDungeons()
    })
    
    return {
      loading,
      submitLoading,
      dungeons,
      allDungeons,
      dialogVisible,
      dialogType,
      formRef,
      form,
      rules,
      formatNumber,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      searchForm,
      filteredDungeons,
      handleSearch,
      handleReset,
      currentPage,
      pageSize,
      total,
      handleSizeChange,
      handleCurrentChange,
      calculatorVisible,
      selectedDungeonIds,
      selectedDungeonsList,
      calculatedIncome,
      showCalculator,
      calculateIncome,
      removeDungeon
    }
  }
})
</script>

<style scoped>
.dungeons {
  height: 100%;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.search-form {
  margin-bottom: 20px;
  padding: 18px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.search-form :deep(.el-form-item__label) {
  font-weight: normal;
}

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select) {
  width: 100%;
}

.table-content {
  margin-top: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.calculator-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.income-stats {
  margin: 20px 0;
}

.stat-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.selected-dungeons {
  margin-top: 20px;
}

.selected-dungeons h4 {
  margin-bottom: 10px;
  color: #606266;
}
</style> 