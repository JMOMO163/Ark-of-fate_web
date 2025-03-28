<template>
  <div class="default-layout">
    <el-container class="layout-container">
      <el-aside width="220px">
        <div class="logo">
          <h2>命运方舟统计</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/">
            <el-icon><el-icon-house /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><el-icon-data-line /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><el-icon-document /></el-icon>
            <span>报表管理</span>
          </el-menu-item>
          <el-menu-item index="/game-accounts">
            <el-icon><el-icon-user /></el-icon>
            <span>游戏账号</span>
          </el-menu-item>
          <el-menu-item index="/dungeons">
            <el-icon><el-icon-collection /></el-icon>
            <span>副本管理</span>
          </el-menu-item>
          <el-menu-item index="/characters">
            <el-icon><el-icon-user /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-left">
            <h2>{{ currentPageTitle }}</h2>
          </div>
          <div class="header-right">
            <template v-if="isLoggedIn">
              <el-dropdown trigger="click" @command="handleCommand">
                <div class="user-info">
                  <el-avatar :size="32" :src="userAvatar">{{ userInitials }}</el-avatar>
                  <span class="username">{{ username }}</span>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <el-button type="text" @click="showLoginDialog">未登录</el-button>
            </template>
          </div>
        </el-header>
        <el-main class="main-container">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 登录对话框 -->
    <login-dialog
      v-model:visible="loginDialogVisible"
      @login-success="handleLoginSuccess"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { 
  House as ElIconHouse, 
  DataLine as ElIconDataLine, 
  Document as ElIconDocument,
  User as ElIconUser,
  Collection as ElIconCollection
} from '@element-plus/icons-vue'
import LoginDialog from '@/components/LoginDialog.vue'

export default defineComponent({
  name: 'DefaultLayout',
  components: {
    ElIconHouse,
    ElIconDataLine,
    ElIconDocument,
    ElIconUser,
    ElIconCollection,
    LoginDialog
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const loginDialogVisible = ref(false)

    const isLoggedIn = computed(() => store.getters.isAuthenticated)
    const username = computed(() => {
      const user = store.state.user
      return user ? user.username : ''
    })
    const userAvatar = computed(() => {
      const user = store.state.user
      return user && user.avatar ? user.avatar : ''
    })
    const userInitials = computed(() => {
      const name = username.value
      return name ? name.charAt(0).toUpperCase() : '?'
    })

    const activeMenu = computed(() => route.path)
    const currentPageTitle = computed(() => {
      return route.meta.title || '首页'
    })

    const showLoginDialog = () => {
      loginDialogVisible.value = true
    }

    const handleLoginSuccess = () => {
      loginDialogVisible.value = false
      ElMessage.success('登录成功')
    }

    const handleCommand = (command: string) => {
      if (command === 'logout') {
        store.dispatch('logout')
        ElMessage.success('已退出登录')
        router.push('/')
      } else if (command === 'profile') {
        router.push('/profile')
      }
    }

    return {
      isLoggedIn,
      username,
      userAvatar,
      userInitials,
      activeMenu,
      currentPageTitle,
      loginDialogVisible,
      showLoginDialog,
      handleLoginSuccess,
      handleCommand
    }
  }
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #bfcbd9;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  background-color: #263445;
}

.el-menu-vertical {
  border-right: none;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e6e6e6;
  position: relative;
  z-index: 999;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.main-container {
  height: 100%;
}
</style> 