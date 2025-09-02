import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
  },
  copyright: {
    companyName: 'Yimukeshi Technology Co., Ltd.',
    companySiteLink: 'https://www.aijpq.com',
    date: '2025',
    icp: '浙ICP备2025148163号-1',
    icpLink: 'https://beian.miit.gov.cn/',
  },
  logo: {
    enable: true,
    fit: 'contain',
    source:
      'https://aijpq-app-oss.oss-cn-hangzhou.aliyuncs.com/images/ai-poker-logo.png',
  },
});
