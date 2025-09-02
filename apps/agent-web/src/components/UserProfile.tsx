import React from 'react';

import { logoutUrl } from '../services/authing';

interface UserProfileProps {
  userInfo: any;
}

const UserProfile: React.FC<UserProfileProps> = ({ userInfo }) => {
  if (!userInfo) {
    return <div>加载中...</div>;
  }

  return (
    <div className="user-profile">
      <h2>用户信息</h2>
      <div className="user-avatar">
        {userInfo.picture ? (
          <img alt="用户头像" src={userInfo.picture} />
        ) : (
          <div className="avatar-placeholder">
            {userInfo.name?.charAt(0) || '用户'}
          </div>
        )}
      </div>
      <div className="user-details">
        <p>
          <strong>用户名:</strong> {userInfo.name || '未设置'}
        </p>
        <p>
          <strong>邮箱:</strong> {userInfo.email || '未设置'}
        </p>
        <p>
          <strong>用户ID:</strong> {userInfo.sub}
        </p>
      </div>
      <button className="logout-button" onClick={logoutUrl}>
        退出登录
      </button>
    </div>
  );
};

export default UserProfile;
