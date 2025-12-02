import { request } from './http';

export type SubmitInfoPayload = {
  type: 'personal' | 'company';
  phone?: string;
  name?: string;
  introduction?: string;
  detail_info: Record<string, any>;
  senior_id?: number;
};

export function submitInfoApi(data: SubmitInfoPayload) {
  return request({
    method: 'POST',
    url: '/promoter/submit-info',
    data,
  });
}

// 推广员状态响应
export interface PromoterStatusResponse {
  status: string;       // 状态：not_submitted/pending/reject/pass/active
  promoter_id: number;  // 推广员ID
  name: string;         // 姓名
  phone: string;        // 手机号
  level: number | null; // 级别：1-一级代理，2-二级代理
  type: 'personal' | 'company'; // 类型：个人/企业
}

export function getStatusApi() {
  return request<PromoterStatusResponse>({
    method: 'GET',
    url: '/promoter/status',
  });
}

export interface ValidateSeniorResponse {
  valid: boolean;
  senior_name?: string;
}

export function validateSeniorIdApi(seniorId: string | number) {
  return request<ValidateSeniorResponse>({
    method: 'GET',
    url: `/promoter/validate-senior/${seniorId}`,
  });
}
export interface WithdrawalResponse {
  id: number;
  promoter_id: number;
  amount_fen: number;
  status: string;
  created_at: string;
}

export function requestWithdrawalApi(amountFen: number) {
  return request<WithdrawalResponse>({
    method: 'POST',
    url: '/promoter/withdrawal',
    data: { amount_fen: amountFen },
  });
}

