import request from '@/utils/request'

export interface UserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  stats?: {
    totalIncome: number;
    boundIncome: number;
    tradeableIncome: number;
    recordCount: number;
  }
}

export function getUsers() {
  return request<{ users: UserData[] }>({
    url: '/api/users/all',
    method: 'get'
  })
}

export function updateUserRole(userId: string, role: 'user' | 'admin') {
  return request({
    url: `/api/users/${userId}/role`,
    method: 'put',
    data: { role }
  })
}

export function deleteUser(userId: string) {
  return request({
    url: `/api/users/${userId}`,
    method: 'delete'
  })
} 