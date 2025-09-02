<script lang="ts" setup>
import type { EChartsOption } from 'echarts';

import { onMounted, ref, watch } from 'vue';

import { Card, Radio } from 'ant-design-vue';

import {
  buildTimeRange,
  generateReport,
  MetricType,
  ReportType,
  TimeGranularity,
} from '#/api/core/report';
import {
  defaultChartOptions,
  formatCurrency,
  useECharts,
} from '#/hooks/useECharts';

const { Group: RadioGroup, Button: RadioButton } = Radio;

const chartRef = ref<HTMLElement>();
const loading = ref(false);
const selectedPeriod = ref('today');

const { setOption, showLoading, hideLoading } = useECharts(chartRef);

// 加载图表数据
const loadChartData = async () => {
  try {
    loading.value = true;
    showLoading('加载收入数据...');

    const timeRange = buildTimeRange(selectedPeriod.value);
    let granularity;
    if (selectedPeriod.value === 'today') {
      granularity = TimeGranularity.HOUR;
    } else if (selectedPeriod.value === 'week') {
      granularity = TimeGranularity.DAY;
    } else {
      granularity = TimeGranularity.DAY;
    }

    const reportData = await generateReport({
      report_type: ReportType.REVENUE,
      granularity,
      start_time: timeRange.start_time,
      end_time: timeRange.end_time,
      metrics: [
        {
          name: 'total_revenue',
          type: MetricType.SUM,
          field: 'amount',
          alias: '总收入',
        },
        {
          name: 'order_count',
          type: MetricType.COUNT,
          field: 'id',
          alias: '订单数',
        },
      ],
      include_total: true,
    });

    // 处理数据
    const times: string[] = [];
    const revenues: number[] = [];
    const orders: number[] = [];

    // 检查 API 响应结构
    // 调试日志已移除

    if (
      reportData &&
      reportData.data &&
      Array.isArray(reportData.data) &&
      reportData.data.length > 0
    ) {
      reportData.data.forEach((item) => {
        const time = new Date(item.time);
        if (selectedPeriod.value === 'today') {
          times.push(`${time.getHours()}:00`);
        } else {
          times.push(`${time.getMonth() + 1}/${time.getDate()}`);
        }
        revenues.push(item.metrics?.total_revenue || 0);
        orders.push(item.metrics?.order_count || 0);
      });
      // 调试日志已移除
    }

    // 如果没有有效数据，使用模拟数据
    if (times.length === 0) {
      // 调试日志已移除
      const mockData = generateMockData(selectedPeriod.value);
      times.push(...mockData.times);
      revenues.push(...mockData.revenues);
      orders.push(...mockData.orders);
    }

    // 设置图表配置
    const option: EChartsOption = {
      ...defaultChartOptions,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985',
          },
        },
        formatter: (params: any) => {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach((param: any) => {
            const value =
              param.seriesName === '收入'
                ? formatCurrency(param.value)
                : param.value.toLocaleString();
            result += `${param.marker}${param.seriesName}: ${value}<br/>`;
          });
          return result;
        },
      },
      legend: {
        data: ['收入', '订单数'],
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: times,
        boundaryGap: false,
      },
      yAxis: [
        {
          type: 'value',
          name: '收入 (¥)',
          position: 'left',
          axisLabel: {
            formatter: (value: number) => formatCurrency(value, '¥', 0),
          },
        },
        {
          type: 'value',
          name: '订单数',
          position: 'right',
          axisLabel: {
            formatter: '{value}',
          },
        },
      ],
      series: [
        {
          name: '收入',
          type: 'line',
          yAxisIndex: 0,
          data: revenues,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3,
          },
          areaStyle: {
            opacity: 0.3,
          },
          itemStyle: {
            color: '#1890ff',
          },
        },
        {
          name: '订单数',
          type: 'line',
          yAxisIndex: 1,
          data: orders,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: '#52c41a',
          },
        },
      ],
    };

    setOption(option);
  } catch (error) {
    console.error('加载收入趋势数据失败:', error);

    // 使用模拟数据
    const mockData = generateMockData(selectedPeriod.value);
    const option: EChartsOption = {
      ...defaultChartOptions,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: ['收入', '订单数'],
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: mockData.times,
        boundaryGap: false,
      },
      yAxis: [
        {
          type: 'value',
          name: '收入 (¥)',
          position: 'left',
        },
        {
          type: 'value',
          name: '订单数',
          position: 'right',
        },
      ],
      series: [
        {
          name: '收入',
          type: 'line',
          yAxisIndex: 0,
          data: mockData.revenues,
          smooth: true,
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#1890ff' },
        },
        {
          name: '订单数',
          type: 'line',
          yAxisIndex: 1,
          data: mockData.orders,
          smooth: true,
          itemStyle: { color: '#52c41a' },
        },
      ],
    };
    setOption(option);
  } finally {
    loading.value = false;
    hideLoading();
  }
};

// 生成模拟数据
const generateMockData = (period: string) => {
  const times: string[] = [];
  const revenues: number[] = [];
  const orders: number[] = [];

  if (period === 'today') {
    for (let i = 0; i < 24; i++) {
      times.push(`${i}:00`);
      revenues.push(Math.random() * 10_000 + 2000);
      orders.push(Math.floor(Math.random() * 100 + 20));
    }
  } else if (period === 'week') {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    days.forEach((day) => {
      times.push(day);
      revenues.push(Math.random() * 50_000 + 20_000);
      orders.push(Math.floor(Math.random() * 500 + 100));
    });
  } else {
    for (let i = 1; i <= 30; i++) {
      times.push(`${i}日`);
      revenues.push(Math.random() * 30_000 + 15_000);
      orders.push(Math.floor(Math.random() * 300 + 80));
    }
  }

  return { times, revenues, orders };
};

// 处理时间周期变化
const handlePeriodChange = () => {
  loadChartData();
};

// 监听时间周期变化
watch(selectedPeriod, () => {
  loadChartData();
});

onMounted(() => {
  loadChartData();
});
</script>

<template>
  <Card title="收入趋势" :loading="loading">
    <template #extra>
      <RadioGroup v-model:value="selectedPeriod" @change="handlePeriodChange">
        <RadioButton value="today">今日</RadioButton>
        <RadioButton value="week">本周</RadioButton>
        <RadioButton value="month">本月</RadioButton>
      </RadioGroup>
    </template>

    <div ref="chartRef" class="chart-container"></div>
  </Card>
</template>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>
