import React, { useEffect, useState } from 'react';

import { agentApi } from '../api';
import { Inventory as InventoryType } from '../api/types';

import '../styles/Inventory.css';

// 库存卡片组件
interface InventoryCardProps {
  type: 'SVIP' | 'VIP';
  duration: string;
  quantity: number;
}

const InventoryCard: React.FC<InventoryCardProps> = ({
  type,
  duration,
  quantity,
}) => {
  // 确保quantity是数字并且不为undefined/null，如果是则使用0
  const safeQuantity = quantity || 0;

  // 数量为0时使用不同的样式
  const isEmpty = safeQuantity === 0;

  return (
    <div className="inventory-card">
      <div className="card-header">
        <span className={`card-type ${type === 'VIP' ? 'vip' : 'svip'}`}>
          {type}
        </span>
        <span className="card-duration">{duration}</span>
      </div>
      <div className="card-quantity">
        <span className={`quantity-value ${isEmpty ? 'empty' : ''}`}>
          {safeQuantity}
        </span>
        <span className="quantity-unit">张</span>
      </div>
    </div>
  );
};

const Inventory: React.FC = () => {
  const [inventories, setInventories] = useState<InventoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);

  // 映射库存数据到卡片数据
  const getCardData = () => {
    // 初始化卡片数据结构
    const cardData = [
      { type: 'VIP' as const, duration: '月卡', durationDays: 30, quantity: 0 },
      { type: 'VIP' as const, duration: '7天', durationDays: 7, quantity: 0 },
      { type: 'VIP' as const, duration: '3天', durationDays: 3, quantity: 0 },
      {
        type: 'SVIP' as const,
        duration: '月卡',
        durationDays: 30,
        quantity: 0,
      },
      { type: 'SVIP' as const, duration: '7天', durationDays: 7, quantity: 0 },
      { type: 'SVIP' as const, duration: '3天', durationDays: 3, quantity: 0 },
    ];

    // 根据API数据更新卡片数据
    if (inventories && inventories.length > 0) {
      inventories.forEach((item) => {
        const type = item.type.toLowerCase() === 'vip' ? 'VIP' : 'SVIP';
        const cardItem = cardData.find(
          (card) =>
            card.type === type && card.durationDays === item.duration_days,
        );

        if (cardItem) {
          cardItem.quantity = item.quantity || 0; // 确保quantity有值，否则使用0
        }
      });
    }

    return cardData;
  };

  // 加载库存数据
  useEffect(() => {
    const fetchInventories = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await agentApi.getInventories();
        setInventories(data);
      } catch (error_) {
        console.error('获取库存数据失败:', error_);
        setError('获取库存数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, []);

  if (loading) {
    return <div className="inventory-loading">加载中...</div>;
  }

  if (error) {
    return <div className="inventory-error">{error}</div>;
  }

  const cardData = getCardData();

  return (
    <div className="inventory-container">
      <h2 className="inventory-title">
        <span className="heart-icon">♥</span> 库存
      </h2>
      <div className="inventory-grid">
        {cardData.map((card, index) => (
          <InventoryCard
            duration={card.duration}
            key={index}
            quantity={card.quantity}
            type={card.type}
          />
        ))}
      </div>
    </div>
  );
};

export default Inventory;
