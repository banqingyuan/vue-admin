import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

import { createRouter, createWebHistory } from 'vue-router';

// 定义路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('#/views/home/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('#/views/auth/login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login-buffer',
    name: 'LoginBuffer',
    component: () => import('#/views/auth/login-buffer.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/callback',
    name: 'Callback',
    component: () => import('#/views/auth/callback.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/logout-callback',
    name: 'LogoutCallback',
    component: () => import('#/views/auth/logout-callback.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('#/views/user-profile/index.vue'),
    meta: { requiresAuth: true },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth) {
    // 检查用户是否已登录
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      // 未登录，重定向到登录缓冲页
      next('/login-buffer');
      return;
    }
  }

  next();
});

export { router };

export async function setupRouter(app: App) {
  app.use(router);
  await router.isReady();
}
