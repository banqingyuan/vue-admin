/**
 * API工具函数
 */

/**
 * 格式化金额（分转元）
 * @param amount 金额（分）
 * @returns 格式化后的金额（元）
 */
export const formatAmount = (amount: number): string => {
  return (amount / 100).toFixed(2);
};

/**
 * 格式化日期时间
 * @param dateStr ISO日期字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

/**
 * 获取会员类型显示名称
 * @param type 会员类型
 * @returns 显示名称
 */
export const getMemberTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    vip: 'VIP',
    svip: 'SVIP',
  };

  return typeMap[type.toLowerCase()] || type;
};

/**
 * 获取会员有效期显示名称
 * @param days 天数
 * @returns 显示名称
 */
export const getDurationDisplayName = (days: number): string => {
  const durationMap: Record<number, string> = {
    3: '3天',
    7: '7天',
    30: '月卡',
    90: '季卡',
    365: '年卡',
  };

  return durationMap[days] || `${days}天`;
};
