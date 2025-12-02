<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="handleClose" @touchmove.prevent @wheel.prevent>
        <div class="modal-container" @click.stop @touchmove.stop @wheel.stop>
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">《AI扑克记牌器代理合作协议》</h2>
            <button class="close-btn" @click="handleClose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 6L18 18M18 6L6 18" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Subtitle -->
          <div class="modal-subtitle">
            <p>协议更新日期：2025-11-15</p>
            <p>协议生效日期：2025-11-15</p>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <div class="agreement-text">
              <p class="paragraph">
                请您务必审慎阅读、充分理解各条款内容，特别是免除或者限制公司责任的条款、对您权利进行限制的条款、约定争议解决方式和司法管辖的条款（如第11条相关约定）等。<strong>限制、免责条款或者其他涉及您重大权益的条款可能以加粗、加下划线等形式提示您重点注意。</strong>
              </p>

              <p class="paragraph">
                本《AI扑克记牌器代理分销合作协议》（以下简称"本协议"）由以下双方在平等互利的基础上达成并签署，即杭州一目可识科技有限公司（以下简称"公司"）与参与推广的代理商（以下简称"代理商"）。
              </p>

              <h3 class="section-title">1. 定义</h3>

              <p class="paragraph">
                1.1 公司产品：系指公司设计、开发的 "AI扑克记牌器" 软件（以下简称"APP"）。
              </p>

              <p class="paragraph">
                1.2 代理商：系指通过本协议获得公司授权，通过推广邀请码或推广二维码或推广链接或为最终用户提供代充值的方式以为公司提供公司产品或服务的推广营销服务，并引导最终用户购买或使用公司产品或服务的主体。
              </p>

              <p class="paragraph">
                1.3 最终用户：指以其自身使用为目的而并非为向第三方提供公司产品或服务的个人或实体。
              </p>

              <p class="paragraph">
                1.4 保密信息：指一方从对方取得的、获知的、或因双方履行本协议而产生的商业秘密（包括财务秘密）、技术秘密、经营诀窍和（或）其他应予保密的信息和资料（包括产品资料，产品计划，价格，财务及营销规划，业务战略，客户信息，客户数据，研发，软件，硬件，API应用数据接口，技术说明，设计，特殊公式，特殊算法等），无论上述信息和资料以何种形式或载于何种载体，无论披露的该方在披露时是否以口头、图像或书面等方式表明其具有保密性。
              </p>

              <h3 class="section-title">2. 合作概况</h3>

              <p class="paragraph">
                2.1 公司授权代理商为中华人民共和国境内除香港特别行政区、澳门特别行政区以及台湾省以外的地区内非排他的代理商，可以为公司产品或服务提供推广与销售服务，将公司产品或服务引入市场，通过其推广邀请码或推广二维码或推广链接引导最终用户进行购买或使用，或为最终用户提供代充值服务。
              </p>

              <p class="paragraph">
                2.2 代理商与公司根据本协议开展的合作可分为如下两种：
              </p>

              <p class="paragraph indent">
                1）新用户（定义见下文）在公司平台充值后，由公司根据本协议第3条的约定向代理商支付代理佣金分成模式（以下简称"分成模式"）；
              </p>

              <p class="paragraph indent">
                2）最终用户向代理商购买公司产品的充值服务后，代理商通过其代理商账号在代理商软件（定义见下文）中为指定的最终用户充值，或代理商先行向公司采购公司产品或服务并获得相关链接或激活码后提供给最终用户以供最终用户自行激活并充值（以下简称"代充模式"）。
              </p>

              <p class="paragraph">
                2.3 不论代理商选择分成模式或代充模式，公司与代理商均需遵守本协议相关约定。
              </p>

              <h3 class="section-title">3. 合作结算及费用约定</h3>

              <p class="paragraph">
                <strong>3.1 分成模式</strong>
              </p>

              <p class="paragraph indent">
                1）最终用户通过代理商的推广邀请码或推广二维码或推广链接首次注册本公司APP并绑定指定邀请码后，购买公司产品或服务，公司与代理商将按照最终用户购买产品或服务而向公司支付的价款获得分成（以下简称"代理佣金"）。
              </p>

              <p class="paragraph indent">
                2）CPS分成比例：公司与代理商的代理佣金以如下方式结算：根据最终用户通过代理商提供的邀请码或二维码或推广链接注册成为公司产品实际有效新用户（以下简称"新用户"）后向公司实际充值流水（以下简称"分成基数"）的百分比（以下简称"CPS比例"）进行结算，向代理商分成的最高比例原则上不超过60%。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                A. 实际CPS比例，以代理商与公司对接人员另行确定的为准;
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                B. 最终用户需通过代理商提供的推广邀请码或推广二维码或推广链接，注册成为公司产品的新用户，该新用户购买或使用公司产品所实际充值的费用才被视为分成基数。
              </p>

              <p class="paragraph indent">
                有效新用户定义如下：
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                1. 新设备：此设备从未下载/注册/登录过此APP；
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                2. 新手机号：此手机号从未注册过；
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                3. 首次归因：此设备未被其他推广渠道归因；
              </p>

              <p class="paragraph indent">
                3）收益及提现规则：详见：AI扑克记牌器代理后台 提现规则
              </p>

              <p class="paragraph indent">
                4）<strong>退款扣除：分成模式下，若新用户在购买公司产品后发生退款，公司有权在分销商账户中扣除相应的代理佣金，以确保代理商获得的分成与实际成交的销售情况相符。</strong>
              </p>

              <p class="paragraph">
                <strong>3.2 代充模式</strong>
              </p>

              <p class="paragraph indent">
                1）双方确认，代充模式下代理商向公司购买公司产品或服务的价款及享受的产品价款具体折扣以代理商与公司对接人员另行确定的为准。
              </p>

              <p class="paragraph indent">
                2）<strong>双方进一步确认并同意，代充模式下，就代理商已通过其账户为最终用户完成充值，或代理商已向公司采购公司产品或服务并获得二维码或相关链接后，代理商或最终用户均不得向公司申请退款。</strong>
              </p>

              <p class="paragraph">
                3.3 双方应依法承担各自应当缴纳的各种税费费用，涉及代扣代缴的，一方有权代扣代缴并提供相关凭证。
              </p>

              <h3 class="section-title">4. 公司的权利和义务</h3>

              <p class="paragraph">
                4.1 公司有权通过多种形式检查代理商是否依约履行义务，如果发现代理商有违反本协议等相关约定时，<strong>公司有权随时中止、终止代理商的代理商资格或拒绝向代理商发展的新用户提供任何服务</strong>，并根据本协议约定追究代理商的违约责任。
              </p>

              <p class="paragraph">
                4.2 公司有权根据经营需要，不时地制定、修改本协议及/或与合作协议相关的各项政策、规则（包括但不限于佣金比例、提现规则、产品价格等），并通过公司官网、代理商软件系统内弹窗、电子邮件或短信等一种或多种方式向代理商公告。该等变更自公告中载明的生效日期起生效。代理商在本协议及相关政策、规则更新之后继续使用代理商软件或进行任何推广行为的，即视为其已接受该等变更。若代理商不同意相关变更，应立即停止一切推广行为并书面通知公司终止本协议。
              </p>

              <p class="paragraph">
                4.3 公司可为代理商提供必要的产品资料和信息。
              </p>

              <h3 class="section-title">5. 代理商的权利和义务</h3>

              <p class="paragraph">
                5.1 代理商需以诚信和良好的商业道德推广公司产品或服务，采用合法、合理的方式向最终用户推广公司产品，按照公司官网上的信息或者公司提供的其他材料介绍相关产品，不得通过任何不正当方式招揽客户，不得以任何方式扰乱市场竞争秩序，也不得从事任何违法、违规或损害公司声誉的活动。
              </p>

              <p class="paragraph">
                5.2 代理商应积极推广，使用公司提供的宣传资料和推广工具，确保推广信息准确、清晰。
              </p>

              <p class="paragraph">
                <strong>5.3 代理商禁止性信息发布</strong>
              </p>

              <p class="paragraph indent">
                1）代理商应确保推广信息真实、准确、合法。不得通过代理商推广功能发布以下任一信息：
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                A. 违反国家法律法规、行政规章等规定的。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                B. 违反公序良俗的。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                C. 侵犯他人知识产权或其他合法权益的。
              </p>

              <p class="paragraph indent">
                2）代理商应当确保所推广信息不包含以下内容：
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                A. 违反国家法律法规禁止性规定的。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                B. 政治宣传、封建迷信、淫秽、色情、赌博、暴力、恐怖或者教唆犯罪的。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                C. 欺诈、虚假、不准确或存在误导性的。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                D. 侵犯他人知识产权或涉及第三方商业秘密及其他专有权利的。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                E. 侮辱、诽谤、恐吓、涉及他人隐私等侵害他人合法权益的。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                F. 存在可能破坏、篡改、删除、影响分销员软件正常运行或未经授权秘密获取分销员软件及其他用户的数据、个人资料的病毒、木马、爬虫等恶意软件、程序代码的。
              </p>

              <p class="paragraph indent" style="padding-left: 40px;">
                G. 其他违背社会公共利益、公共道德，或依据规则规定不适合发布的。
              </p>

              <p class="paragraph">
                5.4 <strong>代理商不得向有违法行为（包括但不限于诈骗、赌博类）的企业、组织、个人推广公司产品，并确保其推荐的最终用户不得将公司产品用于违法犯罪行为（包括但不限于诈骗、赌博）。</strong>如果公司发现通过代理商而购买使用公司产品的客户，有违反公司相关规则或规范、法律法规、社会公共道德、品牌名誉或侵犯了第三方的合法权益的行为时，公司有权通过技术手段单方终止该最终用户对于相应产品的使用，如代理商对最终用户的资质审核存在过错的，公司有权取消代理商的相关资格、关停代理商账户、停止向代理商提供公司产品的推广邀请码或推广二维码或推广链接以及停止向代理商提供充值服务。若由此造成公司、最终用户或任何第三方损失的，代理商应负责独立妥善解决，并承担全部赔偿责任，确保公司免受任何损害（包括但不限于赔偿公司因此支出的赔偿金、律师费、诉讼费等）。
              </p>

              <p class="paragraph">
                5.5 为履行本协议之必要，代理商应根据公司的要求向公司提供其推广的新用户的信息及相关文件；如代理商提供给公司的信息、文件发生任何重大变化或预期的变化，须立即书面通知公司。
              </p>

              <p class="paragraph">
                5.6 代理商保证不得帮助最终用户制造、提交任何形式的虚假信息。如公司发现代理商有上述帮助制造、提供信息虚假的行为，公司有权通过技术手段单方终止该最终用户对于相应产品的使用、取消代理商的相关资格、关停代理商账户、停止向代理商提供公司产品的二维码或推广链接以及停止向代理商提供充值服务。若由此造成最终用户或代理商损失的，代理商应负责独立妥善解决并承担相关损失。
              </p>

              <p class="paragraph">
                5.7 代理商有权采取各种合法、合理方式向最终用户推广公司产品和服务。代理商可以为宣传、销售产品之目的合理使用产品logo、名称等内容，但不得有任何引人误解的宣传、使用方式。同时，代理商对于产品的产品logo、名称等内容的任何使用方案均需经过公司审核及书面确认后方可执行，除非是公司直接向代理商提供的物料或者素材。公司有权随时监督代理商的推广行为，对于任何不符合要求的推广，公司有权要求代理商立即整改并采取本协议第4.1条规定的措施。
              </p>

              <p class="paragraph">
                5.8 为保护公司的商业秘密，在与公司合作期间，代理商不能自行或与公司的商业竞争对手以任何形式进行有损公司利益的活动。
              </p>

              <p class="paragraph">
                5.9 非经公司事先书面同意，代理商不得将本协议项下的推广权、以及其他任何权利或义务以任何方式转让给第三人。
              </p>

              <h3 class="section-title">6. 知识产权</h3>

              <p class="paragraph">
                6.1 除双方另有约定外，对于本协议签署前双方已拥有或已存在的所有知识产权仍归原有方所有，不因本协议的签订或履行而使另一方对之享有任何知识产权。为免疑义，代理商对公司产品不享有任何知识产权上的任何权利，产品的任何衍生作品或改编作品应为公司所有。
              </p>

              <p class="paragraph">
                6.2 代理商尊重并保护公司产品的知识产权，并保证不会作出任何破坏或损害公司知识产权、形象或商誉等行为；同时，代理商保证其推广的最终用户不会作出任何破坏或损害公司知识产权、形象或商誉等行为。
              </p>

              <p class="paragraph">
                6.3 代理商不得复制公司产品所涉软件及相关文件，或进行任何二次开发、更改（更新），或将之转让，披露、再许可或分配给任何人，或超越本协议目的使用；代理商所持有或移转的所有软件与文件复本，都必须留有著作权的标记；代理商不得企图以反向工程等方式，取得软件源代码。
              </p>

              <p class="paragraph">
                6.4 任何一方不得将双方合作细则透露给其他任何第三方，但双方有书面约定或法律有特别规定的除外。
              </p>

              <h3 class="section-title">7. 保密义务</h3>

              <p class="paragraph">
                7.1 双方同意，任何一方对于因签署或履行本协议而了解或接触到的对方的保密信息均应保守秘密；非经对方书面同意，任何一方不得向第三方泄露、给予或转让该等保密信息。但以下情况除外：（1）适用法律、规则及规定要求的披露，前提是披露应仅限于必要的范围，并在可能的范围内及时通知另一方；或（2）向有必要得知信息的其关联方或专业顾问披露，但该等披露应仅限于必要的范围，且确保该等关联方或专业顾问遵守同样的保密义务，且仅为本协议所述事项使用该等信息；或（3）该等信息已经为公众所知，或者由披露方从第三方合法取得且披露方对该等第三方不负保密义务。
              </p>

              <p class="paragraph">
                7.2 双方在本协议期限内和本协议终止后均应继续保守保密信息的机密性。
              </p>

              <h3 class="section-title">8. 违约责任与限制</h3>

              <p class="paragraph">
                8.1 除本协议另有约定外，任何一方违反本协议约定的，应赔偿因此给另一方造成的全部损失（包括直接损失和可预见的间接损失）。<strong>尽管有前述约定，在任何情况下，任何一方的累计赔偿责任均不应超过本协议项下已实际支付及应支付的代理佣金总额。本条款不适用于因一方故意或重大过失、违反保密义务、侵犯知识产权所导致的损失。</strong>
              </p>

              <p class="paragraph">
                8.2 <strong>如代理商通过虚构新用户、虚假交易或其他欺诈手段骗取代理佣金，公司有权立即终止本协议，冻结并扣除其全部未结算佣金，代理商应在收到公司通知后3日内向公司全额返还其已获取的全部不当收益，并按照不当收益总额的300%向公司支付违约金，违约金不足以弥补公司损失的，代理商还应继续赔偿。</strong>
              </p>

              <p class="paragraph">
                8.3 任何一方均不对其不能控制的事件引起的履行不能或迟延履行负责，该等事件应包括但不限于天灾、罢工、抗议、暴乱、战争行为、瘟疫、政府法规、能源供给不能、地震或其他灾难。
              </p>

              <h3 class="section-title">9. 协议的生效</h3>

              <p class="paragraph">
                9.1 代理商勾选"同意"或对代理商软件的登录、使用等行为即视为代理商已阅读并同意本协议的约束。本协议即在代理商与公司之间产生法律效力，成为对双方均具有约束力的法律文件。
              </p>

              <h3 class="section-title">10. 协议终止</h3>

              <p class="paragraph">
                10.1 任何一方违反本协议的条款，另一方有权立即终止本协议。
              </p>

              <p class="paragraph">
                10.2 在协议终止后，并不影响本协议终止前双方已经产生的权利与义务，双方仍需履行未履行的义务，包括但不限于保密义务、退款扣除等，但代理商应立刻停止以任何方式使用公司品牌和标识，不得再以任何名义开展本协议项下约定的业务。
              </p>

              <h3 class="section-title">11. 其他</h3>

              <p class="paragraph">
                11.1 公司有权将其在本协议项下的全部或部分权利和义务转让给任何第三方，届时公司将通过本协议约定的通知方式告知代理商。代理商对此无异议且不得就此向公司主张任何权利或补偿。
              </p>

              <p class="paragraph">
                11.2 <strong>本协议之效力、解释、变更、执行与争议解决均适用中华人民共和国法律。因本协议的签署、效力、解释及执行而产生之争议，应通过友好协商加以解决。如不能协商解决，任何一方可将有关协议提交公司所在地有管辖权的人民法院诉讼解决。</strong>
              </p>

              <p class="paragraph">
                11.3 本协议中所有涉及合作的未尽事宜（如分成模式下CPS比例、单个新用户价值，以及代充模式下代理商向公司进行充值的折扣等），均可由双方另行协商确定，双方另行通过邮件或其他方式达成的约定，视为对于本协议的有效补充。
              </p>

              <p class="paragraph" style="margin-top: 32px; text-align: right;">
                <strong>杭州一目可识科技有限公司</strong>
              </p>
            </div>
          </div>

          <!-- Footer with gradient mask -->
          <div class="modal-footer-wrapper">
            <div class="modal-footer">
              <BaseButton
                type="primary"
                size="large"
                class="confirm-btn"
                block
                @click="handleConfirm"
              >
                我已阅读并同意
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseButton from './ui/BaseButton.vue';

interface Props {
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const visible = ref(props.visible);

watch(() => props.visible, (newVal) => {
  visible.value = newVal;
});

function handleClose() {
  visible.value = false;
  emit('close');
}

function handleConfirm() {
  visible.value = false;
  emit('confirm');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10001;
  padding: 0;
  overflow: hidden;
  touch-action: none; /* Prevent touch scrolling on overlay */
}

.modal-container {
  background: var(--basic-1);
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 375px;
  height: 85vh; /* 85% of viewport height for better proportion */
  max-height: 700px; /* Maximum height cap */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  position: relative;
  touch-action: pan-y; /* Allow vertical scrolling within modal */
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--basic-1);
  gap: 16px;
  flex-shrink: 0;
}

.modal-title {
  font-family: var(--font-family-primary);
  font-size: 20px;
  font-weight: var(--font-weight-regular);
  line-height: 1;
  color: var(--basic-10);
  margin: 0;
  flex: 1;
}

.close-btn {
  width: 32px;
  height: 32px;
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--basic-10);
  flex-shrink: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--basic-3);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

/* Subtitle */
.modal-subtitle {
  padding: 0 20px 16px;
  flex-shrink: 0;
}

.modal-subtitle p {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 22px;
  color: var(--basic-5);
  margin: 0;
}

/* Content */
.modal-content {
  padding: 0 20px 160px; /* Add padding for gradient mask */
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.agreement-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.paragraph {
  font-family: var(--font-family-primary);
  font-size: 14px;
  font-weight: var(--font-weight-regular);
  line-height: 22px;
  color: var(--basic-10);
  margin: 0;
  text-align: justify;
}

.paragraph strong {
  font-weight: var(--font-weight-semibold);
  color: var(--primary-6);
}

.paragraph.indent {
  padding-left: 20px;
}

.section-title {
  font-family: var(--font-family-primary);
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  line-height: 24px;
  color: var(--primary-6);
  margin: 8px 0 0 0;
}

.agreement-link {
  color: var(--primary-6);
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;
}

.agreement-link:hover {
  color: var(--primary-5);
  text-decoration: underline;
}

.agreement-link:active {
  color: var(--primary-7);
}

/* Footer with gradient mask */
.modal-footer-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-footer-wrapper::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140px; /* Adjusted to cover footer + gradient */
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(20, 20, 20, 1) 36.111%);
  pointer-events: none;
  z-index: 1;
}

.modal-footer {
  padding: 9px 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  position: relative;
  z-index: 2;
}

.confirm-btn {
  border-radius: 12px;
  flex: 1;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: slideUp 0.3s ease-out;
}

.modal-fade-leave-active .modal-container {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
</style>
