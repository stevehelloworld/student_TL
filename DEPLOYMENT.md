# 部署指南 (Deployment Guide)

本文件說明如何將學生出缺勤系統部署到生產環境。

## 系統需求

### 硬體需求
- **CPU**: 最少 2 核心，建議 4 核心以上
- **記憶體**: 最少 4GB RAM，建議 8GB 以上
- **儲存空間**: 最少 20GB，建議 50GB 以上 (包含日誌和備份)
- **網路**: 穩定的網際網路連線

### 軟體需求
- **作業系統**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.0+

## 部署前準備

### 1. 伺服器設定

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝必要套件
sudo apt install -y curl wget git unzip

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登入以套用 Docker 群組權限
```

### 2. 防火牆設定

```bash
# 開啟必要的連接埠
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. 下載專案

```bash
# 複製專案到伺服器
git clone <your-repository-url> student-attendance-system
cd student-attendance-system
```

## 環境設定

### 1. 建立環境變數檔案

```bash
# 複製環境變數範本
cp .env.production .env.prod

# 編輯環境變數
nano .env.prod
```

### 2. 必要的環境變數設定

```bash
# 資料庫設定
POSTGRES_DB=student_attendance
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-database-password-here

# Redis 設定
REDIS_PASSWORD=your-secure-redis-password-here

# JWT 設定
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long

# NextAuth 設定
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret-key-at-least-32-characters-long

# API 設定
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# 網域設定
DOMAIN=yourdomain.com

# 監控設定
GRAFANA_PASSWORD=your-secure-grafana-password
```

## 部署步驟

### 方法一：自動部署 (推薦)

```bash
# 執行自動部署腳本
./scripts/deploy.sh
```

### 方法二：手動部署

```bash
# 1. 建立必要目錄
mkdir -p nginx/logs logs backups nginx/ssl

# 2. 建置 Docker 映像
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. 啟動服務
docker-compose -f docker-compose.prod.yml up -d

# 4. 等待服務啟動
sleep 30

# 5. 執行資料庫遷移
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 6. 執行資料庫種子資料 (僅首次部署)
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
```

## SSL 憑證設定

### 使用 Let's Encrypt (推薦)

```bash
# 設定環境變數
export DOMAIN=yourdomain.com
export SSL_EMAIL=admin@yourdomain.com

# 執行 SSL 設定腳本
./scripts/setup-ssl.sh
```

### 使用自有憑證

```bash
# 將憑證檔案放置到正確位置
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem

# 設定正確的檔案權限
chmod 600 nginx/ssl/*.pem
```

## 服務管理

### 檢查服務狀態

```bash
# 查看所有服務狀態
docker-compose -f docker-compose.prod.yml ps

# 查看服務日誌
docker-compose -f docker-compose.prod.yml logs -f [service-name]

# 查看系統資源使用情況
docker stats
```

### 重啟服務

```bash
# 重啟所有服務
docker-compose -f docker-compose.prod.yml restart

# 重啟特定服務
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart nginx
```

### 更新應用程式

```bash
# 1. 拉取最新程式碼
git pull origin main

# 2. 重新建置映像
docker-compose -f docker-compose.prod.yml build --no-cache

# 3. 停止服務
docker-compose -f docker-compose.prod.yml down

# 4. 啟動服務
docker-compose -f docker-compose.prod.yml up -d

# 5. 執行資料庫遷移 (如有需要)
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

## 備份與還原

### 自動備份

系統已設定每日自動備份，備份檔案儲存在 `./backups` 目錄。

### 手動備份

```bash
# 執行手動備份
docker-compose -f docker-compose.prod.yml exec db-backup /backup.sh

# 查看備份檔案
ls -la backups/
```

### 還原備份

```bash
# 停止應用程式服務
docker-compose -f docker-compose.prod.yml stop backend frontend

# 還原資料庫
docker-compose -f docker-compose.prod.yml exec postgres sh -c "
    PGPASSWORD=\$POSTGRES_PASSWORD psql -U \$POSTGRES_USER -d \$POSTGRES_DB < /backups/your-backup-file.sql
"

# 重啟服務
docker-compose -f docker-compose.prod.yml start backend frontend
```

## 監控與日誌

### 存取監控介面

- **Grafana 儀表板**: http://your-domain:3001
  - 使用者名稱: admin
  - 密碼: 在 `.env.prod` 中設定的 `GRAFANA_PASSWORD`

- **Prometheus 指標**: http://your-domain:9091

### 查看日誌

```bash
# 應用程式日誌
tail -f logs/app.log

# Nginx 日誌
tail -f nginx/logs/access.log
tail -f nginx/logs/error.log

# Docker 容器日誌
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## 效能調校

### 資料庫最佳化

```bash
# 進入 PostgreSQL 容器
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d student_attendance

# 執行 VACUUM 和 ANALYZE
VACUUM ANALYZE;

# 檢查索引使用情況
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename IN ('User', 'Course', 'AttendanceRecord');
```

### Redis 最佳化

```bash
# 檢查 Redis 記憶體使用情況
docker-compose -f docker-compose.prod.yml exec redis redis-cli INFO memory

# 檢查 Redis 效能統計
docker-compose -f docker-compose.prod.yml exec redis redis-cli INFO stats
```

## 安全性檢查清單

- [ ] 更改所有預設密碼
- [ ] 設定強密碼政策
- [ ] 啟用 SSL/TLS 加密
- [ ] 設定防火牆規則
- [ ] 定期更新系統和套件
- [ ] 設定自動備份
- [ ] 監控系統日誌
- [ ] 限制 SSH 存取
- [ ] 設定入侵偵測系統

## 故障排除

### 常見問題

#### 1. 服務無法啟動

```bash
# 檢查 Docker 服務狀態
sudo systemctl status docker

# 檢查容器日誌
docker-compose -f docker-compose.prod.yml logs [service-name]

# 檢查磁碟空間
df -h
```

#### 2. 資料庫連線失敗

```bash
# 檢查資料庫容器狀態
docker-compose -f docker-compose.prod.yml ps postgres

# 測試資料庫連線
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
```

#### 3. SSL 憑證問題

```bash
# 檢查憑證有效期
openssl x509 -in nginx/ssl/cert.pem -text -noout | grep "Not After"

# 測試 SSL 設定
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

#### 4. 記憶體不足

```bash
# 檢查記憶體使用情況
free -h

# 檢查 Docker 容器記憶體使用
docker stats --no-stream

# 清理未使用的 Docker 資源
docker system prune -a
```

## 維護作業

### 定期維護檢查清單

#### 每日
- [ ] 檢查服務狀態
- [ ] 檢查備份是否成功
- [ ] 檢查磁碟空間使用情況

#### 每週
- [ ] 檢查系統日誌
- [ ] 檢查安全性更新
- [ ] 檢查效能指標

#### 每月
- [ ] 更新系統套件
- [ ] 檢查 SSL 憑證有效期
- [ ] 測試備份還原程序
- [ ] 檢查資料庫效能

## 聯絡資訊

如有部署相關問題，請聯絡系統管理員：
- Email: admin@yourdomain.com
- 技術支援: support@yourdomain.com