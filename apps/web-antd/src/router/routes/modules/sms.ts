import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:message-text-outline',
      order: 9997,
      title: '短信发送',
    },
    name: 'SmsCenter',
    path: '/sms',
    children: [
      {
        meta: {
          title: '营销短信发送',
        },
        name: 'SmsMarketingSend',
        path: '/sms/marketing-send',
        component: () => import('#/views/sms/marketing-send/index.vue'),
      },
      {
        meta: {
          title: '营销短信数据查看',
        },
        name: 'SmsMarketingData',
        path: '/sms/marketing-data',
        component: () => import('#/views/sms/marketing-data/index.vue'),
      },
      {
        meta: {
          title: '验证码发送记录',
        },
        name: 'SmsVerifyCodeRecords',
        path: '/sms/verify-code-records',
        component: () => import('#/views/sms/verify-code-records/index.vue'),
      },
    ],
  },
];

export default routes;
