#!/bin/bash

# 付费数据看板启动脚本

echo "🚀 启动付费数据看板系统"
echo "=========================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查依赖
echo -e "${BLUE}1. 检查系统依赖...${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm 未安装${NC}"
    exit 1
fi

# 检查 Go
if ! command -v go &> /dev/null; then
    echo -e "${RED}❌ Go 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 系统依赖检查通过${NC}"

# 安装前端依赖
echo -e "${BLUE}2. 安装前端依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "安装依赖中..."
    pnpm install --silent
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 前端依赖安装完成${NC}"
    else
        echo -e "${RED}❌ 前端依赖安装失败${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 前端依赖已存在${NC}"
fi

# 编译后端服务
echo -e "${BLUE}3. 编译后端服务...${NC}"
BACKEND_DIR="../mahjong-backend/cmd/admin_backend"
if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    go build -o admin_backend .
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 后端服务编译完成${NC}"
    else
        echo -e "${RED}❌ 后端服务编译失败${NC}"
        exit 1
    fi
    cd - > /dev/null
else
    echo -e "${RED}❌ 后端目录不存在: $BACKEND_DIR${NC}"
    exit 1
fi

# 启动服务
echo -e "${BLUE}4. 启动服务...${NC}"

# 启动后端服务
echo "启动后端服务 (端口: 8001)..."
cd "$BACKEND_DIR"
./admin_backend &
BACKEND_PID=$!
cd - > /dev/null

# 等待后端服务启动
sleep 3

# 检查后端服务是否启动成功
if curl -s http://localhost:8001/health > /dev/null; then
    echo -e "${GREEN}✅ 后端服务启动成功 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  后端服务可能未完全启动，继续启动前端...${NC}"
fi

# 启动前端服务
echo "启动前端服务 (端口: 5173)..."
pnpm dev:antd &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}🎉 服务启动完成！${NC}"
echo "=========================="
echo -e "${BLUE}前端地址:${NC} http://localhost:5173"
echo -e "${BLUE}后端地址:${NC} http://localhost:8001"
echo -e "${BLUE}付费数据页面:${NC} http://localhost:5173/data-board/payment"
echo ""
echo -e "${YELLOW}进程信息:${NC}"
echo "前端 PID: $FRONTEND_PID"
echo "后端 PID: $BACKEND_PID"
echo ""
echo -e "${YELLOW}停止服务:${NC}"
echo "kill $FRONTEND_PID $BACKEND_PID"
echo ""
echo -e "${BLUE}📊 功能特性:${NC}"
echo "• 数据概览卡片 - 今日收入、订单、付费用户、转化率"
echo "• 收入趋势图表 - 支持今日/本周/本月切换"
echo "• 支付方式分布 - 饼图展示各支付方式占比"
echo "• 用户队列分析 - 完整的队列分析表格"
echo ""
echo -e "${BLUE}🔧 API 接口:${NC}"
echo "• POST /api/analyse/report - 生成自定义报表"
echo "• GET /api/analyse/quick-report - 快速报表"
echo "• GET /api/analyse/report-types - 报表类型"
echo "• GET /api/analyse/report-metrics - 报表指标"
echo ""

# 等待用户输入
echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"

# 捕获 Ctrl+C 信号
trap 'echo -e "\n${YELLOW}正在停止服务...${NC}"; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; echo -e "${GREEN}✅ 服务已停止${NC}"; exit 0' INT

# 保持脚本运行
wait
