import { HttpClient } from './http';
import {
  AgentInfo,
  ApiResponse,
  CancelSaleResponse,
  Inventory,
  RechargeInfo,
  RechargeRequest,
  SaleRecord,
} from './types';

/**
 * 代理商API服务
 */
export class AgentApi {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient();
  }

  /**
   * 撤销充值
   * POST /api/agent/sales/:sale_id/cancel
   * @param saleId 销售记录ID
   */
  async cancelSale(saleId: number): Promise<CancelSaleResponse> {
    const response = await this.http.post<ApiResponse<CancelSaleResponse>>(
      `/api/agent/sales/${saleId}/cancel`,
    );
    return response.data;
  }

  /**
   * 获取代理商信息
   * GET /api/agent/info
   */
  async getAgentInfo(): Promise<AgentInfo> {
    const response =
      await this.http.get<ApiResponse<AgentInfo>>('/api/agent/info');
    return response.data;
  }

  /**
   * 获取库存信息
   * GET /api/agent/inventories
   */
  async getInventories(): Promise<Inventory[]> {
    const response = await this.http.get<ApiResponse<Inventory[]>>(
      '/api/agent/inventories',
    );
    return response.data;
  }

  /**
   * 获取销售记录
   * GET /api/agent/sales
   */
  async getSales(): Promise<SaleRecord[]> {
    const response =
      await this.http.get<ApiResponse<SaleRecord[]>>('/api/agent/sales');
    return response.data;
  }

  /**
   * 充值接口
   * POST /api/agent/recharge
   * @param data 充值请求数据
   */
  async recharge(data: RechargeRequest): Promise<RechargeInfo> {
    const response = await this.http.post<ApiResponse<RechargeInfo>>(
      '/api/agent/recharge',
      data,
    );
    return response.data;
  }
}
