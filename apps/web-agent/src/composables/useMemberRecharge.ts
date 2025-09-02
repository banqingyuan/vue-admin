/**
 * 会员充值 Composable
 */
import type {
  MemberRechargeRequest,
  MemberRechargeResult,
} from '#/services/member';

import { ref } from 'vue';

import { memberService } from '#/services/member';

export function useMemberRecharge() {
  const loading = ref(false);
  const result = ref<MemberRechargeResult | null>(null);
  const error = ref<null | string>(null);

  /**
   * 充值会员
   */
  const rechargeMember = async (
    request: MemberRechargeRequest,
  ): Promise<MemberRechargeResult> => {
    loading.value = true;
    error.value = null;
    result.value = null;

    try {
      const rechargeResult = await memberService.rechargeMember(request);
      result.value = rechargeResult;
      return rechargeResult;
    } catch (error_: any) {
      console.error('会员充值失败:', error_);
      const errorMessage =
        error_ instanceof Error ? error_.message : '充值失败，请稍后重试';
      error.value = errorMessage;

      const failResult: MemberRechargeResult = {
        success: false,
        message: errorMessage,
      };
      result.value = failResult;
      return failResult;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    result,
    error,
    rechargeMember,
  };
}
