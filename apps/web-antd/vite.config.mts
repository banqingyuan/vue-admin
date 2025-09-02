import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            // 直接转发到 local_images_browser（统一后端）
            target: 'http://localhost:8001',
            ws: true,
          },
        },
      },
    },
  };
});
