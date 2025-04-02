<template>
  <div class="characters">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>角色管理</h3>
          <el-button type="primary" @click="handleAdd">添加角色</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="游戏账号">
            <el-select 
              v-model="searchForm.gameAccount" 
              placeholder="选择游戏账号"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="account in gameAccounts"
                :key="account._id"
                :label="`${account.accountNumber} (${account.accountName})`"
                :value="account._id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="最低装等">
            <el-input
              v-model="searchForm.minItemLevel"
              placeholder="请输入最低装等"
              style="width: 160px"
              @input="handleMinItemLevelInput"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 角色列表 -->
      <div class="table-content">
        <el-table
          v-loading="loading"
          :data="characters"
          style="width: 100%"
          border
        >
          <el-table-column prop="name" label="角色名称" min-width="120" />
          <el-table-column prop="itemLevel" label="装等" width="100" />
          <el-table-column label="游戏账号" width="200">
            <template #default="scope">
              {{ scope.row.gameAccount.accountNumber }}
              ({{ scope.row.gameAccount.accountName }})
            </template>
          </el-table-column>
          <el-table-column prop="profession" label="职业" width="120" />
          <el-table-column label="装备等级" width="400">
            <template #default="scope">
              <el-tooltip effect="dark" placement="top">
                <template #content>
                  头盔: {{ scope.row.equipmentLevels.helmet }}<br>
                  肩部: {{ scope.row.equipmentLevels.shoulder }}<br>
                  上装: {{ scope.row.equipmentLevels.chest }}<br>
                  下装: {{ scope.row.equipmentLevels.pants }}<br>
                  手套: {{ scope.row.equipmentLevels.gloves }}<br>
                  武器: {{ scope.row.equipmentLevels.weapon }}
                </template>
                <div class="equipment-levels">
                  <span>{{ scope.row.equipmentLevels.helmet }}</span>
                  <span>{{ scope.row.equipmentLevels.shoulder }}</span>
                  <span>{{ scope.row.equipmentLevels.chest }}</span>
                  <span>{{ scope.row.equipmentLevels.pants }}</span>
                  <span>{{ scope.row.equipmentLevels.gloves }}</span>
                  <span>{{ scope.row.equipmentLevels.weapon }}</span>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="340" fixed="right">
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
                type="success"
                @click="handleAddRecord(scope.row)"
              >
                添加记录
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
      :title="dialogType === 'add' ? '添加角色' : '编辑角色'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="游戏账号" prop="gameAccount">
          <el-select 
            v-model="form.gameAccount" 
            placeholder="请选择游戏账号"
          >
            <el-option
              v-for="account in gameAccounts"
              :key="account._id"
              :label="`${account.accountNumber} (${account.accountName})`"
              :value="account._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职业" prop="profession">
          <el-input v-model="form.profession" placeholder="请输入职业" />
        </el-form-item>
        <el-form-item label="装等" prop="itemLevel">
          <el-input-number v-model="form.itemLevel" :min="0" placeholder="请输入装等" />
        </el-form-item>
        <el-form-item label="头盔等级" prop="equipmentLevels.helmet">
          <el-input-number v-model="form.equipmentLevels.helmet" :min="0" placeholder="请输入头盔等级" />
        </el-form-item>
        <el-form-item label="肩部等级" prop="equipmentLevels.shoulder">
          <el-input-number v-model="form.equipmentLevels.shoulder" :min="0" placeholder="请输入肩部等级" />
        </el-form-item>
        <el-form-item label="上装等级" prop="equipmentLevels.chest">
          <el-input-number v-model="form.equipmentLevels.chest" :min="0" placeholder="请输入上装等级" />
        </el-form-item>
        <el-form-item label="下装等级" prop="equipmentLevels.pants">
          <el-input-number v-model="form.equipmentLevels.pants" :min="0" placeholder="请输入下装等级" />
        </el-form-item>
        <el-form-item label="手套等级" prop="equipmentLevels.gloves">
          <el-input-number v-model="form.equipmentLevels.gloves" :min="0" placeholder="请输入手套等级" />
        </el-form-item>
        <el-form-item label="武器等级" prop="equipmentLevels.weapon">
          <el-input-number v-model="form.equipmentLevels.weapon" :min="0" placeholder="请输入武器等级" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            :loading="submitLoading"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加副本记录对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      title="添加副本记录"
      width="800px"
    >
      <el-form
        ref="recordFormRef"
        :model="recordForm"
        :rules="recordRules"
        label-width="120px"
      >
        <el-form-item label="角色">
          <el-input v-model="currentCharacter.name" disabled />
        </el-form-item>
        
        <!-- 将下拉选择框改为transfer组件实现多选 -->
        <el-form-item label="选择副本" prop="dungeonIds">
          <el-transfer
            v-model="recordForm.dungeonIds"
            :data="dungeonTransferData"
            :titles="['可选副本', '已选副本']"
            :button-texts="['移除', '添加']"
            filterable
            :filter-method="filterDungeonMethod"
            filter-placeholder="请输入副本名称搜索"
          >
            <template #default="{ option }">
              <div>{{ option.label }} (装等: {{ option.itemLevel }})</div>
            </template>
          </el-transfer>
        </el-form-item>
        
        <!-- 公共设置区域 -->
        <el-divider content-position="center">公共设置</el-divider>
        <el-form-item label="单人模式">
          <el-switch v-model="recordForm.isSolo" />
        </el-form-item>
        <el-form-item label="已完成">
          <el-switch v-model="recordForm.isCompleted" />
        </el-form-item>
        <el-form-item v-if="!recordForm.isCompleted" label="进度">
          <el-input v-model="recordForm.progress" placeholder="例如：2/3" />
        </el-form-item>
        <el-form-item label="获得奖励">
          <el-switch v-model="recordForm.hasReward" />
        </el-form-item>
        <el-form-item label="获得艾斯特">
          <el-switch v-model="recordForm.hasEster" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recordDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmitRecord">
            {{ recordForm.dungeonIds.length > 1 ? `添加 ${recordForm.dungeonIds.length} 条记录` : '添加记录' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加角色详情对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      :title="`角色详情 - ${currentCharacter?.name || ''}`"
      width="800px"
    >
      <div v-if="currentCharacter" class="character-details">
        <!-- 基本信息 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h4>基本信息</h4>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="角色名称">{{ currentCharacter.name }}</el-descriptions-item>
            <el-descriptions-item label="装等">{{ currentCharacter.itemLevel }}</el-descriptions-item>
            <el-descriptions-item label="职业">{{ currentCharacter.profession }}</el-descriptions-item>
            <el-descriptions-item label="游戏账号">
              {{ currentCharacter.gameAccount.accountNumber }} ({{ currentCharacter.gameAccount.accountName }})
            </el-descriptions-item>
          </el-descriptions>
          
          <h4 class="equipment-title">装备等级</h4>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="头盔">{{ currentCharacter.equipmentLevels.helmet }}</el-descriptions-item>
            <el-descriptions-item label="肩部">{{ currentCharacter.equipmentLevels.shoulder }}</el-descriptions-item>
            <el-descriptions-item label="上装">{{ currentCharacter.equipmentLevels.chest }}</el-descriptions-item>
            <el-descriptions-item label="下装">{{ currentCharacter.equipmentLevels.pants }}</el-descriptions-item>
            <el-descriptions-item label="手套">{{ currentCharacter.equipmentLevels.gloves }}</el-descriptions-item>
            <el-descriptions-item label="武器">{{ currentCharacter.equipmentLevels.weapon }}</el-descriptions-item>
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
                <div class="stat-value">{{ formatNumber(recordStats.totalIncome) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">绑金收益</div>
                <div class="stat-value">{{ formatNumber(recordStats.boundIncome) }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-card">
                <div class="stat-title">交易金收益</div>
                <div class="stat-value">{{ formatNumber(recordStats.tradeableIncome) }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <!-- 副本记录 -->
        <el-card class="detail-card">
          <template #header>
            <div class="card-header">
              <h4>副本记录</h4>
            </div>
          </template>
          <el-table
            v-loading="recordsLoading"
            :data="dungeonRecords"
            style="width: 100%"
            border
          >
            <el-table-column prop="dungeon.name" label="副本名称" min-width="120" />
            <el-table-column label="模式" width="80">
              <template #default="scope">
                {{ scope.row.isSolo ? '单人' : '多人' }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.isCompleted ? 'success' : 'warning'">
                  {{ scope.row.isCompleted ? '已通关' : '进行中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" min-width="120">
              <template #default="scope">
                {{ scope.row.isCompleted ? '已通关' : scope.row.progress }}
              </template>
            </el-table-column>
            <el-table-column label="收益" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.hasReward ? 'success' : 'info'">
                  {{ scope.row.hasReward ? '已获得' : '未获得' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="艾斯特" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.hasEster ? 'success' : 'info'">
                  {{ scope.row.hasEster ? '有' : '无' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="总收益" width="100">
              <template #default="scope">
                {{ scope.row.hasReward ? formatNumber(scope.row.rewards.total) : '0' }}
              </template>
            </el-table-column>
            <el-table-column label="绑金" width="100">
              <template #default="scope">
                {{ scope.row.hasReward ? formatNumber(scope.row.rewards.bound) : '0' }}
              </template>
            </el-table-column>
            <el-table-column label="交易金" width="100">
              <template #default="scope">
                {{ scope.row.hasReward ? formatNumber(scope.row.rewards.tradeable) : '0' }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="记录时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click="handleEditRecord(scope.row)">修改</el-button>
                <el-button size="small" type="danger" @click="handleDeleteRecord(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-dialog>

    <!-- 添加修改记录对话框 -->
    <el-dialog
      v-model="editRecordDialogVisible"
      title="修改副本记录"
      width="600px"
    >
      <el-form
        ref="editRecordFormRef"
        :model="editRecordForm"
        :rules="recordRules"
        label-width="120px"
      >
        <el-form-item label="角色">
          <el-input v-model="currentCharacter.name" disabled />
        </el-form-item>
        <el-form-item label="副本">
          <el-input v-model="editRecordForm.dungeonName" disabled />
        </el-form-item>
        <el-form-item label="单人模式">
          <el-switch v-model="editRecordForm.isSolo" />
        </el-form-item>
        <el-form-item label="已完成">
          <el-switch v-model="editRecordForm.isCompleted" />
        </el-form-item>
        <el-form-item v-if="!editRecordForm.isCompleted" label="进度">
          <el-input v-model="editRecordForm.progress" placeholder="例如：2/3" />
        </el-form-item>
        <el-form-item label="获得奖励">
          <el-switch v-model="editRecordForm.hasReward" />
        </el-form-item>
        <el-form-item label="获得艾斯特">
          <el-switch v-model="editRecordForm.hasEster" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editRecordDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmitEditRecord">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { 
  getCharacters, 
  createCharacter, 
  updateCharacter, 
  deleteCharacter,
  CharacterData 
} from '@/api/character'
import { getGameAccounts } from '@/api/gameAccount'
import { getAllDungeons } from '@/api/statistics'
import type { GameAccountData } from '@/api/gameAccount'
import type { DungeonData } from '@/api/statistics'
import { 
  getDungeonRecords, 
  createDungeonRecord, 
  getCompletedDungeons,
  updateDungeonRecord,
  deleteDungeonRecord
} from '@/api/dungeonRecord'

export default defineComponent({
  name: 'Characters',
  setup() {
    const loading = ref(false)
    const submitLoading = ref(false)
    const dialogVisible = ref(false)
    const dialogType = ref<'add' | 'edit'>('add')
    const currentId = ref('')
    const characters = ref<CharacterData[]>([])
    const gameAccounts = ref<GameAccountData[]>([])
    const formRef = ref<FormInstance>()

    const recordDialogVisible = ref(false)
    const recordFormRef = ref<FormInstance>()
    const currentCharacter = ref<CharacterData | null>(null)
    const dungeons = ref<DungeonData[]>([])
    const completedDungeons = ref<string[]>([])

    // 搜索表单
    const searchForm = reactive({
      gameAccount: '',
      minItemLevel: undefined as number | undefined
    })

    // 表单数据
    const form = reactive({
      name: '',
      gameAccount: '',
      profession: '',
      itemLevel: 0,
      equipmentLevels: {
        helmet: 0,
        shoulder: 0,
        chest: 0,
        pants: 0,
        gloves: 0,
        weapon: 0
      }
    })

    const recordForm = reactive({
      dungeonIds: [],
      isSolo: false,
      isCompleted: true,
      progress: '',
      hasReward: true,
      hasEster: false
    })

    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' }
      ],
      gameAccount: [
        { required: true, message: '请选择游戏账号', trigger: 'change' }
      ],
      profession: [
        { required: true, message: '请输入职业', trigger: 'blur' }
      ],
      itemLevel: [
        { required: true, message: '请输入装等', trigger: 'blur' }
      ],
      'equipmentLevels.helmet': [
        { required: true, message: '请输入头盔等级', trigger: 'blur' }
      ],
      'equipmentLevels.shoulder': [
        { required: true, message: '请输入肩部等级', trigger: 'blur' }
      ],
      'equipmentLevels.chest': [
        { required: true, message: '请输入上装等级', trigger: 'blur' }
      ],
      'equipmentLevels.pants': [
        { required: true, message: '请输入下装等级', trigger: 'blur' }
      ],
      'equipmentLevels.gloves': [
        { required: true, message: '请输入手套等级', trigger: 'blur' }
      ],
      'equipmentLevels.weapon': [
        { required: true, message: '请输入武器等级', trigger: 'blur' }
      ]
    }

    const recordRules = {
      dungeonIds: [
        { type: 'array', required: true, message: '请至少选择一个副本', trigger: 'change' }
      ]
    }

    // 添加分页相关的响应式变量
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)

    // 获取角色列表
    const fetchCharacters = async () => {
      try {
        loading.value = true
        const res = await getCharacters({
          page: currentPage.value,
          limit: pageSize.value,
          ...searchForm
        })
        
        if (res.code === 200) {
          characters.value = res.data.characters
          total.value = res.data.total
        }
      } catch (error) {
        console.error('获取角色列表失败:', error)
        ElMessage.error('获取角色列表失败')
      } finally {
        loading.value = false
      }
    }

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

    // 获取所有副本
    const fetchDungeons = async () => {
      try {
        const res = await getAllDungeons()
        dungeons.value = res.data.dungeons
      } catch (error) {
        console.error('获取副本列表失败:', error)
        ElMessage.error('获取副本列表失败')
      }
    }

    // 获取已完成副本列表
    const fetchCompletedDungeons = async (characterId: string) => {
      try {
        const res = await getCompletedDungeons(characterId)
        if (res.code === 200) {
          completedDungeons.value = res.data.dungeons
        }
      } catch (error) {
        console.error('获取已完成副本失败:', error)
      }
    }

    // 搜索
    const handleSearch = () => {
      fetchCharacters()
    }

    // 重置搜索
    const handleReset = () => {
      searchForm.gameAccount = ''
      searchForm.minItemLevel = undefined
      fetchCharacters()
    }

    // 添加角色
    const handleAdd = () => {
      dialogType.value = 'add'
      currentId.value = ''
      form.name = ''
      form.gameAccount = ''
      form.profession = ''
      form.itemLevel = 0
      form.equipmentLevels = {
        helmet: 0,
        shoulder: 0,
        chest: 0,
        pants: 0,
        gloves: 0,
        weapon: 0
      }
      dialogVisible.value = true
    }

    // 编辑角色
    const handleEdit = (row: CharacterData) => {
      dialogType.value = 'edit'
      currentId.value = row._id
      form.name = row.name
      form.gameAccount = row.gameAccount._id
      form.profession = row.profession
      form.itemLevel = row.itemLevel
      form.equipmentLevels = { ...row.equipmentLevels }
      dialogVisible.value = true
    }

    // 删除角色
    const handleDelete = (row: CharacterData) => {
      ElMessageBox.confirm(
        `确定要删除角色 ${row.name} 吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          const res = await deleteCharacter(row._id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            fetchCharacters()
          }
        } catch (error) {
          console.error('删除角色失败:', error)
        }
      })
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            submitLoading.value = true
            
            const data: CharacterData = {
              name: form.name,
              gameAccount: form.gameAccount,
              profession: form.profession,
              itemLevel: form.itemLevel,
              equipmentLevels: form.equipmentLevels
            }
            
            if (dialogType.value === 'add') {
              const res = await createCharacter(data)
              if (res.code === 200) {
                ElMessage.success('添加成功')
                dialogVisible.value = false
                fetchCharacters()
              }
            } else {
              const res = await updateCharacter(currentId.value, data)
              if (res.code === 200) {
                ElMessage.success('更新成功')
                dialogVisible.value = false
                fetchCharacters()
              }
            }
          } catch (error) {
            console.error('提交角色失败:', error)
          } finally {
            submitLoading.value = false
          }
        }
      })
    }

    // 处理最低装等输入，只允许输入数字
    const handleMinItemLevelInput = (value: string) => {
      // 移除非数字字符
      searchForm.minItemLevel = value.replace(/[^\d]/g, '')
    }

    // 新增：为transfer组件准备数据
    const dungeonTransferData = computed(() => {
      return dungeons.value.map(dungeon => ({
        key: dungeon._id,
        label: dungeon.name,
        itemLevel: dungeon.itemLevel,
        disabled: completedDungeons.value.includes(dungeon._id) // 可选：已完成的副本置灰
      }))
    })

    // 新增：搜索副本的过滤方法
    const filterDungeonMethod = (query, item) => {
      return item.label.toLowerCase().includes(query.toLowerCase())
    }

    // 修改打开添加记录对话框方法
    const handleAddRecord = async (row) => {
      currentCharacter.value = row
      // 获取已完成副本列表
      await fetchCompletedDungeons(row._id)
      
      // 重置表单
      recordForm.dungeonIds = []
      recordForm.isSolo = false
      recordForm.isCompleted = true
      recordForm.progress = ''
      recordForm.hasReward = true
      recordForm.hasEster = false
      
      recordDialogVisible.value = true
    }

    // 修改提交记录方法，支持创建多条记录
    const handleSubmitRecord = async () => {
      if (!recordFormRef.value) return
      
      recordFormRef.value.validate(async (valid) => {
        if (valid) {
          if (recordForm.dungeonIds.length === 0) {
            ElMessage.warning('请至少选择一个副本')
            return
          }
          
          try {
            submitLoading.value = true
            
            // 记录成功和失败的数量
            let successCount = 0
            let failCount = 0
            
            // 遍历选中的副本，创建多条记录
            for (const dungeonId of recordForm.dungeonIds) {
              try {
                // 找到当前处理的副本信息，用于显示
                const dungeonInfo = dungeons.value.find(d => d._id === dungeonId)
                
                // 创建单条记录
                const res = await createDungeonRecord({
                  characterId: currentCharacter.value._id,
                  characterName: currentCharacter.value.name,
                  gameAccountId: currentCharacter.value.gameAccount._id,
                  gameAccountName: currentCharacter.value.gameAccount.accountName,
                  dungeonId: dungeonId,
                  isSolo: recordForm.isSolo,
                  isCompleted: recordForm.isCompleted,
                  progress: recordForm.isCompleted ? undefined : recordForm.progress,
                  hasReward: recordForm.hasReward,
                  hasEster: recordForm.hasEster
                })
                
                if (res.code === 200) {
                  successCount++
                } else {
                  failCount++
                  console.error(`添加副本 ${dungeonInfo?.name || dungeonId} 记录失败:`, res.message)
                }
              } catch (error) {
                failCount++
                console.error(`添加副本记录异常:`, error)
              }
            }
            
            // 显示结果消息
            if (successCount > 0 && failCount === 0) {
              ElMessage.success(`成功添加 ${successCount} 条副本记录`)
            } else if (successCount > 0 && failCount > 0) {
              ElMessage.warning(`成功添加 ${successCount} 条记录，${failCount} 条记录失败`)
            } else {
              ElMessage.error('添加记录失败')
            }
            
            // 关闭对话框并刷新
            recordDialogVisible.value = false
            
            // 重新获取已完成副本列表
            if (successCount > 0) {
              await fetchCompletedDungeons(currentCharacter.value._id)
            }
          } catch (error) {
            console.error('添加副本记录失败:', error)
            ElMessage.error('添加记录失败')
          } finally {
            submitLoading.value = false
          }
        }
      })
    }

    // 角色详情相关
    const detailsDialogVisible = ref(false)
    const dungeonRecords = ref<any[]>([])
    const recordsLoading = ref(false)
    const recordStats = reactive({
      totalIncome: 0,
      boundIncome: 0,
      tradeableIncome: 0
    })

    // 查看角色详情
    const handleViewDetails = async (row: CharacterData) => {
      currentCharacter.value = row
      detailsDialogVisible.value = true
      await fetchDungeonRecords(row._id)
    }

    // 获取角色副本记录
    const fetchDungeonRecords = async (characterId: string) => {
      try {
        recordsLoading.value = true
        const res = await getDungeonRecords(characterId)
        if (res.code === 200) {
          dungeonRecords.value = res.data.records
          calculateRecordStats()
        }
      } catch (error) {
        console.error('获取副本记录失败:', error)
      } finally {
        recordsLoading.value = false
      }
    }

    // 计算副本记录统计数据
    const calculateRecordStats = () => {
      let totalIncome = 0
      let boundIncome = 0
      let tradeableIncome = 0

      dungeonRecords.value.forEach(record => {
        if (record.hasReward && record.isCompleted) {
          totalIncome += record.rewards.total
          boundIncome += record.rewards.bound
          tradeableIncome += record.rewards.tradeable
        }
      })

      recordStats.totalIncome = totalIncome
      recordStats.boundIncome = boundIncome
      recordStats.tradeableIncome = tradeableIncome
    }

    // 格式化数字
    const formatNumber = (num: number) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    // 格式化日期
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 处理每页显示数量变化
    const handleSizeChange = (val: number) => {
      pageSize.value = val
      currentPage.value = 1 // 重置到第一页
      fetchCharacters()
    }

    // 处理页码变化
    const handleCurrentChange = (val: number) => {
      currentPage.value = val
      fetchCharacters()
    }

    // 监听搜索条件变化，重置分页
    watch(() => searchForm.minItemLevel, () => {
      currentPage.value = 1
      fetchCharacters()
    })

    // 新增：修改副本记录
    const editRecordDialogVisible = ref(false)
    const editRecordFormRef = ref<FormInstance>()
    const currentRecordId = ref('')
    const editRecordForm = reactive({
      dungeonName: '',
      isSolo: false,
      isCompleted: true,
      progress: '',
      hasReward: true,
      hasEster: false
    })

    // 处理编辑记录
    const handleEditRecord = (record) => {
      currentRecordId.value = record._id
      editRecordForm.dungeonName = record.dungeon.name
      editRecordForm.isSolo = record.isSolo
      editRecordForm.isCompleted = record.isCompleted
      editRecordForm.progress = record.progress || ''
      editRecordForm.hasReward = record.hasReward
      editRecordForm.hasEster = record.hasEster
      editRecordDialogVisible.value = true
    }

    // 提交编辑记录
    const handleSubmitEditRecord = async () => {
      if (!editRecordFormRef.value) return
      
      await editRecordFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            submitLoading.value = true
            
            const data = {
              isSolo: editRecordForm.isSolo,
              isCompleted: editRecordForm.isCompleted,
              progress: !editRecordForm.isCompleted ? editRecordForm.progress : '',
              hasReward: editRecordForm.hasReward,
              hasEster: editRecordForm.hasEster
            }
            
            const res = await updateDungeonRecord(currentRecordId.value, data)
            
            if (res.code === 200) {
              ElMessage.success('更新记录成功')
              editRecordDialogVisible.value = false
              // 重新获取记录列表
              await fetchDungeonRecords(currentCharacter.value._id)
            }
          } catch (error) {
            console.error('更新副本记录失败:', error)
            ElMessage.error('更新副本记录失败')
          } finally {
            submitLoading.value = false
          }
        }
      })
    }

    // 处理删除记录
    const handleDeleteRecord = (record) => {
      ElMessageBox.confirm(
        `确定要删除副本"${record.dungeon.name}"的记录吗？此操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          const res = await deleteDungeonRecord(record._id)
          
          if (res.code === 200) {
            ElMessage.success('删除记录成功')
            // 重新获取记录列表
            await fetchDungeonRecords(currentCharacter.value._id)
          }
        } catch (error) {
          console.error('删除副本记录失败:', error)
          ElMessage.error('删除副本记录失败')
        }
      }).catch(() => {
        // 取消删除，不执行任何操作
      })
    }

    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          fetchCharacters(),
          fetchGameAccounts(),
          fetchDungeons()
        ])
      } finally {
        loading.value = false
      }
    })
    
    return {
      loading,
      submitLoading,
      dialogVisible,
      dialogType,
      characters,
      gameAccounts,
      searchForm,
      formRef,
      form,
      rules,
      handleSearch,
      handleReset,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      handleMinItemLevelInput,
      recordDialogVisible,
      recordFormRef,
      recordForm,
      recordRules,
      dungeons,
      currentCharacter,
      completedDungeons,
      handleAddRecord,
      handleSubmitRecord,
      detailsDialogVisible,
      dungeonRecords,
      recordsLoading,
      recordStats,
      handleViewDetails,
      formatNumber,
      formatDate,
      currentPage,
      pageSize,
      total,
      handleSizeChange,
      handleCurrentChange,
      dungeonTransferData,
      filterDungeonMethod,
      editRecordDialogVisible,
      editRecordFormRef,
      editRecordForm,
      handleEditRecord,
      handleSubmitEditRecord,
      handleDeleteRecord
    }
  }
})
</script>

<style scoped>
.characters {
  height: 100%;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.table-content {
  margin-top: 20px;
}

.equipment-levels {
  display: flex;
  gap: 8px;
}

.equipment-levels span {
  padding: 2px 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select) {
  width: 100%;
}

.character-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.equipment-title {
  margin: 20px 0 10px 0;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 优化transfer组件的样式 - 整体缩小高度40px */
:deep(.el-transfer) {
  display: flex;
  justify-content: center;
}

/* 优化transfer组件中间按钮的样式 */
:deep(.el-transfer__buttons) {
  padding: 0 15px;  /* 增加左右内边距 */
  display: flex;
  flex-direction: column;  /* 保持垂直排列 */
  justify-content: center;
  gap: 10px;  /* 按钮之间的间距 */
}

:deep(.el-transfer__button) {
  width: 80px;  /* 设置固定宽度代替最小宽度 */
  height: 36px;  /* 设置固定高度 */
  padding: 0;  /* 移除内边距，由固定宽高控制 */
  font-weight: bold;  /* 字体加粗 */
  display: flex;  /* 使用flex布局居中内容 */
  justify-content: center;  /* 水平居中 */
  align-items: center;  /* 垂直居中 */
}

:deep(.el-transfer-panel) {
  width: 45%;
  min-height: 310px;  /* 从350px减少到310px */
}

:deep(.el-transfer-panel__body) {
  height: 260px;  /* 从300px减少到260px */
}

:deep(.el-transfer-panel__list.is-filterable) {
  height: 194px;  /* 从234px减少到194px */
}
</style> 