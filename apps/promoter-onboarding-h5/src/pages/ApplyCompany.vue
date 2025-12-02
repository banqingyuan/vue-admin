<template>
  <main class="page">
    <h1>审核｜公司</h1>
    <form class="form" @submit.prevent="onSubmit">
      <section>
        <h3>入驻类型</h3>
        <label><input type="radio" value="personal" v-model="type" />个人</label>
        <label><input type="radio" value="company" v-model="type" />企业</label>
      </section>
      <section>
        <h3>申请信息</h3>
        <label>企业名称<input v-model.trim="companyName" placeholder="请输入营业执照中公司全称" /></label>
        <label>法人名称<input v-model.trim="legalPersonName" placeholder="请输入法人姓名" /></label>
        <label>统一社会信用代码<input v-model.trim="uscc" placeholder="请输入营业执照上的编号" /></label>
        <label class="textarea">
          公司介绍
          <textarea v-model.trim="introduction" maxlength="200" placeholder="请简述公司的业务能力、销售能力、运营能力、资源储备能力等情况。"></textarea>
        </label>
      </section>
      <section>
        <h3>联系方式</h3>
        <label>联系人姓名<input v-model.trim="name" placeholder="请输入联系人姓名" /></label>
        <label>微信号<input v-model.trim="wechat" placeholder="请输入微信号" /></label>
      </section>
      <label class="agree">
        <input type="checkbox" v-model="agreed" /> 我已阅读且同意《AI扑克记牌器代理合作协议》
      </label>
      <div class="actions">
        <router-link to="/login">联系客服</router-link>
        <button type="submit" :disabled="!canSubmit">提交申请</button>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { submitInfoApi, getStatusApi } from '#/api/promoter';
import AgreementModal from '#/components/AgreementModal.vue';

const router = useRouter();
const type = ref<'personal'|'company'>('company');
const companyName = ref('');
const legalPersonName = ref('');
const uscc = ref('');
const introduction = ref('');
const name = ref('');
const wechat = ref('');
const agreed = ref(false);
const showAgreementModal = ref(false);
const pendingSubmit = ref(false); // 标记是否因未勾选协议而打开弹窗

const canSubmit = computed(() => companyName.value && legalPersonName.value && uscc.value && name.value && wechat.value && agreed.value);

// 确认协议
function handleAgreementConfirm() {
  showAgreementModal.value = false;
  agreed.value = true;
  
  // 如果是因为未勾选协议而打开的弹窗，点击确认后自动提交
  if (pendingSubmit.value) {
    pendingSubmit.value = false;
    // 延迟一下，让协议弹窗先关闭
    setTimeout(() => {
      submitForm();
    }, 100);
  }
}

async function submitForm() {
  await submitInfoApi({
    type: 'company',
    name: name.value,
    introduction: introduction.value,
    detail_info: {
      company_name: companyName.value,
      legal_person: legalPersonName.value,
      uscc: uscc.value,
      contact_wechat: wechat.value,
    },
  });
  const statusInfo = await getStatusApi();
  if (statusInfo.status === 'reject') router.replace('/result/fail');
  else router.replace('/result/success');
}

async function onSubmit() {
  // 先检查是否填写完整
  if (!companyName.value || !legalPersonName.value || !uscc.value || !name.value || !wechat.value) {
    return;
  }
  
  // 如果未勾选协议，自动打开协议弹窗
  if (!agreed.value) {
    pendingSubmit.value = true;
    showAgreementModal.value = true;
    return;
  }
  
  // 已勾选协议，直接提交
  await submitForm();
}
</script>

<style scoped>
.page { padding: 16px; color: #fff; background: #141414; min-height: 100vh; }
.form { display: flex; flex-direction: column; gap: 16px; }
section { border: 1px solid #595959; border-radius: 12px; padding: 12px; }
h3 { margin: 0 0 8px; color: #FFE395; }
label { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
input, textarea { flex: 1; padding: 10px 12px; border-radius: 12px; border: 1px solid #595959; background: #141414; color: #fff; }
.textarea textarea { min-height: 120px; }
.agree { gap: 8px; }
.actions { display: flex; gap: 10px; }
button { padding: 10px 12px; border-radius: 12px; border: 1px solid #FFE395; background: #FFE395; color: #201e1a; }
a { color: #FFE395; }
</style>

<AgreementModal :visible="showAgreementModal" @close="showAgreementModal=false" @confirm="handleAgreementConfirm" />


