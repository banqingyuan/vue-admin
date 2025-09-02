import type { Dayjs } from 'dayjs';

import type { ReportResponse } from '#/api/core/report';

import { ref } from 'vue';

import { generateReport, ReportType, TimeGranularity } from '#/api/core/report';

export interface DistributorBoardState {
  loading: ReturnType<typeof ref<boolean>>;
  pkgOptions: ReturnType<typeof ref<string[]>>;
  selectedPkgs: ReturnType<typeof ref<string[]>>;
  range: ReturnType<typeof ref<[Dayjs, Dayjs] | null>>;
  installs: ReturnType<typeof ref<number>>;
  registrations: ReturnType<typeof ref<number>>;
  orderCount: ReturnType<typeof ref<number>>;
  paidAmount: ReturnType<typeof ref<number>>;
}

export interface PackagesProviderCtx {
  getAllPackages: () => Promise<string[]>; // 返回当前上下文可用的渠道包列表
}

export function useDistributorBoard(provider: PackagesProviderCtx) {
  const loading = ref(false);
  const pkgOptions = ref<string[]>([]);
  const selectedPkgs = ref<string[]>([]);
  const range = ref<[Dayjs, Dayjs] | null>(null);

  const installs = ref(0);
  const registrations = ref(0);
  const orderCount = ref(0);
  const paidAmount = ref(0);

  const mustKeepOne = () => {
    if (selectedPkgs.value.length === 0 && pkgOptions.value.length > 0) {
      selectedPkgs.value = [pkgOptions.value[0]];
    }
  };

  async function loadMetaAndEnsureDefault() {
    const list = await provider.getAllPackages();
    pkgOptions.value = Array.isArray(list) ? list : [];
    if (selectedPkgs.value.length === 0 && pkgOptions.value.length > 0) {
      selectedPkgs.value = [pkgOptions.value[0]];
    } else {
      // 仅保留仍存在的选项
      selectedPkgs.value = selectedPkgs.value.filter((v) =>
        pkgOptions.value.includes(v),
      );
      mustKeepOne();
    }
  }

  async function loadData() {
    try {
      loading.value = true;
      if (!range.value) return;
      const req: any = {
        report_type: ReportType.USER,
        granularity: TimeGranularity.DAY,
        start_time: range.value[0].toISOString(),
        end_time: range.value[1].toISOString(),
        modules: ['users', 'orders'],
        metrics: [
          { name: 'install_count', type: 'count' },
          { name: 'new_users', type: 'count' },
          { name: 'order_count', type: 'count' },
          { name: 'total_revenue', type: 'sum', field: 'amount' },
        ],
        filters: {},
        include_total: true,
        page: 1,
        page_size: 100,
      };
      if (selectedPkgs.value.length > 0)
        req.filters.channel_names = selectedPkgs.value;
      const resp: ReportResponse = await generateReport(req);
      const summary = (resp?.summary?.metrics || {}) as any;
      installs.value = Number(summary.install_count || 0);
      registrations.value = Number(
        summary.total_new_users || summary.registration_count || 0,
      );
      orderCount.value = Number(
        summary.total_orders || summary.order_count || 0,
      );
      const milliAmount = Number(
        summary.total_revenue || summary.order_amount || 0,
      );
      paidAmount.value = milliAmount / 1000;
    } finally {
      loading.value = false;
    }
  }

  function handleSelectAll() {
    if (pkgOptions.value.length > 0) {
      selectedPkgs.value = [...pkgOptions.value];
    }
  }

  return {
    // state
    loading,
    pkgOptions,
    selectedPkgs,
    range,
    installs,
    registrations,
    orderCount,
    paidAmount,
    // actions
    loadMetaAndEnsureDefault,
    loadData,
    handleSelectAll,
    mustKeepOne,
  } as const;
}
