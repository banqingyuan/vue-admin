import React, { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';

import Callback from './components/Callback';
import Home from './components/Home';
import Login from './components/Login';
import LoginBuffer from './components/LoginBuffer';
import LogoutCallback from './components/LogoutCallback';
import UserProfile from './components/UserProfile';
import { checkLoginStatus } from './services/authing';

import './App.css';

function App() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = () => {
      const user = checkLoginStatus();
      setUserInfo(user);
      setLoading(false);

      // 如果用户已登录，打印JWT token
      if (user) {
        // 从localStorage获取token
        const tokenString = localStorage.getItem('authTokens');
        if (tokenString) {
          try {
            const tokens = JSON.parse(tokenString);
            console.warn(
              '首页 - JWT访问令牌:',
              tokens.access_token || '未找到',
            );
            console.warn('首页 - JWT ID令牌:', tokens.id_token || '未找到');
            console.warn('首页 - 刷新令牌:', tokens.refresh_token || '未找到');
          } catch (error) {
            console.error('解析token失败:', error);
          }
        } else {
          console.warn('首页 - 未找到token信息');
        }

        // 打印用户信息
        console.warn('首页 - 用户信息:', user);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route element={<Home />} path="/" />
          <Route
            element={
              userInfo ? (
                <UserProfile userInfo={userInfo} />
              ) : (
                <Navigate to="/login-buffer" />
              )
            }
            path="/profile"
          />
          <Route element={<Login />} path="/login" />
          <Route element={<LoginBuffer />} path="/login-buffer" />
          <Route element={<Callback />} path="/callback" />
          <Route element={<LogoutCallback />} path="/logout-callback" />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
