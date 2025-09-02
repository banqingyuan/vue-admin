import { Segmented } from 'antd';
import React, { useEffect, useState } from 'react';

import {
  checkLoginStatus,
  getLogoutUrl,
  getUserRole,
} from '../services/authing';
import {
  generatePackageId,
  MemberDuration,
  MemberType,
  useMemberRecharge,
} from '../services/member';
import Inventory from './Inventory';
import SaleRecords from './SaleRecords';
import Toast, { ToastType } from './Toast';

import '../styles/Home.css';

// 用户ID和手机号验证正则表达式
const USER_ID_REGEX = /^\d{8}$/; // 8位数字

// 输入类型枚举
enum InputType {
  INVALID = 'invalid',
  UNKNOWN = 'unknown',
  USER_ID = 'userId',
}

// 页面类型
type PageType = '会员充值' | '充值记录' | '库存';

// 确认弹窗组件
interface ConfirmModalProps {
  userId: string;
  memberType: MemberType;
  duration: MemberDuration;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  userId,
  memberType,
  duration,
  onCancel,
  onConfirm,
}) => {
  // 根据duration获取显示名称
  const getDurationText = (duration: MemberDuration): string => {
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
  };

  // 根据duration获取有效期天数
  const getDurationDays = (duration: MemberDuration): string => {
    switch (duration) {
      case MemberDuration.OneDay: {
        return '1天';
      }
      case MemberDuration.SevenDays: {
        return '7天';
      }
      case MemberDuration.ThirtyDays: {
        return '30天';
      }
      case MemberDuration.ThreeDays: {
        return '3天';
      }
      default: {
        return `${duration}天`;
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h2 className="confirm-title">充值信息确认</h2>

        <div className="confirm-info-item">
          <span className="confirm-label">充值用户ID</span>
          <span className="confirm-value">{userId}</span>
        </div>

        <div className="confirm-info-item">
          <span className="confirm-label">会员类型</span>
          <span className="confirm-value">{memberType.toUpperCase()}</span>
        </div>

        <div className="confirm-info-item">
          <span className="confirm-label">类型</span>
          <span className="confirm-value">{getDurationText(duration)}</span>
        </div>

        <div className="confirm-info-item">
          <span className="confirm-label">有效期</span>
          <span className="confirm-value">{getDurationDays(duration)}</span>
        </div>

        <div className="confirm-buttons">
          <button className="cancel-button" onClick={onCancel}>
            取消
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            确认立即充值
          </button>
        </div>
      </div>
    </div>
  );
};

// 会员充值组件
const RechargeContent: React.FC<{
  duration: MemberDuration;
  getInputHint: () => React.ReactNode;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleShowConfirm: () => void;
  inputError: string;
  inputType: InputType;
  loading: boolean;
  memberType: MemberType;
  setDuration: (duration: MemberDuration) => void;
  setMemberType: (type: MemberType) => void;
  userInput: string;
  userRole: null | string | string[];
}> = ({
  memberType,
  setMemberType,
  duration,
  setDuration,
  userInput,
  inputType,
  inputError,
  handleInputChange,
  getInputHint,
  handleShowConfirm,
  loading,
  userRole,
}) => {
  const isAdmin =
    userRole === 'admin' ||
    (Array.isArray(userRole) && userRole.includes('admin'));
  return (
    <div className="recharge-content">
      <h2 className="section-title">♠ 会员充值</h2>

      <div className="member-type-section">
        <div className="section-label">会员类型</div>
        <div className="option-buttons">
          <button
            className={`option-button ${memberType === MemberType.VIP ? 'active' : ''}`}
            onClick={() => setMemberType(MemberType.VIP)}
          >
            VIP
          </button>
          <button
            className={`option-button ${memberType === MemberType.SVIP ? 'active' : ''}`}
            onClick={() => setMemberType(MemberType.SVIP)}
          >
            SVIP
          </button>
        </div>
      </div>

      <div className="duration-section">
        <div className="section-label">会员有效期</div>
        <div className="option-buttons">
          <button
            className={`option-button ${duration === MemberDuration.ThirtyDays ? 'active' : ''}`}
            onClick={() => setDuration(MemberDuration.ThirtyDays)}
          >
            月卡
          </button>
          <button
            className={`option-button ${duration === MemberDuration.SevenDays ? 'active' : ''}`}
            onClick={() => setDuration(MemberDuration.SevenDays)}
          >
            7天
          </button>
          <button
            className={`option-button ${duration === MemberDuration.ThreeDays ? 'active' : ''}`}
            onClick={() => setDuration(MemberDuration.ThreeDays)}
          >
            3天
          </button>
          {isAdmin && (
            <button
              className={`option-button ${duration === MemberDuration.OneDay ? 'active' : ''}`}
              onClick={() => setDuration(MemberDuration.OneDay)}
            >
              1天
            </button>
          )}
        </div>
      </div>

      <div className="user-id-section">
        <div className="section-label">输入用户ID</div>
        <input
          className={`user-id-input ${inputError ? 'error' : ''}`}
          onChange={handleInputChange}
          placeholder="请输入用户ID（8位数字）"
          type="text"
          value={userInput}
        />
        <div className="input-hint-container">{getInputHint()}</div>
      </div>

      <button
        className={`recharge-button ${loading ? 'loading' : ''}`}
        disabled={
          loading ||
          inputType === InputType.INVALID ||
          inputType === InputType.UNKNOWN
        }
        onClick={handleShowConfirm}
      >
        {loading ? '充值中...' : '立即充值'}
      </button>
    </div>
  );
};

// 退出登录模态框组件
interface LogoutModalProps {
  phoneNumber: string;
  onCancel: () => void;
  onLogout: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  phoneNumber,
  onCancel,
  onLogout,
}) => {
  return (
    <div className="bottom-modal-overlay" onClick={onCancel}>
      <div className="bottom-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-account-info">当前登录账号：{phoneNumber}</div>
        <button className="logout-button" onClick={onLogout}>
          退出登录
        </button>
        <button className="cancel-logout-button" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
};

// 手机号脱敏处理函数
const maskPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || phoneNumber.length < 11) return phoneNumber;
  return `${phoneNumber.slice(0, 3)}***${phoneNumber.slice(7)}`;
};

// 代理合作页面组件
interface AgencyPageProps {
  onClose: () => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const AgencyPage: React.FC<AgencyPageProps> = ({ onClose, onClick }) => {
  return (
    <div className="slide-in-page" onClick={onClick}>
      <div className="slide-in-header">
        <button className="back-button" onClick={onClose}>
          <span className="back-arrow">&#8592;</span>
        </button>
        <h2 className="slide-in-title">代理合作</h2>
      </div>
      <div className="agency-content">
        <div className="qr-code-container">
          <img
            alt="代理合作微信二维码"
            className="agency-qrcode"
            src="/assets/agency-qr.png"
          />
        </div>
        <div className="agency-text">合作微信二维码</div>
        <div
          className="wechat-id-container"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText('aijpq11');
            // no-alert: 使用非阻塞通知或控制台提示替代
            console.warn('微信号已复制');
          }}
        >
          <img alt="微信" className="wechat-icon" src="/assets/wechat.svg" />
          <div className="wechat-id-label">合作微信号：</div>
          <div className="wechat-id">aijpq11</div>
          <img alt="复制" className="copy-icon" src="/assets/copy.png" />
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  // 使用会员充值Hook
  const { loading, rechargeMember } = useMemberRecharge();

  // 状态
  const [memberType, setMemberType] = useState<MemberType>(MemberType.SVIP);
  const [duration, setDuration] = useState<MemberDuration>(
    MemberDuration.ThirtyDays,
  );
  const [userInput, setUserInput] = useState<string>('');
  const [inputType, setInputType] = useState<InputType>(InputType.UNKNOWN);
  const [inputError, setInputError] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<PageType>('会员充值');
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showAgencyModal, setShowAgencyModal] = useState<boolean>(false);
  const [maskedPhoneNumber, setMaskedPhoneNumber] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);
  const [userRole, setUserRole] = useState<null | string | string[]>(null);

  // 检查登录状态
  useEffect(() => {
    const fetchedUserInfo = checkLoginStatus();
    if (fetchedUserInfo) {
      // 处理手机号脱敏
      if (fetchedUserInfo.phone_number) {
        setMaskedPhoneNumber(maskPhoneNumber(fetchedUserInfo.phone_number));
      }
      // 获取用户角色
      const role = getUserRole();
      setUserRole(role);
      console.warn('Current user role:', role); // 调试日志
    } else {
      // 未登录，跳转到登录缓冲页面
      window.location.href = '/login-buffer';
    }
  }, []);

  // 显示Toast
  const displayToast = (
    message: string,
    type: ToastType = ToastType.SUCCESS,
    duration: number = 3000,
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    // 自动关闭
    setTimeout(() => {
      setToastVisible(false);
    }, duration);
  };

  // 验证并检测输入类型
  const validateInput = (input: string): InputType => {
    if (!input) return InputType.UNKNOWN;

    return USER_ID_REGEX.test(input) ? InputType.USER_ID : InputType.INVALID;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.trim();
    setUserInput(input);

    // 验证输入
    const type = validateInput(input);
    setInputType(type);

    // 设置错误信息
    if (input && type === InputType.INVALID) {
      setInputError('请输入有效的用户ID（8位数字）');
    } else {
      setInputError('');
    }
  };

  // 显示充值确认弹窗
  const handleShowConfirm = () => {
    if (!userInput) {
      setInputError('请输入用户ID');
      return;
    }

    // 再次验证输入
    const type = validateInput(userInput);

    if (type === InputType.INVALID || type === InputType.UNKNOWN) {
      setInputError('请输入有效的用户ID（8位数字）');
      return;
    }

    // 显示确认弹窗
    setShowConfirm(true);
  };

  // 处理确认取消
  const handleConfirmCancel = () => {
    setShowConfirm(false);
  };

  // 处理充值确认
  const handleConfirmRecharge = async () => {
    // 关闭确认弹窗
    setShowConfirm(false);

    // 继续充值流程
    // 生成套餐ID
    const packageId = generatePackageId(memberType, duration);

    // 准备请求参数 - 只保留用户ID逻辑
    const rechargeParams = {
      packageId,
      userId: Number.parseInt(userInput, 10),
    };

    // 调用充值服务
    const result = await rechargeMember(rechargeParams);

    if (result.success) {
      displayToast(result.message, ToastType.SUCCESS);
      // 成功后清空输入
      setUserInput('');
      setInputType(InputType.UNKNOWN);
      setInputError('');
    } else {
      displayToast(result.message || '充值失败，请重试', ToastType.ERROR);
    }
  };

  // 获取输入框下方的提示文本
  const getInputHint = () => {
    if (inputError) {
      return <span className="input-error">{inputError}</span>;
    }
    return null;
  };

  // 处理页面切换
  const handlePageChange = (value: PageType) => {
    setActivePage(value);
  };

  // 显示退出登录模态框
  const handleShowLogoutModal = () => {
    setShowLogoutModal(true);
  };

  // 关闭退出登录模态框
  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  // 处理退出登录
  const handleLogout = () => {
    // 关闭登出模态框
    setShowLogoutModal(false);

    // 显示退出中的toast
    displayToast('正在退出登录...', ToastType.INFO);

    // 获取登出URL并跳转
    const logoutUrl = getLogoutUrl();
    window.location.href = logoutUrl;
  };

  // 显示代理合作滑入页面
  const handleShowAgencyModal = () => {
    setShowAgencyModal(true);
  };

  // 关闭代理合作滑入页面
  const handleCloseAgencyModal = () => {
    setShowAgencyModal(false);
  };

  // 渲染当前页面内容
  const renderPageContent = () => {
    switch (activePage) {
      case '充值记录': {
        return <SaleRecords />;
      }
      case '库存': {
        return <Inventory />;
      }
      default: {
        return (
          <RechargeContent
            duration={duration}
            getInputHint={getInputHint}
            handleInputChange={handleInputChange}
            handleShowConfirm={handleShowConfirm}
            inputError={inputError}
            inputType={inputType}
            loading={loading}
            memberType={memberType}
            setDuration={setDuration}
            setMemberType={setMemberType}
            userInput={userInput}
            userRole={userRole}
          />
        );
      }
    }
  };

  return (
    <div className="home-container">
      <div className="header">
        <div className="logo-container">
          <div className="app-logo">
            <img
              alt="AI扑克记牌器"
              className="logo-image"
              src="/assets/poker-logo.png"
            />
            <span className="title">AI扑克记牌器</span>
            <img
              alt="代理合作"
              className="agency-tag-img"
              src="/assets/agency-tag.png"
            />
          </div>
        </div>
        <div className="header-right">
          <div className="headphone-icon" onClick={handleShowAgencyModal}>
            <img alt="客服" src="/assets/headphone.png" />
          </div>
          <div className="profile-icon" onClick={handleShowLogoutModal}>
            <img alt="用户头像" src="/assets/profile-placeholder.png" />
          </div>
        </div>
      </div>

      <div className="segment-container">
        <Segmented
          block
          className="custom-segmented"
          onChange={(value) => handlePageChange(value as PageType)}
          options={['会员充值', '库存', '充值记录']}
          value={activePage}
        />
      </div>

      {/* 充值记录页面提示 */}
      {activePage === '充值记录' && (
        <div className="page-tip">
          <img alt="提示" className="alert-icon" src="/assets/alert.png" />
          仅可撤消 24h 内的订单！
        </div>
      )}

      {renderPageContent()}

      {/* 确认弹窗 */}
      {showConfirm && (
        <ConfirmModal
          duration={duration}
          memberType={memberType}
          onCancel={handleConfirmCancel}
          onConfirm={handleConfirmRecharge}
          userId={userInput}
        />
      )}

      {/* 退出登录模态框 */}
      {showLogoutModal && (
        <LogoutModal
          onCancel={handleCloseLogoutModal}
          onLogout={handleLogout}
          phoneNumber={maskedPhoneNumber}
        />
      )}

      {/* 代理合作滑入页面 */}
      {showAgencyModal && (
        <div className="slide-in-container" onClick={handleCloseAgencyModal}>
          <AgencyPage
            onClick={(e) => e.stopPropagation()}
            onClose={handleCloseAgencyModal}
          />
        </div>
      )}

      {/* Toast提示 */}
      {toastVisible && (
        <Toast
          duration={3000}
          message={toastMessage}
          onClose={() => setToastVisible(false)}
          type={toastType}
          visible={toastVisible}
        />
      )}

      {/* 页脚备案信息 */}
      <footer className="footer">
        <a
          href="https://beian.miit.gov.cn/"
          rel="noopener noreferrer"
          target="_blank"
        >
          浙ICP备2025148163号
        </a>
      </footer>
    </div>
  );
};

export default Home;
