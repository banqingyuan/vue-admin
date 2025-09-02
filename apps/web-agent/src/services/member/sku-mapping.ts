/**
 * SKU 映射关系
 */
import type { MemberPackage } from './models';

import { MemberDuration, MemberType } from './models';

/**
 * 会员套餐列表（硬编码的 SKU 映射关系）
 *
 * 与 API 返回的 SKU 对应关系：
 * - VIP 3 天: ID = 8
 * - VIP 7 天: ID = 7
 * - VIP 30 天: ID = 5
 * - SVIP 3 天: ID = 4
 * - SVIP 7 天: ID = 3
 * - SVIP 30 天: ID = 1
 */
export const MEMBER_PACKAGES: MemberPackage[] = [
  {
    type: MemberType.VIP,
    duration: MemberDuration.OneDay,
    displayName: 'VIP 1天',
    skuId: 10,
  },
  {
    type: MemberType.VIP,
    duration: MemberDuration.ThreeDays,
    displayName: 'VIP 3天',
    skuId: 8,
  },
  {
    type: MemberType.VIP,
    duration: MemberDuration.SevenDays,
    displayName: 'VIP 7天',
    skuId: 7,
  },
  {
    type: MemberType.VIP,
    duration: MemberDuration.ThirtyDays,
    displayName: 'VIP 月卡',
    skuId: 5,
  },
  {
    type: MemberType.SVIP,
    duration: MemberDuration.OneDay,
    displayName: 'SVIP 1天',
    skuId: 9,
  },
  {
    type: MemberType.SVIP,
    duration: MemberDuration.ThreeDays,
    displayName: 'SVIP 3天',
    skuId: 4,
  },
  {
    type: MemberType.SVIP,
    duration: MemberDuration.SevenDays,
    displayName: 'SVIP 7天',
    skuId: 3,
  },
  {
    type: MemberType.SVIP,
    duration: MemberDuration.ThirtyDays,
    displayName: 'SVIP 月卡',
    skuId: 1,
  },
];

/**
 * 根据会员类型和有效期获取套餐
 */
export function getPackageByTypeAndDuration(
  type: MemberType,
  duration: MemberDuration,
): MemberPackage | undefined {
  return MEMBER_PACKAGES.find(
    (pkg) => pkg.type === type && pkg.duration === duration,
  );
}

/**
 * 根据套餐 ID 获取套餐
 * @param packageId 套餐 ID (格式: type_duration, e.g., vip_3 or svip_1)
 */
export function getPackageById(packageId: string): MemberPackage | undefined {
  const parts = packageId.split('_');
  if (parts.length !== 2) return undefined;

  const type = parts[0] as MemberType;
  const durationValue = Number.parseInt(parts[1], 10) as MemberDuration;

  if (
    !Object.values(MemberType).includes(type) ||
    Number.isNaN(durationValue)
  ) {
    return undefined;
  }

  return MEMBER_PACKAGES.find(
    (pkg) => pkg.type === type && pkg.duration === durationValue,
  );
}

/**
 * 根据 SKU ID 获取套餐
 */
export function getPackageBySkuId(skuId: number): MemberPackage | undefined {
  return MEMBER_PACKAGES.find((pkg) => pkg.skuId === skuId);
}

/**
 * 生成套餐 ID
 */
export function generatePackageId(
  type: MemberType,
  duration: MemberDuration,
): string {
  return `${type}_${duration}`;
}

/**
 * 获取所有 VIP 套餐
 */
export function getVipPackages(): MemberPackage[] {
  return MEMBER_PACKAGES.filter((pkg) => pkg.type === MemberType.VIP);
}

/**
 * 获取所有 SVIP 套餐
 */
export function getSvipPackages(): MemberPackage[] {
  return MEMBER_PACKAGES.filter((pkg) => pkg.type === MemberType.SVIP);
}
