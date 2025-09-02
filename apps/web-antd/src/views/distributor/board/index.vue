<script lang="ts" setup>
import type { DistributorOption, DistributorReportParams } from '#/api/core';
import type { ReportResponse } from '#/api/core/report';

import { computed, defineComponent, onMounted, ref } from 'vue';

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

import { getDistributorOptions, getDistributorReport } from '#/api/core';
import { generateReport, ReportType, TimeGranularity } from '#/api/core/report';
import { useAuthStore } from '#/store';

import DistributorBoardContent from '../../../components/DistributorBoardContent.vue';
import { useDistributorBoard } from '../../../composables/useDistributorBoard';
// 金额单位：后端为「厘」，前端展示为「元」保留两位小数

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
  handleSelectAll,
  mustKeepOne,
} = useDistributorBoard({
  getAllPackages: async () => {
    const params: DistributorReportParams = {};
    if (range.value) {
      params.start = range.value[0].toISOString();
      params.end = range.value[1].toISOString();
    }
    const resp = await getDistributorReport(params);
    return ((resp as any)?.packages as string[]) || [];
  },
});
const distributorOptions = ref<DistributorOption[]>([]);
const selectedDistributor = ref<number | undefined>(undefined);
// range 在 composable 中已定义

// 指标由 composable 提供

const userStore = useUserStore();
const authStore = useAuthStore();
const isDistributor = computed(() =>
  (userStore.userInfo?.roles || []).includes('distributor'),
);

// 展示使用可复用内容组件

// 渲染 antd Select 下拉自定义内容的辅助组件
const VNodes = defineComponent({
  name: 'VNodes',
  props: { vnodes: { type: [Object, Array] as any, default: null } },
  setup(props) {
    return () => (props as any).vnodes;
  },
});

async function loadAll() {
  try {
    await loadMetaAndEnsureDefault();
    await loadData();
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || '加载数据失败');
  }
}

function handlePkgChange() {
  const before = selectedPkgs.value.length;
  mustKeepOne();
  if (selectedPkgs.value.length !== before)
    message.warning('至少保留一个渠道包');
  loadData();
}

function handleSelectAllPkgs() {
  if (pkgOptions.value.length > 0) {
    handleSelectAll();
    loadData();
  }
}
function handleRangeChange(dates: any) {
  range.value = dates;
  loadData();
}
function handleDistributorChange() {
  loadData();
}

onMounted(() => {
  // 默认展示最近30天
  const end = dayjs();
  const start = end.subtract(30, 'day');
  range.value = [start, end];
  loadAll();
  // 管理员使用：加载全部分销商列表；分销商角色隐藏选择框
  if (!isDistributor.value) {
    getDistributorOptions()
      .then((list) => {
        if (Array.isArray(list)) distributorOptions.value = list;
      })
      .catch((error: any) => console.error(error));
  }
});

async function handleLogout() {
  await authStore.logout(false);
}

// 导出每日数据为 XLSX
const exportingData = ref(false);
async function handleExportData() {
  if (!range.value || selectedPkgs.value.length === 0) {
    message.warning('请先选择时间范围和渠道包');
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
      filters: {
        channel_names: selectedPkgs.value,
      },
      include_total: true,
      page: 1,
      page_size: 1000, // 获取尽可能多的数据
    };

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

    const fileName = `CPS渠道数据_${range.value[0].format('YYYYMMDD')}-${range.value[1].format('YYYYMMDD')}.xlsx`;
    downloadFileFromBlob({ fileName, source: blob });

    message.success('导出成功');
  } catch (error: any) {
    console.error('导出失败:', error);
    message.error(error?.message || '导出失败，请重试');
  } finally {
    exportingData.value = false;
  }
}
</script>

<template>
  <Row :gutter="16">
    <Col :span="24">
      <Card :loading="loading" title="CPS渠道看板" :bordered="false">
        <template #extra>
          <Space class="toolbar" :wrap="true">
            <Select
              v-if="!isDistributor && distributorOptions.length > 0"
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
              v-if="pkgOptions.length > 0"
              v-model:value="selectedPkgs"
              mode="multiple"
              placeholder="选择渠道包（可多选）"
              class="toolbar-item"
              style="width: 280px"
              :options="pkgOptions.map((v) => ({ label: v, value: v }))"
              :allow-clear="selectedPkgs.length > 1"
              @change="handlePkgChange"
            >
              <template #dropdownRender="{ menuNode }">
                <div style="padding: 4px 8px">
                  <a @click.stop="handleSelectAllPkgs">全选</a>
                </div>
                <VNodes :vnodes="menuNode" />
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
            <Button v-if="isDistributor" danger @click="handleLogout">
              退出登录
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
