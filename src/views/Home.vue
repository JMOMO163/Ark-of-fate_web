<template>
  <div class="home">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <h3>欢迎使用命运方舟统计系统</h3>
        </div>
      </template>
      <div class="card-content">
        <p>这是一个数据统计和分析平台，帮助您更好地了解和管理数据。</p>
        <div class="quick-actions">
          <el-button type="primary" @click="goToStatistics">查看统计数据</el-button>
          <el-button @click="goToReports">查看报表</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'Home',
  setup() {
    const router = useRouter()
    
    const goToStatistics = () => {
      router.push('/statistics')
    }
    
    const goToReports = () => {
      router.push('/reports')
    }
    
    return {
      goToStatistics,
      goToReports
    }
  }
})
</script>

<style scoped>
.home {
  padding: 20px;
}

.welcome-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  padding: 20px 0;
}

.quick-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style> 