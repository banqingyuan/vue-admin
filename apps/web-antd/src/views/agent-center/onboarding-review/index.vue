<script setup lang="ts">
import type { TableProps } from 'ant-design-vue';

import { computed, h, onMounted, reactive, ref, watch } from 'vue';

import {
  approvePromoter,
  getPromoterDetail,
  getPromoterPerformanceStats,
  listPromoters,
  rejectPromoter,
  type PromoterListItem,
  type PromoterListQuery,
  type PromoterPerformanceStats,
} from '#/api/core';

import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Pagination,
  Radio,
  Segmented,
  Select,
  Space,
  Spin,
  Table,
  message,
} from 'ant-design-vue';

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待审核', value: 'pending' },
  { label: '自动通过', value: 'auto_pass' },
  { label: '已通过', value: 'pass' },
  { label: '不通过', value: 'reject' },
];
const statusValue = ref('pending');

const filterForm = reactive({
  level: undefined as number | undefined,
  phone: '',
  company_name: '',
  real_name: '',
  contact_phone: '',
  keyword: '',
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

const loading = ref(false);
const dataSource = ref<PromoterListItem[]>([]);

const selectedPromoter = ref<PromoterListItem | null>(null);
const reviewTarget = ref<PromoterListItem | null>(null);
const reviewModalVisible = ref(false);
const reviewModalLoading = ref(false);
const reviewSourceStatus = ref<'pending' | 'reject' | null>(null);
const reviewForm = reactive({
  result: 'pass' as 'pass' | 'reject',
  level: 2,
  parentPromoterId: undefined as number | undefined,
  remark: '',
});
const reviewParentOptions = ref<{ label: string; value: number }[]>([]);
const reviewParentLoading = ref(false);
const showParentSelector = computed(() => reviewForm.result === 'pass' && reviewForm.level === 2);
const reviewModalTitle = computed(() =>
  reviewSourceStatus.value === 'reject' ? '修改审核' : '审核',
);

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<PromoterListItem | null>(null);
const detailStats = ref<PromoterPerformanceStats | null>(null);
const detailStatsLoading = ref(false);

function formatFenToYuan(fen?: number | null) {
  if (typeof fen !== 'number') return '—';
  return (fen / 100).toFixed(2);
}

function formatCount(...values: (number | null | undefined)[]) {
  const total = values.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  return total || '—';
}

const detailStatItems = computed(() => {
  const stats = detailStats.value;
  const formatMoney = (value?: number | null) =>
    detailStatsLoading.value ? '加载中...' : formatFenToYuan(value);
  const formatCount = (value?: number | null) => {
    if (detailStatsLoading.value) return '加载中...';
    if (typeof value !== 'number') return '—';
    return value;
  };

  return [
    { title: '累计销售额-原价', unit: '元', value: formatMoney(stats?.total_sales_amount_fen) },
    { title: '累计收益-分成', unit: '元', value: formatMoney(stats?.total_commission_fen) },
    { title: '累计销售订单数', value: formatCount(stats?.paid_order_count) },
    { title: '邀请收益', unit: '元', value: formatMoney(stats?.invite_income_fen) },
    { title: '邀请订单数', value: formatCount(stats?.invite_order_count) },
    { title: '邀请用户数', value: formatCount(stats?.invite_user_count) },
    { title: '下级收益', unit: '元', value: formatMoney(stats?.downstream_income_fen) },
    { title: '下级订单数', value: formatCount(stats?.downstream_order_count) },
    { title: '下级邀请用户数', value: formatCount(stats?.downstream_invite_user_count) },
  ];
});

const levelOptions = [
  { label: '高级代理', value: 1 },
  { label: '代理', value: 2 },
];

type StatusVariant = 'pending' | 'auto_pass' | 'pass' | 'reject';

const STATUS_META: Record<StatusVariant, { text: string; variant: StatusVariant }> = {
  pending: { text: '待审核', variant: 'pending' },
  auto_pass: { text: '自动通过', variant: 'auto_pass' },
  pass: { text: '已通过', variant: 'pass' },
  reject: { text: '不通过', variant: 'reject' },
};

const SUBJECT_META: Record<'personal' | 'company', { text: string; variant: string }> = {
  personal: { text: '个人', variant: 'subject-personal' },
  company: { text: '企业', variant: 'subject-company' },
};

type JoinTypeKey = 'self_apply' | 'invite' | 'admin_import';

const JOIN_TYPE_META: Record<
  JoinTypeKey,
  {
    label: string;
    className: string;
  }
> = {
  self_apply: { label: '自主申请', className: 'join-type-pill join-type-pill--self' },
  invite: { label: '上级邀请', className: 'join-type-pill join-type-pill--invite' },
  admin_import: { label: '后台导入', className: 'join-type-pill join-type-pill--admin' },
};

const levelMap: Record<number, string> = {
  1: '高级代理',
  2: '代理',
};

function getLevelLabel(level?: number | null) {
  if (level === 1 || level === 2) {
    return levelMap[level];
  }
  return '-';
}

function resolveStatusVariant(record: PromoterListItem): StatusVariant {
  const status = (record.approval_status || '').toLowerCase();
  if (status === 'reject') return 'reject';
  if (status === 'pending') return 'pending';
  if (status === 'auto_pass') return 'auto_pass';
  if (status === 'pass' || status === 'active') {
    if (record.join_type === 'invite' || record.auto_passed) {
      return 'auto_pass';
    }
    return 'pass';
  }
  return 'pending';
}

function getStatusMeta(record?: PromoterListItem | null): { text: string; variant: StatusVariant } {
  if (!record) return STATUS_META.pending;
  const variant = resolveStatusVariant(record);
  return STATUS_META[variant] ?? STATUS_META.pending;
}

function getJoinTypeMeta(joinType?: string) {
  const key = (joinType || 'self_apply') as JoinTypeKey;
  return JOIN_TYPE_META[key] ?? JOIN_TYPE_META.self_apply;
}

function getJoinTypeLabel(joinType?: string) {
  return getJoinTypeMeta(joinType).label;
}

type SubjectMetaKey = keyof typeof SUBJECT_META;

function getSubjectMeta(record?: PromoterListItem | null): { text: string; variant: string } {
  const key = (record?.type ?? 'personal') as SubjectMetaKey;
  return SUBJECT_META[key] ?? SUBJECT_META.personal;
}

const columns: TableProps['columns'] = [
  {
    title: '注册手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 160,
    align: 'left',
  },
  {
    title: '审核状态',
    key: 'status',
    width: 150,
    align: 'center',
    customRender: ({ record }) => renderStatus(record as PromoterListItem),
  },
  {
    title: '代理类型',
    key: 'type',
    width: 180,
    align: 'center',
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      return getLevelLabel(item.level);
    },
  },
  {
    title: '上级代理',
    key: 'parent',
    width: 180,
    align: 'center',
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      if (!item.parent_promoter_id) return '-';
      return item.parent_promoter_name || `ID:${item.parent_promoter_id}`;
    },
  },
  {
    title: '主体类型',
    key: 'subject',
    width: 150,
    align: 'center',
    customRender: ({ record }) => renderSubject(record as PromoterListItem),
  },
  {
    title: '真实姓名',
    key: 'real_name',
    width: 180,
    align: 'center',
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      return (
        getDetailField(item, ['legal_name', 'real_name', 'contact_name']) ||
        item.name ||
        '-'
      );
    },
  },
  {
    title: '身份证号',
    key: 'id_number',
    width: 220,
    align: 'center',
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      return (
        getDetailField(item, ['legal_id_number', 'id_number']) || (item.type === 'company' ? '—' : '-')
      );
    },
  },
  {
    title: '企业名称',
    key: 'company_name',
    width: 240,
    customRender: ({ record }) =>
      getDetailField(record as PromoterListItem, ['company_name']) || '-',
  },
  {
    title: '法人名称',
    key: 'legal_person',
    width: 220,
    align: 'center',
    customRender: ({ record }) =>
      getDetailField(record as PromoterListItem, ['legal_person']) || '-',
  },
  {
    title: '统一社会信用代码',
    key: 'license',
    width: 240,
    align: 'left',
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      return (
        getDetailField(item, ['business_license_number', 'uscc']) ??
        (item.type === 'personal' ? '—' : '-')
      );
    },
  },
  {
    title: '联系手机号',
    key: 'contact_phone',
    width: 180,
    align: 'center',
    customRender: ({ record }) =>
      getDetailField(record as PromoterListItem, ['contact_phone']) ||
      (record as PromoterListItem).contact_phone ||
      '-',
  },
  {
    title: '资源介绍',
    key: 'resource_desc',
    width: 220,
    ellipsis: true,
    customRender: ({ record }) =>
      (record as PromoterListItem).resource_desc ||
      getDetailField(record as PromoterListItem, ['resource_desc', 'resource']) ||
      '-',
  },
  {
    title: '申请时间',
    key: 'application_time',
    width: 200,
    align: 'center',
    customRender: ({ record }) =>
      formatDate((record as PromoterListItem).application_time || (record as PromoterListItem).created_at),
  },
  {
    title: '申请方式',
    key: 'application_method',
    width: 180,
    align: 'center',
    customRender: ({ record }) => renderJoinType(record as PromoterListItem),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    align: 'center',
    fixed: 'right',
    customRender: ({ record }) => renderActions(record as PromoterListItem),
  },
];

function renderStatus(record: PromoterListItem) {
  const meta = getStatusMeta(record);
  return h(
    'span',
    {
      class: ['status-pill', `status-pill--${meta.variant}`],
    },
    meta.text,
  );
}

function renderSubject(record: PromoterListItem) {
  const meta = getSubjectMeta(record);
  return h(
    'span',
    {
      class: ['subject-pill', `subject-pill--${meta.variant}`],
    },
    meta.text,
  );
}

function renderJoinType(record: PromoterListItem) {
  const meta = getJoinTypeMeta(record.join_type);
  return h(
    'span',
    {
      class: meta.className,
    },
    meta.label,
  );
}

function renderActions(record: PromoterListItem) {
  const status = (record.approval_status || '').toLowerCase();
  return h(
    Space,
    { size: 8 },
    {
      default: () => [
        h(
          Button,
          {
            type: 'link',
            size: 'small',
            onClick: () => openDetail(record),
          },
          { default: () => '查看' },
        ),
        status === 'pending'
          ? h(
              Button,
              {
                type: 'link',
                size: 'small',
                onClick: () => openReviewModal(record),
              },
              { default: () => '审核' },
            )
          : status === 'reject'
            ? h(
                Button,
                {
                  type: 'link',
                  size: 'small',
                  onClick: () => openReviewModal(record),
                },
                { default: () => '修改审核' },
              )
          : null,
      ],
    },
  );
}

function getDetailField(record: PromoterListItem, keys: string[]) {
  if (!record.detail_info) return '';
  for (const key of keys) {
    const value = record.detail_info[key];
    if (value) return String(value);
  }
  return '';
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

async function fetchPromoters() {
  loading.value = true;
  try {
    const query: PromoterListQuery = {
      page: pagination.current,
      page_size: pagination.pageSize,
    };
    if (statusValue.value && statusValue.value !== 'all') query.status = statusValue.value;
    if (filterForm.level) query.level = filterForm.level;
    if (filterForm.phone) query.phone = filterForm.phone.trim();
    if (filterForm.company_name) query.company_name = filterForm.company_name.trim();
    if (filterForm.real_name) query.real_name = filterForm.real_name.trim();
    if (filterForm.contact_phone) query.contact_phone = filterForm.contact_phone.trim();
  if (filterForm.keyword) query.keyword = filterForm.keyword.trim();

    const resp = await listPromoters(query);
    dataSource.value = resp.records || [];
    pagination.total = resp.total || 0;
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || '加载入驻审核列表失败');
  } finally {
    loading.value = false;
  }
}

function triggerFilter() {
  pagination.current = 1;
  fetchPromoters();
}

function handleTableChange(page: number, pageSize?: number) {
  pagination.current = page;
  if (pageSize) pagination.pageSize = pageSize;
  fetchPromoters();
}

async function openDetail(record: PromoterListItem) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailStats.value = null;
  try {
    const data = await getPromoterDetail(record.promoter_id);
    detailData.value = data;
    selectedPromoter.value = data;
    fetchDetailStats(record.promoter_id);
  } catch (error: any) {
    detailVisible.value = false;
    message.error(error?.message || '加载入驻申请详情失败');
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  detailVisible.value = false;
  detailData.value = null;
  detailStats.value = null;
  selectedPromoter.value = null;
}

async function fetchDetailStats(promoterId: number) {
  detailStatsLoading.value = true;
  try {
    const stats = await getPromoterPerformanceStats(promoterId);
    detailStats.value = stats;
  } catch (error: any) {
    console.error(error);
    detailStats.value = null;
    message.warning(error?.message || '加载业绩数据失败');
  } finally {
    detailStatsLoading.value = false;
  }
}

async function loadReviewParentOptions() {
  if (reviewParentLoading.value) return;
  try {
    reviewParentLoading.value = true;
    const resp = await listPromoters({
      status: 'pass',
      level: 1,
      page: 1,
      page_size: 200,
    });
    reviewParentOptions.value =
      resp.records?.map((item) => ({
        label: `${item.name || item.phone}（ID:${item.promoter_id}）`,
        value: item.promoter_id,
      })) ?? [];
  } catch (error) {
    console.warn('加载上级代理失败', error);
  } finally {
    reviewParentLoading.value = false;
  }
}

function openReviewModal(record?: PromoterListItem) {
  const target = record || selectedPromoter.value;
  if (!target) return;
  reviewTarget.value = target;
  const status = (target.approval_status || '').toLowerCase();
  reviewSourceStatus.value = status === 'reject' ? 'reject' : 'pending';
  reviewForm.result = reviewSourceStatus.value === 'reject' ? 'reject' : 'pass';
  reviewForm.level = target.level || 2;
  reviewForm.parentPromoterId = target.parent_promoter_id ?? undefined;
  reviewForm.remark = '';
  reviewModalVisible.value = true;
  if (reviewForm.level === 2 && !reviewParentOptions.value.length) {
    loadReviewParentOptions();
  }
}

function closeReviewModal() {
  reviewModalVisible.value = false;
  reviewTarget.value = null;
  reviewSourceStatus.value = null;
}

async function submitReview() {
  if (!reviewTarget.value) return;
  const promoterId = reviewTarget.value.promoter_id;
  if (reviewSourceStatus.value === 'reject' && reviewForm.result === 'reject') {
    message.warning('不通过状态仅支持修改为通过');
    return;
  }
  if (reviewForm.result === 'pass') {
    if (!reviewForm.level) {
      message.warning('请选择代理等级');
      return;
    }
  } else if (!reviewForm.remark.trim()) {
    message.warning('请输入驳回原因');
    return;
  }

  reviewModalLoading.value = true;
  try {
    if (reviewForm.result === 'pass') {
      await approvePromoter(promoterId, {
        level: reviewForm.level,
        parent_promoter_id:
          reviewForm.level === 2
            ? reviewForm.parentPromoterId ?? null
            : undefined,
      });
      message.success('已通过该申请');
    } else {
      await rejectPromoter(promoterId, { remark: reviewForm.remark.trim() });
      message.success('已驳回申请');
    }
    reviewModalVisible.value = false;
    reviewTarget.value = null;
    reviewSourceStatus.value = null;
    await fetchPromoters();
    if (selectedPromoter.value?.promoter_id === promoterId) {
      selectedPromoter.value = {
        ...selectedPromoter.value,
        approval_status: reviewForm.result === 'pass' ? 'active' : 'reject',
        parent_promoter_id:
          reviewForm.result === 'pass' && reviewForm.level === 2
            ? reviewForm.parentPromoterId
            : undefined,
        level: reviewForm.result === 'pass' ? reviewForm.level : selectedPromoter.value.level,
      };
      if (reviewForm.result === 'reject') {
        detailVisible.value = false;
      }
    }
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || '审核操作失败');
  } finally {
    reviewModalLoading.value = false;
  }
}

watch(
  () => reviewForm.level,
  (level) => {
    if (level === 2 && !reviewParentOptions.value.length) {
      loadReviewParentOptions();
    }
    if (level !== 2) {
      reviewForm.parentPromoterId = undefined;
    }
  },
);

watch(
  () => reviewForm.result,
  (value) => {
    if (value === 'pass') {
      reviewForm.remark = '';
    }
  },
);

watch(
  () => statusValue.value,
  () => {
    pagination.current = 1;
    fetchPromoters();
  },
);

onMounted(() => {
  fetchPromoters();
});
</script>

<template>
  <div class="agent-review-page">
    <div class="status-segmented">
      <Segmented v-model:value="statusValue" :options="statusOptions" />
    </div>

    <Card class="filter-card" :bordered="false">
      <Form layout="inline" :model="filterForm" class="filter-form">
        <Form.Item label="代理等级">
          <Select
            v-model:value="filterForm.level"
            :options="levelOptions"
            allow-clear
            placeholder="全部"
            style="width: 200px"
            @change="triggerFilter"
          />
        </Form.Item>
        <Form.Item label="手机号">
          <Input
            v-model:value="filterForm.phone"
            placeholder="请输入"
            allow-clear
            style="width: 200px"
            @pressEnter="triggerFilter"
            @blur="triggerFilter"
          />
        </Form.Item>
        <Form.Item label="企业名称">
          <Input
            v-model:value="filterForm.company_name"
            placeholder="请输入"
            allow-clear
            style="width: 200px"
            @pressEnter="triggerFilter"
            @blur="triggerFilter"
          />
        </Form.Item>
        <Form.Item label="真实姓名">
          <Input
            v-model:value="filterForm.real_name"
            placeholder="请输入"
            allow-clear
            style="width: 200px"
            @pressEnter="triggerFilter"
            @blur="triggerFilter"
          />
        </Form.Item>
        <Form.Item label="联系电话">
          <Input
            v-model:value="filterForm.contact_phone"
            placeholder="请输入"
          allow-clear
            style="width: 200px"
            @pressEnter="triggerFilter"
            @blur="triggerFilter"
          />
        </Form.Item>
        <Form.Item label="关键字">
          <Input
            v-model:value="filterForm.keyword"
            placeholder="手机号 / 姓名 / 企业名称"
            allow-clear
            style="width: 220px"
            @pressEnter="triggerFilter"
            @blur="triggerFilter"
          />
        </Form.Item>
      </Form>
    </Card>

    <Card class="table-card" :bordered="false">
      <div class="table-scroll-wrapper">
        <Table
          :data-source="dataSource"
          :columns="columns"
          :loading="loading"
          row-key="promoter_id"
          :pagination="false"
          :scroll="{ x: 2200 }"
          size="middle"
          :row-class-name="() => 'review-table-row'"
          class="review-table"
        />
      </div>
      <div class="table-footer">
        <Pagination
          :current="pagination.current"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          show-size-changer
          @change="handleTableChange"
          @showSizeChange="handleTableChange"
        />
      </div>
    </Card>

    <div v-if="detailVisible" class="detail-overlay">
      <Spin tip="加载中..." :spinning="detailLoading">
        <div v-if="detailData" class="detail-panel">
          <!-- 头部标题栏 -->
          <div class="detail-header-new">
            <!-- 左侧：返回+标题+ID+标签（独立金色边框盒子） -->
            <div class="header-left-box">
              <button class="back-button" type="button" @click="closeDetail">
                <span class="back-arrow"></span>
              </button>
              <div class="header-info">
                <span class="company-title">{{ detailData.name || detailData.detail_info?.company_name || detailData.phone }}</span>
                <span class="company-id">ID：{{ detailData.promoter_id }}</span>
                <span class="agent-level-tag">{{ detailData.level === 1 ? '高级代理' : '代理' }}</span>
              </div>
            </div>
            <!-- 右侧：审核操作按钮（独立金色边框盒子） -->
            <div 
              v-if="['pending', 'reject'].includes((detailData.approval_status || '').toLowerCase())"
              class="header-right-box"
            >
              <Button 
                class="action-btn review-btn" 
                type="primary"
                @click="openReviewModal()"
              >
                {{ (detailData.approval_status || '').toLowerCase() === 'reject' ? '修改审核' : '审核' }}
              </Button>
            </div>
          </div>

          <!-- 账号信息卡片 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="card-title">账号信息</div>
            </div>
            <div class="card-body card-body-5cols">
              <div class="form-field">
                <div class="field-label">注册手机号</div>
                <div class="field-value-static">{{ detailData.phone || '-' }}</div>
              </div>
              <div class="form-field">
                <div class="field-label">代理等级</div>
                <div class="field-value-static">{{ getLevelLabel(detailData.level) }}</div>
              </div>
              <div class="form-field">
                <div class="field-label">上级代理</div>
                <div class="field-value-static">
                  {{
                    detailData.parent_promoter_name ||
                    (detailData.parent_promoter_id ? `ID:${detailData.parent_promoter_id}` : '无')
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">资源介绍</div>
                <div class="field-value-static">
                  {{
                    detailData.resource_desc ||
                    getDetailField(detailData, ['resource_desc', 'resource']) ||
                    '-'
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">备注</div>
                <div class="field-value-static">
                  {{ getDetailField(detailData, ['remark']) || '-' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">加入时间</div>
                <div class="field-value-static">{{ formatDate(detailData.created_at) }}</div>
              </div>
              <div class="form-field">
                <div class="field-label">加入方式</div>
                <div class="field-value-static">{{ getJoinTypeLabel(detailData.join_type) }}</div>
              </div>
            </div>
          </div>

          <!-- 主体信息卡片 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="card-title">主体信息</div>
            </div>
            <!-- 企业类型：3列 -->
            <div v-if="detailData.type === 'company'" class="card-body card-body-3cols">
              <div class="form-field">
                <div class="field-label">主体类型</div>
                <div class="field-value-static">公司</div>
              </div>
              <div class="form-field">
                <div class="field-label">公司主体名称</div>
                <div class="field-value-static">
                  {{
                    getDetailField(detailData, ['company_name']) ||
                    detailData.name ||
                    '-'
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">统一社会信用代码</div>
                <div class="field-value-static">
                  {{
                    getDetailField(detailData, ['business_license_number', 'uscc']) ||
                    '-'
                  }}
                </div>
              </div>
            </div>
            <!-- 个人类型：4列 -->
            <div v-else-if="detailData.type === 'personal'" class="card-body card-body-4cols">
              <div class="form-field">
                <div class="field-label">主体类型</div>
                <div class="field-value-static">个人</div>
              </div>
              <div class="form-field">
                <div class="field-label">姓名</div>
                <div class="field-value-static">
                  {{
                    getDetailField(detailData, ['real_name', 'legal_name']) ||
                    detailData.name ||
                    '-'
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">身份证号</div>
                <div class="field-value-static">
                  {{
                    getDetailField(detailData, ['id_number']) ||
                    '-'
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">实名认证</div>
                <div class="field-value-static field-value-verified">
                  <span v-if="getDetailField(detailData, ['verification_status']) === '已认证' || getDetailField(detailData, ['verified'])">
                    ✅ 已通过
                  </span>
                  <span v-else>
                    {{ getDetailField(detailData, ['verification_status']) || '未认证' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 收款信息卡片 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="card-title">收款信息</div>
            </div>
            <!-- 企业类型：账户名称 + 开户行 + 账号 -->
            <div v-if="detailData.type === 'company'" class="card-body card-body-3cols">
              <div class="form-field">
                <div class="field-label">账户名称</div>
                <div class="field-value-static">
                  {{ getDetailField(detailData, ['account_name']) || detailData.detail_info?.payee_name || '-' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">开户行</div>
                <div class="field-value-static">
                  {{ getDetailField(detailData, ['bank_name', 'pay_channel']) || '—' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">账号</div>
                <div class="field-value-static">
                  {{ getDetailField(detailData, ['bank_account', 'payee_account']) || '—' }}
                </div>
              </div>
            </div>
            <!-- 个人类型：支付宝账号 + 银行卡账号 + 银行卡姓名 -->
            <div v-else-if="detailData.type === 'personal'" class="card-body card-body-3cols">
              <div class="form-field">
                <div class="field-label">支付宝账号</div>
                <div class="field-value-static">
                  {{ getDetailField(detailData, ['alipay_account', 'alipay']) || '—' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">银行卡账号</div>
                <div class="field-value-static">
                  {{ getDetailField(detailData, ['bank_account', 'bank_card_number']) || '—' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">银行卡姓名</div>
                <div class="field-value-static">
                  {{ getDetailField(detailData, ['bank_card_name', 'card_holder_name']) || '—' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 业绩情况卡片 - 已隐藏，仅在代理列表页展示 -->
          <div v-if="false" class="detail-card">
            <div class="card-header">
              <div class="card-title">业绩情况</div>
            </div>
            <div class="card-body">
              <!-- 总收入（直接推广+下级推广）-->
              <div class="stats-section">
                <div class="stats-section-title">总收入（直接推广+下级推广）</div>
                <div class="stats-grid stats-grid-6">
                  <div class="stat-item">
                    <div class="stat-label">总-销售额-原价<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.total_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">累计总收入-分成<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.total_commission_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">累计销售额-净收入<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.total_net_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总-退款金额-分成<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.total_refunded_commission_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总-邀请用户数</div>
                    <div class="stat-value">{{ formatCount(detailStats?.invite_user_count, detailStats?.downstream_invite_user_count) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总-销售订单数</div>
                    <div class="stat-value">{{ detailStats?.paid_order_count || '—' }}</div>
                  </div>
                </div>
                <div class="stats-grid stats-grid-6" style="margin-top: 12px;">
                  <div class="stat-item">
                    <div class="stat-label">已提现现金<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.withdrawn_fen) }}</div>
              </div>
                </div>
              </div>

              <!-- 推广收益（直接推广）-->
              <div class="stats-section">
                <div class="stats-section-title">推广收益（直接推广）</div>
                <div class="stats-grid stats-grid-6">
                  <div class="stat-item">
                    <div class="stat-label">邀请-销售额-原价<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.invite_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请收入-分成<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.invite_income_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请-销售额-净收入<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.invite_net_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请-退款金额-分成<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.invite_refunded_commission_fen) }}</div>
                </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请-用户数</div>
                    <div class="stat-value">{{ detailStats?.invite_user_count || '—' }}</div>
              </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请-销售订单数</div>
                    <div class="stat-value">{{ detailStats?.invite_order_count || '—' }}</div>
                  </div>
                </div>
              </div>

              <!-- 下级收益（下级推广）-->
              <div class="stats-section">
                <div class="stats-section-title">下级收益（下级推广）</div>
                <div class="stats-grid stats-grid-6">
                  <div class="stat-item">
                    <div class="stat-label">下级-销售额-原价<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.downstream_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级收益-分成<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.downstream_income_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级-销售额-净收入<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.downstream_net_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级-退款金额-分成<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.downstream_refunded_commission_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级-邀请用户数</div>
                    <div class="stat-value">{{ detailStats?.downstream_invite_user_count || '—' }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级-销售订单数</div>
                    <div class="stat-value">{{ detailStats?.downstream_order_count || '—' }}</div>
                  </div>
                </div>
                <div class="stats-grid stats-grid-6" style="margin-top: 12px;">
                  <div class="stat-item">
                    <div class="stat-label">下级代理人数</div>
                    <div class="stat-value">{{ detailStats?.child_promoter_count || '—' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spin>
    </div>
    <Modal
      v-model:open="reviewModalVisible"
      :title="reviewModalTitle"
      :footer="null"
      :confirm-loading="reviewModalLoading"
      wrap-class-name="review-modal"
      @cancel="closeReviewModal"
    >
      <Form layout="vertical" class="review-modal-form">
        <Form.Item label="审核结果" required class="review-form-item">
          <Radio.Group v-model:value="reviewForm.result" class="review-radio-group">
            <Radio value="pass">审核通过</Radio>
            <Radio value="reject">审核不通过</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          v-if="reviewForm.result === 'pass'"
          label="代理等级"
          required
          class="review-form-item"
        >
          <Select
            v-model:value="reviewForm.level"
            :options="levelOptions"
            placeholder="请选择（高级代理/代理）"
            class="review-modal-select"
          />
        </Form.Item>
        <Form.Item
          v-if="showParentSelector"
          label="上级代理（可选）"
          class="review-form-item"
        >
          <Select
            v-model:value="reviewForm.parentPromoterId"
            :options="reviewParentOptions"
            :loading="reviewParentLoading"
            show-search
            option-filter-prop="label"
            placeholder="请选择"
            class="review-modal-select"
          />
        </Form.Item>
        <Form.Item
          v-if="reviewForm.result === 'reject'"
          label="驳回原因"
          required
          class="review-form-item"
        >
          <Input.TextArea
            v-model:value="reviewForm.remark"
            placeholder="请输入驳回原因"
            :rows="3"
            :maxlength="200"
            class="review-modal-textarea"
          />
        </Form.Item>
      </Form>
      <div class="review-modal-footer">
        <Button class="modal-btn cancel" @click="closeReviewModal">取消</Button>
        <Button
          class="modal-btn confirm"
          type="primary"
          :loading="reviewModalLoading"
          @click="submitReview"
        >
          确认
        </Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
:global(:root) {
  --agent-review-bg: #f7f3ea;
  --agent-review-card-bg: #ffffff;
  --agent-review-border: #e8e2d3;
  --agent-review-text: #1b1b1b;
  --agent-review-muted: #5c5c5c;
  --agent-review-segmented-bg: #efe8db;
  --agent-review-segmented-active-bg: #fffaf0;
  --agent-review-grid: #fbf8f0;
  --agent-review-highlight: #c58b21;
  --subject-personal-color: #897c55;
  --subject-company-color: #237804;
}

:global(.dark) {
  --agent-review-bg: --dark;
  --agent-review-card-bg: #1f1f1f;
  --agent-review-border: #262626;
  --agent-review-text: #f5f5f5;
  --agent-review-muted: #bfbfbf;
  --agent-review-segmented-bg: #434343;
  --agent-review-segmented-active-bg: #141414;
  --agent-review-grid: #1a1a1a;
  --agent-review-highlight: #ffe395;
  --subject-personal-color: #fff2cc;
  --subject-company-color: #95de64;
}

.agent-review-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--agent-review-text);
  padding: 16px;
  min-height: 100vh;
}

.status-segmented {
  display: flex;
  justify-content: flex-start;
  background: var(--agent-review-segmented-bg);
  border-radius: 6px;
  padding: 2px;
}

.status-segmented :deep(.ant-segmented) {
  background: transparent;
}

.status-segmented :deep(.ant-segmented-item) {
  color: var(--agent-review-muted);
}

.status-segmented :deep(.ant-segmented-thumb) {
  background: var(--agent-review-segmented-active-bg);
  border-radius: 4px;
}

.status-segmented :deep(.ant-segmented-item-selected) {
  color: var(--agent-review-highlight);
  font-weight: 600;
}

.filter-card {
  background: var(--agent-review-card-bg);
  border: 1px solid var(--agent-review-border);
  border-radius: 8px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
}

.table-card {
  background: var(--agent-review-card-bg);
  border: 1px solid var(--agent-review-border);
  border-radius: 8px;
  padding: 0 0 8px;
}

.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table-scroll-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-scroll-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.table-scroll-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
}

.review-table :deep(.ant-table) {
  background: transparent;
  color: var(--agent-review-text);
  min-width: 1100px;
}

.review-table :deep(.ant-table-thead > tr > th) {
  background: var(--agent-review-card-bg);
  color: var(--agent-review-muted);
  border-bottom: 1px solid var(--agent-review-border);
  font-size: 14px;
  font-weight: 500;
  padding: 14px 20px;
}

.review-table :deep(.ant-table-thead > tr > th:not(:last-child)) {
  border-right: 1px solid var(--agent-review-border);
}

.review-table :deep(.ant-table-tbody > tr > td) {
  border-color: var(--agent-review-border);
  color: var(--agent-review-text);
  padding: 16px 20px;
  font-size: 14px;
}

.review-table :deep(.ant-table-tbody > tr > td:not(:last-child)) {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.review-table :deep(.ant-table-cell-fix-left),
.review-table :deep(.ant-table-cell-fix-right) {
  background: var(--agent-review-card-bg) !important;
}

.review-table :deep(.ant-table-placeholder),
.review-table :deep(.ant-table-body) {
  background: transparent;
}

.review-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(255, 255, 255, 0.03);
}

/* 固定列在hover时也保持实色背景 */
.review-table :deep(.ant-table-tbody > tr:hover > td.ant-table-cell-fix-left),
.review-table :deep(.ant-table-tbody > tr:hover > td.ant-table-cell-fix-right) {
  background: var(--agent-review-card-bg) !important;
}

.review-table-row {
  transition: background 0.2s ease;
}

.review-table-row:nth-child(odd) td {
  background: transparent;
}

.review-table-row:nth-child(even) td {
  background: rgba(255, 255, 255, 0.015);
}

/* 固定列不受斑马纹影响,始终保持实色背景 */
.review-table-row:nth-child(odd) td.ant-table-cell-fix-left,
.review-table-row:nth-child(odd) td.ant-table-cell-fix-right,
.review-table-row:nth-child(even) td.ant-table-cell-fix-left,
.review-table-row:nth-child(even) td.ant-table-cell-fix-right {
  background: var(--agent-review-card-bg) !important;
}

:deep(.status-pill),
:deep(.subject-pill) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 16px;
  border: 1px solid transparent;
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
}

:deep(.status-pill--pending) {
  background: rgba(255, 227, 149, 0.15);
  border-color: rgba(255, 227, 149, 0.4);
  color: #ffe395;
}

:deep(.status-pill--pass) {
  background: rgba(82, 196, 26, 0.15);
  border-color: rgba(82, 196, 26, 0.4);
  color: #52c41a;
}

:deep(.status-pill--auto_pass) {
  background: rgba(82, 196, 26, 0.1);
  border-color: rgba(82, 196, 26, 0.25);
  color: #9de46f;
}

:deep(.status-pill--reject) {
  background: rgba(255, 77, 79, 0.15);
  border-color: rgba(255, 77, 79, 0.4);
  color: #ff7875;
}

/* 个人 - 金色系,亮暗同色背景 */
:deep(.subject-pill--subject-personal) {
  display: flex;
  padding: 3px 6px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  border: 1px solid #897c55;
  background: rgba(137, 124, 85, 0.1);
  width: 38px;
  font-size: 12px;
  line-height: 16px;
  font-family: var(--fontFamily-PingFang-SC, "PingFang SC");
  font-weight: 400;
  color: var(--subject-personal-color);
}

/* 企业 - 绿色系,亮暗同色背景 */
:deep(.subject-pill--subject-company) {
  display: flex;
  padding: 3px 6px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  border: 1px solid #237804;
  background: rgba(35, 120, 4, 0.1);
  width: 38px;
  font-size: 12px;
  line-height: 16px;
  font-family: var(--fontFamily-PingFang-SC, "PingFang SC");
  font-weight: 400;
  color: var(--subject-company-color);
}

.subject-pill {
  min-width: 48px;
}

/* 加入方式pill样式 - 保持暗色主题 */
:deep(.join-type-pill) {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid transparent;
  border-radius: 6px;
}

/* 自主申请 - 保持暗色主题 */
:deep(.join-type-pill--self) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
}

/* 上级邀请 - 绿色,保持暗色主题 */
:deep(.join-type-pill--invite) {
  background: rgba(65, 160, 80, 0.12);
  border-color: rgba(65, 160, 80, 0.5);
  color: #48d46d;
}

/* 后台导入 - 蓝色,保持暗色主题 */
:deep(.join-type-pill--admin) {
  background: rgba(0, 87, 194, 0.1);
  border-color: rgba(0, 87, 194, 1);
  color: rgba(148, 203, 255, 1);
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 8px;
}

.detail-row .label {
  color: var(--agent-review-muted);
}

.detail-row .value {
  color: var(--agent-review-text);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-grid-item {
  padding: 12px;
  border-radius: 10px;
  background: var(--agent-review-grid);
  border: 1px solid var(--agent-review-border);
}

.detail-grid-item .label {
  font-size: 12px;
  color: var(--agent-review-muted);
}

.detail-grid-item .value {
  margin-top: 4px;
  color: var(--agent-review-text);
  word-break: break-all;
}

.detail-grid-item.wide {
  grid-column: span 2;
}

@media (max-width: 640px) {
  .detail-grid-item.wide {
    grid-column: span 1;
  }
}

.detail-overlay {
  position: absolute;
  inset: 0;
  background: #141414;
  padding: 16px;
  z-index: 5;
  overflow-y: auto;
}

.detail-panel {
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  color: var(--agent-review-text);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 0;
}

.detail-back .arrow {
  width: 10px;
  height: 10px;
  border-left: 2px solid var(--agent-review-text);
  border-bottom: 2px solid var(--agent-review-text);
  transform: rotate(45deg);
  display: inline-block;
}

.detail-title {
  flex: 1;
}

.detail-title h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--agent-review-text);
}

.detail-subtitle {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  color: var(--agent-review-muted);
}

.detail-id {
  font-size: 14px;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--agent-review-text);
}

.detail-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.stat-card {
  background: var(--agent-review-card-bg);
  border: 1px solid var(--agent-review-border);
  border-radius: 10px;
  padding: 16px;
}

.stat-card .label {
  color: var(--agent-review-muted);
  margin-bottom: 6px;
}

.stat-card .unit {
  font-size: 12px;
}

:global(.review-modal .ant-modal-content) {
  background: var(--agent-review-card-bg);
  border: 1px solid var(--agent-review-border);
  border-radius: 12px;
  padding: 0;
}

:global(.review-modal .ant-modal-header) {
  background: var(--agent-review-card-bg);
  border-bottom: 1px solid var(--agent-review-border);
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
}

:global(.review-modal .ant-modal-title) {
  color: var(--agent-review-text);
  font-size: 16px;
  font-weight: 600;
}

:global(.review-modal .ant-modal-body) {
  padding: 0 20px 8px;
}

:global(.review-modal .ant-modal-close) {
  color: var(--agent-review-text);
}

.review-modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.review-form-item :deep(.ant-form-item-label > label) {
  color: var(--agent-review-text);
  font-size: 14px;
}

.review-radio-group {
  display: flex;
  gap: 16px;
  padding: 5px 0;
}

.review-radio-group :deep(.ant-radio-wrapper) {
  color: var(--agent-review-text);
  font-size: 14px;
}

.review-radio-group :deep(.ant-radio-inner) {
  background: var(--agent-review-bg);
  border-color: var(--agent-review-border);
}

.review-radio-group :deep(.ant-radio-checked .ant-radio-inner) {
  border-color: var(--agent-review-highlight);
  background: var(--agent-review-highlight);
}

.review-modal-select :deep(.ant-select-selector) {
  background: var(--agent-review-bg);
  border: 1px solid var(--agent-review-border);
  border-radius: 12px;
  color: var(--agent-review-text);
  font-size: 16px;
  min-height: 40px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
}

.review-modal-select :deep(.ant-select-selection-placeholder) {
  color: var(--agent-review-muted);
}

.review-modal-select :deep(.ant-select-selection-item) {
  display: flex;
  align-items: center;
  line-height: 24px;
}

.review-modal-textarea :deep(.ant-input) {
  background: var(--agent-review-bg);
  border: 1px solid var(--agent-review-border);
  border-radius: 12px;
  color: var(--agent-review-text);
  resize: none;
}

.review-modal-textarea :deep(.ant-input::placeholder) {
  color: var(--agent-review-muted);
}

.review-modal-footer {
  display: flex;
  gap: 8px;
  padding: 0 20px 20px;
}

.modal-btn {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.modal-btn.cancel {
  background: var(--agent-review-card-bg);
  border: 1px solid var(--agent-review-border);
  color: var(--agent-review-text);
}

.modal-btn.confirm {
  background: var(--agent-review-highlight);
  border: 1px solid var(--agent-review-highlight);
  color: #332d1e;
}

.modal-btn.confirm:hover {
  opacity: 0.9;
}

/* ==================== 新版详情页面样式 ==================== */
/* 头部标题栏 - 完全匹配UI稿 */
.detail-header-new {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* 左侧盒子：金色边框，包含返回按钮+标题+ID+标签 */
.header-left-box {
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 0;
  flex-shrink: 0;
}

/* 返回按钮 */
.back-button {
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-arrow {
  width: 16px;
  height: 16px;
  position: relative;
  display: block;
}

.back-arrow::before {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border-left: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: rotate(45deg);
  top: 50%;
  left: 50%;
  margin-top: -5px;
  margin-left: -3px;
}

/* 标题信息区域 */
.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 16px;
  flex-shrink: 0;
}

.company-title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  color: #ffffff;
  white-space: nowrap;
}

.company-id {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #8c8c8c;
  white-space: nowrap;
}

.agent-level-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 6px;
  border: 1px solid #897c55;
  border-radius: 4px;
  background: #332d1e;
  color: #ffe395;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  white-space: nowrap;
}

/* 右侧盒子：金色边框，包含操作按钮 */
.header-right-box {
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  flex-shrink: 0;
}

.action-btn {
  border: 1px solid #595959 !important;
  border-radius: 10px;
  height: auto !important;
  font-family: 'PingFang SC', sans-serif;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: 7px 13px !important;
  font-weight: 400;
}

.action-btn:hover {
  opacity: 0.8;
}

.review-btn {
  background-color: rgba(255, 227, 149, 1) !important;
  color: #332d1e !important;
  font-weight: 500 !important;
}

/* 卡片样式 */
.detail-card {
  background: #1f1f1f;
  border: 1px solid #434343;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  background: #262626;
  border-bottom: 1px solid #434343;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: #ffffff;
  font-family: 'PingFang SC', sans-serif;
}

.card-body {
  padding: 20px 20px 0;
}

.card-body-5cols {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.card-body-4cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.card-body-3cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 24px;
}

.field-label {
  font-size: 14px;
  line-height: 22px;
  color: #ffffff;
  font-family: 'PingFang SC', sans-serif;
}

.field-value-static {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  line-height: 22px;
  color: #8c8c8c;
  font-family: 'PingFang SC', sans-serif;
  padding-top: 2px;
}

.field-value-verified {
  color: #52c41a;
  font-weight: 500;
}

/* 业绩情况样式 */
.stats-section {
  margin-bottom: 24px;
}

.stats-section-title {
  font-size: 14px;
  line-height: 22px;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 16px;
  font-family: 'PingFang SC', sans-serif;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 200px));
  gap: 12px;
}

.stats-grid-5 {
  grid-template-columns: repeat(auto-fit, minmax(150px, 200px));
}

.stats-grid-6 {
  grid-template-columns: repeat(auto-fit, minmax(150px, 200px));
}

.stat-item {
  background: #262626;
  border: 1px solid #434343;
  border-radius: 8px;
  padding: 16px;
}

.stat-label {
  font-size: 12px;
  line-height: 20px;
  color: #8c8c8c;
  margin-bottom: 8px;
  font-family: 'PingFang SC', sans-serif;
}

.stat-unit {
  font-size: 12px;
}

.stat-value {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: #ffe395;
  font-family: 'PingFang SC', sans-serif;
}
</style>

