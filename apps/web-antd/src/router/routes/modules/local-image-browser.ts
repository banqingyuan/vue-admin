import type { RouteRecordRaw } from 'vue-router';

// import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:image-search',
      order: 600,
      title: '图片浏览器',
    },
    name: 'LocalImageBrowser',
    path: '/local-image-browser',
    component: () => import('#/views/local-image-browser/index.vue'),
  },
];

export default routes;
