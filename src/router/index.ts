import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Home from '@/views/Home.vue'
import store from '@/store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: {
          title: '首页'
        }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/Statistics.vue'),
        meta: {
          title: '数据统计',
          requiresAuth: true
        }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
        meta: {
          title: '报表管理',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: {
          title: '个人信息',
          requiresAuth: true
        }
      },
      {
        path: 'game-accounts',
        name: 'GameAccounts',
        component: () => import('@/views/GameAccounts.vue'),
        meta: {
          title: '游戏账号管理',
          requiresAuth: true
        }
      },
      {
        path: 'dungeons',
        name: 'Dungeons',
        component: () => import('@/views/Dungeons.vue'),
        meta: {
          title: '副本管理',
          requiresAuth: true
        }
      },
      {
        path: 'characters',
        name: 'Characters',
        component: () => import('@/views/Characters.vue'),
        meta: {
          title: '角色管理',
          requiresAuth: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 命运方舟统计` : '命运方舟统计'
  
  // 检查是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      // 如果需要登录但未登录，重定向到首页
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 