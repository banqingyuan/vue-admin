<script lang="ts" setup>
import type { Dayjs } from 'dayjs';

import type { Money } from '@vben/types';

import { computed, onMounted, ref } from 'vue';

import { asMoney } from '@vben/types';
import { downloadFileFromBlob, moneyToYuan } from '@vben/utils';

import {
  DownloadOutlined,
  DownOutlined,
  ReloadOutlined,
  RightOutlined,
  UpOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  DatePicker,
  message,
  Select,
  Space,
  Table,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import * as XLSX from 'xlsx';

import {
  generateReport,
  getDistinctChannels,
  MetricType,
  TimeGranularity,
} from '#/api/core/report';

// 扩展 dayjs 插件
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

interface CohortTableRow {
  key: string;
  analysisMonth: string; // 分析月份 "6月付费拆解"
  monthKey: string; // 月份标识 "6月付费拆解" (用于展开收起逻辑)
  analysisMonthISO?: string; // 分析月份 ISO，如 "2025-07"
  userType?: 'new' | 'old' | 'summary'; // 行类型：新用户/老用户/汇总
  registrationCohortISO?: string; // 老用户注册队列 ISO，如 "2025-05"
  backIndex?: number; // 相对分析月的回溯月数（1 表示上月）
  userGroup: string; // 用户群体 "新用户(6月注册)" 或 "老用户(5月注册)"
  registrationCount: string; // 注册设备数 (只有新用户显示)
  orderCount: string; // 订单数
  orderAmount: Money; // 订单金额（厘）
  newUserPaymentRate: string; // 新用户付费率 / 老用户续费率
  revenueShare: string; // 付费占比
}

const loading = ref(false);
const selectedChannels = ref<string[]>([]);
const channelOptions = ref<{ label: string; value: string }[]>([
  { label: '全部渠道', value: '' },
]);
const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs().subtract(6, 'day').startOf('day'),
  dayjs().endOf('day'),
]);
// 操作系统筛选
const selectedOS = ref<string>('');
const osOptions = [
  { label: '全部', value: '' },
  { label: '安卓', value: 'android' },
  { label: 'iOS', value: 'ios' },
];

const tableData = ref<CohortTableRow[]>([]);
const isExpanded = ref(false);
const expandedMonths = ref<Set<string>>(new Set());

// 计算属性：是否有超过3个月的数据
const hasMoreThanThreeMonths = computed(() => {
  const analysisMonths = new Set(
    tableData.value.map((row) => row.monthKey).filter(Boolean),
  );
  return analysisMonths.size > 3;
});

// 计算属性：总月份数
const totalMonthsCount = computed(() => {
  const analysisMonths = new Set(
    tableData.value.map((row) => row.monthKey).filter(Boolean),
  );
  return analysisMonths.size;
});

// 计算属性：获取所有分析月份（按时间倒序），按 ISO 时间排序，再映射到 monthKey
const allAnalysisMonths = computed(() => {
  const isoToKey = new Map<string, string>();
  for (const row of tableData.value) {
    const iso = row.analysisMonthISO;
    const key = row.monthKey || row.analysisMonth;
    if (iso && key && !isoToKey.has(iso)) {
      isoToKey.set(iso, key);
    }
  }
  return [...isoToKey.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([_, key]) => key);
});

// 计算属性：显示的表格数据（按月份分组，顺序：汇总→新用户→老用户；默认仅显示最近3个老用户队列）
const displayedTableData = computed(() => {
  console.warn('计算displayedTableData:', {
    isExpanded: isExpanded.value,
    expandedMonths: [...expandedMonths.value],
    tableDataLength: tableData.value.length,
  });

  // 按分析月份 ISO 分组（避免使用 reduce）
  const groups: Record<string, CohortTableRow[]> = {};
  for (const row of tableData.value) {
    const iso = row.analysisMonthISO || '';
    if (!iso) continue;
    if (!groups[iso]) groups[iso] = [] as CohortTableRow[];
    groups[iso].push(row);
  }

  // 月份按时间倒序
  const monthISOs = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const result: CohortTableRow[] = [];

  for (const iso of monthISOs) {
    const rows = groups[iso];
    if (!rows || rows.length === 0) continue;

    // 找到该月的 monthKey（优先取新用户行，否则取任意行）
    const monthKey =
      rows.find((r) => r.userType === 'new')?.monthKey ||
      rows[0]?.monthKey ||
      '';
    const expanded =
      isExpanded.value || (monthKey && expandedMonths.value.has(monthKey));

    // 汇总行（优先显示）
    const summaryRow = rows.find((r) => r.userType === 'summary');
    if (summaryRow) result.push(summaryRow);

    // 新用户行（显示一次）
    const newRow = rows.find((r) => r.userType === 'new');
    if (newRow) result.push(newRow);

    // 老用户行，按 backIndex 升序（1,2,3...）或注册队列倒序
    const returning = rows
      .filter((r) => r.userType === 'old')
      .sort((a, b) => {
        const ai = a.backIndex ?? 9999;
        const bi = b.backIndex ?? 9999;
        if (ai !== bi) return ai - bi;
        const ac = a.registrationCohortISO || '';
        const bc = b.registrationCohortISO || '';
        return bc.localeCompare(ac);
      });

    if (expanded) {
      result.push(...returning);
    } else {
      result.push(...returning.slice(0, 3));
    }
  }

  console.warn('计算后的显示数据条数:', result.length);
  return result;
});

// 切换展开/收起状态
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

// 切换指定月份的展开/收起状态
const toggleMonthExpanded = (month: string) => {
  console.warn('点击切换月份:', month);
  console.warn('当前展开的月份:', [...expandedMonths.value]);

  if (expandedMonths.value.has(month)) {
    expandedMonths.value.delete(month);
    console.warn('收起月份:', month);
  } else {
    expandedMonths.value.add(month);
    console.warn('展开月份:', month);
  }
  // 触发响应式更新
  expandedMonths.value = new Set(expandedMonths.value);

  console.warn('更新后展开的月份:', [...expandedMonths.value]);
};

// 判断月份是否已展开
const isMonthExpanded = (month: string) => {
  // 如果是全局展开状态，所有月份都显示为展开
  if (isExpanded.value) return true;

  // 最近3个月默认展开
  const recentThreeMonths = allAnalysisMonths.value.slice(0, 3);
  if (recentThreeMonths.includes(month)) return true;

  // 其他月份根据手动展开状态判断
  return expandedMonths.value.has(month);
};

// 表格列配置 - 完全对应您的表格结构
const columns = [
  {
    title: '',
    key: 'analysisMonth',
    dataIndex: 'analysisMonth',
    width: 120,
    fixed: 'left' as const,
    align: 'center' as const,
  },
  {
    title: '',
    key: 'userGroup',
    dataIndex: 'userGroup',
    width: 150,
    fixed: 'left' as const,
    align: 'center' as const,
  },
  {
    title: '注册设备数',
    key: 'registrationCount',
    dataIndex: 'registrationCount',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '订单数',
    key: 'orderCount',
    dataIndex: 'orderCount',
    width: 100,
    align: 'center' as const,
  },
  {
    title: '订单金额',
    key: 'orderAmount',
    dataIndex: 'orderAmount',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '新用户付费率\n老用户续费率',
    key: 'newUserPaymentRate',
    dataIndex: 'newUserPaymentRate',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '付费占比',
    key: 'revenueShare',
    dataIndex: 'revenueShare',
    width: 100,
    align: 'center' as const,
  },
];

// 加载队列分析数据
const loadCohortData = async () => {
  try {
    loading.value = true;

    const [startDate, endDate] = dateRange.value;

    // 构建 filters（避免把 undefined/null 发送给后端）
    const filters: Record<string, any> = {};
    if (selectedChannels.value && selectedChannels.value.length > 0) {
      // 过滤掉空字符串（全部渠道选项）
      const validChannels = selectedChannels.value.filter(
        (ch) => ch && ch !== '',
      );
      if (validChannels.length > 0) {
        filters.channel_sources = validChannels;
      }
    }
    // 添加设备类型过滤（空字符串表示全部，不添加过滤）
    if (selectedOS.value && selectedOS.value !== '') {
      filters.device_type = selectedOS.value;
    }

    const reportData = await generateReport({
      modules: ['retention'],
      granularity: TimeGranularity.MONTH,
      start_time: startDate.startOf('day').toISOString(),
      end_time: endDate.endOf('day').toISOString(),
      metrics: [
        {
          name: 'registration_count',
          type: MetricType.COUNT,
          field: 'id',
          alias: '注册设备数',
        },
        {
          name: 'order_count',
          type: MetricType.COUNT,
          field: 'order_id',
          alias: '订单数',
        },
        {
          name: 'order_amount',
          type: MetricType.SUM,
          field: 'amount',
          alias: '订单金额',
        },
        {
          name: 'payment_rate',
          type: MetricType.RATE,
          alias: '付费率',
        },
        {
          name: 'retention_rate',
          type: MetricType.RATE,
          alias: '续费率',
        },
        {
          name: 'revenue_share',
          type: MetricType.PERCENT,
          alias: '付费占比',
        },
      ],
      group_by: ['registration_cohort', 'analysis_month', 'user_type'],
      cohort_analysis: {
        enabled: true,
        registration_periods: generatePeriods(startDate, endDate),
        analysis_periods: generatePeriods(startDate, endDate),
        cohort_type: 'registration',
      },
      filters,
    });

    // 处理数据
    if (reportData.data && reportData.data.length > 0) {
      tableData.value = buildTableData(reportData.data);
      // 数据加载完成后自动收起到3个月视图
      isExpanded.value = false;
      expandedMonths.value.clear();
    } else {
      tableData.value = [];
      isExpanded.value = false;
      expandedMonths.value.clear();
    }
  } catch (error) {
    console.error('加载队列分析数据失败:', error);
    tableData.value = [];
    message.error('加载失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 生成时间周期数组
const generatePeriods = (start: Dayjs, end: Dayjs): string[] => {
  const periods: string[] = [];
  let current = start.clone();

  while (current.isSameOrBefore(end, 'day')) {
    periods.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return periods;
};

// 构建表格数据
const buildTableData = (data: any[]): CohortTableRow[] => {
  const rows: CohortTableRow[] = [];

  // 调试：打印原始数据结构
  console.warn('原始数据结构:', data);
  if (data.length > 0) {
    console.warn('第一条数据示例:', data[0]);
  }

  // 按分析月份分组（后端始终返回月维度）- 避免 reduce
  const groupedData: Record<string, any[]> = {};
  for (const item of data) {
    const analysisMonth: string =
      item.group_by?.analysis_month || dayjs(item.time).format('YYYY-MM');
    if (!groupedData[analysisMonth]) groupedData[analysisMonth] = [];
    groupedData[analysisMonth].push(item);
  }

  // 调试：打印分组后的数据
  console.warn('分组后的数据:', groupedData);

  // 构建表格行
  Object.keys(groupedData)
    .sort()
    .forEach((month) => {
      const monthData = groupedData[month];
      const m = month.split('-')[1] || '';
      const monthName = `${m ? Number.parseInt(m, 10) : dayjs(month).month() + 1}月`;

      // 调试：打印每个月份的数据
      console.warn(`处理月份 ${month} (${monthName}):`, monthData);
      monthData.forEach((item: any, index: number) => {
        console.warn(`  - 数据项 ${index}:`, {
          user_type: item.group_by?.user_type,
          analysis_month: item.group_by?.analysis_month,
          registration_cohort: item.group_by?.registration_cohort,
          metrics: item.metrics,
        });
      });

      // 从后端返回的数据中查找汇总行（user_type === 'summary'）
      const summaryData = monthData.find(
        (d: any) => d.group_by?.user_type === 'summary',
      );
      if (summaryData) {
        rows.push({
          key: `${month}-summary`,
          analysisMonth: `${monthName}付费拆解`,
          monthKey: `${monthName}付费拆解`,
          analysisMonthISO: month,
          userType: 'summary',
          userGroup: `${monthName}汇总`,
          registrationCount: '',
          orderCount: formatNumberCell(summaryData.metrics.order_count),
          orderAmount: asMoney(summaryData.metrics.order_amount),
          newUserPaymentRate: '',
          revenueShare: '100.0%',
        });
      }

      // 新用户行
      const newUserData = monthData.find(
        (d: any) => d.group_by?.user_type === 'new_user',
      );
      console.warn(`${monthName} 新用户数据:`, newUserData);
      if (newUserData) {
        rows.push({
          key: `${month}-new`,
          analysisMonth: '',
          monthKey: `${monthName}付费拆解`,
          analysisMonthISO: month,
          userType: 'new',
          userGroup: `新用户\n(${monthName}注册)`,
          registrationCount: formatNumberCell(
            newUserData.metrics.registration_count,
          ),
          orderCount: formatNumberCell(newUserData.metrics.order_count),
          orderAmount: asMoney(newUserData.metrics.order_amount),
          newUserPaymentRate: formatPercentCell(
            newUserData.metrics.payment_rate,
          ),
          revenueShare: formatPercentCell(newUserData.metrics.revenue_share),
        });
      }

      // 老用户行
      const returningUsers = monthData.filter(
        (d: any) => d.group_by?.user_type === 'returning_user',
      );
      console.warn(`${monthName} 老用户数据:`, returningUsers);
      returningUsers.forEach((userData: any, index: number) => {
        const cohortMonthISO = userData.group_by?.registration_cohort || month;
        const cohortName = dayjs(cohortMonthISO).format('M月');
        // 计算回溯月数：分析月 - 注册月
        const backIndex = Math.max(
          0,
          dayjs(month).diff(dayjs(cohortMonthISO), 'month'),
        );

        rows.push({
          key: `${month}-returning-${index}`,
          analysisMonth: '', // 老用户行不显示月份标题
          monthKey: `${monthName}付费拆解`, // 但仍然标识属于哪个月份
          analysisMonthISO: month,
          userType: 'old',
          registrationCohortISO: cohortMonthISO,
          backIndex,
          userGroup: `老用户\n(${cohortName}注册)`,
          registrationCount: '',
          orderCount: formatNumberCell(userData.metrics.order_count),
          orderAmount: asMoney(userData.metrics.order_amount),
          newUserPaymentRate: formatPercentCell(
            userData.metrics.retention_rate ?? userData.metrics.payment_rate,
          ),
          revenueShare: formatPercentCell(userData.metrics.revenue_share),
        });
      });
    });

  // 调试：打印最终构建的行数据
  console.warn('最终构建的行数据:', rows);
  console.warn(
    '🔍 行数据中的monthKey:',
    rows.map((r) => r.monthKey),
  );

  return rows;
};

// 单元格格式化辅助
function formatNumberCell(v: any): string {
  if (v === undefined || v === null) return '';
  const n = Number(v);
  if (Number.isNaN(n)) return '';
  return n.toLocaleString();
}
function formatPercentCell(v: any): string {
  if (v === undefined || v === null) return '';
  const n = Number(v);
  if (Number.isNaN(n)) return '';
  return `${(n * 100).toFixed(1)}%`;
}

// 处理日期范围变化
const handleDateChange = () => {
  loadChannels();
  loadCohortData();
};

const handleChannelChange = () => {
  // 确保至少保留一个选项（如果有可选项的话）
  if (
    selectedChannels.value.length === 0 &&
    channelOptions.value.length > 0 &&
    channelOptions.value[0]
  ) {
    selectedChannels.value = [channelOptions.value[0].value];
    message.warning('至少保留一个渠道选项');
  }
  loadCohortData();
};

const handleSelectAllChannels = () => {
  if (channelOptions.value) {
    selectedChannels.value = channelOptions.value.map((opt) => opt.value);
    handleChannelChange();
  }
};

onMounted(() => {
  loadChannels();
  loadCohortData();
});

// 加载渠道列表（基于用户注册表 channel_name，按所选时间范围）
const loadChannels = async () => {
  try {
    const [startDate, endDate] = dateRange.value;
    const channels = await getDistinctChannels(
      startDate.startOf('day').toISOString(),
      endDate.endOf('day').toISOString(),
    );
    const opts = [
      { label: '全部渠道', value: '' },
      ...(channels || []).map((ch: string) => ({ label: ch, value: ch })),
    ];
    channelOptions.value = opts;

    // 如果当前没有选中任何渠道，默认选择第一个
    if (selectedChannels.value.length === 0 && opts.length > 0 && opts[0]) {
      selectedChannels.value = [opts[0].value];
    } else {
      // 仅保留仍存在的选项
      selectedChannels.value = selectedChannels.value.filter((ch) =>
        opts.some((opt) => opt.value === ch),
      );
      // 如果过滤后没有选项了，默认选择第一个
      if (selectedChannels.value.length === 0 && opts.length > 0 && opts[0]) {
        selectedChannels.value = [opts[0].value];
      }
    }
  } catch {
    channelOptions.value = [{ label: '全部渠道', value: '' }];
    selectedChannels.value = [''];
  }
};

// 导出为 XLSX
const exportToXlsx = () => {
  try {
    const rows = displayedTableData.value || [];
    if (rows.length === 0) {
      message.warning('暂无数据可导出');
      return;
    }

    const [startDate, endDate] = dateRange.value;
    const fileName = `队列分析_${startDate.format('YYYYMMDD')}-${endDate.format('YYYYMMDD')}.xlsx`;

    const header = [
      '分析月份',
      '用户群体',
      '注册设备数',
      '订单数',
      '订单金额(元)',
      '付费率/续费率',
      '付费占比',
    ];

    const toNumber = (v: string) => {
      if (!v) return '';
      const n = Number(String(v).replaceAll(',', ''));
      return Number.isNaN(n) ? '' : n;
    };

    const toYuanNumber = (m: Money) => {
      const s = moneyToYuan(m);
      const n = Number(s);
      return Number.isNaN(n) ? s : n;
    };

    const data = rows.map((r) => [
      r.analysisMonth || r.monthKey || '',
      r.userGroup || '',
      toNumber(r.registrationCount as unknown as string),
      toNumber(r.orderCount as unknown as string),
      r.orderAmount ? toYuanNumber(r.orderAmount) : '',
      r.newUserPaymentRate || '',
      r.revenueShare || '',
    ]);

    const aoa = [header, ...data];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '队列分析');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadFileFromBlob({ fileName, source: blob });
  } catch (error) {
    console.error('导出失败:', error);
    message.error('导出失败，请重试');
  }
};
</script>

<template>
  <Card title="用户队列分析" :loading="loading">
    <template #extra>
      <Space>
        <RangePicker
          v-model:value="dateRange"
          format="YYYY-MM-DD"
          @change="handleDateChange"
        />
        <Select
          v-model:value="selectedChannels"
          mode="multiple"
          style="width: 280px"
          placeholder="选择渠道（可多选）"
          @change="handleChannelChange"
          :allow-clear="selectedChannels.length > 1"
          :options="channelOptions"
          :filter-option="true"
          show-search
        >
          <template #dropdownRender="{ menuNode }">
            <div style="padding: 4px 8px">
              <a @click.stop="handleSelectAllChannels">全选</a>
            </div>
            <component :is="menuNode" />
          </template>
        </Select>
        <Select
          v-model:value="selectedOS"
          placeholder="操作系统"
          style="width: 130px"
          :options="osOptions"
          @change="loadCohortData"
        />
        <Button type="primary" @click="loadCohortData">
          <template #icon>
            <ReloadOutlined />
          </template>
          刷新
        </Button>
        <Button @click="exportToXlsx">
          <template #icon>
            <DownloadOutlined />
          </template>
          导出Excel
        </Button>
      </Space>
    </template>

    <div class="cohort-table-container">
      <Table
        :columns="columns"
        :data-source="displayedTableData"
        :pagination="false"
        :scroll="{ x: 'max-content' }"
        size="small"
        bordered
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'analysisMonth'">
            <div
              class="analysis-month-cell clickable"
              v-if="record.analysisMonth"
              @click="toggleMonthExpanded(record.monthKey)"
              :title="
                isMonthExpanded(record.monthKey) ? '点击收起' : '点击展开'
              "
            >
              <div class="month-content">
                <span class="expand-icon">
                  <DownOutlined v-if="isMonthExpanded(record.monthKey)" />
                  <RightOutlined v-else />
                </span>
                <strong>{{ record.analysisMonth }}</strong>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'userGroup'">
            <div
              class="user-group-cell"
              :class="
                record.userGroup.includes('新用户') ? 'new-user' : 'old-user'
              "
            >
              {{ record.userGroup }}
            </div>
          </template>

          <template v-else-if="column.key === 'registrationCount'">
            <div
              class="metric-cell registration-count"
              v-if="record.registrationCount"
            >
              {{ record.registrationCount }}
            </div>
          </template>

          <template v-else-if="column.key === 'orderCount'">
            <div class="metric-cell">
              {{ record.orderCount }}
            </div>
          </template>

          <template v-else-if="column.key === 'orderAmount'">
            <div class="metric-cell">
              {{ moneyToYuan(record.orderAmount) }}
            </div>
          </template>

          <template v-else-if="column.key === 'newUserPaymentRate'">
            <div class="metric-cell payment-rate">
              {{ record.newUserPaymentRate }}
            </div>
          </template>

          <template v-else-if="column.key === 'revenueShare'">
            <div class="metric-cell">
              {{ record.revenueShare }}
            </div>
          </template>
        </template>
      </Table>

      <!-- 展开/收起按钮 -->
      <div class="expand-collapse-container" v-if="hasMoreThanThreeMonths">
        <Button type="link" @click="toggleExpanded">
          <template #icon>
            <UpOutlined v-if="isExpanded" />
            <DownOutlined v-else />
          </template>
          {{ isExpanded ? '收起' : `展开显示全部${totalMonthsCount}个月数据` }}
        </Button>
      </div>
    </div>
  </Card>
</template>

<style lang="scss" scoped>
.cohort-table-container {
  .analysis-month-cell {
    font-weight: bold;
    color: hsl(var(--foreground));
    text-align: center;

    &.clickable {
      padding: 4px 8px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s ease;

      &:hover {
        color: hsl(var(--primary));
        background-color: hsl(var(--accent));
      }

      .month-content {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: center;

        .expand-icon {
          font-size: 12px;
          color: hsl(var(--muted-foreground));
          transition: color 0.2s ease;
        }
      }

      &:hover .expand-icon {
        color: hsl(var(--primary));
      }
    }
  }

  .user-group-cell {
    font-weight: 500;
    text-align: center;
    white-space: pre-line; // 支持换行显示

    &.new-user {
      color: hsl(var(--success));
    }

    &.old-user {
      color: hsl(var(--muted-foreground));
    }
  }

  .metric-cell {
    font-family: Monaco, Menlo, 'Ubuntu Mono', monospace;
    text-align: center;

    &.registration-count {
      font-weight: 500;
      background-color: hsl(var(--warning) / 12%); // 依据主题 token 的弱化背景
    }

    &.payment-rate {
      font-weight: 500;
      background-color: hsl(var(--success) / 12%); // 依据主题 token 的弱化背景
    }
  }

  .expand-collapse-container {
    padding: 16px 0;
    margin-top: 8px;
    text-align: center;
    border-top: 1px solid hsl(var(--border));

    .ant-btn-link {
      font-size: 14px;
      color: hsl(var(--primary));

      &:hover {
        color: hsl(var(--primary-hover));
      }
    }
  }
}

:deep(.ant-table) {
  .ant-table-tbody > tr > td {
    padding: 12px 8px;
    vertical-align: middle;
  }

  .ant-table-thead > tr > th {
    padding: 12px 8px;
    font-weight: 600;
    color: hsl(var(--foreground));
    text-align: center;
    white-space: pre-line; // 支持表头换行
    background-color: hsl(var(--accent));
  }

  .ant-table-tbody > tr:hover > td {
    background-color: hsl(var(--accent-hover));
  }

  // 表格边框样式
  .ant-table-bordered .ant-table-tbody > tr > td,
  .ant-table-bordered .ant-table-thead > tr > th {
    border: 1px solid hsl(var(--border));
  }

  // 固定列样式
  .ant-table-fixed-left {
    box-shadow: 6px 0 6px -4px rgb(0 0 0 / 15%);
  }
}
</style>
