import { defineStore } from 'pinia';

export interface UserInfo {
  id?: string;
  username?: string;
  realName?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface AuthState {
  userInfo: null | UserInfo;
  userRole: null | string | string[];
  accessToken: null | string;
  idToken: null | string;
  refreshToken: null | string;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    userInfo: null,
    userRole: null,
    accessToken: null,
    idToken: null,
    refreshToken: null,
  }),

  getters: {
    isLoggedIn: (state) => state.userInfo !== null,
    isAdmin: (state) => {
      if (!state.userRole) return false;
      if (Array.isArray(state.userRole)) {
        return state.userRole.includes('admin');
      }
      return state.userRole === 'admin';
    },
  },

  actions: {
    setUserInfo(userInfo: null | UserInfo) {
      this.userInfo = userInfo;
    },

    setUserRole(role: null | string | string[]) {
      this.userRole = role;
    },

    setTokens(tokens: {
      accessToken: string;
      idToken: string;
      refreshToken: string;
    }) {
      this.accessToken = tokens.accessToken;
      this.idToken = tokens.idToken;
      this.refreshToken = tokens.refreshToken;
    },

    clearAuth() {
      this.userInfo = null;
      this.userRole = null;
      this.accessToken = null;
      this.idToken = null;
      this.refreshToken = null;
    },
  },
});
