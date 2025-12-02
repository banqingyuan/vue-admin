/**
 * 应用启动入口
 * 由 Vben Admin 框架要求，需要有 bootstrap.ts 文件
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '#/styles/variables.css';

import App from './App.vue';
import { router } from './router';
import { useAuthStore } from '#/store/auth';

export async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  // 恢复登录态
  const auth = useAuthStore();
  auth.loadFromStorage();

  app.use(router);

  app.mount('#app');
}
