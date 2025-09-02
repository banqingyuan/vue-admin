/**
 * 代理商 API 服务
 */

import type {
  AgentInfo,
  ApiResponse,
  CancelSaleResponse,
  Inventory,
  RechargeInfo,
  RechargeRequest,
  SaleRecord,
} from './types';

import { agentRequestClient } from './request';

/**
 * 代理商 API 类
 */
export class AgentApi {
  /**
   * 撤销充值
   * POST /api/agent/sales/:sale_id/cancel
   * @param saleId 销售记录 ID
   */
  async cancelSale(saleId: number): Promise<CancelSaleResponse> {
    const response = await agentRequestClient.post<
      ApiResponse<CancelSaleResponse>
    >(`/agent/sales/${saleId}/cancel`);
    return (response as any).data;
  }

  /**
   * 获取代理商信息
   * GET /api/agent/info
   */
  async getAgentInfo(): Promise<AgentInfo> {
    const response =
      await agentRequestClient.get<ApiResponse<AgentInfo>>('/agent/info');
    return (response as any).data;
  }

  /**
   * 获取库存信息
   * GET /api/agent/inventories
   */
  async getInventories(): Promise<Inventory[]> {
    const response =
      await agentRequestClient.get<ApiResponse<Inventory[]>>(
        '/agent/inventories',
      );
    return (response as any).data;
  }

  /**
   * 获取销售记录
   * GET /api/agent/sales
   */
  async getSales(): Promise<SaleRecord[]> {
    const response =
      await agentRequestClient.get<ApiResponse<SaleRecord[]>>('/agent/sales');
    return (response as any).data;
  }

  /**
   * 充值接口
   * POST /api/agent/recharge
   * @param data 充值请求数据
   */
  async recharge(data: RechargeRequest): Promise<RechargeInfo> {
    const response = await agentRequestClient.post<ApiResponse<RechargeInfo>>(
      '/agent/recharge',
      data,
    );
    return (response as any).data;
  }
}

// 导出单例
export const agentApi = new AgentApi();
