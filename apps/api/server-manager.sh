#!/bin/bash

API_DIR="/var/www/Nextsafar/apps/api"
LOG_FILE="/tmp/nest-api.log"
PID_FILE="/tmp/nest-api.pid"

case "$1" in
  start)
    echo "🚀 Starting API server..."
    cd $API_DIR
    sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
    sleep 2
    nohup pnpm start:dev > $LOG_FILE 2>&1 &
    echo $! > $PID_FILE
    echo "✅ API started (PID: $(cat $PID_FILE))"
    echo "📋 Logs: tail -f $LOG_FILE"
    ;;
  
  stop)
    echo "🛑 Stopping API server..."
    if [ -f $PID_FILE ]; then
      kill $(cat $PID_FILE) 2>/dev/null
      rm $PID_FILE
      echo "✅ API stopped"
    else
      sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true
      echo "✅ API stopped (force kill)"
    fi
    ;;
  
  restart)
    $0 stop
    sleep 3
    $0 start
    ;;
  
  status)
    if [ -f $PID_FILE ] && ps -p $(cat $PID_FILE) > /dev/null; then
      echo "✅ API is running (PID: $(cat $PID_FILE))"
      curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost:3000/api/v1/auth/login
    else
      echo "❌ API is not running"
    fi
    ;;
  
  logs)
    tail -f $LOG_FILE
    ;;
  
  *)
    echo "Usage: $0 {start|stop|restart|status|logs}"
    exit 1
    ;;
esac
