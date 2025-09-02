import type { ReportResponse } from './report';

import { requestClient } from '../request';

export interface DistributorReportParams {
  pkg_name?: string;
  start?: string; // ISO string
  end?: string; // ISO string
}

export async function getDistributorReport(
  params?: DistributorReportParams,
): Promise<ReportResponse> {
  return requestClient.get('/analyse/distributor-report', { params });
}

// 获取所有分销商（渠道）名称列表
export interface DistributorItem {
  id: number;
  name: string;
}
export async function getAllDistributors(): Promise<DistributorItem[]> {
  return requestClient.get('/analyse/distributors');
}

// 管理员下拉：分销商及其渠道包
export interface DistributorOption {
  distributor_id: number;
  distributor_name: string;
  packages: string[];
}
export async function getDistributorOptions(): Promise<DistributorOption[]> {
  return requestClient.get('/analyse/distributor-options');
}
