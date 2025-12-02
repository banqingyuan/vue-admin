/**
 * 应用初始化入口
 * 遵循 Vben Admin 标准结构，main.ts 动态导入 bootstrap.ts
 */

async function initApplication() {
  // 启动应用并挂载
  const { bootstrap } = await import('./bootstrap');
  await bootstrap();
}

initApplication();
