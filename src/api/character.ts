import request from '@/utils/request'

export interface EquipmentLevels {
  helmet: number;
  shoulder: number;
  chest: number;
  pants: number;
  gloves: number;
  weapon: number;
}

export interface CharacterData {
  name: string;
  itemLevel: number;
  gameAccount: string;
  profession: string;
  avatar?: string;
  equipmentLevels: EquipmentLevels;
}

export interface CharacterQuery {
  gameAccount?: string;
  minItemLevel?: number;
}

export function getCharacters(params: { 
  page: number; 
  limit: number;
  gameAccount?: string;
  minItemLevel?: number;
}) {
  return request({
    url: '/api/characters',
    method: 'get',
    params
  })
}

export function getCharacter(id: string) {
  return request({
    url: `/api/characters/${id}`,
    method: 'get'
  })
}

export function createCharacter(data: CharacterData) {
  return request({
    url: '/api/characters',
    method: 'post',
    data
  })
}

export function updateCharacter(id: string, data: Partial<CharacterData>) {
  return request({
    url: `/api/characters/${id}`,
    method: 'put',
    data
  })
}

export function deleteCharacter(id: string) {
  return request({
    url: `/api/characters/${id}`,
    method: 'delete'
  })
} 