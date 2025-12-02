import { defineStore } from 'pinia';

type UserInfo = {
  admin_user_id?: number;
  phone?: string;
  username?: string;
  role?: string;
  status?: string;
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    user: {} as UserInfo,
  }),
  actions: {
    setToken(t: string) {
      this.token = t;
      localStorage.setItem('promoter_token', t);
    },
    setUser(u: UserInfo) {
      this.user = u;
      localStorage.setItem('promoter_user', JSON.stringify(u || {}));
    },
    loadFromStorage() {
      const t = localStorage.getItem('promoter_token');
      const u = localStorage.getItem('promoter_user');
      if (t) this.token = t;
      if (u) this.user = JSON.parse(u);
    },
    logout() {
      this.token = '';
      this.user = {};
      localStorage.removeItem('promoter_token');
      localStorage.removeItem('promoter_user');
    },
  },
});


