import { requestClient } from '#/api/request';

export interface PromoterDetailInfo extends Record<string, any> {}

export interface PromoterListItem {
  promoter_id: number;
  admin_user_id: number;
  type: string;
  level: number | null;
  approval_status: string;
  join_type?: string;
  phone: string;
  name: string;
  introduction?: string;
  detail_info: PromoterDetailInfo;
  parent_promoter_id?: number;
  parent_promoter_name?: string;
  parent_promoter_level?: number;
  auto_passed: boolean;
  contact_phone?: string;
  invite_code?: string;
  resource_desc?: string;
  application_time?: string;
  application_method?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoterListResponse {
  records: PromoterListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface PromoterListQuery {
  status?: string;
  level?: number;
  type?: string;
  phone?: string;
  real_name?: string;
  company_name?: string;
  contact_phone?: string;
  keyword?: string;
  parent_promoter_id?: number;
  page?: number;
  page_size?: number;
}

export async function listPromoters(query: PromoterListQuery) {
  return requestClient.get<PromoterListResponse>('/promoters/review', {
    params: query,
  });
}

export async function getPromoterDetail(promoterId: number) {
  return requestClient.get<PromoterListItem>(`/promoters/review/${promoterId}`);
}

export interface ReviewRequestPayload {
  remark?: string;
  level?: number;
  parent_promoter_id?: number | null;
}

export async function approvePromoter(promoterId: number, payload: ReviewRequestPayload = {}) {
  return requestClient.post<PromoterListItem>(
    `/promoters/review/${promoterId}/approve`,
    payload,
  );
}

export async function rejectPromoter(promoterId: number, payload: ReviewRequestPayload = {}) {
  return requestClient.post<PromoterListItem>(
    `/promoters/review/${promoterId}/reject`,
    payload,
  );
}

export interface PromoterPerformanceStats {
  // 现有字段（保持向前兼容）
  total_sales_amount_fen: number;        // 总销售额原价（pending + withdrawable）
  total_commission_fen: number;          // 总佣金（pending + withdrawable）
  paid_order_count: number;              // 总订单数（pending + withdrawable）
  invite_order_count: number;            // 直接邀请订单数
  invite_user_count: number;             // 直接邀请用户数
  invite_income_fen: number;             // 直接邀请佣金
  invite_sales_amount_fen: number;       // 直接邀请销售额原价
  downstream_income_fen: number;         // 从下级获得的佣金
  downstream_sales_amount_fen: number;   // 下级销售额原价
  downstream_order_count: number;        // 下级订单数
  downstream_invite_user_count: number;  // 下级邀请用户数
  child_promoter_count: number;          // 下级代理人数
  
  // 新增字段（三状态系统）
  total_net_sales_amount_fen: number;      // 总净销售额
  invite_net_sales_amount_fen: number;     // 直接邀请净销售额
  downstream_net_sales_amount_fen: number; // 下级净销售额
  total_refunded_commission_fen: number;      // 总退款佣金
  invite_refunded_commission_fen: number;     // 直接邀请退款佣金
  downstream_refunded_commission_fen: number; // 下级退款佣金
  withdrawn_fen: number;                      // 已提现金额
}

export async function getPromoterPerformanceStats(promoterId: number) {
  return requestClient.get<PromoterPerformanceStats>(`/promoters/review/${promoterId}/performance`);
}

export interface CreatePromoterPayload {
  account_type: string;
  login_phone: string;
  real_name?: string;
  id_number?: string;
  company_name?: string;
  uscc?: string;
  contact_phone?: string;
  parent_promoter_id?: number;
  resource_desc?: string;
  level: number;
}

export async function createPromoter(payload: CreatePromoterPayload) {
  return requestClient.post('/promoters/review', payload);
}

export interface UpdatePromoterPayload {
  phone?: string;
  type?: string;
  level?: number;
  parent_promoter_id?: number | null;
  // 资源介绍，对应后端的 introduction 字段
  introduction?: string;
  detail_info?: Record<string, any>;
}

export async function updatePromoter(promoterId: number, payload: UpdatePromoterPayload) {
  return requestClient.put<PromoterListItem>(`/promoters/review/${promoterId}`, payload);
}


