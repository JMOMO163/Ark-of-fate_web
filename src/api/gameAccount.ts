import request from '@/utils/request'

export function getGameAccounts() {
  return request({
    url: '/api/game-accounts',
    method: 'get'
  })
}

export function getGameAccount(id: string) {
  return request({
    url: `/api/game-accounts/${id}`,
    method: 'get'
  })
}

export function createGameAccount(data: { accountNumber: string; accountName: string }) {
  return request({
    url: '/api/game-accounts',
    method: 'post',
    data
  })
}

export function updateGameAccount(id: string, data: { accountNumber?: string; accountName?: string }) {
  return request({
    url: `/api/game-accounts/${id}`,
    method: 'put',
    data
  })
}

export function deleteGameAccount(id: string) {
  return request({
    url: `/api/game-accounts/${id}`,
    method: 'delete'
  })
}

export function getGameAccountStats(id: string) {
  return request({
    url: `/api/game-accounts/${id}/stats`,
    method: 'get'
  })
} 