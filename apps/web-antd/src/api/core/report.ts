/**
 * 报表分析相关接口
 */
import { requestClient } from '../request';

// 报表类型枚举
export enum ReportType {
  AGENT = 'agent',
  ANALYTICS = 'analytics',
  RETENTION = 'retention',
  REVENUE = 'revenue',
  USER = 'user',
}

// 时间粒度枚举
export enum TimeGranularity {
  DAY = 'day',
  HOUR = 'hour',
  MONTH = 'month',
  WEEK = 'week',
  YEAR = 'year',
}

// 指标类型枚举
export enum MetricType {
  AVG = 'avg',
  COUNT = 'count',
  MAX = 'max',
  MIN = 'min',
  PERCENT = 'percent',
  RATE = 'rate',
  SUM = 'sum',
}

// 指标配置接口
export interface MetricConfig {
  name: string;
  type: MetricType;
  field?: string;
  alias?: string;
  description?: string;
}

// 报表请求接口
export interface ReportRequest {
  report_type?: ReportType; // 兼容旧字段，可不传
  modules?: string[]; // 新增：按模块组合查询，例如 ["retention"]
  granularity: TimeGranularity;
  start_time: string;
  end_time: string;
  metrics: MetricConfig[];
  group_by?: string[];
  filters?: Record<string, any>;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_dir?: string;
  include_total?: boolean;
  include_compare?: boolean;
  export_format?: string;
  cohort_analysis?: {
    analysis_periods?: string[];
    cohort_type?: string;
    enabled: boolean;
    registration_periods?: string[];
    retention_periods?: number[];
  };
}

// 报表数据项接口
export interface ReportDataItem {
  time: string;
  metrics: Record<string, any>;
  group_by?: Record<string, any>;
  metadata?: Record<string, any>;
}

// 报表汇总接口
export interface ReportSummary {
  total_records: number;
  metrics: Record<string, any>;
  trends?: Record<string, number>;
  highlights?: string[];
}

// 报表对比数据接口
export interface ReportComparison {
  previous_period?: ReportSummary;
  same_period_last_year?: ReportSummary;
  changes?: Record<string, number>;
}

// 分页信息接口
export interface PaginationInfo {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 报表元数据接口
export interface ReportMetadata {
  query_time: number;
  data_sources: string[];
  metrics: MetricConfig[];
  filters: Record<string, any>;
  cache_hit: boolean;
  version: string;
}

// 报表响应接口
export interface ReportResponse {
  report_type: ReportType;
  granularity: TimeGranularity;
  start_time: string;
  end_time: string;
  generated_at: string;
  data: ReportDataItem[];
  summary?: ReportSummary;
  comparison?: ReportComparison;
  pagination?: PaginationInfo;
  metadata: ReportMetadata;
}

// 报表类型信息接口
export interface ReportTypeInfo {
  type: ReportType;
  name: string;
  description: string;
  icon?: string;
}

// API 接口函数

/**
 * 生成报表
 */
export async function generateReport(
  data: ReportRequest,
): Promise<ReportResponse> {
  return requestClient.post('/analyse/report', data);
}

/**
 * 获取快速报表
 */
export async function getQuickReport(
  type: ReportType,
  period: string = 'today',
): Promise<ReportResponse> {
  return requestClient.get('/analyse/quick-report', {
    params: { type, period },
  });
}

/**
 * 获取报表类型列表
 */
export async function getReportTypes(): Promise<ReportTypeInfo[]> {
  return requestClient.get('/analyse/report-types');
}

/**
 * 获取报表指标
 */
export async function getReportMetrics(
  type: ReportType,
): Promise<MetricConfig[]> {
  return requestClient.get('/analyse/report-metrics', {
    params: { type },
  });
}

/**
 * 导出报表
 */
export async function exportReport(
  data: ReportRequest,
  format: string = 'csv',
): Promise<Blob> {
  return requestClient.post('/analyse/report/export', data, {
    params: { format },
    responseType: 'blob',
  });
}

/**
 * 获取报表配置
 */
export async function getReportConfig(type: ReportType): Promise<any> {
  return requestClient.get('/analyse/report-config', {
    params: { type },
  });
}

/**
 * 获取去重渠道（基于用户表 channel_name，按注册时间范围）
 */
export async function getDistinctChannels(
  start_time: string,
  end_time: string,
): Promise<string[]> {
  return requestClient.get('/analyse/channels', {
    params: { start: start_time, end: end_time },
  });
}

// 预定义的报表配置

/**
 * 用户报表指标配置
 */
export const USER_METRICS: MetricConfig[] = [
  {
    name: 'new_users',
    type: MetricType.COUNT,
    field: 'id',
    alias: '新增用户',
    description: '新注册用户数',
  },
  {
    name: 'active_users',
    type: MetricType.COUNT,
    field: 'id',
    alias: '活跃用户',
    description: '活跃用户数',
  },
  {
    name: 'retention_rate',
    type: MetricType.RATE,
    alias: '留存率',
    description: '用户留存率',
  },
];

/**
 * 收入报表指标配置
 */
export const REVENUE_METRICS: MetricConfig[] = [
  {
    name: 'total_revenue',
    type: MetricType.SUM,
    field: 'amount',
    alias: '总收入',
    description: '总收入金额',
  },
  {
    name: 'order_count',
    type: MetricType.COUNT,
    field: 'id',
    alias: '订单数',
    description: '订单总数',
  },
  {
    name: 'avg_order_value',
    type: MetricType.AVG,
    field: 'amount',
    alias: '客单价',
    description: '平均订单金额',
  },
  {
    name: 'payment_success_rate',
    type: MetricType.RATE,
    alias: '支付成功率',
    description: '支付成功率',
  },
];

/**
 * 埋点分析指标配置
 */
export const ANALYTICS_METRICS: MetricConfig[] = [
  {
    name: 'event_count',
    type: MetricType.COUNT,
    field: 'event_count',
    alias: '事件数',
    description: '事件触发次数',
  },
  {
    name: 'unique_users',
    type: MetricType.COUNT,
    field: 'user_id',
    alias: '独立用户',
    description: '触发事件的独立用户数',
  },
  {
    name: 'avg_value',
    type: MetricType.AVG,
    field: 'accumulated_value',
    alias: '平均值',
    description: '事件平均值',
  },
];

/**
 * 获取默认指标配置
 */
export function getDefaultMetrics(reportType: ReportType): MetricConfig[] {
  switch (reportType) {
    case ReportType.ANALYTICS: {
      return ANALYTICS_METRICS;
    }
    case ReportType.REVENUE: {
      return REVENUE_METRICS;
    }
    case ReportType.USER: {
      return USER_METRICS;
    }
    default: {
      return [];
    }
  }
}

/**
 * 构建时间范围
 */
export function buildTimeRange(period: string): {
  end_time: string;
  start_time: string;
} {
  const now = new Date();
  let startTime: Date;
  let endTime: Date;

  switch (period) {
    case 'last_month': {
      startTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endTime = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case 'month': {
      startTime = new Date(now.getFullYear(), now.getMonth(), 1);
      endTime = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    }
    case 'today': {
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
      break;
    }
    case 'week': {
      const weekday = now.getDay() === 0 ? 7 : now.getDay();
      startTime = new Date(now.getTime() - (weekday - 1) * 24 * 60 * 60 * 1000);
      startTime = new Date(
        startTime.getFullYear(),
        startTime.getMonth(),
        startTime.getDate(),
      );
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    }
    case 'yesterday': {
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
      break;
    }
    default: {
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  return {
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
  };
}
