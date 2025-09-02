export interface Money {
  milli: number;
}

// 将厘转为元（保留两位小数，四舍五入）
export function moneyToYuan(m: Money): string {
  const n = Number(m?.milli ?? 0);
  const yuan = n / 1000; // 1 元 = 1000 厘
  return yuan.toFixed(2);
}

// 直接格式化后端返回的厘数值
export function formatYuanFromMilli(milli: null | number | undefined): string {
  const n = Number(milli ?? 0);
  return (n / 1000).toFixed(2);
}

// 将 number(金额/元) 转 Money(厘)
export function yuanToMoney(yuan: number | string): Money {
  const n = Number(yuan || 0);
  return { milli: Math.round(n * 1000) };
}
