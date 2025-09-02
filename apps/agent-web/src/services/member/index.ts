/**
 * 会员服务模块入口
 */

// 导入服务类
import { MemberService } from './service';

// 导出React Hooks
export * from './hooks';

// 导出模型定义
export * from './models';

// 导出SKU映射
export * from './sku-mapping';

// 创建服务实例
const memberService = new MemberService();

// 导出服务实例
export { memberService };

// 默认导出服务实例
export default memberService;
