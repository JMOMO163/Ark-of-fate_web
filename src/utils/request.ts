import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import router from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 增加超时时间
  withCredentials: true // 允许携带 cookie
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = store.state.token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 确保 headers 存在
    config.headers = config.headers || {}
    // 添加必要的请求头
    config.headers['Content-Type'] = 'application/json'
    config.headers['Access-Control-Allow-Origin'] = '*'
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据后端返回的状态码处理不同情况
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        store.dispatch('logout').then(() => {
          router.push('/')
        })
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    console.error('响应错误:', error)
    // 处理网络错误
    const message = error.response?.data?.message || error.message || '网络错误'
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    // 如果是 401 错误，清除登录状态
    if (error.response?.status === 401) {
      store.dispatch('logout').then(() => {
        router.push('/')
      })
    }
    return Promise.reject(error)
  }
)

export default service 