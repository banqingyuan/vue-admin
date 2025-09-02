<script lang="ts" setup>
import type { DistributorOption } from '#/api/core';
import type { ReportResponse } from '#/api/core/report';

import { computed, onMounted, ref } from 'vue';

// icons 移除，展示由内容组件处理
import { useUserStore } from '@vben/stores';
import { downloadFileFromBlob } from '@vben/utils';

import { DownloadOutlined } from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  DatePicker,
  message,
  Row,
  Select,
  Space,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

import { getDistributorOptions } from '#/api/core';
import { generateReport, ReportType, TimeGranularity } from '#/api/core/report';

import DistributorBoardContent from '../../../components/DistributorBoardContent.vue';
import { useDistributorBoard } from '../../../composables/useDistributorBoard';

const distributorOptions = ref<DistributorOption[]>([]);
const selectedDistributor = ref<number | undefined>(undefined);

const {
  loading,
  pkgOptions,
  selectedPkgs,
  range,
  installs,
  registrations,
  orderCount,
  paidAmount,
  loadMetaAndEnsureDefault,
  loadData,
} = useDistributorBoard({
  getAllPackages: async () => {
    if (!selectedDistributor.value) return [];
    const opt = distributorOptions.value.find(
      (o) => o.distributor_id === selectedDistributor.value,
    );
    return opt?.packages || [];
  },
});
const currentPackages = computed<string[]>(() => pkgOptions.value);
// range/installs/registrations/orderCount/paidAmount 由 composable 提供

const userStore = useUserStore();
const isDistributor = computed(() =>
  (userStore.userInfo?.roles || []).includes('distributor'),
);

// overviewItems 交由内容组件渲染

async function loadDistributors() {
  try {
    const list = await getDistributorOptions();
    if (Array.isArray(list)) distributorOptions.value = list;
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || '加载分销商列表失败');
  }
}

async function loadDataWrapper() {
  try {
    // 选中分销商但没有任何渠道包 -> 提示并兜底为 0
    const pkgs = currentPackages.value;
    if (selectedDistributor.value && pkgs.length === 0) {
      installs.value = 0;
      registrations.value = 0;
      orderCount.value = 0;
      paidAmount.value = 0;
      message.error('所选分销商暂无渠道包，暂无可用数据');
      return;
    }

    // 若存在渠道包但未选中，则默认选择第一个
    if (
      selectedDistributor.value &&
      pkgs.length > 0 &&
      selectedPkgs.value.length === 0
    ) {
      selectedPkgs.value = [pkgs[0] as string];
    }

    if (!range.value) return;
    await loadMetaAndEnsureDefault();
    await loadData();
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || '加载数据失败');
  }
}

async function handleDistributorChange() {
  // 当切换分销商时：
  // 1) 若未选择或原选择不在当前分销商包列表中，则默认选中该分销商的第一个渠道包
  // 2) 若清空分销商，则清空渠道包
  await loadMetaAndEnsureDefault();
  const pkgs = currentPackages.value;
  if (selectedDistributor.value) {
    // 仅保留当前分销商下存在的渠道包
    selectedPkgs.value = selectedPkgs.value.filter((v) => pkgs.includes(v));
    if (selectedPkgs.value.length === 0 && pkgs.length > 0) {
      selectedPkgs.value = [pkgs[0] as string];
    }
  } else {
    selectedPkgs.value = [];
  }
  await loadData();
}
function handlePackagesChange() {
  const pkgs = currentPackages.value;
  if (selectedPkgs.value.length === 0 && pkgs.length > 0) {
    selectedPkgs.value = [pkgs[0] as string];
    message.warning('至少保留一个渠道包');
  }
  loadData();
}
function handleRangeChange(dates: any) {
  range.value = dates;
  loadData();
}

// 导出每日数据为 XLSX
const exportingData = ref(false);
async function handleExportData() {
  if (!range.value) {
    message.warning('请先选择时间范围');
    return;
  }

  // 如果选择了分销商，但没有选择渠道包
  if (selectedDistributor.value && selectedPkgs.value.length === 0) {
    message.warning('请先选择渠道包');
    return;
  }

  try {
    exportingData.value = true;

    // 构造报表请求参数，获取按天的详细数据
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
      page_size: 1000, // 获取尽可能多的数据
    };

    // 如果选择了分销商和渠道包，则添加过滤条件
    if (selectedDistributor.value && selectedPkgs.value.length > 0) {
      req.filters.channel_names = selectedPkgs.value;
    }

    const resp: ReportResponse = await generateReport(req);
    const dataItems = resp?.data || [];

    if (dataItems.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }

    // 准备导出数据 - 按日期分组合并
    const header = ['日期', '激活数', '注册数', '订单数', '付费金额(元)'];

    // 按日期分组合并数据
    const dataByDate = new Map<string, any>();
    dataItems.forEach((item) => {
      const dateKey = dayjs(item.time).format('YYYY-MM-DD');
      const metrics = item.metrics || {};

      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, {
          date: dateKey,
          installCount: 0,
          newUsers: 0,
          orderCount: 0,
          totalRevenue: 0,
        });
      }

      const existing = dataByDate.get(dateKey);
      existing.installCount += Number(metrics.install_count || 0);
      existing.newUsers += Number(metrics.new_users || 0);
      existing.orderCount += Number(metrics.order_count || 0);
      existing.totalRevenue += Number(metrics.total_revenue || 0);
    });

    // 转换为数组并按日期排序
    const data = [...dataByDate.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => [
        item.date,
        item.installCount,
        item.newUsers,
        item.orderCount,
        (item.totalRevenue / 1000).toFixed(2), // 厘转元
      ]);

    // 添加汇总行
    const summary = resp?.summary?.metrics || {};
    const totalInstalls = Number(summary.install_count || 0);
    const totalNewUsers = Number(
      summary.total_new_users || summary.registration_count || 0,
    );
    const totalOrders = Number(
      summary.total_orders || summary.order_count || 0,
    );
    const totalAmount = Number(
      summary.total_revenue || summary.order_amount || 0,
    );

    data.push([
      '合计',
      totalInstalls,
      totalNewUsers,
      totalOrders,
      (totalAmount / 1000).toFixed(2),
    ]);

    // 生成 Excel
    const aoa = [header, ...data];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // 设置列宽
    ws['!cols'] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CPS渠道数据');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 文件名包含分销商信息（如果有）
    let fileName = `CPS渠道数据_${range.value[0].format('YYYYMMDD')}-${range.value[1].format('YYYYMMDD')}`;
    if (selectedDistributor.value) {
      const distributor = distributorOptions.value.find(
        (d) => d.distributor_id === selectedDistributor.value,
      );
      if (distributor) {
        fileName = `${distributor.distributor_name}_${fileName}`;
      }
    }
    fileName += '.xlsx';

    downloadFileFromBlob({ fileName, source: blob });

    message.success('导出成功');
  } catch (error: any) {
    console.error('导出失败:', error);
    message.error(error?.message || '导出失败，请重试');
  } finally {
    exportingData.value = false;
  }
}

onMounted(() => {
  const end = dayjs();
  const start = end.subtract(30, 'day');
  range.value = [start, end];
  // 仅管理员/超级管理员可见本页面，但仍加载数据
  loadDistributors();
  loadDataWrapper();
});
</script>

<template>
  <Row :gutter="16">
    <Col :span="24">
      <Card :loading="loading" title="CPS渠道看板（管理员）" :bordered="false">
        <template #extra>
          <Space class="toolbar" :wrap="true">
            <Select
              v-if="!isDistributor"
              v-model:value="selectedDistributor"
              placeholder="选择分销商（可选）"
              class="toolbar-item"
              style="width: 220px"
              :options="
                distributorOptions.map((v) => ({
                  label: v.distributor_name,
                  value: v.distributor_id,
                }))
              "
              allow-clear
              @change="handleDistributorChange"
            />
            <Select
              v-if="
                !isDistributor &&
                selectedDistributor &&
                (currentPackages.length || 0) > 0
              "
              v-model:value="selectedPkgs"
              mode="multiple"
              placeholder="选择渠道包（可多选）"
              class="toolbar-item"
              style="width: 260px"
              :options="currentPackages.map((p) => ({ label: p, value: p }))"
              :allow-clear="selectedPkgs.length > 1"
              @change="handlePackagesChange"
            >
              <template #dropdownRender="{ menuNode }">
                <div style="padding: 4px 8px">
                  <a
                    @click.stop="
                      () => {
                        selectedPkgs = [...currentPackages];
                        handlePackagesChange();
                      }
                    "
                  >
                    全选
                  </a>
                </div>
                <component :is="menuNode" />
              </template>
            </Select>
            <DatePicker.RangePicker
              class="toolbar-item"
              :value="range as any"
              show-time
              style="width: 460px"
              @change="handleRangeChange"
            />
            <Button
              type="primary"
              :loading="exportingData"
              @click="handleExportData"
            >
              <template #icon>
                <DownloadOutlined />
              </template>
              下载数据
            </Button>
          </Space>
        </template>

        <DistributorBoardContent
          :loading="loading"
          :installs="installs"
          :registrations="registrations"
          :order-count="orderCount"
          :paid-amount="paidAmount"
        />
      </Card>
    </Col>
  </Row>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.toolbar-item {
  max-width: 100%;
}

@media (max-width: 768px) {
  .toolbar-item {
    width: 100% !important;
  }
}
</style>
