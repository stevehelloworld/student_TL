# 維運手冊 (Operations Manual)

本文件提供學生出缺勤系統的日常維運指南，包含監控、故障排除、維護作業等。

## 系統監控

### 監控儀表板

#### Grafana 儀表板
- **URL**: http://your-domain:3001
- **預設帳號**: admin / admin (首次登入後請更改密碼)
- **主要儀表板**:
  - Application Overview: 應用程式整體狀況
  - Infrastructure Metrics: 基礎設施監控
  - Database Performance: 資料庫效能
  - Security Dashboard: 安全事件監控

#### Prometheus 指標
- **URL**: http://your-domain:9091
- **主要指標**:
  - `http_requests_total`: HTTP 請求總數
  - `http_request_duration_seconds`: 請求回應時間
  - `database_query_duration_seconds`: 資料庫查詢時間
  - `active_users_current`: 目前活躍使用者數
  - `error_rate_current`: 目前錯誤率

#### Alertmanager 告警
- **URL**: http://your-domain:9093
- **告警分類**:
  - Critical: 需要立即處理的嚴重問題
  - Warning: 需要關注的警告
  - Info: 資訊性通知

### 健康檢查端點

```bash
# 基本健康檢查
curl http://your-domain/health

# 資料庫健康檢查
curl http://your-domain/api/health/database

# Redis 健康檢查
curl http://your-domain/api/health/redis

# 詳細健康檢查
curl http://your-domain/api/health/detailed

# 效能指標
curl http://your-domain/api/health/metrics
```

### 日誌監控

#### 日誌位置
```bash
# 應用程式日誌
./logs/combined.log      # 所有日誌
./logs/error.log         # 錯誤日誌
./logs/access.log        # 存取日誌

# Nginx 日誌
./nginx/logs/access.log  # Nginx 存取日誌
./nginx/logs/error.log   # Nginx 錯誤日誌

# 容器日誌
docker-compose -f docker-compose.prod.yml logs [service-name]
```

#### 日誌查詢
```bash
# 查看最新錯誤
tail -f logs/error.log

# 搜尋特定錯誤
grep "ERROR" logs/combined.log | tail -20

# 查看特定時間範圍的日誌
grep "2024-01-01" logs/combined.log

# 統計錯誤數量
grep -c "ERROR" logs/combined.log
```

## 故障排除

### 常見問題診斷

#### 1. 服務無法存取

**症狀**: 網站無法開啟或回應緩慢

**診斷步驟**:
```bash
# 檢查服務狀態
docker-compose -f docker-compose.prod.yml ps

# 檢查 Nginx 狀態
curl -I http://localhost

# 檢查後端 API 狀態
curl http://localhost/api/health

# 檢查系統資源
docker stats
free -h
df -h
```

**可能原因與解決方案**:
- **容器停止**: `docker-compose -f docker-compose.prod.yml up -d`
- **記憶體不足**: 重啟服務或增加記憶體
- **磁碟空間不足**: 清理日誌和備份檔案
- **網路問題**: 檢查防火牆和 DNS 設定

#### 2. 資料庫連線問題

**症狀**: 資料庫連線錯誤或查詢超時

**診斷步驟**:
```bash
# 檢查 PostgreSQL 容器狀態
docker-compose -f docker-compose.prod.yml ps postgres

# 測試資料庫連線
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# 檢查資料庫連線數
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d student_attendance -c "SELECT count(*) FROM pg_stat_activity;"

# 檢查慢查詢
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d student_attendance -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

**解決方案**:
- **連線池滿**: 重啟應用程式或增加連線池大小
- **資料庫鎖定**: 檢查並終止長時間執行的查詢
- **磁碟空間不足**: 清理資料庫日誌或增加儲存空間

#### 3. Redis 快取問題

**症狀**: 快取失效或 Redis 連線錯誤

**診斷步驟**:
```bash
# 檢查 Redis 容器狀態
docker-compose -f docker-compose.prod.yml ps redis

# 測試 Redis 連線
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# 檢查 Redis 記憶體使用
docker-compose -f docker-compose.prod.yml exec redis redis-cli info memory

# 檢查 Redis 慢查詢
docker-compose -f docker-compose.prod.yml exec redis redis-cli slowlog get 10
```

**解決方案**:
- **記憶體不足**: 清理過期 key 或增加記憶體
- **連線問題**: 重啟 Redis 服務
- **效能問題**: 檢查慢查詢並最佳化

#### 4. 高錯誤率

**症狀**: 應用程式回傳大量 5xx 錯誤

**診斷步驟**:
```bash
# 檢查錯誤日誌
tail -f logs/error.log

# 統計錯誤類型
grep "ERROR" logs/combined.log | awk '{print $5}' | sort | uniq -c | sort -nr

# 檢查應用程式指標
curl http://localhost/api/health/metrics

# 檢查系統資源使用
top
iostat 1 5
```

**解決方案**:
- **程式錯誤**: 檢查錯誤日誌並修復程式碼
- **資源不足**: 增加 CPU 或記憶體
- **外部服務問題**: 檢查第三方服務狀態

### 緊急處理程序

#### 服務完全中斷
1. **立即通知**: 通知相關人員和使用者
2. **快速診斷**: 檢查基礎設施和服務狀態
3. **回復服務**: 重啟服務或切換到備用系統
4. **根因分析**: 分析問題原因並制定預防措施

#### 資料庫問題
1. **停止寫入**: 暫停可能造成資料損壞的操作
2. **備份檢查**: 確認最新備份的完整性
3. **修復或還原**: 修復問題或從備份還原
4. **驗證資料**: 確認資料完整性

#### 安全事件
1. **隔離系統**: 暫時隔離受影響的系統
2. **收集證據**: 保存日誌和相關證據
3. **通知相關方**: 通知安全團隊和管理層
4. **修復漏洞**: 修復安全漏洞並加強防護

## 維護作業

### 日常維護檢查清單

#### 每日檢查
- [ ] 檢查服務狀態和健康檢查
- [ ] 檢查錯誤日誌和告警
- [ ] 檢查系統資源使用情況
- [ ] 檢查備份是否成功執行
- [ ] 檢查監控儀表板異常

#### 每週檢查
- [ ] 檢查磁碟空間使用情況
- [ ] 檢查資料庫效能指標
- [ ] 檢查安全日誌和事件
- [ ] 更新系統套件 (非關鍵)
- [ ] 檢查 SSL 憑證有效期

#### 每月檢查
- [ ] 執行完整系統備份
- [ ] 檢查和更新監控告警規則
- [ ] 檢查系統效能趨勢
- [ ] 執行安全掃描
- [ ] 檢查和更新文件

### 系統更新程序

#### 應用程式更新
```bash
# 1. 備份資料庫
./scripts/backup.sh

# 2. 拉取最新程式碼
git pull origin main

# 3. 建置新映像
docker-compose -f docker-compose.prod.yml build --no-cache

# 4. 執行資料庫遷移 (如需要)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 5. 重啟服務
docker-compose -f docker-compose.prod.yml up -d --remove-orphans

# 6. 健康檢查
sleep 30
curl -f http://localhost/health
```

#### 系統套件更新
```bash
# 更新系統套件
sudo apt update && sudo apt upgrade -y

# 更新 Docker
sudo apt update && sudo apt install docker-ce docker-ce-cli containerd.io

# 重啟 Docker 服務
sudo systemctl restart docker

# 重啟應用程式
docker-compose -f docker-compose.prod.yml restart
```

### 效能最佳化

#### 資料庫最佳化
```sql
-- 分析資料庫統計
ANALYZE;

-- 重建索引
REINDEX DATABASE student_attendance;

-- 清理無用資料
VACUUM FULL;

-- 檢查慢查詢
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

#### 快取最佳化
```bash
# 清理 Redis 過期 key
docker-compose -f docker-compose.prod.yml exec redis redis-cli --scan --pattern "*" | xargs docker-compose -f docker-compose.prod.yml exec redis redis-cli del

# 檢查快取命中率
docker-compose -f docker-compose.prod.yml exec redis redis-cli info stats | grep keyspace
```

#### 日誌輪轉
```bash
# 設定 logrotate
sudo tee /etc/logrotate.d/student-attendance << EOF
/opt/student-attendance-system/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/student-attendance-system/docker-compose.prod.yml restart backend
    endscript
}
EOF
```

## 備份與還原

### 自動備份
系統已設定每日自動備份，備份檔案儲存在 `./backups` 目錄。

### 手動備份
```bash
# 執行完整備份
./scripts/backup.sh

# 檢查備份檔案
ls -la backups/

# 驗證備份完整性
gunzip -t backups/latest-backup.sql.gz
```

### 還原程序
```bash
# 1. 停止應用程式
docker-compose -f docker-compose.prod.yml stop backend frontend

# 2. 還原資料庫
gunzip -c backups/backup-file.sql.gz | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d student_attendance

# 3. 重啟應用程式
docker-compose -f docker-compose.prod.yml start backend frontend

# 4. 驗證還原結果
curl -f http://localhost/health
```

## 安全維護

### 安全檢查
```bash
# 檢查開放連接埠
nmap -sT -O localhost

# 檢查系統更新
sudo apt list --upgradable

# 檢查 Docker 映像漏洞
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image your-image

# 檢查 SSL 憑證
openssl x509 -in nginx/ssl/cert.pem -text -noout | grep "Not After"
```

### 日誌分析
```bash
# 檢查失敗的登入嘗試
grep "authentication failed" logs/combined.log | tail -20

# 檢查可疑的 IP 位址
awk '{print $1}' nginx/logs/access.log | sort | uniq -c | sort -nr | head -20

# 檢查 4xx 和 5xx 錯誤
grep -E " (4|5)[0-9]{2} " nginx/logs/access.log | tail -20
```

## 聯絡資訊

### 緊急聯絡人
- **系統管理員**: admin@yourdomain.com
- **開發團隊**: dev@yourdomain.com
- **安全團隊**: security@yourdomain.com

### 外部服務
- **雲端服務商**: [服務商聯絡資訊]
- **SSL 憑證商**: [憑證商聯絡資訊]
- **監控服務**: [監控服務聯絡資訊]

### 文件和資源
- **系統架構圖**: [連結]
- **API 文件**: http://your-domain/api/docs
- **監控儀表板**: http://your-domain:3001
- **故障排除指南**: [連結]