import request from '@/utils/request'

interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export function login(data: LoginData) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data
  })
}

export function register(data: { username: string; email: string; password: string }) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/api/auth/me',
    method: 'get'
  })
}

export function forgotPassword(data: { email: string }) {
  return request({
    url: '/api/auth/forgotpassword',
    method: 'post',
    data
  })
}

export function resetPassword(data: { email: string; resetCode: string; newPassword: string }) {
  return request({
    url: '/api/auth/resetpassword',
    method: 'post',
    data
  })
}

export function updatePassword(data: { currentPassword: string; newPassword: string }) {
  return request({
    url: '/api/auth/password',
    method: 'put',
    data
  })
}

export function updateProfile(data: { username?: string; goldRate?: number }) {
  return request({
    url: '/api/auth/profile',
    method: 'put',
    data
  })
}

export function weeklyReset() {
  return request({
    url: '/api/auth/weekly-reset',
    method: 'post'
  })
} 