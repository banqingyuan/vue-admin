import { defineStore } from 'pinia';

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    inviterId: '' as string | null,
    channelId: '' as string | null,
    campaign: '' as string | null,
    deviceId: '' as string | null,
  }),
  actions: {
    initFromQuery(query: Record<string, string | string[] | null | undefined>) {
      this.inviterId = (query.inviterId as string) || null;
      this.channelId = (query.channelId as string) || null;
      this.campaign = (query.campaign as string) || null;
      if (!this.deviceId) {
        const saved = localStorage.getItem('promoter_device_id');
        if (saved) this.deviceId = saved;
        else {
          this.deviceId = crypto.randomUUID();
          localStorage.setItem('promoter_device_id', this.deviceId);
        }
      }
    },
  },
});


