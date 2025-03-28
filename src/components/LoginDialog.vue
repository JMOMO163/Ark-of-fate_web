<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="400px"
    destroy-on-close
  >
    <!-- 登录表单 -->
    <el-form
      v-if="activeForm === 'login'"
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-width="80px"
    >
      <el-form-item label="账号" prop="account">
        <el-input v-model="loginForm.account" placeholder="请输入邮箱或手机号"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
        ></el-input>
      </el-form-item>
      <div class="form-actions">
        <el-button type="text" @click="switchForm('register')">注册账号</el-button>
        <el-button type="text" @click="switchForm('forgot')">忘记密码</el-button>
      </div>
    </el-form>

    <!-- 注册表单 -->
    <el-form
      v-if="activeForm === 'register'"
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="账号" prop="email">
        <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
        ></el-input>
      </el-form-item>
      <div class="form-actions">
        <el-button type="text" @click="switchForm('login')">返回登录</el-button>
      </div>
    </el-form>

    <!-- 忘记密码表单 -->
    <el-form
      v-if="activeForm === 'forgot'"
      ref="forgotFormRef"
      :model="forgotForm"
      :rules="forgotRules"
      label-width="80px"
    >
      <el-form-item label="账号" prop="email">
        <el-input v-model="forgotForm.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <div class="form-actions">
        <el-button type="text" @click="switchForm('login')">返回登录</el-button>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ submitButtonText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, FormInstance } from 'element-plus'
import { login, register, forgotPassword } from '@/api/auth'

export default defineComponent({
  name: 'LoginDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible', 'login-success'],
  setup(props, { emit }) {
    const store = useStore()
    const activeForm = ref('login')
    const loading = ref(false)
    
    // 表单引用
    const loginFormRef = ref<FormInstance>()
    const registerFormRef = ref<FormInstance>()
    const forgotFormRef = ref<FormInstance>()
    
    // 登录表单
    const loginForm = ref({
      account: '',
      password: ''
    })
    
    // 注册表单
    const registerForm = ref({
      username: '',
      email: '',
      password: ''
    })
    
    // 忘记密码表单
    const forgotForm = ref({
      email: ''
    })
    
    // 表单验证规则
    const loginRules = {
      account: [
        { required: true, message: '请输入账号', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
      ]
    }
    
    const registerRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
      ]
    }
    
    const forgotRules = {
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
      ]
    }
    
    // 计算属性
    const dialogVisible = computed({
      get: () => props.visible,
      set: (val) => emit('update:visible', val)
    })
    
    const dialogTitle = computed(() => {
      switch (activeForm.value) {
        case 'register':
          return '注册账号'
        case 'forgot':
          return '忘记密码'
        default:
          return '用户登录'
      }
    })
    
    const submitButtonText = computed(() => {
      switch (activeForm.value) {
        case 'register':
          return '注册'
        case 'forgot':
          return '重置密码'
        default:
          return '登录'
      }
    })
    
    // 方法
    const switchForm = (form: string) => {
      activeForm.value = form
    }
    
    const closeDialog = () => {
      dialogVisible.value = false
    }
    
    const handleSubmit = async () => {
      if (activeForm.value === 'login') {
        await submitLogin()
      } else if (activeForm.value === 'register') {
        await submitRegister()
      } else if (activeForm.value === 'forgot') {
        await submitForgotPassword()
      }
    }
    
    const submitLogin = async () => {
      if (!loginFormRef.value) return
      
      try {
        await loginFormRef.value.validate()
        loading.value = true
        
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.value.account)
        const loginData = {
          email: isEmail ? loginForm.value.account : '',
          phone: !isEmail ? loginForm.value.account : '',
          password: loginForm.value.password
        }
        
        const res = await login(loginData)
        
        if (res.code === 200) {
          store.dispatch('login', {
            token: res.data.token,
            user: res.data.user
          })
          emit('login-success')
          closeDialog()
          ElMessage.success('登录成功')
        }
      } catch (error: any) {
        console.error('登录失败:', error)
        ElMessage.error(error.response?.data?.message || error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
    
    const submitRegister = async () => {
      if (!registerFormRef.value) return
      
      await registerFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            loading.value = true
            const res = await register({
              username: registerForm.value.username,
              email: registerForm.value.email,
              password: registerForm.value.password
            })
            
            if (res.code === 200) {
              ElMessage.success('注册成功，请登录')
              switchForm('login')
            }
          } catch (error) {
            console.error('注册失败:', error)
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    const submitForgotPassword = async () => {
      if (!forgotFormRef.value) return
      
      await forgotFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            loading.value = true
            const res = await forgotPassword({
              email: forgotForm.value.email
            })
            
            if (res.code === 200) {
              ElMessage.success('密码已重置为123456，请登录')
              switchForm('login')
            }
          } catch (error) {
            console.error('重置密码失败:', error)
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    // 监听对话框关闭，重置表单
    watch(() => dialogVisible.value, (val) => {
      if (!val) {
        activeForm.value = 'login'
        loginForm.value = { account: '', password: '' }
        registerForm.value = { username: '', email: '', password: '' }
        forgotForm.value = { email: '' }
      }
    })
    
    return {
      activeForm,
      dialogVisible,
      dialogTitle,
      submitButtonText,
      loading,
      loginFormRef,
      registerFormRef,
      forgotFormRef,
      loginForm,
      registerForm,
      forgotForm,
      loginRules,
      registerRules,
      forgotRules,
      switchForm,
      closeDialog,
      handleSubmit
    }
  }
})
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style> 