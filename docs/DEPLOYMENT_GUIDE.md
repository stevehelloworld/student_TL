# 系統部署文件 (Deployment Guide)

本文件說明如何將系統部署至伺服器或本地環境。本文件已更新以包含最新的環境設定修正。

## 1. 系統架構
本系統由三個主要部分組成：
- **Frontend**: Next.js (React) 應用程式 (Port 3000)
- **Backend**: Node.js (Fastify) API Server (Port 3001)
- **Infrastructure**: PostgreSQL 資料庫 (Port 5432) 與 Redis (Port 6379)

## 2. 部署環境需求
- **Docker** & **Docker Compose**
- **Node.js** (v18+)

## 3. 快速部署 (Local Development)

### 步驟 1: 啟動基礎設施
在專案根目錄執行：
```bash
docker-compose up -d postgres redis
```

### 步驟 2: 設定後端 (Backend)
```bash
cd backend
npm install

# 初始化資料庫 Schema
npm run db:generate
npm run db:push

# 植入種子資料 (預設帳號)
# 注意：需使用支援 dotenv 的指令
npx ts-node -r dotenv/config prisma/seed.ts

# 啟動後端伺服器
npm run dev
```
> **注意**: `backend/.env` 中的 `DATABASE_URL` 使用者須為 `postgres1` (密碼 `admin5432`)。

### 步驟 3: 設定前端 (Frontend)
```bash
cd frontend
npm install

# 確保 .env 存在 (可由 .env.example 複製)
# 啟動前端
npm run dev
```

---

## 4. 生產環境部署 (Production)

### Docker Compose 全系統部署

1. **配置環境變數**
   確保根目錄有 `.env`，`backend/.env` 與 `frontend/.env`。
   
   **關鍵設定 (backend/.env)**:
   ```env
   DATABASE_URL="postgresql://postgres1:admin5432@postgres:5432/student_attendance?schema=public"
   JWT_SECRET="your-secure-secret"
   ```

2. **使用 Docker Compose 啟動**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **資料庫遷移**
   在容器內執行 migration：
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

## 5. 故障排除 (Troubleshooting)

### 常見問題 Check List

1. **後端無法連線資料庫**
   - 檢查 `DATABASE_URL` 是否正確。我們已將使用者更新為 `postgres1`。
   - 確認 Docker 容器 `postgres` 正在執行 (`docker ps`)。

2. **登入失敗 (401 Unauthorized)**
   - 確認後端是否正確載入 `JWT_SECRET`。在開發模式下，請確保使用 `ts-node -r dotenv/config` 啟動。
   - 確認 `seed.ts` 是否執行成功，這些包含預設的 admin/teacher/student 帳號。

3. **前端無法呼叫 API**
   - 檢查前端 `.env` 中的 API URL 設定 (`NEXT_PUBLIC_API_URL` 或類似變數)。預設應指向 `http://localhost:3001`。
