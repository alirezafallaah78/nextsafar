#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🛑 Nextsafar - Stopping All Services                ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# توقف Admin Panel
echo -e "${BLUE}[1/2] توقف Next.js Admin (پورت 3001)...${NC}"
if sudo lsof -ti:3001 > /dev/null 2>&1; then
    sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Admin Panel متوقف شد${NC}"
else
    echo -e "${YELLOW}ℹ️  Admin Panel در حال اجرا نیست${NC}"
fi

# توقف API
echo -e "${BLUE}[2/2] توقف NestJS API (پورت 3000)...${NC}"
if sudo lsof -ti:3000 > /dev/null 2>&1; then
    sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ API متوقف شد${NC}"
else
    echo -e "${YELLOW}ℹ️  API در حال اجرا نیست${NC}"
fi

echo ""
echo -e "${YELLOW}⚠️  Docker containers (PostgreSQL + Redis) متوقف نشدند${NC}"
echo -e "   برای توقف Docker: ${CYAN}cd infra/docker && docker compose down${NC}"
echo ""
echo -e "${GREEN}🎉 همه سرویس‌ها متوقف شدند${NC}"
