import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:view-dashboard',
      keepAlive: true,
      order: 1000,
      title: '数据看板',
    },
    name: 'DataBoard',
    path: '/data-board',
    children: [
      {
        meta: {
          title: '付费数据',
        },
        name: 'DataBoardPayment',
        path: '/data-board/payment',
        component: () => import('#/views/data-board/payment/index.vue'),
      },
      {
        meta: {
          title: 'CPS渠道数据',
          authority: ['admin', 'super'],
        },
        name: 'DataBoardDistributor',
        path: '/data-board/distributor',
        component: () => import('#/views/data-board/distributor/index.vue'),
      },
      {
        meta: {
          title: '游戏分析',
        },
        name: 'DataBoardGameAnalysis',
        path: '/data-board/game-analysis',
        component: () => import('#/views/data-board/game-analysis/index.vue'),
      },
    ],
  },
];

export default routes;
