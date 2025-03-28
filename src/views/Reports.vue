<template>
  <div class="reports">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>报表管理</h3>
        </div>
      </template>
      <div class="card-content">
        <p>这里将显示报表数据...</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Reports'
})
</script>

<style scoped>
.reports {
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
</style> 