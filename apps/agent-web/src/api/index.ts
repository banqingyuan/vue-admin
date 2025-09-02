/**
 * API模块入口文件
 */

// 导入代理商API
import { AgentApi } from './agent';

// 导出API配置
export * from './config';

// 导出Http客户端
export { HttpClient } from './http';

// 导出API类型
export * from './types';

// 导出API工具函数
export * from './utils';

// 创建API实例
const agentApi = new AgentApi();

// API服务集合
const apiServices = {
  agent: agentApi,
};

// 导出所有API服务
export { agentApi };

// 默认导出所有API服务
export default apiServices;
