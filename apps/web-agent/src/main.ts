import { createApp } from 'vue';

import App from './app.vue';
import { setupRouter } from './router';
import { setupStore } from './store';

// 导入全局样式
import './styles/index.css';

async function bootstrap() {
  const app = createApp(App);

  // 配置状态管理
  await setupStore(app);

  // 配置路由
  await setupRouter(app);

  // 挂载应用
  app.mount('#app');
}

bootstrap();
