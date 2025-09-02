import type {
  MemberPackage,
  MemberRechargeRequest,
  MemberRechargeResult,
} from './models';

/**
 * 会员服务类
 */
import type { Inventory, RechargeRequest } from '#/api/types';

import { agentApi } from '#/api';
import { formatDateTime } from '#/api/utils';

import { MemberDuration, MemberType } from './models';
import {
  getPackageById,
  getPackageBySkuId,
  getSvipPackages,
  getVipPackages,
  MEMBER_PACKAGES,
} from './sku-mapping';

/**
 * 会员服务类
 */
export class MemberService {
  /**
   * 获取所有套餐
   */
  getAllPackages(): MemberPackage[] {
    return [...MEMBER_PACKAGES];
  }

  /**
   * 获取会员有效期显示名称
   */
  getDurationDisplayName(duration: MemberDuration): string {
    switch (duration) {
      case MemberDuration.OneDay: {
        return '1天';
      }
      case MemberDuration.SevenDays: {
        return '7天';
      }
      case MemberDuration.ThirtyDays: {
        return '月卡';
      }
      case MemberDuration.ThreeDays: {
        return '3天';
      }
      default: {
        return `${duration}天`;
      }
    }
  }

  /**
   * 获取所有库存信息，并转换为套餐格式
   */
  async getInventories(): Promise<MemberPackage[]> {
    try {
      const inventories = await agentApi.getInventories();
      return this.mapInventoriesToPackages(inventories);
    } catch (error) {
      console.error('获取库存信息失败:', error);
      // 如果 API 调用失败，返回预定义的套餐
      return this.getAllPackages();
    }
  }

  /**
   * 获取会员类型显示名称
   */
  getMemberTypeDisplayName(type: MemberType): string {
    return type.toUpperCase();
  }

  /**
   * 获取套餐显示名称
   */
  getPackageDisplayName(type: MemberType, duration: MemberDuration): string {
    const pkg = MEMBER_PACKAGES.find(
      (p) => p.type === type && p.duration === duration,
    );
    return pkg ? pkg.displayName : `${type.toUpperCase()} ${duration}天`;
  }

  /**
   * 获取 SVIP 套餐
   */
  getSvipPackages(): MemberPackage[] {
    return getSvipPackages();
  }

  /**
   * 获取 VIP 套餐
   */
  getVipPackages(): MemberPackage[] {
    return getVipPackages();
  }

  /**
   * 充值会员
   */
  async rechargeMember(
    request: MemberRechargeRequest,
  ): Promise<MemberRechargeResult> {
    // 获取套餐信息
    const pkg = getPackageById(request.packageId);
    if (!pkg) {
      return {
        success: false,
        message: '无效的套餐 ID',
      };
    }

    try {
      // 准备 API 请求参数
      const rechargeRequest: RechargeRequest = {
        sku_id: pkg.skuId,
        user_id: request.userId,
      };

      const result = await agentApi.recharge(rechargeRequest);

      // 转换结果
      return {
        success: true,
        message: '充值成功',
        orderId: result.transaction_id,
        userId: result.user_id,
        packageInfo: {
          type: pkg.type,
          typeName: this.getMemberTypeDisplayName(pkg.type),
          duration: pkg.duration,
          durationName: this.getDurationDisplayName(pkg.duration),
          expireDate: result.created_at
            ? formatDateTime(result.created_at)
            : '',
        },
      };
    } catch (error) {
      console.error('充值失败:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : '充值失败，请稍后重试',
      };
    }
  }

  /**
   * 将库存信息映射为套餐格式
   */
  private mapInventoriesToPackages(inventories: Inventory[]): MemberPackage[] {
    return inventories
      .filter(
        (inv) =>
          inv.status === 'active' &&
          (inv.type === 'vip' || inv.type === 'svip'),
      )
      .map((inv) => {
        // 尝试从预定义的套餐中找到匹配的
        const existingPackage = getPackageBySkuId(inv.id);
        if (existingPackage) {
          return existingPackage;
        }

        // 如果没有找到匹配的，根据库存信息创建新的套餐
        const type = inv.type === 'vip' ? MemberType.VIP : MemberType.SVIP;
        let duration: MemberDuration;

        switch (inv.duration_days) {
          case 1: {
            duration = MemberDuration.OneDay;
            break;
          }
          case 3: {
            duration = MemberDuration.ThreeDays;
            break;
          }
          case 7: {
            duration = MemberDuration.SevenDays;
            break;
          }
          case 30: {
            duration = MemberDuration.ThirtyDays;
            break;
          }
          default: {
            // 不支持的有效期，跳过
            return null;
          }
        }

        return {
          type,
          duration,
          displayName: inv.name,
          skuId: inv.id,
        };
      })
      .filter((pkg): pkg is MemberPackage => pkg !== null); // 过滤掉不支持的套餐
  }
}

// 导出单例
export const memberService = new MemberService();
