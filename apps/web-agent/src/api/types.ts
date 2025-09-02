/**
 * API 类型定义
 */

/**
 * API 响应通用格式
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  code?: number;
}

/**
 * 代理商信息
 */
export interface AgentInfo {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * 库存信息
 */
export interface Inventory {
  id: number;
  type: string;
  name: string;
  duration_days: number;
  quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * 充值请求
 */
export interface RechargeRequest {
  user_id: number;
  sku_id: number;
}

/**
 * 充值响应
 */
export interface RechargeInfo {
  transaction_id: string;
  user_id: number;
  sku_id: number;
  sku_name: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * 销售记录
 */
export interface SaleRecord {
  id: number;
  transaction_id: string;
  user_id: number;
  sku_id: number;
  sku_name: string;
  amount: number;
  status: string;
  can_cancel: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 撤销充值响应
 */
export interface CancelSaleResponse {
  success: boolean;
  message: string;
  transaction_id: string;
}
