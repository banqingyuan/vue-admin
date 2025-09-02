#!/bin/bash

echo "=== Vue Vben Admin 短信验证码登录测试 ==="

# 检查后端服务是否运行
echo "1. 检查后端服务..."
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务未运行，请先启动 admin_backend"
    echo "   cd /Users/qingyuan/qingyuaner/mahjong-backend && ./admin_backend"
    exit 1
fi

# 测试发送验证码接口
echo ""
echo "2. 测试发送验证码接口..."
SEND_CODE_RESPONSE=$(curl -s -X POST http://localhost:8001/api/admin/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "15606160125"}')

if echo "$SEND_CODE_RESPONSE" | grep -q "验证码发送成功"; then
    echo "✅ 发送验证码接口正常"
    echo "   响应: $SEND_CODE_RESPONSE"
else
    echo "❌ 发送验证码接口异常"
    echo "   响应: $SEND_CODE_RESPONSE"
fi

# 测试登录接口
echo ""
echo "3. 测试登录接口..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "15606160125", "code": "1234"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ 登录接口正常"
    echo "   响应: $LOGIN_RESPONSE"
else
    echo "❌ 登录接口异常"
    echo "   响应: $LOGIN_RESPONSE"
fi

echo ""
echo "4. 前端启动说明："
echo "   cd /Users/qingyuan/qingyuaner/vue-vben-admin/apps/web-antd"
echo "   pnpm dev"
echo ""
echo "   然后访问: http://localhost:5173/login"
echo "   使用手机号: 15606160125"
echo "   验证码: 1234 (如果配置了白名单)"

echo ""
echo "=== 测试完成 ==="
