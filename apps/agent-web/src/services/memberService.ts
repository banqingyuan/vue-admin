// 会员类型
export type MemberType = 'SVIP' | 'VIP';

// 会员有效期
export type MemberDuration = '3天' | '7天' | '月卡';

// 充值请求参数
export interface RechargeParams {
  userId: string;
  memberType: MemberType;
  duration: MemberDuration;
}

// 充值结果
export interface RechargeResult {
  success: boolean;
  message: string;
  data?: {
    duration: MemberDuration;
    expireDate: string;
    memberType: MemberType;
    orderId: string;
    userId: string;
  };
}

/**
 * 会员充值
 * @param params 充值参数
 * @returns 充值结果
 */
export const rechargeMember = async (
  params: RechargeParams,
): Promise<RechargeResult> => {
  if (!params.userId) {
    return {
      success: false,
      message: '请输入用户ID',
    };
  }

  // 模拟API请求
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功响应
      resolve({
        success: true,
        message: '充值成功',
        data: {
          orderId: `ORD${Date.now()}`,
          userId: params.userId,
          memberType: params.memberType,
          duration: params.duration,
          expireDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      });
    }, 1000);
  });
};
