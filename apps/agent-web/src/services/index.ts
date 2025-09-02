/**
 * 服务层入口文件
 */

// 服务集合
import memberService from './member';

// 导出会员服务
export * from './member';

// 服务集合
const services = {
  member: memberService,
};

// 默认导出所有服务
export default services;
