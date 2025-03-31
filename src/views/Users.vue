<template>
  <div class="users">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>用户管理</h3>
        </div>
      </template>

      <div class="card-content">
        <el-table
          v-loading="loading"
          :data="users"
          style="width: 100%"
          border
        >
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.role === 'admin' ? 'success' : ''">
                {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="收益统计" width="300">
            <template #default="scope">
              <div class="income-stats">
                <el-tooltip effect="dark" placement="top">
                  <template #content>
                    记录数: {{ scope.row.stats?.recordCount || 0 }}<br>
                    总收益: {{ formatNumber(scope.row.stats?.totalIncome || 0) }}<br>
                    绑定金: {{ formatNumber(scope.row.stats?.boundIncome || 0) }}<br>
                    交易金: {{ formatNumber(scope.row.stats?.tradeableIncome || 0) }}
                  </template>
                  <div class="stats-preview">
                    <span class="count">[{{ scope.row.stats?.recordCount || 0 }}]</span>
                    <span class="total">{{ formatNumber(scope.row.stats?.totalIncome || 0) }}</span>
                    <span class="bound">({{ formatNumber(scope.row.stats?.boundIncome || 0) }})</span>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row._id !== currentUserId"
                size="small"
                :type="scope.row.role === 'admin' ? 'warning' : 'success'"
                @click="handleRoleToggle(scope.row)"
              >
                {{ scope.row.role === 'admin' ? '取消管理员' : '设为管理员' }}
              </el-button>
              <el-button
                v-if="scope.row._id !== currentUserId"
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, updateUserRole, deleteUser } from '@/api/user'
import type { UserData } from '@/api/user'
import { useStore } from 'vuex'
import { formatDate, formatNumber } from '@/utils/format.ts'

export default defineComponent({
  name: 'Users',
  setup() {
    const store = useStore()
    const loading = ref(false)
    const users = ref<UserData[]>([])
    
    const currentUserId = computed(() => store.state.user?._id)

    const fetchUsers = async () => {
      try {
        loading.value = true
        const res = await getUsers()
        users.value = res.data.users
      } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败')
      } finally {
        loading.value = false
      }
    }

    const handleRoleToggle = async (user: UserData) => {
      try {
        await ElMessageBox.confirm(
          `确定要${user.role === 'admin' ? '取消' : '设置'}该用户的管理员权限吗？`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const newRole = user.role === 'admin' ? 'user' : 'admin'
        await updateUserRole(user._id, newRole)
        ElMessage.success('更新成功')
        fetchUsers()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('更新用户角色失败:', error)
          ElMessage.error('更新用户角色失败')
        }
      }
    }

    const handleDelete = async (user: UserData) => {
      try {
        await ElMessageBox.confirm(
          '删除用户将同时删除该用户的所有数据，确定要继续吗？',
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'danger'
          }
        )

        await deleteUser(user._id)
        ElMessage.success('删除成功')
        fetchUsers()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('删除用户失败:', error)
          ElMessage.error('删除用户失败')
        }
      }
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      loading,
      users,
      currentUserId,
      handleRoleToggle,
      handleDelete,
      formatDate,
      formatNumber
    }
  }
})
</script>

<style scoped>
.users {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.income-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-preview {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stats-preview .count {
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
}

.stats-preview .total {
  font-weight: bold;
  color: #409EFF;
}

.stats-preview .bound {
  font-size: 12px;
  color: #909399;
}
</style> 