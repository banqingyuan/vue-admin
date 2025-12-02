import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:account-tie',
      order: -50,
      title: '代理商视图',
    },
    name: 'AgentCenter',
    path: '/agent-center',
    redirect: '/agent-center/overview',
    children: [
      {
        name: 'AgentCenterOverview',
        path: '/agent-center/overview',
        component: () => import('#/views/agent-center/overview/index.vue'),
        meta: {
          title: '数据概览',
        },
      },
      {
        name: 'AgentCenterModes',
        path: '/agent-center/modes',
        component: () => import('#/views/agent-center/modes/index.vue'),
        meta: {
          title: '代理模式',
        },
      },
      {
        name: 'AgentCenterOnboardingReview',
        path: '/agent-center/onboarding-review',
        component: () => import('#/views/agent-center/onboarding-review/index.vue'),
        meta: {
          title: '入驻审核',
        },
      },
      {
        name: 'AgentCenterPromoters',
        path: '/agent-center/promoters',
        component: () => import('#/views/agent-center/promoters/index.vue'),
        meta: {
          title: '代理列表',
        },
      },
      {
        name: 'AgentCenterWithdrawReview',
        path: '/agent-center/withdraw-review',
        component: () => import('#/views/agent-center/withdraw-review/index.vue'),
        meta: {
          title: '提现审核',
        },
      },
    ],
  },
];

export default routes;


