import React, { useEffect, useState } from 'react';

import { agentApi } from '../api';
import { SaleRecord } from '../api/types';

import '../styles/SaleRecords.css';

interface SaleRecordItemProps {
  record: SaleRecord;
  onCancel: (saleId: number) => void;
}

// 撤销确认弹窗组件
interface CancelConfirmModalProps {
  record: SaleRecord;
  onCancel: () => void;
  onConfirm: () => void;
}

const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  record,
  onCancel,
  onConfirm,
}) => {
  // 格式化套餐名称
  const formatPackageName = (skuName: string): string => {
    let memberType = '';
    if (skuName.includes('VIP')) {
      memberType = skuName.includes('SVIP') ? 'SVIP' : 'VIP';
    }

    let duration = '';
    if (skuName.includes('单日')) {
      duration = '单日';
    } else if (skuName.includes('3天')) {
      duration = '3天';
    } else if (skuName.includes('7天')) {
      duration = '7天';
    } else if (skuName.includes('月卡')) {
      duration = '月卡';
    } else if (skuName.includes('季卡')) {
      duration = '季卡';
    }

    return `${memberType} ${duration}`;
  };

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h2 className="confirm-title">撤销充值确认</h2>

        <div className="confirm-info-item">
          <span className="confirm-label">充值用户ID</span>
          <span className="confirm-value">{record.user_id}</span>
        </div>

        <div className="confirm-info-item">
          <span className="confirm-label">订单号</span>
          <span className="confirm-value">{record.transaction_id}</span>
        </div>

        <div className="confirm-info-item">
          <span className="confirm-label">套餐类型</span>
          <span className="confirm-value">
            {formatPackageName(record.sku_name)}
          </span>
        </div>

        <div className="confirm-info-item">
          <span className="confirm-label">撤销说明</span>
          <span className="confirm-value">回收会员周期，恢复库存</span>
        </div>

        <div className="confirm-buttons">
          <button className="cancel-button" onClick={onCancel}>
            取消
          </button>
          <button className="cancel-confirm-button" onClick={onConfirm}>
            确认撤销充值
          </button>
        </div>
      </div>
    </div>
  );
};

// 错误提示弹窗组件
interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="error-modal">
        <h3 className="error-modal-title">操作失败</h3>
        <div className="error-modal-content">
          <p>{message}</p>
        </div>
        <div className="error-modal-buttons">
          <button className="confirm-button" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

const SaleRecordItem: React.FC<SaleRecordItemProps> = ({
  record,
  onCancel,
}) => {
  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  };

  // 检查是否在24小时内
  const isWithin24Hours = (dateString: string): boolean => {
    const recordDate = new Date(dateString);
    const now = new Date();
    const diffInHours =
      (now.getTime() - recordDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  // 格式化套餐名称
  const formatPackageName = (skuName: string): string => {
    // 检查是否包含VIP或SVIP
    let memberType = '';
    if (skuName.includes('VIP')) {
      memberType = skuName.includes('SVIP') ? 'SVIP' : 'VIP';
    }

    // 检查天数
    let duration = '';
    if (skuName.includes('单日')) {
      duration = '单日';
    } else if (skuName.includes('3天')) {
      duration = '3天';
    } else if (skuName.includes('7天')) {
      duration = '7天';
    } else if (skuName.includes('月卡')) {
      duration = '30天';
    } else if (skuName.includes('季卡')) {
      duration = '90天';
    }

    return `${memberType}_${duration}`;
  };

  const canCancel =
    isWithin24Hours(record.created_at) && record.status !== 'cancelled';

  return (
    <div className="sale-record-item">
      <div className="record-time">{formatDate(record.created_at)}</div>
      <div className="record-details">
        <div className="record-user-info">
          <span className="record-label">充值ID：</span>
          <span className="record-value">{record.user_id}</span>
        </div>

        <div className="record-order-info">
          <span className="record-label">订单号：</span>
          <span className="record-value">{record.transaction_id}</span>
        </div>
      </div>
      <div className="record-package-info">
        <div className="record-package">
          {formatPackageName(record.sku_name)}
        </div>
        {(() => {
          if (record.status === 'cancelled') {
            return (
              <div className="cancelled-status">
                <img
                  alt="已撤销"
                  className="cancelled-icon"
                  src="/assets/y.png"
                />
                已撤消充值
              </div>
            );
          }
          if (canCancel) {
            return (
              <button
                className="cancel-sale-button"
                onClick={() => onCancel(record.id)}
              >
                撤消充值
              </button>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

const SaleRecords: React.FC = () => {
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelingSaleId, setCancelingSaleId] = useState<null | number>(null);
  const [_cancelling, setCancelling] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 加载销售记录数据
  useEffect(() => {
    const fetchSaleRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await agentApi.getSales();
        setRecords(data);
      } catch (error_) {
        console.error('获取充值记录失败:', error_);
        setError('获取充值记录失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleRecords();
  }, []);

  // 处理撤销充值
  const handleCancelSale = (saleId: number) => {
    setCancelingSaleId(saleId);
    setShowCancelModal(true);
  };

  // 确认撤销
  const confirmCancel = async () => {
    if (!cancelingSaleId) return;

    setCancelling(true);
    try {
      await agentApi.cancelSale(cancelingSaleId);

      // 更新本地记录状态
      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === cancelingSaleId
            ? { ...record, status: 'cancelled' }
            : record,
        ),
      );

      setShowCancelModal(false);
      setCancelingSaleId(null);
    } catch (error_) {
      console.error('撤销充值失败:', error_);
      setErrorMessage('撤销充值失败，请稍后重试');
      setShowErrorModal(true);
      setShowCancelModal(false);
      setCancelingSaleId(null);
    } finally {
      setCancelling(false);
    }
  };

  // 取消撤销
  const cancelCancel = () => {
    setShowCancelModal(false);
    setCancelingSaleId(null);
  };

  // 关闭错误弹窗
  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  if (loading) {
    return <div className="records-loading">加载中...</div>;
  }

  if (error) {
    return <div className="records-error">{error}</div>;
  }

  if (records.length === 0) {
    return <div className="records-empty">暂无充值记录</div>;
  }

  return (
    <div className="sale-records-container">
      <h2 className="records-title">
        <span className="club-icon">♣</span> 充值记录
      </h2>
      <div className="records-list">
        {records.map((record) => (
          <SaleRecordItem
            key={record.id}
            onCancel={handleCancelSale}
            record={record}
          />
        ))}
      </div>

      {/* 撤销确认弹窗 */}
      {showCancelModal &&
        cancelingSaleId &&
        (() => {
          const record = records.find((r) => r.id === cancelingSaleId);
          return record ? (
            <CancelConfirmModal
              onCancel={cancelCancel}
              onConfirm={confirmCancel}
              record={record}
            />
          ) : null;
        })()}

      {/* 错误提示弹窗 */}
      {showErrorModal && (
        <ErrorModal message={errorMessage} onClose={closeErrorModal} />
      )}
    </div>
  );
};

export default SaleRecords;
