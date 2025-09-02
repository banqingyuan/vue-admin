/**
 * 会员业务模型定义
 */

// 会员类型枚举
export enum MemberType {
  SVIP = 'svip',
  VIP = 'vip',
}

// 会员有效期枚举（天数）
export enum MemberDuration {
  OneDay = 1,
  SevenDays = 7,
  ThirtyDays = 30,
  ThreeDays = 3,
}

// 会员套餐模型
export interface MemberPackage {
  type: MemberType;
  duration: MemberDuration;
  displayName: string;
  skuId: number; // 与 API 中的 SKU ID 对应
}

// 会员充值请求
export interface MemberRechargeRequest {
  userId: number; // 用户 ID
  packageId: string; // 前端使用的套餐 ID (格式: type_duration)
}

// 会员充值结果
export interface MemberRechargeResult {
  success: boolean;
  message: string;
  orderId?: string;
  userId?: number;
  packageInfo?: {
    duration: MemberDuration;
    durationName: string;
    expireDate: string;
    type: MemberType;
    typeName: string;
  };
}
