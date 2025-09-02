import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences, updatePreferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import {
  getAccessCodesApi,
  getCurrentUserApi,
  getUserInfoApi,
  loginApi,
  logoutApi,
  sendSMSCodeApi,
} from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);
  const sendCodeLoading = ref(false);

  /**
   * 发送短信验证码
   * @param phoneNumber 手机号
   */
  async function sendSMSCode(phoneNumber: string) {
    try {
      sendCodeLoading.value = true;
      const response = await sendSMSCodeApi({ phone_number: phoneNumber });

      notification.success({
        message: '验证码发送成功',
        description: response.data?.message || '请查收短信验证码',
        duration: 3,
      });

      return true;
    } catch (error) {
      console.error('发送验证码失败:', error);
      return false;
    } finally {
      sendCodeLoading.value = false;
    }
  }

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 token
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const result = await loginApi({
        phone_number: params.phoneNumber,
        code: params.code,
      });

      // 如果成功获取到 token
      if (result.token) {
        accessStore.setAccessToken(result.token);

        // 构造用户信息
        const role = result.user.role;
        const isDistributor = role === 'distributor';
        userInfo = {
          userId: result.user.admin_user_id.toString(),
          username: result.user.username,
          realName: result.user.username,
          avatar: '',
          desc: role,
          homePath: isDistributor ? '/distributor-board' : '/data-board',
          roles: [role],
          phone: result.user.phone,
        };

        // 分发商角色：强制全屏内容，仅显示数据看板，隐藏所有导航/设置/全屏按钮
        if (isDistributor) {
          updatePreferences({
            app: {
              enablePreferences: false,
              defaultHomePath: '/distributor-board',
              accessMode: 'backend',
            },
            header: { enable: false, hidden: true },
            sidebar: { enable: false, hidden: true },
            tabbar: { enable: false },
            breadcrumb: { enable: false },
            footer: { enable: false },
            logo: { enable: false },
            widget: {
              fullscreen: false,
              globalSearch: false,
              languageToggle: false,
              notification: false,
              refresh: false,
              sidebarToggle: false,
              themeToggle: false,
            },
          });
        } else {
          // 非分发商角色：切换为后端模式，菜单走后端 /menu/all
          updatePreferences({
            app: {
              enablePreferences: true,
              defaultHomePath: '/data-board',
              accessMode: 'backend',
            },
            header: { enable: true, hidden: false },
            sidebar: { enable: true, hidden: false },
            tabbar: { enable: true },
            breadcrumb: { enable: true },
            footer: { enable: false },
            logo: { enable: true },
            widget: {
              fullscreen: true,
              globalSearch: true,
              languageToggle: true,
              notification: true,
              refresh: true,
              sidebarToggle: true,
              themeToggle: true,
            },
          });
        }

        // 获取权限码
        const accessCodes = await getAccessCodesApi();

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
          duration: 3,
          message: $t('authentication.loginSuccess'),
        });
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    let userInfo: null | UserInfo = null;
    try {
      // 尝试从管理员接口获取用户信息
      const adminUser = await getCurrentUserApi();
      const role = adminUser.role || '';
      const isDistributor = role === 'distributor';
      userInfo = {
        userId: adminUser.admin_user_id?.toString() || '',
        username: adminUser.username || '',
        realName: adminUser.username || '',
        avatar: '',
        desc: role,
        homePath: isDistributor ? '/distributor-board' : '/data-board',
        roles: [role || 'admin'],
        phone: adminUser.phone,
      };
      if (isDistributor) {
        updatePreferences({
          app: {
            enablePreferences: false,
            defaultHomePath: '/distributor-board',
            accessMode: 'backend',
          },
          header: { enable: false, hidden: true },
          sidebar: { enable: false, hidden: true },
          tabbar: { enable: false },
          breadcrumb: { enable: false },
          footer: { enable: false },
          logo: { enable: false },
          widget: {
            fullscreen: false,
            globalSearch: false,
            languageToggle: false,
            notification: false,
            refresh: false,
            sidebarToggle: false,
            themeToggle: false,
          },
        });
      } else {
        // 非分发商角色：切换为后端模式
        updatePreferences({
          app: {
            enablePreferences: true,
            defaultHomePath: '/data-board',
            accessMode: 'backend',
          },
          header: { enable: true, hidden: false },
          sidebar: { enable: true, hidden: false },
          tabbar: { enable: true },
          breadcrumb: { enable: true },
          footer: { enable: false },
          logo: { enable: true },
          widget: {
            fullscreen: true,
            globalSearch: true,
            languageToggle: true,
            notification: true,
            refresh: true,
            sidebarToggle: true,
            themeToggle: true,
          },
        });
      }
    } catch {
      // 如果失败，尝试原有接口
      userInfo = await getUserInfoApi();
    }
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
    sendCodeLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
    sendCodeLoading,
    sendSMSCode,
  };
});
