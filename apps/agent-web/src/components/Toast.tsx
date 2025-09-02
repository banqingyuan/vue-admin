import React, { useEffect, useState } from 'react';

import '../styles/Toast.css';

export enum ToastType {
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
}

interface ToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  type,
  message,
  visible,
  onClose,
  duration = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);

    if (visible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!isVisible) return null;

  const renderIcon = () => {
    if (type === ToastType.SUCCESS) {
      return (
        <div className="success-icon">
          <svg fill="none" viewBox="0 0 24 24">
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
      );
    }
    if (type === ToastType.ERROR) {
      return (
        <div className="error-icon">
          <svg fill="none" viewBox="0 0 24 24">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </div>
      );
    }
    return (
      <div className="info-icon">
        <svg fill="none" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={`toast-container ${isVisible ? 'visible' : ''}`}>
      <div className={`toast-content ${type}`}>
        <div className="toast-icon">{renderIcon()}</div>
        <div className="toast-message">{message}</div>
      </div>
    </div>
  );
};

export default Toast;
