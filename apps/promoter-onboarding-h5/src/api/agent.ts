import { request } from './http';

// 提现余额详情
export interface WithdrawalBalance {
  total_earnings_fen: number;
  withdrawn_fen: number;
  pending_settlement_fen: number;
  withdrawable_fen: number;
}

export function getWithdrawalBalanceApi() {
  return request<WithdrawalBalance>({
    method: 'GET',
    url: '/promoter/withdrawal/balance',
  });
}

// 自身推广统计
export interface SelfPromotionStats {
  invitation_code: string;
  invite_count: number;
  paid_order_count: number;
  total_revenue_fen: number;    // 净收入（总收入 - 退款额）【向后兼容】
  total_earnings_fen: number;   // 总收益（pending + withdrawable）
  total_refunded_fen: number;   // 退款额
}

export function getSelfPromotionStatsApi() {
  return request<SelfPromotionStats>({
    method: 'GET',
    url: '/promoter/self-promotion-stats',
  });
}

// 佣金比例配置
export interface CommissionRate {
  ios: number;
  android: number;
}

export interface CommissionRates {
  level1_direct: CommissionRate;
  level1_from_level2: CommissionRate;
  level2_direct: CommissionRate;
}

export function getCommissionRatesApi() {
  return request<CommissionRates>({
    method: 'GET',
    url: '/promoter/commission-rates',
  });
}

// 下级代理统计
export interface ChildAgentStats {
  promoter_id: number;
  name: string; // 下级代理姓名
  phone: string; // 下级代理手机号
  codes: string[];
  invite_count: number;
  paid_order_count: number;
  child_revenue_fen: number;
  parent_share_from_child_fen: number;      // 上级从下级获得的总佣金（不扣退款）
  parent_refunded_from_child_fen: number;   // 上级从下级的退款佣金
}

export function getChildrenStatsApi() {
  return request<ChildAgentStats[]>({
    method: 'GET',
    url: '/promoter/children',
  });
}

// 我的推广码收益
export interface MyCodesRevenue {
  codes: Record<string, number>;
  total_fen: number;
}

export function getMyCodesRevenueApi() {
  return request<MyCodesRevenue>({
    method: 'GET',
    url: '/promoter/my-code-revenues',
  });
}

// 邀请用户记录
export interface InvitedUserRecord {
  user_id: number;
  register_time: string;
  paid_order_count: number;
  total_revenue_fen: number;
}

export function getInvitedUsersApi() {
  return request<InvitedUserRecord[]>({
    method: 'GET',
    url: '/promoter/invited-users',
  });
}

// 邀请收益业绩明细（基于业绩流水）
export interface InvitePerformanceRecord {
  id: number;
  order_id: number;
  user_id: number;
  promotion_code: string;
  order_amount_fen: number;
  commission_amount_fen: number;
  order_status: 'pending' | 'withdrawable' | 'refunded';
  platform: 'android' | 'ios' | 'unknown';
  product_name: string;
  paid_at: string;
  has_refund: boolean; // 订单是否有退款记录
}

export interface InvitePerformancePage {
  records: InvitePerformanceRecord[];
  has_more: boolean;
}

export function getInvitePerformancesApi(params: { page: number; page_size: number }) {
  return request<InvitePerformancePage>({
    method: 'GET',
    url: '/promoter/invite-performances',
    params,
  });
}

