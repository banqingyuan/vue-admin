import { defineStore } from 'pinia';

interface MemberState {
  isRecharging: boolean;
  lastRechargeResult: null | string;
}

export const useMemberStore = defineStore('member', {
  state: (): MemberState => ({
    isRecharging: false,
    lastRechargeResult: null,
  }),

  actions: {
    setRecharging(isRecharging: boolean) {
      this.isRecharging = isRecharging;
    },

    setLastRechargeResult(result: null | string) {
      this.lastRechargeResult = result;
    },
  },
});
