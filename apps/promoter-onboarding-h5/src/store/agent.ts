import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  WithdrawalBalance,
  SelfPromotionStats,
  CommissionRates,
  ChildAgentStats,
} from '#/api/agent';
import {
  getWithdrawalBalanceApi,
  getSelfPromotionStatsApi,
  getCommissionRatesApi,
  getChildrenStatsApi,
} from '#/api/agent';
import { getStatusApi } from '#/api/promoter';

export interface PromoterInfo {
  promoter_id: number;
  level: number | null; // 1: 一级代理, 2: 二级代理
  approval_status: string;
  phone: string;
  name: string;
  type: 'personal' | 'company';
}

export const useAgentStore = defineStore('agent', () => {
  const promoterInfo = ref<PromoterInfo | null>(null);
  const withdrawalBalance = ref<WithdrawalBalance | null>(null);
  const selfPromotionStats = ref<SelfPromotionStats | null>(null);
  const commissionRates = ref<CommissionRates | null>(null);
  const childrenStats = ref<ChildAgentStats[]>([]);

  // 加载promoter基本信息（从现有接口获取）
  async function loadPromoterInfo() {
    try {
      const statusInfo = await getStatusApi();
      
      // 直接从status接口获取所有信息
      promoterInfo.value = {
        promoter_id: statusInfo.promoter_id,
        level: statusInfo.level,
        approval_status: statusInfo.status,
        phone: statusInfo.phone,
        name: statusInfo.name,
        type: statusInfo.type,
      };
    } catch (error) {
      console.error('加载promoter信息失败:', error);
      throw error;
    }
  }

  // 加载提现余额
  async function loadWithdrawalBalance() {
    try {
      withdrawalBalance.value = await getWithdrawalBalanceApi();
    } catch (error) {
      console.error('加载提现余额失败:', error);
      throw error;
    }
  }

  // 加载自身推广统计
  async function loadSelfPromotionStats() {
    try {
      selfPromotionStats.value = await getSelfPromotionStatsApi();
    } catch (error) {
      console.error('加载推广统计失败:', error);
      throw error;
    }
  }

  // 加载佣金比例
  async function loadCommissionRates() {
    try {
      commissionRates.value = await getCommissionRatesApi();
    } catch (error) {
      console.error('加载佣金比例失败:', error);
      throw error;
    }
  }

  // 加载下级代理统计
  async function loadChildrenStats() {
    try {
      const res = await getChildrenStatsApi();
      // 后端可能返回 data=null，这里兜底为 []
      childrenStats.value = Array.isArray(res) ? res : [];
    } catch (error) {
      console.error('加载下级代理统计失败:', error);
      throw error;
    }
  }

  // 清空数据
  function clearData() {
    promoterInfo.value = null;
    withdrawalBalance.value = null;
    selfPromotionStats.value = null;
    commissionRates.value = null;
    childrenStats.value = [];
  }

  return {
    promoterInfo,
    withdrawalBalance,
    selfPromotionStats,
    commissionRates,
    childrenStats,
    loadPromoterInfo,
    loadWithdrawalBalance,
    loadSelfPromotionStats,
    loadCommissionRates,
    loadChildrenStats,
    clearData,
  };
});

