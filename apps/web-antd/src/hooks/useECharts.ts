import type { EChartsOption } from 'echarts';

import type { Ref } from 'vue';

import { nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';

import * as echarts from 'echarts';

export interface UseEChartsOptions {
  theme?: string;
  renderer?: 'canvas' | 'svg';
  width?: number;
  height?: number;
}

export function useECharts(
  elRef: Ref<HTMLElement | null>,
  options?: UseEChartsOptions,
) {
  const chartInstance = ref<echarts.ECharts | null>(null);
  const isLoading = ref(false);

  const { theme = 'default', renderer = 'canvas' } = options || {};

  // 初始化图表
  const initChart = async () => {
    const el = unref(elRef);
    if (!el) return;

    chartInstance.value = echarts.init(el, theme, {
      renderer,
      width: options?.width,
      height: options?.height,
    });
  };

  // 设置图表配置
  const setOption = (option: EChartsOption, clear = false) => {
    const chart = unref(chartInstance);
    if (!chart) return;

    if (clear) {
      chart.clear();
    }

    chart.setOption(option);
  };

  // 调整图表大小
  const resize = () => {
    const chart = unref(chartInstance);
    if (!chart) return;
    chart.resize();
  };

  // 显示加载状态
  const showLoading = (text = '加载中...') => {
    const chart = unref(chartInstance);
    if (!chart) return;

    isLoading.value = true;
    chart.showLoading('default', {
      text,
      color: '#1890ff',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0,
    });
  };

  // 隐藏加载状态
  const hideLoading = () => {
    const chart = unref(chartInstance);
    if (!chart) return;

    isLoading.value = false;
    chart.hideLoading();
  };

  // 获取图表实例
  const getInstance = () => {
    return unref(chartInstance);
  };

  // 销毁图表
  const dispose = () => {
    const chart = unref(chartInstance);
    if (!chart) return;

    chart.dispose();
    chartInstance.value = null;
  };

  // 监听容器大小变化
  const resizeObserver = new ResizeObserver(() => {
    resize();
  });

  onMounted(async () => {
    await nextTick();
    await initChart();

    const el = unref(elRef);
    if (el) {
      resizeObserver.observe(el);
    }
  });

  onBeforeUnmount(() => {
    dispose();
    resizeObserver.disconnect();
  });

  // 监听主题变化
  watch(
    () => theme,
    () => {
      dispose();
      initChart();
    },
  );

  return {
    chartInstance,
    isLoading,
    setOption,
    resize,
    showLoading,
    hideLoading,
    getInstance,
    dispose,
  };
}

// ECharts 工具函数

/**
 * 格式化数值
 */
export function formatNumber(value: number, precision = 2): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(precision)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(precision)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(precision)}K`;
  }
  return value.toFixed(precision);
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, precision = 1): string {
  return `${(value * 100).toFixed(precision)}%`;
}

/**
 * 格式化货币
 */
export function formatCurrency(
  value: number,
  currency = '¥',
  precision = 2,
): string {
  return currency + value.toFixed(precision);
}

/**
 * 生成颜色数组
 */
export function generateColors(count: number): string[] {
  const colors = [
    '#1890ff',
    '#52c41a',
    '#faad14',
    '#f5222d',
    '#722ed1',
    '#fa8c16',
    '#13c2c2',
    '#eb2f96',
    '#a0d911',
    '#2f54eb',
  ];

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
}

/**
 * 默认图表配置
 */
export const defaultChartOptions: Partial<EChartsOption> = {
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'transparent',
    textStyle: {
      color: '#fff',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  legend: {
    textStyle: {
      color: '#666',
    },
  },
  xAxis: {
    axisLine: {
      lineStyle: {
        color: '#e8e8e8',
      },
    },
    axisLabel: {
      color: '#666',
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#666',
    },
    splitLine: {
      lineStyle: {
        color: '#f0f0f0',
        type: 'dashed',
      },
    },
  },
};
