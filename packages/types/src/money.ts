export interface Money {
  // 数据库存储的原始值（厘）
  milli: number;
}

// 用于后端传入 number（厘）时快速构造
export function asMoney(milli: null | number | undefined): Money {
  return { milli: Number(milli ?? 0) };
}
