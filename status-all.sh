#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   📊 Nextsafar - Services Status                      ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

check_service() {
    local name=$1
    local port=$2
    local url=$3
    
    if curl -s "$url" -o /dev/null -w "%{http_code}" 2>/dev/null | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ $name${NC} (پورت $port)"
    else
        echo -e "${RED}❌ $name${NC} (پورت $port)"
    fi
}

echo -e "${CYAN}📦 زیرساخت:${NC}"
check_service "PostgreSQL" "5433" "http://localhost:5433"
check_service "Redis" "6380" "http://localhost:6380"

echo ""
echo -e "${CYAN}🚀 اپلیکیشن:${NC}"
check_service "NestJS API" "3000" "http://localhost:3000/api/v1/tours"
check_service "Next.js Admin" "3001" "http://localhost:3001"

echo ""
echo -e "${CYAN}📋 اطلاعات:${NC}"
echo -e "   API URL:     ${YELLOW}http://localhost:3000/api/v1${NC}"
echo -e "   Admin URL:   ${YELLOW}http://localhost:3001${NC}"
echo -e "   Login:       ${YELLOW}09120000000${NC} / ${YELLOW}Admin@12345${NC}"
