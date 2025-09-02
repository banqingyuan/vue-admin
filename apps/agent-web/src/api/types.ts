/**
 * API 类型定义
 */

// 通用响应接口
export interface ApiResponse<T> {
  data: T;
  message: string;
}

// 代理商信息
export interface AgentInfo {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  status: string;
  level: string;
  created_at: string;
  updated_at: string;
}

// 商品信息
export interface Inventory {
  id: number;
  name: string;
  description: string;
  retail_price: number;
  wholesale_price: number;
  category: string;
  type: string;
  duration_days: number;
  status: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// 充值请求
export interface RechargeRequest {
  sku_id: number;
  user_id: number;
}

// 充值响应
export interface RechargeInfo {
  sale_id: number;
  agent_id: number;
  user_id: number;
  sku_id: number;
  sku_name: string;
  amount: number;
  subscription_id: number;
  subscription_days: number;
  transaction_id: string;
  created_at: string;
}

// 销售记录
export interface SaleRecord {
  id: number;
  agent_id: number;
  sku_id: number;
  sku_name: string;
  user_id: number;
  user_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  transaction_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// 撤销充值响应
export interface CancelSaleResponse {
  sale_id: number;
  status: string;
}
