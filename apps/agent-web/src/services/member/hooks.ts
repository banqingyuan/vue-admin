/**
 * 会员服务React Hooks
 */
import { useCallback, useEffect, useState } from 'react';

import memberService from './index';
import {
  MemberPackage,
  MemberRechargeRequest,
  MemberRechargeResult,
  MemberType,
} from './models';

/**
 * 使用会员套餐Hook
 */
export const useMemberPackages = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [packages, setPackages] = useState<MemberPackage[]>([]);
  const [vipPackages, setVipPackages] = useState<MemberPackage[]>([]);
  const [svipPackages, setSvipPackages] = useState<MemberPackage[]>([]);
  const [error, setError] = useState<null | string>(null);

  // 获取所有套餐
  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allPackages = await memberService.getInventories();
      setPackages(allPackages);

      // 按类型分类
      setVipPackages(allPackages.filter((pkg) => pkg.type === MemberType.VIP));
      setSvipPackages(
        allPackages.filter((pkg) => pkg.type === MemberType.SVIP),
      );
    } catch (error_) {
      console.error('获取会员套餐失败:', error_);
      setError(error_ instanceof Error ? error_.message : '获取套餐失败');

      // 使用预定义的套餐作为后备
      const fallbackPackages = memberService.getAllPackages();
      setPackages(fallbackPackages);
      setVipPackages(memberService.getVipPackages());
      setSvipPackages(memberService.getSvipPackages());
    } finally {
      setLoading(false);
    }
  }, []);

  // 组件挂载时获取套餐
  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return {
    loading,
    packages,
    vipPackages,
    svipPackages,
    error,
    refresh: fetchPackages,
  };
};

/**
 * 使用会员充值Hook
 */
export const useMemberRecharge = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<MemberRechargeResult | null>(null);
  const [error, setError] = useState<null | string>(null);

  // 充值会员
  const rechargeMember = useCallback(async (request: MemberRechargeRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const rechargeResult = await memberService.rechargeMember(request);
      setResult(rechargeResult);

      return rechargeResult;
    } catch (error_) {
      console.error('会员充值失败:', error_);
      const errorMessage =
        error_ instanceof Error ? error_.message : '充值失败，请稍后重试';
      setError(errorMessage);

      const failResult: MemberRechargeResult = {
        success: false,
        message: errorMessage,
      };
      setResult(failResult);

      return failResult;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    result,
    error,
    rechargeMember,
  };
};
