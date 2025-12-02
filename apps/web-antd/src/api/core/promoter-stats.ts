import { requestClient } from '#/api/request';

/**
 * 数据概览统计接口
 */

export interface OverviewStats {
  invited_user_count: number; // 邀请用户数
  paid_order_count: number; // 付费订单数
  paid_amount_fen: number; // 付费金额（分，总原始订单金额，不扣退款）
  commission_fen: number; // 产生佣金（分，净佣金）
  level1_promoter_count: number; // 高级代理-人数
  level2_promoter_count: number; // 代理-人数
  pending_promoter_count: number; // 待审批
  updated_at: string; // 更新时间
}

export interface OverviewStatsQuery {
  time_range?: 'today' | 'week' | 'month' | 'all' | 'custom'; // 时间范围
  start_date?: string; // 开始日期 (YYYY-MM-DD)，仅在 time_range=custom 时需要
  end_date?: string; // 结束日期 (YYYY-MM-DD)，仅在 time_range=custom 时需要
}

export async function getOverviewStats(query?: OverviewStatsQuery) {
  return requestClient.get<OverviewStats>('/promoters/stats/overview', {
    params: query || {},
  });
}

