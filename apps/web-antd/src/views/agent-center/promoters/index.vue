<script setup lang="ts">
import type { FormInstance } from 'ant-design-vue';
import type { Key } from 'ant-design-vue/es/table/interface';
import type { TableProps } from 'ant-design-vue';
import '../styles/colors.css';

import { computed, h, onMounted, reactive, ref, watch } from 'vue';

import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Pagination,
  Radio,
  Select,
  Table,
  message,
} from 'ant-design-vue';
import Tag from 'ant-design-vue/es/tag';
import Spin from 'ant-design-vue/es/spin';

import {
  createPromoter,
  getPromoterDetail,
  getPromoterPerformanceStats,
  listPromoters,
  updatePromoter,
  type CreatePromoterPayload,
  type PromoterPerformanceStats,
  type PromoterListItem,
  type PromoterListQuery,
  type UpdatePromoterPayload,
} from '#/api/core';

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

const selectedRowKeys = ref<Key[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: Key[]) => (selectedRowKeys.value = keys),
}));

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<PromoterListItem | null>(null);
const detailStats = ref<PromoterPerformanceStats | null>(null);
const detailStatsLoading = ref(false);
const isEditing = ref(false);

// 备注弹窗状态
const remarkModalVisible = ref(false);
const remarkSubmitting = ref(false);
const remarkText = ref('');
const remarkTarget = ref<PromoterListItem | null>(null);

// 分模块的保存loading状态
const savingAccount = ref(false);
const savingSubject = ref(false);
const savingPayment = ref(false);

// 编辑表单数据
const editForm = reactive({
  phone: '',
  level: 1,
  parentPromoterId: undefined as number | undefined,
  accountType: 'personal' as 'personal' | 'company',
  detailInfo: {} as Record<string, any>,
  // 资源介绍（后端 introduction），备注（detail_info.remark）
  resourceDesc: '',
  remark: '',
});

const showAddModal = ref(false);
const addSubmitting = ref(false);
const addFormRef = ref<FormInstance>();
const parentOptions = ref<{ label: string; value: number }[]>([]);
const loadingParents = ref(false);

const addForm = reactive({
  accountType: 'personal',
  loginPhone: '',
  realName: '',
  idNumber: '',
  companyName: '',
  uscc: '',
  contactPhone: '',
  level: 1,
  parentPromoterId: undefined as number | undefined,
  resourceDesc: '',
});

const isCompanyAccount = computed(() => addForm.accountType === 'company');

const levelOptions = [
  { label: '高级代理', value: 1 },
  { label: '代理', value: 2 },
];

const subjectMeta: Record<string, string> = {
  personal: '个人',
  company: '企业',
};

type JoinTypeKey = 'self_apply' | 'invite' | 'admin_import';

const joinTypeMeta: Record<
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

const columns: TableProps['columns'] = [
  { title: '注册手机号', dataIndex: 'phone', key: 'phone', width: 160 },
  {
    title: '真实姓名',
    key: 'real_name',
    width: 180,
    customRender: ({ record }) =>
      getDetailField(record as PromoterListItem, ['legal_name', 'real_name', 'contact_name']) ||
      (record as PromoterListItem).name ||
      '-',
  },
  {
    title: '企业名称',
    key: 'company_name',
    width: 220,
    customRender: ({ record }) =>
      getDetailField(record as PromoterListItem, ['company_name']) || (record as PromoterListItem).detail_info?.company_name || '-',
  },
  {
    title: '备注',
    key: 'remark',
    width: 220,
    ellipsis: true,
    customRender: ({ record }) =>
      getDetailField(record as PromoterListItem, ['remark']) ||
      (record as PromoterListItem).detail_info?.remark ||
      '-',
  },
  {
    title: '代理ID',
    dataIndex: 'promoter_id',
    key: 'promoter_id',
    width: 120,
  },
  {
    title: '代理类型',
    key: 'type',
    width: 160,
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      return `${item.level === 1 ? '高级代理' : '代理'}`;
    },
  },
  {
    title: '上级代理',
    key: 'parent',
    width: 180,
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      if (!item.parent_promoter_id) return '-';
      return item.parent_promoter_name || `ID:${item.parent_promoter_id}`;
    },
  },
  {
    title: '邀请码',
    key: 'invite_code',
    width: 160,
    align: 'center',
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      return item.invite_code || '-';
    },
  },
  {
    title: '主体类型',
    key: 'subject_type',
    width: 140,
    customRender: ({ record }) => renderSubjectPill(record as PromoterListItem),
  },
  {
    title: '身份证号',
    key: 'id_number',
    width: 220,
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      const idNumber = getDetailField(item, ['id_number', 'legal_id_number']);
      if (idNumber) return idNumber;
      return item.type === 'company' ? '—' : '-';
    },
  },
  {
    title: '统一社会信用代码',
    key: 'uscc',
    width: 220,
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      const uscc = getDetailField(item, ['business_license_number', 'uscc']) || 
                   item.detail_info?.business_license_number ||
                   item.detail_info?.uscc;
      if (uscc) return uscc;
      return item.type === 'personal' ? '—' : '-';
    },
  },
  {
    title: '联系手机号',
    dataIndex: 'contact_phone',
    key: 'contact_phone',
    width: 160,
    align: 'center',
    customRender: ({ record }) =>
      record.contact_phone || getDetailField(record as PromoterListItem, ['contact_phone']) || '-',
  },
  {
    title: '微信号',
    key: 'wechat',
    width: 160,
    align: 'center',
    customRender: ({ record }) => getDetailField(record as PromoterListItem, ['wechat', 'contact_wechat']) || '-',
  },
  {
    title: '资源介绍',
    key: 'resource_desc',
    width: 200,
    ellipsis: true,
    customRender: ({ record }) => record.resource_desc || (record as PromoterListItem).introduction || '-',
  },
  {
    title: '加入时间',
    key: 'created_at',
    width: 180,
    align: 'center',
    customRender: ({ record }) => formatDateTime((record as PromoterListItem).created_at),
  },
  {
    title: '加入方式',
    key: 'join_type',
    width: 150,
    align: 'center',
    customRender: ({ record }) => renderJoinTypePill(record as PromoterListItem),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    align: 'center',
    fixed: 'right',
    customRender: ({ record }) => {
      const item = record as PromoterListItem;
      const remarkBtn = h(
        Button,
        {
          type: 'link',
          size: 'small',
          class: 'action-detail-btn',
          onClick: () => openRemarkModal(item),
        },
        { default: () => '备注' },
      );

      const detailBtn = h(
        Button,
        {
          type: 'link',
          size: 'small',
          class: 'action-detail-btn',
          onClick: () => openDetail(item),
        },
        { default: () => '详情页' },
      );

      return h('div', { class: 'action-buttons' }, [detailBtn, remarkBtn]);
    },
  },
];

function renderSubjectPill(record: PromoterListItem) {
  const label = subjectMeta[record.type] ?? record.type;
  return h(
    'button',
    {
      class: ['subject-button', `subject-button--${record.type}`],
      type: 'button',
    },
    label,
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

function renderJoinTypePill(record: PromoterListItem) {
  const meta = resolveJoinType(record.join_type);
  return h(
    'span',
    {
      class: meta.className,
    },
    meta.label,
  );
}

function getJoinTypeLabel(joinType?: string) {
  return resolveJoinType(joinType).label;
}

function getJoinTypeClass(joinType?: string) {
  return resolveJoinType(joinType).className;
}

function resolveJoinType(joinType?: string) {
  const key = (joinType ?? 'self_apply') as JoinTypeKey;
  return joinTypeMeta[key] || joinTypeMeta.self_apply;
}

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

function formatFenToYuan(fen?: number | null) {
  if (typeof fen !== 'number') return '—';
  return (fen / 100).toFixed(2);
}

function formatCount(...values: (number | null | undefined)[]) {
  const total = values.reduce((sum: number, val) => sum + (typeof val === 'number' ? val : 0), 0);
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

async function fetchPromoters() {
  loading.value = true;
  try {
    const query: PromoterListQuery = {
      page: pagination.current,
      page_size: pagination.pageSize,
      status: 'active',
    };
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
    message.error(error?.message || '加载代理列表失败');
  } finally {
    loading.value = false;
  }
}

function handleTableChange(page: number, pageSize?: number) {
  pagination.current = page;
  if (pageSize) pagination.pageSize = pageSize;
  fetchPromoters();
}

function triggerFilter() {
  pagination.current = 1;
  fetchPromoters();
}

async function openDetail(record: PromoterListItem) {
  detailVisible.value = true;
  detailLoading.value = true;
  detailStats.value = null;
  try {
    const data = await getPromoterDetail(record.promoter_id);
    detailData.value = data;
    fetchDetailStats(record.promoter_id);
  } catch (error: any) {
    detailVisible.value = false;
    message.error(error?.message || '加载代理详情失败');
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  detailVisible.value = false;
  detailData.value = null;
  detailStats.value = null;
  detailStatsLoading.value = false;
  isEditing.value = false;
}

// 打开备注弹窗
function openRemarkModal(record: PromoterListItem) {
  remarkTarget.value = record;
  const existing =
    getDetailField(record, ['remark']) ||
    (record.detail_info && (record.detail_info.remark as string)) ||
    '';
  remarkText.value = existing;
  remarkModalVisible.value = true;
}

// 关闭备注弹窗
function closeRemarkModal() {
  remarkModalVisible.value = false;
  remarkText.value = '';
  remarkTarget.value = null;
}

// 保存备注到 detail_info.remark
async function handleRemarkSave() {
  if (!remarkTarget.value || remarkSubmitting.value) return;

  const trimmed = remarkText.value.trim();
  const detailInfo: Record<string, any> = {
    // 为空则删除该字段
    remark: trimmed || null,
  };

  try {
    remarkSubmitting.value = true;
    const updated = await updatePromoter(remarkTarget.value.promoter_id, {
      detail_info: detailInfo,
    } as UpdatePromoterPayload);

    // 更新列表数据
    const index = dataSource.value.findIndex((item) => item.promoter_id === updated.promoter_id);
    if (index !== -1) {
      dataSource.value[index] = updated;
    }

    // 更新详情数据
    if (detailData.value && detailData.value.promoter_id === updated.promoter_id) {
      detailData.value = updated;
    }

    message.success('备注已保存');
    closeRemarkModal();
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || '保存备注失败');
  } finally {
    remarkSubmitting.value = false;
  }
}

// 启动编辑模式
function startEdit() {
  if (!detailData.value) return;
  isEditing.value = true;
  
  // 初始化编辑表单
  editForm.phone = detailData.value.phone;
  editForm.level = detailData.value.level || 1;
  editForm.parentPromoterId = detailData.value.parent_promoter_id ?? undefined;
  editForm.accountType = detailData.value.type === 'company' ? 'company' : 'personal';
  
  // 深拷贝detail_info
  const detailInfo = detailData.value.detail_info || {};
  editForm.detailInfo = {
    // 企业信息
    company_name: getDetailField(detailData.value, ['company_name']) || '',
    business_license_number: getDetailField(detailData.value, ['business_license_number', 'uscc']) || '',
    // 个人信息
    real_name: getDetailField(detailData.value, ['real_name', 'legal_name']) || '',
    id_number: getDetailField(detailData.value, ['id_number']) || '',
    // 企业收款信息
    account_name: getDetailField(detailData.value, ['account_name']) || detailInfo.payee_name || '',
    bank_name: getDetailField(detailData.value, ['bank_name', 'pay_channel']) || '',
    // 个人收款信息
    alipay_account: getDetailField(detailData.value, ['alipay_account', 'alipay']) || '',
    bank_account: getDetailField(detailData.value, ['bank_account', 'payee_account', 'bank_card_number']) || '',
    bank_card_name: getDetailField(detailData.value, ['bank_card_name', 'card_holder_name']) || '',
  };
  // 资源介绍与备注
  editForm.resourceDesc =
    detailData.value.introduction ||
    detailData.value.resource_desc ||
    getDetailField(detailData.value, ['resource_desc', 'resource']) ||
    '';
  editForm.remark = getDetailField(detailData.value, ['remark']) || '';
  
  // 加载上级代理选项
  if (editForm.level === 2) {
    loadParentOptions();
  }
}

// 取消编辑
function cancelEdit() {
  isEditing.value = false;
}

// 监听等级变化，动态加载上级代理选项
watch(() => editForm.level, (newLevel) => {
  if (isEditing.value && newLevel === 2) {
    loadParentOptions();
  } else if (newLevel === 1) {
    // 一级代理没有上级
    editForm.parentPromoterId = undefined;
  }
});

// 监听主体类型变化，只清空对方类型的字段
watch(() => editForm.accountType, (newType, oldType) => {
  if (!isEditing.value) return;
  if (newType === oldType) return;
  
  if (newType === 'company') {
    // 切换到企业，只清空个人特有字段
    editForm.detailInfo.real_name = '';
    editForm.detailInfo.id_number = '';
    editForm.detailInfo.alipay_account = '';
    editForm.detailInfo.bank_card_name = '';
  } else {
    // 切换到个人，只清空企业特有字段
    editForm.detailInfo.company_name = '';
    editForm.detailInfo.business_license_number = '';
    editForm.detailInfo.account_name = '';
    editForm.detailInfo.bank_name = '';
  }
  // 清空共用的银行账号字段
  editForm.detailInfo.bank_account = '';
});

// 保存编辑
async function saveEdit(section: string) {
  if (!detailData.value) return;
  
  // 根据模块设置对应的loading状态
  const loadingRef = 
    section === 'account' ? savingAccount :
    section === 'subject' ? savingSubject :
    savingPayment;
  
  if (loadingRef.value) return; // 防止重复提交
  
  const payload: UpdatePromoterPayload = {};
  
  switch (section) {
    case 'account':
      payload.phone = editForm.phone;
      payload.level = editForm.level;
      payload.parent_promoter_id = editForm.level === 2 ? (editForm.parentPromoterId ?? null) : null;
      // 资源介绍与备注
      if (editForm.resourceDesc.trim()) {
        payload.introduction = editForm.resourceDesc.trim();
      }
      if (editForm.remark.trim() || getDetailField(detailData.value, ['remark'])) {
        payload.detail_info = {
          ...(payload.detail_info || {}),
          remark: editForm.remark.trim() || null,
        };
      }
      break;
    case 'subject':
      // 发送主体类型
      payload.type = editForm.accountType;
      payload.detail_info = {};
      if (editForm.accountType === 'company') {
        payload.detail_info.company_name = editForm.detailInfo.company_name;
        payload.detail_info.business_license_number = editForm.detailInfo.business_license_number || editForm.detailInfo.uscc;
        // 清除个人字段
        payload.detail_info.real_name = null;
        payload.detail_info.id_number = null;
      } else {
        payload.detail_info.real_name = editForm.detailInfo.real_name;
        payload.detail_info.id_number = editForm.detailInfo.id_number;
        // 清除企业字段
        payload.detail_info.company_name = null;
        payload.detail_info.business_license_number = null;
        payload.detail_info.uscc = null;
      }
      break;
    case 'payment':
      payload.detail_info = {};
      if (editForm.accountType === 'company') {
        payload.detail_info.account_name = editForm.detailInfo.account_name;
        payload.detail_info.bank_name = editForm.detailInfo.bank_name;
        payload.detail_info.bank_account = editForm.detailInfo.bank_account;
        // 清除个人收款字段
        payload.detail_info.alipay_account = null;
        payload.detail_info.bank_card_name = null;
      } else {
        payload.detail_info.alipay_account = editForm.detailInfo.alipay_account;
        payload.detail_info.bank_account = editForm.detailInfo.bank_account;
        payload.detail_info.bank_card_name = editForm.detailInfo.bank_card_name;
        // 清除企业收款字段
        payload.detail_info.account_name = null;
        payload.detail_info.bank_name = null;
      }
      break;
  }
  
  try {
    loadingRef.value = true;
    const updated = await updatePromoter(detailData.value.promoter_id, payload);
    detailData.value = updated;
    message.success('保存成功');
    
    // 合并更新后的数据到editForm
    if (payload.detail_info) {
      Object.assign(editForm.detailInfo, payload.detail_info);
    }
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || '保存失败');
  } finally {
    loadingRef.value = false;
  }
}

async function fetchDetailStats(promoterId: number) {
  detailStatsLoading.value = true;
  try {
    const stats = await getPromoterPerformanceStats(promoterId);
    detailStats.value = stats;
  } catch (error: any) {
    console.error(error);
    detailStats.value = null;
    message.warning(error?.message || '加载业绩统计失败');
  } finally {
    detailStatsLoading.value = false;
  }
}

async function loadParentOptions() {
  try {
    loadingParents.value = true;
    const resp = await listPromoters({
      level: 1,
      status: 'pass',
      page: 1,
      page_size: 100,
    });
    
    // 过滤掉当前代理商自己
    const currentPromoterId = detailData.value?.promoter_id;
    parentOptions.value =
      resp.records
        ?.filter((item) => item.promoter_id !== currentPromoterId)
        .map((item) => ({
          label: `${item.name || item.phone}（ID:${item.promoter_id}）`,
          value: item.promoter_id,
        })) ?? [];
  } catch (error) {
    console.warn('加载上级代理失败', error);
  } finally {
    loadingParents.value = false;
  }
}

function resetAddForm() {
  addForm.accountType = 'personal';
  addForm.loginPhone = '';
  addForm.realName = '';
  addForm.idNumber = '';
  addForm.companyName = '';
  addForm.uscc = '';
  addForm.contactPhone = '';
  addForm.level = 1;
  addForm.parentPromoterId = undefined;
  addForm.resourceDesc = '';
}

async function openAddModal() {
  resetAddForm();
  await loadParentOptions();
  showAddModal.value = true;
}

async function handleAddSubmit() {
  if (!addForm.loginPhone.trim()) {
    message.warning('请输入登录手机号');
    return;
  }
  if (addForm.accountType === 'personal' && !addForm.realName.trim()) {
    message.warning('请输入真实姓名');
    return;
  }
  if (addForm.accountType === 'personal' && !addForm.idNumber.trim()) {
    message.warning('请输入身份证号');
    return;
  }
  if (addForm.accountType === 'company' && !addForm.companyName.trim()) {
    message.warning('请输入企业名称');
    return;
  }
  if (addForm.accountType === 'company' && !addForm.uscc.trim()) {
    message.warning('请输入统一社会信用代码');
    return;
  }
  if (addForm.level === 2 && !addForm.parentPromoterId) {
    message.warning('二级代理需要选择上级代理');
    return;
  }

  const payload: CreatePromoterPayload = {
    account_type: addForm.accountType,
    login_phone: addForm.loginPhone.trim(),
    real_name: addForm.realName.trim(),
    id_number: addForm.idNumber.trim(),
    company_name: addForm.companyName.trim(),
    uscc: addForm.uscc.trim(),
    contact_phone: addForm.contactPhone.trim(),
    parent_promoter_id: addForm.parentPromoterId,
    resource_desc: addForm.resourceDesc.trim(),
    level: addForm.level,
  };

  try {
    addSubmitting.value = true;
    await createPromoter(payload);
    message.success('添加代理成功');
    showAddModal.value = false;
    fetchPromoters();
  } catch (error: any) {
    console.error(error);
    message.error(error?.message || '添加代理失败');
  } finally {
    addSubmitting.value = false;
  }
}

onMounted(() => {
  fetchPromoters();
});
</script>

<template>
  <div class="promoters-page">
    <Button type="primary" class="add-agent-btn" @click="openAddModal"> 添加代理 </Button>

    <Card class="filter-card" :bordered="false">
      <Form :model="filterForm" class="filter-form">
        <div class="form-row">
          <Form.Item label="代理等级" class="form-item-with-label">
            <Select
              v-model:value="filterForm.level"
              :options="levelOptions"
              allow-clear
              placeholder="高级代理/代理"
              style="width: 200px"
              @change="triggerFilter"
            />
          </Form.Item>
          <Form.Item label="手机号" class="form-item-with-label form-item-input">
            <input
              v-model="filterForm.phone"
              placeholder="请输入"
              class="custom-input"
              @keyup.enter="triggerFilter"
              @blur="triggerFilter"
            />
          </Form.Item>
          <Form.Item label="企业名称" class="form-item-with-label form-item-input">
            <input
              v-model="filterForm.company_name"
              placeholder="请输入"
              class="custom-input"
              @keyup.enter="triggerFilter"
              @blur="triggerFilter"
            />
          </Form.Item>
          <Form.Item label="真实姓名" class="form-item-with-label form-item-input">
            <input
              v-model="filterForm.real_name"
              placeholder="请输入"
              class="custom-input"
              @keyup.enter="triggerFilter"
              @blur="triggerFilter"
            />
          </Form.Item>
          <Form.Item label="联系电话" class="form-item-with-label form-item-input">
            <input
              v-model="filterForm.contact_phone"
              placeholder="请输入"
              class="custom-input"
              @keyup.enter="triggerFilter"
              @blur="triggerFilter"
            />
          </Form.Item>
          <Form.Item label="关键字" class="form-item-with-label form-item-input keyword-item">
            <input
              v-model="filterForm.keyword"
              placeholder="手机号 / 姓名 / 企业名称"
              class="custom-input keyword-input"
              @keyup.enter="triggerFilter"
              @blur="triggerFilter"
            />
          </Form.Item>
        </div>
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
          :row-selection="rowSelection"
          :scroll="{ x: 1400 }"
          size="middle"
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
            <!-- 右侧：操作按钮（独立金色边框盒子） -->
            <div class="header-right-box">
              <Button class="action-btn dismiss-btn">清退</Button>
              <Button 
                class="action-btn edit-btn" 
                :class="{ 'edit-btn-active': isEditing }"
                @click="isEditing ? cancelEdit() : startEdit()"
              >
                {{ isEditing ? '取消' : '编辑' }}
              </Button>
            </div>
          </div>

          <!-- 账号信息卡片 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="card-title">账号信息</div>
              <Button 
                v-if="isEditing" 
                class="btn-save btn-save-active" 
                size="small" 
                type="text"
                :loading="savingAccount"
                @click="saveEdit('account')"
              >
                保存修改
              </Button>
              <Button v-else class="btn-save" size="small" type="text" disabled>保存修改</Button>
            </div>
            <div class="card-body card-body-5cols">
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>注册手机号
                </div>
                <Input 
                  v-if="isEditing" 
                  v-model:value="editForm.phone"
                  class="field-input-editable"
                  placeholder="请输入手机号"
                />
                <div v-else class="field-value field-input">{{ detailData.phone || '-' }}</div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>代理等级
                </div>
                <Select 
                  v-if="isEditing"
                  v-model:value="editForm.level"
                  :options="levelOptions"
                  class="field-select-editable"
                />
                <div v-else class="field-value field-select">{{ detailData.level === 1 ? '高级代理' : '代理' }}</div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>上级代理
                </div>
                <Select 
                  v-if="isEditing && editForm.level === 2"
                  v-model:value="editForm.parentPromoterId"
                  :options="parentOptions"
                  :loading="loadingParents"
                  show-search
                  option-filter-prop="label"
                  allow-clear
                  placeholder="请选择上级代理"
                  class="field-select-editable"
                />
                <div v-else class="field-value field-select">
                  {{
                    detailData.parent_promoter_name ||
                    (detailData.parent_promoter_id ? `ID:${detailData.parent_promoter_id}` : '无')
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">资源介绍</div>
                <Input
                  v-if="isEditing"
                  v-model:value="editForm.resourceDesc"
                  class="field-input-editable"
                  placeholder="请输入资源介绍"
                />
                <div v-else class="field-value field-input">
                  {{
                    detailData.resource_desc ||
                    detailData.introduction ||
                    getDetailField(detailData, ['resource_desc', 'resource']) ||
                    '-'
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">备注</div>
                <Input.TextArea
                  v-if="isEditing"
                  v-model:value="editForm.remark"
                  class="field-input-editable"
                  :rows="2"
                  placeholder="请输入备注"
                />
                <div v-else class="field-value field-input">
                  {{ getDetailField(detailData, ['remark']) || '-' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">加入时间</div>
                <div class="field-value-static">{{ formatDateTime(detailData.created_at) }}</div>
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
              <Button 
                v-if="isEditing" 
                class="btn-save btn-save-active" 
                size="small" 
                type="text"
                :loading="savingSubject"
                @click="saveEdit('subject')"
              >
                保存修改
              </Button>
              <Button v-else class="btn-save" size="small" type="text" disabled>保存修改</Button>
            </div>
            <!-- 企业类型：3列 -->
            <div v-if="(isEditing && editForm.accountType === 'company') || (!isEditing && detailData.type === 'company')" class="card-body card-body-3cols">
              <div class="form-field">
                <div class="field-label">主体类型</div>
                <Select 
                  v-if="isEditing"
                  v-model:value="editForm.accountType"
                  :options="[
                    { label: '公司', value: 'company' },
                    { label: '个人', value: 'personal' }
                  ]"
                  class="field-select-editable"
                />
                <div v-else class="field-value field-select">公司</div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>公司主体名称
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.company_name"
                  class="field-input-editable"
                  placeholder="请输入公司名称"
                />
                <div v-else class="field-value field-input">
                  {{
                    getDetailField(detailData, ['company_name']) ||
                    detailData.name ||
                    '-'
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>统一社会信用代码
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.business_license_number"
                  class="field-input-editable"
                  placeholder="请输入统一社会信用代码"
                />
                <div v-else class="field-value field-input">
                  {{
                    getDetailField(detailData, ['business_license_number', 'uscc']) ||
                    '-'
                  }}
                </div>
              </div>
            </div>
            <!-- 个人类型：4列 -->
            <div v-else-if="(isEditing && editForm.accountType === 'personal') || (!isEditing && detailData.type === 'personal')" class="card-body card-body-4cols">
              <div class="form-field">
                <div class="field-label">主体类型</div>
                <Select 
                  v-if="isEditing"
                  v-model:value="editForm.accountType"
                  :options="[
                    { label: '公司', value: 'company' },
                    { label: '个人', value: 'personal' }
                  ]"
                  class="field-select-editable"
                />
                <div v-else class="field-value field-select">个人</div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>姓名
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.real_name"
                  class="field-input-editable"
                  placeholder="请输入姓名"
                />
                <div v-else class="field-value field-input">
                  {{
                    getDetailField(detailData, ['real_name', 'legal_name']) ||
                    detailData.name ||
                    '-'
                  }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>身份证号
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.id_number"
                  class="field-input-editable"
                  placeholder="请输入身份证号"
                />
                <div v-else class="field-value field-input">
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
              <Button 
                v-if="isEditing" 
                class="btn-save btn-save-active" 
                size="small" 
                type="text"
                :loading="savingPayment"
                @click="saveEdit('payment')"
              >
                保存修改
              </Button>
              <Button v-else class="btn-save" size="small" type="text" disabled>保存修改</Button>
            </div>
            <!-- 企业类型：账户名称 + 开户行 + 账号 -->
            <div v-if="(isEditing && editForm.accountType === 'company') || (!isEditing && detailData.type === 'company')" class="card-body card-body-3cols">
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>账户名称
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.account_name"
                  class="field-input-editable"
                  placeholder="请输入账户名称"
                />
                <div v-else class="field-value field-input">
                  {{ getDetailField(detailData, ['account_name']) || detailData.detail_info?.payee_name || '-' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>开户行
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.bank_name"
                  class="field-input-editable"
                  placeholder="请输入开户行"
                />
                <div v-else class="field-value field-input">
                  {{ getDetailField(detailData, ['bank_name', 'pay_channel']) || '—' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>账号
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.bank_account"
                  class="field-input-editable"
                  placeholder="请输入账号"
                />
                <div v-else class="field-value field-input">
                  {{ getDetailField(detailData, ['bank_account', 'payee_account']) || '—' }}
                </div>
              </div>
            </div>
            <!-- 个人类型：支付宝账号 + 银行卡账号 + 银行卡姓名 -->
            <div v-else-if="(isEditing && editForm.accountType === 'personal') || (!isEditing && detailData.type === 'personal')" class="card-body card-body-3cols">
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>支付宝账号
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.alipay_account"
                  class="field-input-editable"
                  placeholder="请输入支付宝账号"
                />
                <div v-else class="field-value field-input">
                  {{ getDetailField(detailData, ['alipay_account', 'alipay']) || '—' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>银行卡账号
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.bank_account"
                  class="field-input-editable"
                  placeholder="请输入银行卡账号"
                />
                <div v-else class="field-value field-input">
                  {{ getDetailField(detailData, ['bank_account', 'bank_card_number']) || '—' }}
                </div>
              </div>
              <div class="form-field">
                <div class="field-label">
                  <span class="required">*</span>银行卡姓名
                </div>
                <Input 
                  v-if="isEditing"
                  v-model:value="editForm.detailInfo.bank_card_name"
                  class="field-input-editable"
                  placeholder="请输入银行卡姓名"
                />
                <div v-else class="field-value field-input">
                  {{ getDetailField(detailData, ['bank_card_name', 'card_holder_name']) || '—' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 业绩情况卡片 -->
          <div class="detail-card">
            <div class="card-header">
              <div class="card-title">业绩情况</div>
            </div>
            <div class="card-body">
              <!-- 总收入（直接推广+下级推广）-->
              <div class="stats-section">
                <div class="stats-section-title">总收入（直接推广+下级推广）</div>
                <div class="stats-grid stats-grid-6">
                  <div class="stat-item">
                    <div class="stat-label">总·销售额·原价<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.total_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总·应得收入·分成<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.total_commission_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总·退款扣除额·分成<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.total_refunded_commission_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总·实得收入·净额<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan((detailStats?.total_commission_fen || 0) - (detailStats?.total_refunded_commission_fen || 0)) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总·邀请用户数</div>
                    <div class="stat-value">{{ formatCount(detailStats?.invite_user_count, detailStats?.downstream_invite_user_count) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">总·销售订单数</div>
                    <div class="stat-value">{{ detailStats?.paid_order_count || '—' }}</div>
                  </div>
                </div>
                <div class="stats-grid stats-grid-6" style="margin-top: 12px;">
                  <div class="stat-item">
                    <div class="stat-label">已提现佣金<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.withdrawn_fen) }}</div>
              </div>
                </div>
              </div>

              <!-- 推广收益（直接推广）- 仅高级代理显示 -->
              <div v-if="detailData?.level === 1" class="stats-section">
                <div class="stats-section-title">推广收益（直接推广）</div>
                <div class="stats-grid stats-grid-6">
                  <div class="stat-item">
                    <div class="stat-label">邀请·销售额·原价<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.invite_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请·应得收入·分成</div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.invite_income_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请·退款扣除额·分成</div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.invite_refunded_commission_fen) }}</div>
                </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请·实得收入·净额</div>
                    <div class="stat-value">{{ formatFenToYuan((detailStats?.invite_income_fen || 0) - (detailStats?.invite_refunded_commission_fen || 0)) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请·用户数</div>
                    <div class="stat-value">{{ detailStats?.invite_user_count || '—' }}</div>
              </div>
                  <div class="stat-item">
                    <div class="stat-label">邀请·销售订单数</div>
                    <div class="stat-value">{{ detailStats?.invite_order_count || '—' }}</div>
                  </div>
                </div>
              </div>

              <!-- 下级收益（下级推广）- 仅高级代理显示 -->
              <div v-if="detailData?.level === 1" class="stats-section">
                <div class="stats-section-title">下级收益（下级推广）</div>
                <div class="stats-grid stats-grid-6">
                  <div class="stat-item">
                    <div class="stat-label">下级·销售额·原价<span class="stat-unit">（元）</span></div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.downstream_sales_amount_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级·应得收入·分成</div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.downstream_income_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级·退款扣除额·分成</div>
                    <div class="stat-value">{{ formatFenToYuan(detailStats?.downstream_refunded_commission_fen) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级·实得收入·净额</div>
                    <div class="stat-value">{{ formatFenToYuan((detailStats?.downstream_income_fen || 0) - (detailStats?.downstream_refunded_commission_fen || 0)) }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级·邀请用户数</div>
                    <div class="stat-value">{{ detailStats?.downstream_invite_user_count || '—' }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">下级·销售订单数</div>
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
      v-model:open="showAddModal"
      title="添加代理"
      :confirm-loading="addSubmitting"
      width="700px"
      @ok="handleAddSubmit"
      @cancel="() => (showAddModal = false)"
      ok-text="确认"
      cancel-text="取消"
      :footer="null"
      wrap-class-name="add-promoter-modal"
    >
      <Form ref="addFormRef" layout="vertical" :model="addForm" class="add-form">
        <div class="add-form-grid">
          <div class="add-form-column">
            <Form.Item class="form-item-vertical">
              <template #label>
                <span class="required-label">账号类型</span>
              </template>
              <Radio.Group v-model:value="addForm.accountType" class="radio-group-custom">
                <Radio value="personal">个人</Radio>
                <Radio value="company">企业</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item class="form-item-vertical">
              <template #label>
                <span class="required-label">登录手机号</span>
              </template>
              <Input v-model:value="addForm.loginPhone" placeholder="请输入" class="input-custom" />
            </Form.Item>
            <Form.Item v-if="!isCompanyAccount" class="form-item-vertical">
              <template #label>
                <span class="required-label">真实姓名</span>
              </template>
              <Input v-model:value="addForm.realName" placeholder="请输入" class="input-custom" />
            </Form.Item>
            <Form.Item v-else class="form-item-vertical">
              <template #label>
                <span class="required-label">企业名称</span>
              </template>
              <Input v-model:value="addForm.companyName" placeholder="请输入营业执照中公司全称" class="input-custom" />
            </Form.Item>
            <Form.Item v-if="!isCompanyAccount" class="form-item-vertical">
              <template #label>
                <span>身份证号</span>
              </template>
              <Input v-model:value="addForm.idNumber" placeholder="请输入" class="input-custom" />
            </Form.Item>
            <Form.Item v-else class="form-item-vertical">
              <template #label>
                <span>统一社会信用代码</span>
              </template>
              <Input v-model:value="addForm.uscc" placeholder="请输入营业执照上的编号" class="input-custom" />
            </Form.Item>
          </div>
          <div class="add-form-column add-form-divider">
            <Form.Item class="form-item-vertical">
              <template #label>
                <span class="required-label">代理等级</span>
              </template>
              <Select v-model:value="addForm.level" :options="levelOptions" placeholder="请选择（高级代理/代理）" class="select-custom" />
            </Form.Item>
            <Form.Item v-if="addForm.level === 2" class="form-item-vertical">
              <template #label>
                <span class="required-label">上级代理</span>
              </template>
              <Select
                v-model:value="addForm.parentPromoterId"
                :options="parentOptions"
                :loading="loadingParents"
                allow-clear
                placeholder="请选择"
                class="select-custom"
              />
            </Form.Item>
            <Form.Item class="form-item-vertical">
              <template #label>
                <span>资源介绍</span>
              </template>
              <Select v-model:value="addForm.resourceDesc" placeholder="请选择" class="select-custom" allow-clear />
            </Form.Item>
          </div>
        </div>
      </Form>
      <div class="modal-footer-custom">
        <Button class="btn-cancel" @click="showAddModal = false">取消</Button>
        <Button class="btn-confirm" :loading="addSubmitting" @click="handleAddSubmit">确认</Button>
      </div>
    </Modal>

    <Modal
      v-model:open="remarkModalVisible"
      title="备注"
      :confirm-loading="remarkSubmitting"
      width="420px"
      :footer="null"
      wrap-class-name="remark-modal"
      @cancel="closeRemarkModal"
    >
      <div class="remark-modal-body">
        <Input.TextArea
          v-model:value="remarkText"
          class="remark-textarea"
          :rows="5"
          placeholder="请输入"
        />
      </div>
      <div class="remark-modal-footer">
        <Button class="btn-cancel" @click="closeRemarkModal">取消</Button>
        <Button class="btn-confirm" :loading="remarkSubmitting" @click="handleRemarkSave">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
:global(:root) {
  --promoter-card-bg: var(--agent-gray-1);
  --promoter-border: #e8e2d3;
  --promoter-text: #1b1b1b;
  --promoter-muted: #5c5c5c;
  --promoter-highlight: #c58b21;
  --promoter-subject-personal-color: #897c55;
  --promoter-subject-company-color: #237804;
  --promoter-join-type-self-color: #000000;
  --promoter-join-type-self-bg-color: rgba(0, 0, 0, 0.1);
  --promoter-join-type-self-border-color: rgba(0, 0, 0, 0.15);
}

:global(.dark) {
  --promoter-card-bg: var(--agent-gray-1);
  --promoter-border: #262626;
  --promoter-text: #f5f5f5;
  --promoter-muted: #a3a3a3;
  --promoter-highlight: #ffe395;
  --promoter-subject-personal-color: #fff2cc;
  --promoter-subject-company-color: #95de64;
  --promoter-join-type-self-color: #fff2cc;
  --promoter-join-type-self-bg-color: rgba(255, 255, 255, 0.1);
  --promoter-join-type-self-border-color: rgba(255, 255, 255, 0.15);
}

.promoters-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--promoter-text);
  padding: 16px;
  position: relative;
  min-height: 100vh;
}

.add-agent-btn {
  background: var(--promoter-highlight);
  border: 1px solid var(--promoter-highlight);
  color: #201e1a;
  font-weight: 500;
  font-size: 14px;
  border-radius: 10px;
  padding: 7px 12px;
  height: auto;
  line-height: 22px;
  width: auto;
  align-self: flex-start;
}

.add-agent-btn:hover {
  background: var(--promoter-highlight);
  border-color: var(--promoter-highlight);
  color: #201e1a;
  opacity: 0.9;
}

.filter-card {
  background: var(--promoter-card-bg);
  border: 1px solid var(--promoter-border);
}

.filter-card :deep(.ant-card-body) {
  padding: 16px;
}

.filter-form {
  padding-left: 130px;
}

.filter-form :deep(.ant-select-selector),
.filter-form :deep(.ant-input) {
  background: var(--promoter-card-bg) !important;
  border: 1px solid var(--promoter-border) !important;
  border-radius: 10px !important;
  color: var(--promoter-text) !important;
  font-size: 14px !important;
  line-height: 22px !important;
  padding: 5px 12px !important;
  height: auto !important;
  min-height: 32px !important;
}

.filter-form :deep(.ant-select-selector) {
  padding: 5px 12px !important;
}

.filter-form :deep(.ant-select-selection-item),
.filter-form :deep(.ant-select-selection-placeholder) {
  color: var(--promoter-muted) !important;
  line-height: 22px !important;
}

.filter-form :deep(.ant-input::placeholder) {
  color: var(--promoter-muted) !important;
}

.filter-form :deep(.ant-select-selector:hover),
.filter-form :deep(.ant-input:hover) {
  border-color: var(--promoter-border) !important;
}

.filter-form :deep(.ant-select-selector:focus),
.filter-form :deep(.ant-input:focus),
.filter-form :deep(.ant-select-focused .ant-select-selector) {
  border-color: var(--promoter-highlight) !important;
  box-shadow: none !important;
}

.filter-form :deep(.ant-select-arrow) {
  color: var(--promoter-muted);
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 100px;
  align-items: center;
}

.keyword-item .custom-input {
  width: 260px;
}

.form-item-with-label {
  margin-bottom: 0;
}

.form-item-with-label :deep(.ant-form-item-label) {
  padding-right: 8px;
}

.form-item-with-label :deep(.ant-form-item-label > label) {
  color: var(--promoter-text);
  font-size: 14px;
  line-height: 22px;
}

.form-item-with-label :deep(.ant-form-item-label > label::after) {
  content: ':';
  margin: 0 4px 0 2px;
}

.form-item-input :deep(.ant-form-item-control-input) {
  min-height: auto;
}

.form-item-input :deep(.ant-form-item-control-input-content) {
  display: flex;
  align-items: center;
}

.custom-input {
  width: 200px;
  background: var(--promoter-card-bg);
  border: 1px solid var(--promoter-border);
  border-radius: 10px;
  color: var(--promoter-text);
  font-size: 14px;
  line-height: 22px;
  padding: 5px 12px;
  outline: none;
  transition: border-color 0.3s;
}

.custom-input::placeholder {
  color: var(--promoter-muted);
}

.custom-input:hover {
  border-color: var(--promoter-border);
}

.custom-input:focus {
  border-color: var(--promoter-highlight);
}

.table-card {
  background: var(--promoter-card-bg);
  border: 1px solid var(--promoter-border);
  border-radius: 6px;
  overflow: hidden;
}

.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

:deep(.table-footer .ant-pagination) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.table-footer .ant-pagination-item) {
  background: transparent;
  border: 1px solid var(--promoter-border);
  border-radius: 6px;
}

:deep(.table-footer .ant-pagination-item a) {
  color: var(--promoter-text);
}

:deep(.table-footer .ant-pagination-item-active) {
  background: var(--promoter-highlight);
  border-color: var(--promoter-highlight);
}

:deep(.table-footer .ant-pagination-item-active a) {
  color: #201e1a;
}

:deep(.table-footer .ant-pagination-prev .ant-pagination-item-link),
:deep(.table-footer .ant-pagination-next .ant-pagination-item-link) {
  background: transparent;
  border: 1px solid var(--promoter-border);
  color: var(--promoter-text);
  border-radius: 6px;
}

:deep(.table-footer .ant-pagination-options-size-changer) {
  border-radius: 6px;
}

:deep(.table-footer .ant-select-selector) {
  background: transparent !important;
  border: 1px solid var(--promoter-border) !important;
  border-radius: 6px !important;
  color: var(--promoter-text) !important;
}

:deep(.review-table .ant-table) {
  background: transparent;
  color: var(--promoter-text);
}

:deep(.review-table .ant-table-thead > tr > th) {
  background: var(--promoter-card-bg);
  color: var(--promoter-muted);
  font-weight: 500;
}

:deep(.review-table .ant-table-tbody > tr > td) {
  border-color: rgba(255, 255, 255, 0.05);
  color: var(--promoter-text);
}

:deep(.review-table .ant-table-tbody > tr:hover > td) {
  background: rgba(255, 255, 255, 0.02);
}

/* 固定列使用实色背景,避免与滚动内容重叠 */
:deep(.review-table .ant-table-cell-fix-left),
:deep(.review-table .ant-table-cell-fix-right) {
  background: var(--promoter-card-bg) !important;
}

/* 固定列的表头也使用实色背景 */
:deep(.review-table .ant-table-thead > tr > th.ant-table-cell-fix-left),
:deep(.review-table .ant-table-thead > tr > th.ant-table-cell-fix-right) {
  background: var(--promoter-card-bg) !important;
}

/* 固定列在hover时也保持实色背景 */
:deep(.review-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-left),
:deep(.review-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right) {
  background: var(--promoter-card-bg) !important;
}

:deep(.review-table .subject-button) {
  display: flex;
  width: 38px;
  padding: 3px 6px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 22px;
  cursor: pointer;
  transition: all 0.3s;
}

/* 个人 - 金色系,亮暗同色背景 */
:deep(.review-table .subject-button--personal) {
  border: 1px solid #897c55;
  background: rgba(137, 124, 85, 0.1);
  color: var(--promoter-subject-personal-color);
}

/* 企业 - 绿色系,亮暗同色背景 */
:deep(.review-table .subject-button--company) {
  border: 1px solid #237804;
  background: rgba(35, 120, 4, 0.1);
  color: var(--promoter-subject-company-color);
}

:deep(.review-table .subject-button:hover) {
  opacity: 0.85;
}

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
  background: var(--promoter-join-type-self-bg-color);
  border-color: var(--promoter-join-type-self-border-color);
  color: var(--promoter-join-type-self-color);
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

:deep(.review-table .action-detail-btn) {
  color: var(--promoter-highlight) !important;
  font-size: 14px;
  line-height: 22px;
}

:deep(.review-table .action-detail-btn:hover) {
  color: var(--promoter-highlight) !important;
  opacity: 0.8;
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
}

.action-btn:hover {
  opacity: 0.8;
}

.dismiss-btn {
  padding: 7px 13px !important;
  font-weight: 400;
}

.edit-btn {
  padding: 6px 12px !important;
  font-weight: 500;
  background-color: rgba(255, 227, 149, 1);
  color: #332d1e !important;
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

.btn-save {
  background: #434343 !important;
  border: 1px solid #434343 !important;
  border-radius: 7px;
  padding: 3px 8px !important;
  color: #8c8c8c !important;
  font-size: 14px;
  line-height: 22px;
  height: auto !important;
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

.required {
  color: #ff6e6b;
  margin-right: 4px;
  font-family: 'SimSong', serif;
}

.field-value {
  background: #141414;
  border: 1px solid #595959;
  border-radius: 12px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 16px;
  line-height: 24px;
  font-family: 'PingFang SC', sans-serif;
  min-height: 44px;
}

.field-select {
  display: flex;
  align-items: center;
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

/* 编辑状态的输入框样式 - 复用field-value的样式 */
.field-input-editable,
.field-select-editable {
  width: 100%;
  background: #141414 !important;
  border: 1px solid #595959 !important;
  border-radius: 12px !important;
  padding: 10px 12px !important;
  color: #ffffff !important;
  font-size: 16px !important;
  line-height: 24px !important;
  font-family: 'PingFang SC', sans-serif !important;
  min-height: 44px !important;
  height: auto !important;
}

.field-input-editable:hover,
.field-select-editable:hover {
  border-color: #d9a34e !important;
}

.field-input-editable:focus,
.field-select-editable:focus,
.field-input-editable:focus-within,
.field-select-editable:focus-within {
  border-color: #d9a34e !important;
  box-shadow: 0 0 0 2px rgba(217, 163, 78, 0.1) !important;
}

/* Select下拉框的内部样式调整 */
.field-select-editable :deep(.ant-select-selector) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  height: auto !important;
  min-height: 22px !important;
}

.field-select-editable :deep(.ant-select-selection-item) {
  color: #ffffff !important;
  line-height: 24px !important;
}

.field-select-editable :deep(.ant-select-arrow) {
  color: #8c8c8c !important;
}

/* 激活状态的保存按钮 */
.btn-save-active {
  color: rgba(255, 227, 149, 1) !important;
  cursor: pointer;
}

.btn-save-active:hover {
  color: rgba(255, 227, 149, 1) !important;
}

/* 编辑按钮激活状态（点击后变成取消按钮） */
.edit-btn-active {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(217, 163, 78, 0.5) !important;
  color: #f0b860 !important;
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

.add-form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}

.add-form-column {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.add-form-divider {
  border-left: 1px solid #595959;
}

.form-item-vertical {
  margin-bottom: 24px;
}

.form-item-vertical :deep(.ant-form-item-label) {
  padding-bottom: 8px;
}

.form-item-vertical :deep(.ant-form-item-label > label) {
  color: var(--promoter-text);
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
}

.form-item-vertical :deep(.ant-form-item-label > label::before) {
  display: none !important;
}

.required-label::before {
  content: '*';
  color: #ff5962;
  margin-right: 4px;
  font-family: 'SimSong', serif;
  font-size: 14px;
}

.input-custom,
.select-custom :deep(.ant-select-selector) {
  background: #141414 !important;
  border: 1px solid #595959 !important;
  border-radius: 12px !important;
  color: var(--promoter-text) !important;
  font-size: 16px !important;
  line-height: 24px !important;
  padding: 10px 12px !important;
  height: auto !important;
}

.select-custom :deep(.ant-select-selector) {
  padding: 8px 12px !important;
}

.input-custom::placeholder,
.select-custom :deep(.ant-select-selection-placeholder) {
  color: #8c8c8c !important;
}

.radio-group-custom {
  display: flex;
  gap: 16px;
  padding: 5px 0;
}

.radio-group-custom :deep(.ant-radio-wrapper) {
  color: var(--promoter-text);
  font-size: 16px;
  line-height: 24px;
}

.radio-group-custom :deep(.ant-radio-inner) {
  background: #141414;
  border-color: #595959;
  width: 16px;
  height: 16px;
}

.radio-group-custom :deep(.ant-radio-checked .ant-radio-inner) {
  border-color: var(--promoter-highlight);
  background: var(--promoter-highlight);
}

.radio-group-custom :deep(.ant-radio-checked .ant-radio-inner::after) {
  background-color: #201e1a;
}

.modal-footer-custom {
  display: flex;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #434343;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 40px;
  border-radius: 10px;
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
}

.btn-cancel {
  background: #1f1f1f;
  border: 1px solid #595959;
  color: var(--promoter-text);
}

.btn-cancel:hover {
  background: #2a2a2a;
  border-color: #595959;
  color: var(--promoter-text);
}

.btn-confirm {
  background: var(--promoter-highlight);
  border: 1px solid var(--promoter-highlight);
  color: #332d1e;
}

.btn-confirm:hover {
  background: var(--promoter-highlight);
  border-color: var(--promoter-highlight);
  color: #332d1e;
  opacity: 0.9;
}

/* 备注弹窗样式，与添加代理弹窗保持风格一致 */
::global(.remark-modal .ant-modal-content) {
  background: #262626;
  border: 1px solid #434343;
  border-radius: 12px;
  padding: 0;
}

::global(.remark-modal .ant-modal-header) {
  background: #262626;
  border-bottom: 1px solid #434343;
  padding: 12px 20px;
  border-radius: 12px 12px 0 0;
}

::global(.remark-modal .ant-modal-title) {
  color: var(--promoter-text);
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
}

::global(.remark-modal .ant-modal-close) {
  color: var(--promoter-text);
}

::global(.remark-modal .ant-modal-body) {
  padding: 20px 20px 0;
}

.remark-modal-body {
  padding-bottom: 16px;
}

.remark-textarea {
  background: #141414 !important;
  border: 1px solid #595959 !important;
  border-radius: 10px !important;
  color: var(--promoter-text) !important;
  font-size: 14px !important;
  line-height: 22px !important;
  padding: 12px !important;
}

.remark-textarea::placeholder {
  color: #8c8c8c !important;
}

.remark-modal-footer {
  display: flex;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #434343;
}

:global(.add-promoter-modal .ant-modal-content) {
  background: #262626;
  border: 1px solid #434343;
  border-radius: 12px;
  padding: 0;
}

:global(.add-promoter-modal .ant-modal-header) {
  background: #262626;
  border-bottom: 1px solid #434343;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
}

:global(.add-promoter-modal .ant-modal-title) {
  color: var(--promoter-text);
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
}

:global(.add-promoter-modal .ant-modal-close) {
  color: var(--promoter-text);
}

:global(.add-promoter-modal .ant-modal-body) {
  padding: 0;
}

/* 全局下拉面板样式 */
:global(.ant-select-dropdown) {
  background: #262626 !important;
  border: 1px solid #434343 !important;
  border-radius: 8px !important;
}

:global(.ant-select-item) {
  color: var(--promoter-text, rgba(255, 255, 255, 0.85)) !important;
}

:global(.ant-select-item-option-selected) {
  background: rgba(255, 227, 149, 0.15) !important;
  color: #ffe395 !important;
}

:global(.ant-select-item-option-active) {
  background: rgba(255, 255, 255, 0.08) !important;
}

/* 分页器下拉面板 */
:global(.ant-pagination-options-size-changer.ant-select .ant-select-dropdown) {
  background: #262626 !important;
}
</style>
