import type { App } from 'vue';

import { createPinia } from 'pinia';

const pinia = createPinia();

export async function setupStore(app: App) {
  app.use(pinia);
}

export { pinia };
export * from './modules/auth';
export * from './modules/member';
