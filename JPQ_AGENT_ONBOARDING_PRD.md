---
title: JPQ 分销商后台 · 代理入驻 PRD
version: v1.0-draft
date: 2025-11-11
owner: 产品/前端/后端/运营（待补充）
source: 设计稿（Figma）- [代理入驻](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=297-24770)
---

## 1. 背景与目标
本项目旨在搭建“代理商入驻”完整闭环，承接运营侧生成的专属邀请链接/海报带来的流量，完成代理身份申请、协议确认、审核与结果反馈，并为后台提供可追踪的申请管理能力。

- 业务目标（首版）：
  - 搭建个人/公司两种入驻流程与风控校验。
  - 支持邀请识别与自动放行策略，缩短转化路径。
  - 后台可查询申请记录与状态，支持人工审核。

> 注：本文为骨架草案，后续将根据评审意见与你的补充提示逐步完善细节。

## 2. 术语与定义
- 代理商：通过邀请或主动申请，完成入驻并参与推广结算的主体。
- 邀请链接：运营生成、携带 inviterId/channelId 的 H5 入口。
- 自动通过：命中配置的放行条件（如存在有效邀请记录）后，无需人工审核直接通过。

## 3. 范围与非目标
- 范围（MVP）：
  - H5 入驻流程（登录/邀请识别/信息填写/协议确认/提交/结果）。
  - 后台基础管理（列表、详情、审核、配置）。
- 非目标（后续迭代）：
  - 复杂层级与结算规则实现。
  - 实付申请费网关打通（首版仅预留配置位与 UI 占位）。

## 4. 角色与用户
- 申请人（代理）：通过邀请或主动进入页面，完成入驻。
- 运营：生成与分发邀请链接/海报，关注转化。
- 审核员：处理非自动通过的申请，维护审核记录。
- 管理员：管理自动通过策略、协议版本、申请费等配置。

## 5. 用户旅程（概览）
1) 邀请进入：点击邀请 → 识别渠道 → 填写信息 → 勾选协议 → 提交 → 自动通过/进入审核 → 结果页。
2) 非邀请进入：登录 → 选择入驻类型（个人/公司）→ 填写信息 → 勾选协议 → 提交 → 审核/自动通过 → 结果页。

## 6. 页面清单（与设计映射）
- 登录：`登录页`、`登录-输入手机号后`
- 入驻表单：`审核｜个人`、`审核｜公司`
- 协议确认弹窗：`确认-个人`、`确认-公司`
- 结果页：`审核`（提交成功 / 未通过）
- 邀请入口：`邀请链接进入`
- 流程节点：`判断是否已入驻`、`判断是否为邀请链接`、"有记录，无需人工审核 自动通过"
- 代理主页：`高级代理`（审核通过后的主工作台）

### 6.1 设计佐证（关键子节点链接与解读）
- 登录页（初始）  
  链接：[`1:5377`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=1-5377)  
  解读：包含 `Status Bar`、`Home Bar` 与核心组件 `Login`，手机号输入、验证码按钮与协议勾选齐全，底部提供“专属客服”入口与公司/ICP备案信息。

- 登录-输入手机号后  
  链接：[`1:5381`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=1-5381)  
  解读：同一 `Login` 组件态的后置画面，手机号已回显，验证码输入+发送按钮可见，提交按钮激活；协议勾选保持必选。

- 审核｜个人（入驻表单-个人）  
  链接：[`114:3063`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=114-3063)  
  解读：`入驻类型` 单选（个人/企业），`申请信息` 含姓名/身份证号/资源介绍，`联系方式` 含微信号；协议勾选与申请费区（隐藏）保留，底部 `提交申请/联系客服` 固定按钮组。

- 审核｜公司（入驻表单-公司）  
  链接：[`1:5553`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=1-5553)  
  解读：与个人版结构一致，但字段为公司向（企业名称、统一社会信用代码、公司介绍等），`联系方式` 下增加一项输入；申请费区为隐藏态，可按配置开启。

- 确认-个人（含协议未勾选拦截弹窗）  
  链接：[`204:8696`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=204-8696)  
  子节点：Modal/Basic [`204:13382`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=204-13382)  
  解读：提交时未勾选协议将弹出 `Modal/Basic`，包含 `Alert` 提示与多条事项 `item`，底部按钮组用于确认/返回。

- 确认-公司（含协议未勾选拦截弹窗）  
  链接：[`204:32103`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=204-32103)  
  子节点：Modal/Basic [`204:32136`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=204-32136)  
  解读：与个人版一致，但弹窗 `content` 区域包含 6 条 `item`，用于公司入驻特别说明。

- 提交成功结果页  
  链接：[`142:9705`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=142-9705)  
  解读：展示“申请已成功提交/预计 1-3 个工作日”文案；包含按钮与 `QR Code` 区域（需替换为真实二维码/短链）。

- 未通过结果页  
  链接：[`208:7113`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=208-7113)  
  解读：文案“申请未通过/可联系下方专员”；含 `Button-Group` 与 `QR Code` 区（支持展示失败原因与客服触达）。

- 邀请链接进入  
  链接：[`130:3246`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=130-3246)  
  解读：带海报与"完善您的信息"的轻表单入口，承接 inviterId/channelId 识别，作为邀请链路的首屏承接页。

- 高级代理（代理主页/工作台）  
  链接：[`1:5445`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=1-5445)  
  解读：审核通过（status: `active`）后的代理主工作台页面，包含以下核心模块：
  - **顶部账号状态区**：展示代理昵称"AI扑克记牌器"、高级代理标签、代理ID、手机号；右上角设置按钮。
  - **总收益卡片** ([`122:5255`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=122-5255))：
    - 展示总收益（元）、待结算（元）、可提现（元）三个数据项。
    - 右上角"收入明细"与"立即提现"按钮组。
  - **下级代理卡片**：
    - 标题显示"下级代理"，右侧显示人数（如"12 人"）与右箭头，支持点击查看下级代理列表。
    - 分成比例说明：安卓 10%、苹果 10%（高级代理从下级代理的收益中抽成）。
    - 收益数据：总收益（元）、总订单数、总邀请人数。
    - 底部按钮组："查看代理业绩"与"邀请代理"。
  - **推广卡片** ([`122:5326`](https://www.figma.com/design/kmbsPj7UeCAaoa0zN3bdfq/%F0%9F%94%B7-JPQ-%E5%88%86%E9%94%80%E5%95%86%E5%90%8E%E5%8F%B0?node-id=122-5326))：
    - 标题"邀请码"，显示代理专属邀请码（如"6688"）。
    - 分成比例说明：安卓 60%、苹果 40%（一级代理直接推广用户的分成比例）。
    - 提示文案："一次绑定，长线收益分成！！"
    - 收益数据：总收益（元）、总订单数、总邀请人数。
    - 底部按钮组："查看邀请记录"与"去推广"。
  - **底部公司信息**：杭州一目可识科技有限公司 | 浙ICP备2025148163号。
  - **Home Bar**：iOS 风格的底部Home指示条。
  
  **业务逻辑**：
  - 此页面为已通过审核的代理商主工作台，展示收益概况、团队规模、推广数据等核心业务指标。
  - 代理分为两级：一级代理（高级代理）直接推广用户，获得 60%/40% 分成；二级代理由一级代理邀请，其收益中 10% 归一级代理。
  - 页面支持快捷操作：提现、查看明细、邀请下级、推广新用户等。
  - 数据实时更新，反映当前代理的业务表现。

## 7. 详细需求（骨架）
### 7.1 登录与邀请识别
- 支持手机号登录（验证码/一键登录具体方案待定）。
- 识别邀请参数（inviterId/channelId），记录来源并走邀请分支。
- 自动通过判定点：提交后立即评估命中条件（规则详见 10）。

### 7.2 入驻类型与表单
- 入驻类型：个人 / 公司（单选）。
- 表单区块：申请信息、联系方式、协议勾选、（可选）申请费。
- 协议未勾选时提交拦截，并弹出确认弹窗。

#### 7.2.1 字段键名与校验（落地到 detail_info）
- 顶层字段（PromoterSubmitRequest）：
  - `type`：`personal` | `company`（必填）
  - `name`：申请人名称（可选，默认取当前账号用户名/手机号）
  - `phone`：申请人手机号（可选，默认取当前账号手机号）
  - `introduction`：资源/能力简介（可选，≤200 字）
  - `detail_info`：object（必填，见下）

- detail_info（个人入驻 personal，建议键名与校验）
  - `id_number`：string，必填，二代身份证格式校验（18 位，尾位允许 X/x）
  - `wechat`：string，必填，3-20 位字母数字下划线
  - `email`：string，可选，邮箱格式
  - `region`：string，可选，省市区文本
  - `attachments`：array，可选，元素 `{ "type": "id_front"|"id_back", "url": "https://..." }`

- detail_info（公司入驻 company，建议键名与校验）
  - `company_name`：string，必填，与执照一致（2-60 字）
  - `uscc`：string，必填，统一社会信用代码（18 位大写字母数字）
  - `reg_address`：string，可选，注册地址
  - `legal_name`：string，必填，法人姓名
  - `legal_id_number`：string，必填，身份证号格式同上
  - `contact_wechat`：string，必填
  - `contact_email`：string，可选
  - `biz_license_url`：string，必填，营业执照图片 URL
  - `attachments`：array，可选，元素 `{ "type": "license"|"other", "url": "https://..." }`

- 校验规则（前端/H5 侧强校验，后端兜底）：
  - 字段必填校验与格式校验在提交前完成；超过长度与非法字符直接阻止提交。
  - `introduction` ≤200 字；文本统一去首尾空格。
  - URL 字段需为 https。

示例（personal）：

```json
{
  "type": "personal",
  "name": "张三",
  "phone": "13800000000",
  "introduction": "具备线下渠道资源",
  "detail_info": {
    "id_number": "3301**********123X",
    "wechat": "wxid_abc123",
    "email": "a@b.com",
    "region": "浙江省杭州市",
    "attachments": [
      {"type": "id_front", "url": "https://.../id_front.jpg"},
      {"type": "id_back", "url": "https://.../id_back.jpg"}
    ]
  }
}
```

示例（company）：

```json
{
  "type": "company",
  "name": "李四",               // 联系人/负责人
  "phone": "13800000000",
  "introduction": "有成熟商务团队",
  "detail_info": {
    "company_name": "杭州某某科技有限公司",
    "uscc": "91330106MA1ABCDE2F",
    "reg_address": "杭州市西湖区XX路88号",
    "legal_name": "王五",
    "legal_id_number": "3301**********5678",
    "contact_wechat": "sales_001",
    "contact_email": "sales@corp.com",
    "biz_license_url": "https://.../license.jpg",
    "attachments": [{"type": "license", "url": "https://.../license.jpg"}]
  }
}
```

### 7.3 提交与审核
- 成功提交后给出“1-3 个工作日”提示；若命中自动通过直接返回通过结果。
- 未通过显示拒绝信息与联系专员动作位（按钮/二维码）。

### 7.4 后台管理（最小集）
- 列表：状态筛选、来源筛选、入驻类型。
- 详情：表单信息、来源、风控结果、审核记录。
- 审核：通过/拒绝（拒绝需填写原因）。
- 配置：自动通过策略、申请费开关/金额、协议版本。

## 8. 字段与校验（草案）
### 8.1 个人入驻（建议）
- 申请信息：姓名、身份证号、地区、（可选）经验/备注。
- 联系方式：手机号（与登录一致）、微信/邮箱（二选一必填）。
- 附件（可选）：身份证正/反面。

### 8.2 公司入驻（建议）
- 申请信息：公司名称、统一社会信用代码、注册地址、法人/负责人姓名与证件号、营业执照（附件）。
- 联系方式：对公电话、邮箱、联系人微信。

> 注：最终字段与必填项待确认，详见“待确认清单”。

## 9. 状态机与流转（草案）
`已创建 → 待提交 → 待实名（可选）→ 待审核 → 已通过 | 已拒绝 | 自动通过`

## 10. 规则与策略（草案）
- 协议勾选拦截：未勾选禁止提交。
- 自动通过策略（最小版）：存在有效邀请记录（与手机号/设备指纹的绑定规则待定）。
- 时间承诺：未自动通过时展示“1-3 个工作日”处理提示（可配置）。

### 10.1 邀请参数与自动通过（细化）
- H5 入口识别参数：`inviterId`（发起人/上级代理 ID）、`channelId`（渠道/活动位），可扩展 `campaign`、`utm_*`。
- 归因：进入页面即写入本地与会话态（cookie/localStorage），提交时一并写入 `detail_info` 的 `source`：
  - `detail_info.source = { inviterId, channelId, campaign, utm: {...}, device_id }`
- 自动通过判定（示例最小策略）：
  - A. 验证手机号与邀请记录存在有效绑定（`inviterId+phone` 或 `device_id` 命中），则入驻后状态置为 `pass`；
  - B. 否则保持 `pending`，走人工审核。
- 设备维度：可选接入设备指纹 `device_id`，用于防止恶意注册与提高命中率。

## 11. 埋点与度量（骨架）
- 页面 PV：登录、邀请进入、个人/公司表单、成功、未通过。
- 关键点击：提交、协议勾选、联系专员、二维码曝光。
- 转化链路：提交率、通过率（含自动通过率）、渠道转化、平均审核时长。

## 12. 接口与数据（基于 admin_backend 的规范）

### 12.1 通用约定
- Base URL（示例）：`/api`
- 认证方式：JWT（管理员口令），请求头 `Authorization: Bearer <token>`
- CORS：允许本地开发端口，允许头 `Origin, Content-Type, Authorization, Accept-Language`，暴露 `Authorization`
- 响应包统一结构：

```json
{ "code": 0, "message": "success", "data": { ... } }
```

- 错误响应：`code != 0`，HTTP 状态与 `message` 描述错误原因（429 表示验证码冷却/次数限制）
- 服务器在通过认证后，会向下游处理设置以下请求头（客户端无需手动设置，仅知悉）：
  - `admin_user_id`、`admin_phone`、`admin_username`、`admin_role`、`admin_agent_id`（可选，角色为 distributor 时）

### 12.2 管理员认证（短信验证码登录，支持“promoter”自动注册）
- 发送验证码  
  - 方法/路径：`POST /api/admin/auth/send-code`  
  - 请求头：`Content-Type: application/json`  
  - 入参：
    - `phone_number` string 必填
    - `allow_register_role` string 可选，传 `"promoter"` 则允许首次登录时自动创建推广员账号并置为 `pending`
  - 出参：
    - `{"code":0,"message":"success","data":{"message":"验证码发送成功"}}`
  - 可能错误：400 参数/账号不存在、429 频率限制、500 短信下发失败

- 验证码登录  
  - 方法/路径：`POST /api/admin/auth/login`
  - 入参：
    - `phone_number` string 必填
    - `code` string 必填（白名单手机号可跳过）
    - `allow_register_role` string 可选，同上（`"promoter"` 可自动注册）
  - 出参（节选）：
    - `data.token` string JWT
    - `data.user`：`{admin_user_id, phone, username, role, status}`
  - 说明：JWT 有效期默认 480 小时（20 天，可配置）

- 退出登录  
  - 方法/路径：`POST /api/admin/auth/logout`
  - 请求头：`Authorization: Bearer <token>`
  - 出参：`{"data":{"message":"退出登录成功"}}`

- 获取当前登录信息  
  - 方法/路径：`GET /api/admin/auth/me`
  - 请求头：`Authorization: Bearer <token>`
  - 出参：管理员对象（与中间件写入一致）

### 12.3 入驻（推广员自助提交与状态）
- 提交入驻资料（个人/公司）  
  - 方法/路径：`POST /api/promoter/submit-info`
  - 权限：`Authorization: Bearer <token>` 且角色需为 `promoter`
  - 入参 JSON：
    - `type` string 枚举：`personal` | `company`
    - `phone` string 可选（缺省回退当前账号手机号）
    - `name` string 可选（缺省回退当前账号用户名/手机号）
    - `introduction` string 可选（资源/能力简介）
    - `detail_info` object 自由结构（建议按 7 章字段进行键名约定，例如身份证/营业执照/微信/邮箱等）
  - 出参：保存后的推广员对象（含审核状态，后端统一置为 `pending`）
  - 失败：401 未授权、400 参数错误

- 查询审核状态  
  - 方法/路径：`GET /api/promoter/status`
  - 权限：`Authorization: Bearer <token>` 且角色 `promoter`
  - 出参：字符串枚举：`"pending"` | `"pass"` | `"reject"`（未提交/未创建返回 `"pending"`）

（可选）- 推广员业务统计  
  - `GET /api/promoter/children`：返回子代理统计  
  - `GET /api/promoter/code-revenue?code=XXX`：单码收益（分）  
  - `GET /api/promoter/my-code-revenues`：本人全部推广码收益与合计

### 12.4 前后台通用信息
- 权限代码  
  - 方法/路径：`GET /api/auth/codes`
  - 头：`Authorization: Bearer <token>`
  - 出参：`string[]`（按角色返回）

- 用户信息（前台侧边栏等需要）  
  - 方法/路径：`GET /api/user/info`
  - 头：`Authorization: Bearer <token>`
  - 出参（节选）：`{id, realName, username, phone, roles[], homePath}`

### 12.5 H5 入驻调用链（建议）
1) `POST /api/admin/auth/send-code`（允许 `allow_register_role="promoter"`）  
2) `POST /api/admin/auth/login` → 获取 `token`  
3) `POST /api/promoter/submit-info`（附表单数据与 `detail_info`）  
4) 轮询 `GET /api/promoter/status` 或由后台审核异步推送（后续可加）  
5) 命中“自动通过”策略时，前端直接进入成功页；否则显示“1-3 个工作日”提示

### 12.6 请求示例
发送验证码（允许自动注册推广员）：

```http
POST /api/admin/auth/send-code
Content-Type: application/json

{ "phone_number": "13800000000", "allow_register_role": "promoter" }
```

提交入驻：

```http
POST /api/promoter/submit-info
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "personal",
  "name": "张三",
  "phone": "13800000000",
  "introduction": "有线下地推资源",
  "detail_info": {
    "id_number": "xxxxxxxxxxxxxx",
    "wechat": "wxid_xxx",
    "region": "杭州"
  }
}
```

### 12.7 错误码与权限矩阵
- 通用错误码（结合 HTTP）：
  - 200 + `code=0`：成功
  - 400：参数错误/业务校验失败（`code=-1` 或业务自定义）
  - 401：未授权（缺少或无效 `Authorization: Bearer <token>`）
  - 403：权限不足（角色不匹配或禁止访问）
  - 429：频率/风控限制（验证码冷却/输错次数过多）
  - 500：服务器内部错误
- 角色要求（后端中间件 `RequireRole`）：
  - `/api/admin/auth/*` 登录/验证码：不需要 token；`/me` 需要管理员 token
  - `/api/promoter/*`：需要管理员 token 且角色为 `promoter`
  - `/api/auth/codes`、`/api/user/info`：需要管理员 token

## 13. 配置中心（骨架）
- 自动通过：开关、匹配维度（邀请记录、手机号、设备指纹…）。
- 协议：版本与内容管理。
- 申请费：开关、金额（默认关闭）。

## 14. 安全与合规
- 协议留痕：勾选时间、IP、UA、设备指纹、协议版本。
- 敏感信息加密：证件号/手机号入库加密，HTTPS 传输。
- 审计：审核操作与自动通过命中日志。

## 15. 待确认清单（持续补充）
1. 字段与必填项（个人/公司）最终列表与校验规则。
2. 自动通过命中条件的精确组合与优先级。
3. 申请费是否在首版开启、金额与支付通道。
4. 结果页二维码的真实目标（下载/加企微/落地页）。

## 16. 里程碑与验收（骨架）
- M1 PRD 评审通过，字段/规则冻结。
- M2 H5 开发联调（含邀请识别/协议拦截/提交与结果页）。
- M3 后台申请管理与配置上线。
- M4 联测与灰度（自动通过策略打开）。
- 验收要点（示例）：
  - 邀请链路命中自动通过时，直接达“成功”页。
  - 协议未勾选拦截并弹窗提示。
  - 非邀请链路提交后可在后台看到“待审核”，并可审核。

## 17. 设计规格摘要（摘录）
- 字体：PingFang SC（标题/正文样式以设计变量为准）。
- 主要色系：Primary/6 `#FFE395`、基础深色 `#141414`、基础浅色 `#FFFFFF` 等。
- 组件：Radio-Group、Vertical-Form-Item/Input、Button-Group、Modal/Basic、Alert 等。

## 18. 高级代理主页（工作台）

### 18.1 页面入口
- **路由**：`/agent/home` 或 `/agent/dashboard`
- **访问条件**：
  - 用户已登录（有效 JWT token）
  - Promoter 状态为 `active`（审核通过且激活）
  - Level 为 1（一级代理/高级代理）
- **跳转逻辑**：
  - 登录成功后，如果 status 为 `active`，自动跳转到此页面
  - 从提交成功页面点击"进入工作台"按钮跳转（当状态从 pending 变为 active 后）

### 18.2 页面结构与组件

#### 18.2.1 顶部账号状态区（Sticky Header）
- **组件**：AccountStatus
- **内容**：
  - 左侧头像（默认灰色用户图标）
  - 中间信息区：
    - 昵称：默认"AI扑克记牌器"（可后续支持自定义）
    - 等级标签："高级代理"（金色渐变背景）
    - 代理ID：`promoter_id` 格式化显示（如"8886666"）
    - 手机号：脱敏显示（如"135 8888 0000"）
  - 右侧设置按钮：点击进入设置页面（账户管理、安全设置等）

#### 18.2.2 总收益卡片
- **数据源**：
  - API: `GET /api/promoter/earnings/summary`
  - 返回字段：
    - `total_earnings`: 总收益（元）
    - `pending_settlement`: 待结算（元）
    - `withdrawable`: 可提现（元）
- **交互**：
  - "收入明细"按钮 → 跳转到 `/agent/earnings/detail`
  - "立即提现"按钮 → 跳转到 `/agent/withdraw`（需满足最低提现额度）
  - 点击"可提现"右侧问号图标 → 显示提现规则说明

#### 18.2.3 下级代理卡片（仅一级代理显示）
- **数据源**：
  - API: `GET /api/promoter/team/summary`
  - 返回字段：
    - `subordinate_count`: 下级代理人数
    - `android_commission_rate`: 安卓分成比例（如 0.1 表示 10%）
    - `ios_commission_rate`: iOS 分成比例（如 0.1 表示 10%）
    - `total_earnings`: 从下级代理获得的总收益
    - `total_orders`: 下级代理产生的总订单数
    - `total_invites`: 下级代理总邀请人数
- **交互**：
  - 点击标题区域 → 跳转到 `/agent/team/list`（下级代理列表）
  - "查看代理业绩"按钮 → 跳转到 `/agent/team/performance`
  - "邀请代理"按钮 → 跳转到 `/agent/invite/share`（生成邀请链接/海报）
  - "收益详情"链接 → 跳转到 `/agent/team/earnings`

#### 18.2.4 推广卡片
- **数据源**：
  - API: `GET /api/promoter/promotion/summary`
  - 返回字段：
    - `invitation_code`: 邀请码（如"6688"）
    - `android_commission_rate`: 安卓分成比例（如 0.6 表示 60%）
    - `ios_commission_rate`: iOS 分成比例（如 0.4 表示 40%）
    - `total_earnings`: 直接推广用户产生的总收益
    - `total_orders`: 直接推广用户的总订单数
    - `total_invites`: 直接邀请的用户总数
- **交互**：
  - "收益详情"链接 → 跳转到 `/agent/promotion/earnings`
  - "查看邀请记录"按钮 → 跳转到 `/agent/invitation/records`
  - "去推广"按钮 → 跳转到 `/agent/promotion/share`（生成推广物料）

#### 18.2.5 底部信息
- 公司名称：杭州一目可识科技有限公司
- ICP备案号：浙ICP备2025148163号
- Home Bar：iOS 风格底部指示条（仅在移动端显示）

### 18.3 数据刷新策略
- **初始加载**：页面进入时并发请求所有数据接口
- **下拉刷新**：支持手动下拉刷新全部数据
- **轮询**：每 30 秒自动刷新一次收益相关数据（可配置）

### 18.4 权限与异常处理
- **权限校验**：
  - 如果用户不是 `active` 状态，重定向到对应状态页面
  - **二级代理**（level=2）：
    - 隐藏"下级代理卡片"（仅一级代理可见）
    - 仅显示"总收益卡片"和"推广卡片"
    - 分成比例说明调整为二级代理对应的比例（如：安卓 XX%、苹果 XX%）
- **异常处理**：
  - 数据加载失败显示重试按钮
  - 网络错误显示 Toast 提示
  - 空数据显示占位图与引导文案

### 18.5 后端接口使用说明（利用现有接口）

经后端代码审查，发现已有接口可以复用，**无需新增接口**，具体映射如下：

#### 18.5.1 总收益数据（复用现有接口）
使用现有接口组合获取：
- `GET /api/promoter/my-code-revenues` - 获取本人所有推广码收益（单位：分）
  - 返回：`{codes: {code1: fen1, code2: fen2}, total_fen: xxx}`
  - 前端计算：`total_fen / 100` 得到总收益（元）

**待结算/可提现**：
- 现有 `promoter_performance` 表已记录佣金数据（单位：分）
- 现有 `promoter_withdrawals` 表已记录提现记录
- **建议**：新增接口 `GET /api/promoter/withdrawal/balance` 返回：
  ```json
  {
    "code": 0,
    "data": {
      "total_earnings_fen": 965068,      // 总收益（分）
      "withdrawn_fen": 444000,           // 已提现（分）
      "pending_settlement_fen": 202168,  // 待结算（分，未满足提现条件）
      "withdrawable_fen": 52168          // 可提现（分，已满足条件）
    }
  }
  ```

#### 18.5.2 下级代理数据（复用现有接口）
使用现有接口：
- `GET /api/promoter/children` - 获取子代理统计
  - 返回：`ChildAgentStats[]` 数组
  - 每个对象包含：
    - `promoter_id`: 下级代理ID
    - `codes`: 推广码数组
    - `invite_count`: 邀请人数
    - `paid_order_count`: 付费订单数
    - `child_revenue_fen`: 下级收益（分）
    - `parent_share_from_child_fen`: 上级从下级获得的分成（分）

**前端聚合计算**：
- `subordinate_count`: `children.length`
- `total_earnings`: `sum(parent_share_from_child_fen) / 100`
- `total_orders`: `sum(paid_order_count)`
- `total_invites`: `sum(invite_count)`

**分成比例**：
- 从 `PromoterCommissionScheme` 表获取（需新增配置查询接口，或前端写死 10%）
- **建议**：新增接口 `GET /api/promoter/commission-scheme` 返回当前生效的佣金方案

#### 18.5.3 推广数据（复用现有接口）
使用现有接口组合：
- `GET /api/promoter/my-code-revenues` - 获取推广码与收益
- 前端从 `codes` 对象中提取邀请码

**订单数和邀请人数**：
- 现有 `promotion_code_grants` 表记录邀请绑定
- 现有 `orders` 表通过 `channel_name='pm_<code>'` 关联推广订单
- **前端聚合方案**：
  - 从 `GET /api/promoter/children` 返回的数据中，找到 `promoter_id` 等于当前用户的记录
  - 或**建议新增** `GET /api/promoter/self-promotion-stats` 返回：
  ```json
  {
    "code": 0,
    "data": {
      "invitation_code": "6688",
      "invite_count": 89,
      "paid_order_count": 165,
      "total_revenue_fen": 665300
    }
  }
  ```

#### 18.5.4 分成比例显示
**方案一（前端写死）**：
- 一级代理：安卓 60%、苹果 40%（直接推广用户）
- 一级代理：安卓 10%、苹果 10%（从二级代理分成）

**方案二（动态配置）**：
- 新增接口 `GET /api/promoter/commission-rates` 返回：
  ```json
  {
    "code": 0,
    "data": {
      "level1_direct": {"ios": 40, "android": 60},
      "level1_from_level2": {"ios": 10, "android": 10}
    }
  }
  ```

### 18.5.5 接口新增建议总结
**必需新增**（2个）：
1. `GET /api/promoter/withdrawal/balance` - 提现余额详情
2. `GET /api/promoter/self-promotion-stats` - 自身推广统计

**可选新增**（1个）：
3. `GET /api/promoter/commission-rates` - 佣金比例配置（或前端写死）

### 18.6 前端实现要点
- **组件化**：拆分为独立的卡片组件（EarningsCard, TeamCard, PromotionCard）
- **状态管理**：使用 Pinia store 管理收益、团队、推广数据
- **性能优化**：
  - 卡片懒加载（IntersectionObserver）
  - 数据缓存（5分钟内不重复请求）
  - 图片资源预加载
- **响应式设计**：适配不同屏幕尺寸（375px 基准）
- **动画效果**：
  - 数字滚动动画（CountUp.js 或自定义）
  - 卡片进场动画
  - 下拉刷新动画

## 19. 附录
- 设计稿：见文首链接（Section「代理入驻」）。

## 20. 环境配置键（admin_backend 摘要）
- `admin.jwt.secret`：管理员 JWT 签名密钥（必填）
- `admin.jwt.expire_hours`：JWT 过期小时数，默认 480（20 天）
- `admin.whitelist.phones`：验证码白名单手机号（数组，可选）
- `jwt.secret`：通用密钥（作为回退）
- 短信服务/验证码频率限制相关配置：由 `verificationCodeService`/`smsService` 读取（实现内）


