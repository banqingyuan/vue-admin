import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '#/store/auth';
import { getStatusApi } from '#/api/promoter';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('#/pages/Login.vue'), meta: { title: '登录' } },
  { path: '/invite-entry', component: () => import('#/pages/InviteEntry.vue'), meta: { title: '邀请链接进入' } },
  { path: '/apply/personal', component: () => import('#/pages/ApplyPersonal.vue'), meta: { title: '审核｜个人', requiresStatusCheck: true } },
  { path: '/apply/company', component: () => import('#/pages/ApplyCompany.vue'), meta: { title: '审核｜公司', requiresStatusCheck: true } },
  { path: '/confirm/personal', component: () => import('#/pages/ConfirmPersonal.vue'), meta: { title: '确认｜个人' } },
  { path: '/confirm/company', component: () => import('#/pages/ConfirmCompany.vue'), meta: { title: '确认｜公司' } },
  { path: '/result/success', component: () => import('#/pages/ResultSuccess.vue'), meta: { title: '提交成功' } },
  { path: '/result/fail', component: () => import('#/pages/ResultFail.vue'), meta: { title: '申请未通过' } },
  {
    path: '/agent/home',
    component: () => import('#/pages/AgentHome.vue'),
    meta: { title: '代理主页', requiresAuth: true, requiresActive: true },
  },
  {
    path: '/agent/invited-users',
    component: () => import('#/pages/InvitedUsers.vue'),
    meta: { title: '邀请用户列表', requiresAuth: true, requiresActive: true },
  },
  {
    path: '/agent/team/performance',
    component: () => import('#/pages/TeamPerformance.vue'),
    meta: {
      title: '下级代理业绩',
      requiresAuth: true,
      requiresActive: true,
      requiresLevel1: true,
    },
  },
  {
    path: '/agent/income',
    component: () => import('#/pages/IncomeDetail.vue'),
    meta: {
      title: '收入明细',
      requiresAuth: true,
      requiresActive: true,
    },
  },
  {
    path: '/agent/withdraw',
    component: () => import('#/pages/WithdrawalPage.vue'),
    meta: {
      title: '立即提现',
      requiresAuth: true,
      requiresActive: true,
    },
  },
  {
    path: '/agent/withdrawal-history',
    component: () => import('#/pages/WithdrawalHistory.vue'),
    meta: {
      title: '提现记录',
      requiresAuth: true,
      requiresActive: true,
    },
  },
  {
    path: '/agent/promotion/share',
    component: () => import('../pages/PromotionShare.vue'),
    meta: {
      title: '我的邀请信息',
      requiresAuth: true,
      requiresActive: true,
    },
  },
  {
    path: '/contact-service',
    component: () => import('#/pages/ContactService.vue'),
    meta: {
      title: '联系客服',
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();
  const publicPages = ['/login', '/contact-service'];
  const requiresAuth = !publicPages.includes(to.path);

  // 1. 检查是否需要认证
  if (requiresAuth && !auth.token) {
    next('/login');
    return;
  }

  // 统一的状态信息获取函数，避免重复请求
  let cachedStatusInfo: Awaited<ReturnType<typeof getStatusApi>> | null = null;
  const ensureStatusInfo = async () => {
    if (!cachedStatusInfo) {
      cachedStatusInfo = await getStatusApi();
    }
    return cachedStatusInfo;
  };

  // 2. 检查是否需要active状态（代理主页、代理相关页面）
  if (to.meta.requiresActive && auth.token) {
    try {
      const statusInfo = await ensureStatusInfo();
      if (statusInfo.status !== 'active' && statusInfo.status !== 'pass') {
        // 不是active状态，重定向回申请页面
        next('/apply/personal');
        return;
      }
    } catch (error) {
      console.error('状态检查失败:', error);
      next('/login');
      return;
    }
  }

  // 3. 仅一级代理可访问的页面
  if (to.meta.requiresLevel1 && auth.token) {
    try {
      const statusInfo = await ensureStatusInfo();
      if (statusInfo.level !== 1) {
        // 非一级代理，重定向到代理主页
        next('/agent/home');
        return;
      }
    } catch (error) {
      console.error('等级检查失败:', error);
      next('/agent/home');
      return;
    }
  }

  // 4. 检查是否需要状态检查（apply/* 页面）
  if (to.meta.requiresStatusCheck && auth.token) {
    try {
      const statusInfo = await ensureStatusInfo();
      const status = statusInfo.status;

      // 根据状态自动重定向
      if (status === 'not_submitted') {
        // 未提交 -> 允许访问申请页面
        // 不做任何重定向，让用户填写申请表
      } else if (status === 'pending') {
        // 已提交待审核 -> 重定向到成功页面
        if (to.path !== '/result/success') {
          next('/result/success');
          return;
        }
      } else if (status === 'reject') {
        // 审核拒绝 -> 重定向到拒绝页面
        if (to.path !== '/result/fail') {
          next('/result/fail');
          return;
        }
      } else if (status === 'active' || status === 'pass') {
        // 审核通过（active或pass） -> 重定向到代理主页
        if (to.path !== '/agent/home') {
          next('/agent/home');
          return;
        }
      }
      // 其他未知状态 -> 允许访问申请页面
    } catch (error) {
      console.error('状态检查失败:', error);
      // 状态检查失败，允许继续访问（避免阻塞用户）
    }
  }
  
  next();
});


