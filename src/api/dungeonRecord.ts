import request from '@/utils/request'

export interface DungeonRecordData {
  characterId: string;
  characterName: string;
  gameAccountId: string;
  gameAccountName: string;
  dungeonId: string;
  isSolo: boolean;
  isCompleted: boolean;
  progress?: string;
  hasReward: boolean;
  hasEster: boolean;
}

export function getDungeonRecords(characterId: string) {
  return request({
    url: `/api/dungeon-records/${characterId}`,
    method: 'get'
  })
}

export function createDungeonRecord(data: DungeonRecordData) {
  return request({
    url: '/api/dungeon-records',
    method: 'post',
    data
  })
}

export function getCompletedDungeons(characterId: string) {
  return request({
    url: `/api/dungeon-records/completed/${characterId}`,
    method: 'get'
  })
}

export function getDungeonRecordStats(characterId: string) {
  return request({
    url: `/api/dungeon-records/stats/${characterId}`,
    method: 'get'
  })
}

// 更新副本记录
export function updateDungeonRecord(id: string, data: Partial<DungeonRecordData>) {
  return request({
    url: `/api/dungeon-records/record/${id}`,
    method: 'put',
    data
  })
}

// 删除副本记录
export function deleteDungeonRecord(id: string) {
  return request({
    url: `/api/dungeon-records/record/${id}`,
    method: 'delete'
  })
} 