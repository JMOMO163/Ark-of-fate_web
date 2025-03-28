<template>
  <div class="game-accounts">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>游戏账号管理</h3>
          <el-button type="primary" @click="handleAdd">添加账号</el-button>
        </div>
      </template>
      <div class="card-content">
        <el-table
          v-loading="loading"
          :data="gameAccounts"
          style="width: 100%"
          border
        >
          <el-table-column prop="_id" label="ID" width="220" />
          <el-table-column prop="accountNumber" label="游戏账号" width="180" />
          <el-table-column prop="accountName" label="账号名称" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
            <template #default="scope">
              <el-button
                size="small"
                type="info"
                @click="handleViewDetails(scope.row)"
              >
                查看详情
              </el-button>
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
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加游戏账号' : '编辑游戏账号'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="游戏账号" prop="accountNumber">
          <el-input v-model="form.accountNumber" placeholder="请输入游戏账号" />
        </el-form-item>
        <el-form-item label="账号名称" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入账号名称" />
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

    <!-- 添加账号详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      :title="`账号详情 - ${currentAccount?.accountNumber || ''}`"
      width="800px"
    >
      <div v-if="currentAccount" class="account-details">
        <!-- 基本信息 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h4>基本信息</h4>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="游戏账号">{{ currentAccount.accountNumber }}</el-descriptions-item>
            <el-descriptions-item label="账号名称">{{ currentAccount.accountName }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 收益统计 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h4>收益统计</h4>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">总收益</div>
                <div class="stat-value">{{ formatNumber(accountStats.totalIncome) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">绑金收益</div>
                <div class="stat-value">{{ formatNumber(accountStats.boundIncome) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">交易金收益</div>
                <div class="stat-value">{{ formatNumber(accountStats.tradeableIncome) }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- 角色列表 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h4>角色列表</h4>
            </div>
          </template>
          <el-table
            v-loading="statsLoading"
            :data="accountStats.characters"
            style="width: 100%"
            border
          >
            <el-table-column prop="characterName" label="角色名称" min-width="120" />
            <el-table-column prop="profession" label="职业" width="100" />
            <el-table-column prop="itemLevel" label="装等" width="100" sortable />
            <el-table-column label="副本情况" min-width="300">
              <template #default="scope">
                <div class="dungeon-tags">
                  <el-tag
                    v-for="(dungeon, index) in scope.row.dungeonDetails"
                    :key="index"
                    :type="getDungeonTagType(dungeon)"
                    :effect="dungeon.hasReward ? 'dark' : 'plain'"
                    class="dungeon-tag"
                    :class="{
                      'has-reward': dungeon.hasReward,
                      'no-reward': !dungeon.hasReward
                    }"
                  >
                    {{ dungeon.dungeonName }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="总收益" width="120" sortable>
              <template #default="scope">
                {{ formatNumber(scope.row.totalIncome) }}
              </template>
            </el-table-column>
            <el-table-column label="绑金" width="120" sortable>
              <template #default="scope">
                {{ formatNumber(scope.row.boundIncome) }}
              </template>
            </el-table-column>
            <el-table-column label="交易金" width="120" sortable>
              <template #default="scope">
                {{ formatNumber(scope.row.tradeableIncome) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { 
  getGameAccounts, 
  createGameAccount, 
  updateGameAccount, 
  deleteGameAccount,
  getGameAccountStats
} from '@/api/gameAccount'

interface GameAccount {
  _id: string;
  accountNumber: string;
  accountName: string;
  createdAt: string;
}

export default defineComponent({
  name: 'GameAccounts',
  setup() {
    const loading = ref(false)
    const submitLoading = ref(false)
    const gameAccounts = ref<GameAccount[]>([])
    const dialogVisible = ref(false)
    const dialogType = ref<'add' | 'edit'>('add')
    const currentId = ref('')
    const formRef = ref<FormInstance>()
    const detailsDialogVisible = ref(false)
    const currentAccount = ref<GameAccount | null>(null)
    const statsLoading = ref(false)
    const accountStats = reactive({
      totalIncome: 0,
      boundIncome: 0,
      tradeableIncome: 0,
      recordCount: 0,
      characterCount: 0,
      characters: []
    })
    
    const form = reactive({
      accountNumber: '',
      accountName: ''
    })
    
    const rules = {
      accountNumber: [
        { required: true, message: '请输入游戏账号', trigger: 'blur' }
      ],
      accountName: [
        { required: true, message: '请输入账号名称', trigger: 'blur' }
      ]
    }
    
    // 获取游戏账号列表
    const fetchGameAccounts = async () => {
      try {
        loading.value = true
        const res = await getGameAccounts()
        if (res.code === 200) {
          gameAccounts.value = res.data.gameAccounts
        }
      } catch (error) {
        console.error('获取游戏账号列表失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 格式化日期
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleString()
    }
    
    // 添加游戏账号
    const handleAdd = () => {
      dialogType.value = 'add'
      currentId.value = ''
      form.accountNumber = ''
      form.accountName = ''
      dialogVisible.value = true
    }
    
    // 编辑游戏账号
    const handleEdit = (row: GameAccount) => {
      dialogType.value = 'edit'
      currentId.value = row._id
      form.accountNumber = row.accountNumber
      form.accountName = row.accountName
      dialogVisible.value = true
    }
    
    // 删除游戏账号
    const handleDelete = (row: GameAccount) => {
      ElMessageBox.confirm(
        `确定要删除游戏账号 ${row.accountNumber} 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          const res = await deleteGameAccount(row._id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchGameAccounts()
          }
        } catch (error) {
          console.error('删除游戏账号失败:', error)
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
              // 添加游戏账号
              const res = await createGameAccount({
                accountNumber: form.accountNumber,
                accountName: form.accountName
              })
              
              if (res.code === 200) {
                ElMessage.success('添加成功')
                dialogVisible.value = false
                fetchGameAccounts()
              }
            } else {
              // 编辑游戏账号
              const res = await updateGameAccount(currentId.value, {
                accountNumber: form.accountNumber,
                accountName: form.accountName
              })
              
              if (res.code === 200) {
                ElMessage.success('更新成功')
                dialogVisible.value = false
                fetchGameAccounts()
              }
            }
          } catch (error) {
            console.error('提交游戏账号失败:', error)
          } finally {
            submitLoading.value = false
          }
        }
      })
    }
    
    // 查看账号详情
    const handleViewDetails = async (row: GameAccount) => {
      currentAccount.value = row
      detailsDialogVisible.value = true
      await fetchAccountStats(row._id)
    }
    
    // 获取账号统计数据
    const fetchAccountStats = async (accountId: string) => {
      try {
        statsLoading.value = true
        const res = await getGameAccountStats(accountId)
        if (res.code === 200) {
          Object.assign(accountStats, res.data)
        }
      } catch (error) {
        console.error('获取账号统计失败:', error)
      } finally {
        statsLoading.value = false
      }
    }
    
    // 格式化数字
    const formatNumber = (num: number) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    
    // 获取副本标签类型
    const getDungeonTagType = (dungeon: any) => {
      if (dungeon.isCompleted) {
        return 'success'
      } else {
        return 'danger'
      }
    }
    
    onMounted(() => {
      fetchGameAccounts()
    })
    
    return {
      loading,
      submitLoading,
      gameAccounts,
      dialogVisible,
      dialogType,
      formRef,
      form,
      rules,
      formatDate,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      detailsDialogVisible,
      currentAccount,
      statsLoading,
      accountStats,
      handleViewDetails,
      formatNumber,
      getDungeonTagType
    }
  }
})
</script>

<style scoped>
.game-accounts {
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

.account-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.stat-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
  height: 100%;
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

.dungeon-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dungeon-tag {
  margin: 2px;
}

.dungeon-tag.has-reward {
  border: 1px solid #67c23a;
}

.dungeon-tag.no-reward {
  border: 1px solid #dcdfe6;
  background-color: #f4f4f5;
}

:deep(.el-tag.el-tag--plain) {
  background-color: #f4f4f5;
  border: 1px solid #dcdfe6;
  color: #909399;
}

:deep(.el-tag.el-tag--plain.has-reward) {
  background-color: var(--el-tag-bg-color);
  border: 1px solid #67c23a;
  color: var(--el-tag-text-color);
}

:deep(.el-tag.el-tag--plain.no-reward) {
  background-color: #f4f4f5;
  border: 1px solid #dcdfe6;
  color: #909399;
}
</style> 