/**
 * SKU映射关系
 */
import { MemberDuration, MemberPackage, MemberType } from './models';

/**
 * 会员套餐列表（硬编码的SKU映射关系）
 *
 * 与API返回的SKU对应关系：
 * - VIP 3天: ID = 8
 * - VIP 7天: ID = 7
 * - VIP 30天: ID = 5
 * - SVIP 3天: ID = 4
 * - SVIP 7天: ID = 3
 * - SVIP 30天: ID = 1
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
 * @param type 会员类型
 * @param duration 有效期
 * @returns 对应的套餐
 */
export const getPackageByTypeAndDuration = (
  type: MemberType,
  duration: MemberDuration,
): MemberPackage | undefined => {
  return MEMBER_PACKAGES.find(
    (pkg) => pkg.type === type && pkg.duration === duration,
  );
};

/**
 * 根据套餐ID获取套餐
 * @param packageId 套餐ID (格式: type_duration, e.g., vip_3 or svip_1)
 * @returns 对应的套餐
 */
export const getPackageById = (
  packageId: string,
): MemberPackage | undefined => {
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
};

/**
 * 根据SKU ID获取套餐
 * @param skuId SKU ID
 * @returns 对应的套餐
 */
export const getPackageBySkuId = (skuId: number): MemberPackage | undefined => {
  return MEMBER_PACKAGES.find((pkg) => pkg.skuId === skuId);
};

/**
 * 生成套餐ID
 * @param type 会员类型
 * @param duration 有效期
 * @returns 套餐ID
 */
export const generatePackageId = (
  type: MemberType,
  duration: MemberDuration,
): string => {
  return `${type}_${duration}`;
};

/**
 * 获取所有VIP套餐
 */
export const getVipPackages = (): MemberPackage[] => {
  return MEMBER_PACKAGES.filter((pkg) => pkg.type === MemberType.VIP);
};

/**
 * 获取所有SVIP套餐
 */
export const getSvipPackages = (): MemberPackage[] => {
  return MEMBER_PACKAGES.filter((pkg) => pkg.type === MemberType.SVIP);
};
