#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Nextsafar - Start All Services
# ═══════════════════════════════════════════════════════════

set -e

# رنگ‌ها برای خروجی بهتر
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# مسیرهای پروژه
PROJECT_ROOT="/var/www/Nextsafar"
API_DIR="$PROJECT_ROOT/apps/api"
ADMIN_DIR="$PROJECT_ROOT/apps/admin"
DOCKER_DIR="$PROJECT_ROOT/infra/docker"

# فایل‌های لاگ
API_LOG="/tmp/nest-api.log"
ADMIN_LOG="/tmp/next-admin.log"
API_PID="/tmp/nest-api.pid"
ADMIN_PID="/tmp/next-admin.pid"

echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🚀 Nextsafar - Starting All Services                ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# ─────────────────────────────────────────────────────
# مرحله ۱: بررسی و استارت Docker (PostgreSQL + Redis)
# ─────────────────────────────────────────────────────
echo -e "${BLUE}[1/3] بررسی Docker containers...${NC}"

cd "$DOCKER_DIR"

# بررسی وضعیت docker
if docker compose ps 2>/dev/null | grep -q "Up"; then
    echo -e "${GREEN}✅ Docker containers در حال اجرا هستند${NC}"
    docker compose ps
else
    echo -e "${YELLOW}⏳ استارت Docker containers...${NC}"
    docker compose up -d
    sleep 5
    
    if docker compose ps 2>/dev/null | grep -q "Up"; then
        echo -e "${GREEN}✅ Docker containers با موفقیت استارت شدند${NC}"
        docker compose ps
    else
        echo -e "${RED}❌ خطا در استارت Docker containers${NC}"
        docker compose ps
    fi
fi

# تست اتصال به دیتابیس
echo ""
echo -e "${BLUE}🔍 تست اتصال به PostgreSQL...${NC}"
if docker compose exec postgres psql -U nextsafar -d nextsafar_core -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ اتصال به PostgreSQL برقرار است${NC}"
else
    echo -e "${RED}❌ اتصال به PostgreSQL برقرار نیست${NC}"
fi

# تست اتصال به Redis
echo -e "${BLUE}🔍 تست اتصال به Redis...${NC}"
if docker compose exec redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✅ اتصال به Redis برقرار است${NC}"
else
    echo -e "${RED}❌ اتصال به Redis برقرار نیست${NC}"
fi

# ─────────────────────────────────────────────────────
# مرحله ۲: استارت API (NestJS)
# ─────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[2/3] استارت NestJS API (پورت 3000)...${NC}"

# کشتن پروسه قبلی
if sudo lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⏳ کشتن API قبلی...${NC}"
    sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
    sleep 2
fi

cd "$API_DIR"

# استارت API در پس‌زمینه
echo -e "${YELLOW}⏳ در حال استارت API...${NC}"
nohup pnpm start:dev > "$API_LOG" 2>&1 &
echo $! > "$API_PID"

# صبر برای آماده شدن
echo -n "⏳ صبر برای آماده شدن API"
for i in {1..30}; do
    sleep 1
    echo -n "."
    
    # بررسی آیا API آماده است
    if curl -s http://localhost:3000/api/v1/tours -o /dev/null 2>/dev/null; then
        echo ""
        echo -e "${GREEN}✅ API با موفقیت استارت شد (PID: $(cat $API_PID))${NC}"
        echo -e "${GREEN}   🌐 URL: http://localhost:3000/api/v1${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  API هنوز در حال استارت است. لاگ را چک کنید:${NC}"
        echo -e "   tail -f $API_LOG"
    fi
done

# ─────────────────────────────────────────────────────
# مرحله ۳: استارت Admin Panel (Next.js)
# ─────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[3/3] استارت Next.js Admin (پورت 3001)...${NC}"

# کشتن پروسه قبلی
if sudo lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}⏳ کشتن Admin Panel قبلی...${NC}"
    sudo lsof -ti:3001 | xargs sudo kill -9 2>/dev/null || true
    sleep 2
fi

cd "$ADMIN_DIR"

# پاک کردن cache برای اطمینان
rm -rf .next 2>/dev/null || true

# استارت Admin در پس‌زمینه
echo -e "${YELLOW}⏳ در حال استارت Admin Panel...${NC}"
nohup pnpm dev -p 3001 > "$ADMIN_LOG" 2>&1 &
echo $! > "$ADMIN_PID"

# صبر برای آماده شدن
echo -n "⏳ صبر برای آماده شدن Admin Panel"
for i in {1..20}; do
    sleep 1
    echo -n "."
    
    # بررسی آیا Admin آماده است
    if curl -s http://localhost:3001 -o /dev/null 2>/dev/null; then
        echo ""
        echo -e "${GREEN}✅ Admin Panel با موفقیت استارت شد (PID: $(cat $ADMIN_PID))${NC}"
        echo -e "${GREEN}   🌐 URL: http://localhost:3001${NC}"
        break
    fi
    
    if [ $i -eq 20 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  Admin Panel هنوز در حال استارت است. لاگ را چک کنید:${NC}"
        echo -e "   tail -f $ADMIN_LOG"
    fi
done

# ─────────────────────────────────────────────────────
# نمایش خلاصه نهایی
# ─────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   ✨ وضعیت نهایی سرویس‌ها                              ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# نمایش وضعیت هر سرویس
check_service() {
    local name=$1
    local port=$2
    local pid_file=$3
    
    if curl -s http://localhost:$port -o /dev/null 2>/dev/null; then
        echo -e "${GREEN}✅ $name${NC} (پورت $port) - ${GREEN}در حال اجرا${NC}"
        if [ -f "$pid_file" ]; then
            echo -e "   PID: $(cat $pid_file)"
        fi
    else
        echo -e "${RED}❌ $name${NC} (پورت $port) - ${RED}در دسترس نیست${NC}"
    fi
}

check_service "🐘 PostgreSQL" "5433"
check_service "🔴 Redis" "6380"
check_service "🚀 NestJS API" "3000" "$API_PID"
check_service "🎨 Next.js Admin" "3001" "$ADMIN_PID"

echo ""
echo -e "${CYAN}📋 دستورات کمکی:${NC}"
echo -e "   ${YELLOW}./stop-all.sh${NC}     - توقف همه سرویس‌ها"
echo -e "   ${YELLOW}./status-all.sh${NC}   - بررسی وضعیت سرویس‌ها"
echo -e "   ${YELLOW}tail -f $API_LOG${NC}   - مشاهده لاگ API"
echo -e "   ${YELLOW}tail -f $ADMIN_LOG${NC}   - مشاهده لاگ Admin"
echo ""
echo -e "${GREEN}🎉 همه سرویس‌ها با موفقیت استارت شدند!${NC}"
