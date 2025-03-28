import request from '@/utils/request'

export interface DungeonData {
  name: string;
  itemLevel: number;
  totalIncome: number;
  boundGoldIncome: number;
  tradeableGoldIncome: number;
  hasEster: boolean;
  refreshInterval: number;
  hasSoloMode: boolean;
  soloIncome?: number;
}

export function getDungeons(params: { page: number; limit: number }) {
  return request({
    url: '/api/dungeons',
    method: 'get',
    params
  })
}

export function getDungeon(id: string) {
  return request({
    url: `/api/dungeons/${id}`,
    method: 'get'
  })
}

export function createDungeon(data: DungeonData) {
  return request({
    url: '/api/dungeons',
    method: 'post',
    data
  })
}

export function updateDungeon(id: string, data: Partial<DungeonData>) {
  return request({
    url: `/api/dungeons/${id}`,
    method: 'put',
    data
  })
}

export function deleteDungeon(id: string) {
  return request({
    url: `/api/dungeons/${id}`,
    method: 'delete'
  })
}

// 获取所有副本（不分页）
export function getAllDungeons() {
  return request({
    url: '/api/dungeons/all',
    method: 'get'
  })
} 