<template>
  <div class="profile">
    <el-row :gutter="20" v-loading="loading">
      <!-- 基本信息卡片 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>基本信息</h3>
              <div class="header-actions">
                <el-button 
                  type="warning" 
                  @click="handleWeeklyReset"
                  :loading="resetting"
                >周重置</el-button>
                <el-button type="primary" @click="handleEdit">编辑</el-button>
              </div>
            </div>
          </template>
          <el-form label-width="100px">
            <el-form-item label="用户名">
              <span>{{ user?.username }}</span>
            </el-form-item>
            <el-form-item label="邮箱">
              <span>{{ user?.email }}</span>
            </el-form-item>
            <el-form-item label="角色">
              <el-tag>{{ user?.role }}</el-tag>
            </el-form-item>
            <el-form-item label="金价比例">
              <span>1 RMB = {{ user?.goldRate || 1500 }} 金</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 修改密码卡片 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>修改密码</h3>
            </div>
          </template>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdatePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑个人信息"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="金价比例" prop="goldRate">
          <el-input-number
            v-model="form.goldRate"
            :min="1"
            :step="100"
            controls-position="right"
          />
          <span class="gold-rate-hint">1 RMB = {{ form.goldRate }} 金</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateProfile">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { updatePassword, updateProfile, getInfo, weeklyReset } from '@/api/auth'

export default defineComponent({
  name: 'Profile',
  setup() {
    const store = useStore()
    const user = computed(() => store.state.user)
    const loading = ref(false)
    const resetting = ref(false)
    
    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        loading.value = true
        const res = await getInfo()
        if (res.code === 200) {
          store.commit('setUser', res.data)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 修改密码表单
    const passwordFormRef = ref<FormInstance>()
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 编辑表单
    const formRef = ref<FormInstance>()
    const dialogVisible = ref(false)
    const form = ref({
      username: '',
      goldRate: 1500
    })

    // 表单校验规则
    const passwordRules = {
      currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule: any, value: string, callback: Function) => {
            if (value !== passwordForm.value.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
    }

    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
      ],
      goldRate: [
        { required: true, message: '请输入金价比例', trigger: 'blur' },
        { type: 'number', min: 1, message: '金价比例不能小于1', trigger: 'blur' }
      ]
    }

    // 处理编辑
    const handleEdit = () => {
      form.value = {
        username: user.value?.username || '',
        goldRate: user.value?.goldRate || 1500
      }
      dialogVisible.value = true
    }

    // 处理更新个人信息
    const handleUpdateProfile = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const res = await updateProfile(form.value)
            if (res.code === 200) {
              ElMessage.success('更新成功')
              store.commit('setUser', res.data)
              dialogVisible.value = false
            }
          } catch (error) {
            console.error('更新个人信息失败:', error)
          }
        }
      })
    }

    // 处理修改密码
    const handleUpdatePassword = async () => {
      if (!passwordFormRef.value) return

      await passwordFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const res = await updatePassword({
              currentPassword: passwordForm.value.currentPassword,
              newPassword: passwordForm.value.newPassword
            })
            if (res.code === 200) {
              ElMessage.success('密码修改成功')
              passwordForm.value = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              }
            }
          } catch (error) {
            console.error('修改密码失败:', error)
          }
        }
      })
    }

    // 处理周重置
    const handleWeeklyReset = async () => {
      try {
        await ElMessageBox.confirm(
          '周重置将把所有副本记录转移到历史记录中，确定要执行吗？',
          '周重置确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        resetting.value = true
        const res = await weeklyReset()
        if (res.code === 200) {
          ElMessage.success(`周重置成功，已转移 ${res.data.count} 条记录`)
        }
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('周重置失败:', error)
          ElMessage.error('周重置失败')
        }
      } finally {
        resetting.value = false
      }
    }

    onMounted(() => {
      fetchUserInfo()
    })

    return {
      user,
      loading,
      passwordFormRef,
      passwordForm,
      passwordRules,
      formRef,
      form,
      rules,
      dialogVisible,
      handleEdit,
      handleUpdateProfile,
      handleUpdatePassword,
      resetting,
      handleWeeklyReset
    }
  }
})
</script>

<style scoped>
.profile {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gold-rate-hint {
  margin-left: 10px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 12px;
}
</style> 