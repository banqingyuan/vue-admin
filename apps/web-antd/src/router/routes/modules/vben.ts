import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:cash-multiple',
      order: 9998,
      title: '结算',
    },
    name: 'Settlement',
    path: '/settlement',
    children: [
      {
        name: 'SettlementSuppliers',
        path: '/settlement/suppliers',
        component: () => import('#/views/settlement/suppliers/index.vue'),
        meta: {
          icon: 'mdi:account-group',
          title: '供应商管理',
        },
      },
      {
        name: 'SettlementBilling',
        path: '/settlement/billing',
        component: () => import('#/views/settlement/billing/index.vue'),
        meta: {
          icon: 'mdi:cash-check',
          title: '供应商结算',
        },
      },
    ],
  },
];

export default routes;
