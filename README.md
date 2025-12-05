# 學生出缺勤系統 (Student Attendance Management System)

一個為學習機構設計的管理系統，用於追蹤學生的課程出席情況，並允許學生在同週次的相同課程間申請換班。

## 功能特色

- 🎓 **課程管理**: 建立和管理課程、場次、學生註冊
- 📊 **出勤記錄**: 記錄和查詢學生出勤狀況
- 🔄 **換班申請**: 學生可申請換到同週次的相同課程
- 👥 **使用者管理**: 支援管理員、教師、學生多角色權限
- 📈 **統計報表**: 產生各種出勤統計和報表
- 🔔 **通知系統**: 自動通知相關人員重要資訊

## 技術架構

### 前端
- **Next.js 14** - React 框架，支援 SSR/SSG
- **TypeScript** - 型別安全的 JavaScript
- **Tailwind CSS** - 實用優先的 CSS 框架
- **NextAuth.js** - 認證解決方案

### 後端
- **Node.js + Fastify** - 高效能的 Web 框架
- **TypeScript** - 型別安全的開發體驗
- **Prisma ORM** - 現代化的資料庫工具
- **PostgreSQL** - 關聯式資料庫
- **Redis** - 快取和 Session 儲存

### 開發工具
- **Docker Compose** - 容器化開發環境
- **Jest** - 測試框架
- **Playwright** - 端對端測試
- **ESLint + Prettier** - 程式碼品質工具

## 快速開始

### 前置需求

- Node.js 18+
- Docker 和 Docker Compose
- Git

### 安裝步驟

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd student-attendance-system
   ```

2. **設定環境變數**
   ```bash
   # 複製環境變數範例檔案
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # 編輯環境變數檔案，設定必要的配置
   ```

3. **啟動開發環境**
   ```bash
   # 使用 Docker Compose 啟動所有服務
   docker-compose up -d
   
   # 或者分別啟動各服務
   # 啟動資料庫和 Redis
   docker-compose up -d postgres redis
   
   # 安裝後端依賴並啟動
   cd backend
   npm install
   npm run db:generate
   npm run db:push
   npm run db:seed
   npm run dev
   
   # 安裝前端依賴並啟動
   cd ../frontend
   npm install
   npm run dev
   ```

4. **存取應用程式**
   - 前端: http://localhost:3000
   - 後端 API: http://localhost:3001
   - API 文件: http://localhost:3001/documentation (待實作)

### 預設帳號

開發環境會自動建立以下測試帳號：

- **管理員**: admin@example.com / admin123
- **教師**: teacher@example.com / teacher123  
- **學生**: student@example.com / student123

## 開發指南

### 專案結構

```
student-attendance-system/
├── frontend/                 # Next.js 前端應用
│   ├── src/
│   │   ├── app/             # App Router 頁面
│   │   ├── components/      # React 元件
│   │   ├── lib/            # 工具函數和配置
│   │   └── types/          # TypeScript 型別定義
│   ├── tests/              # Playwright 測試
│   └── package.json
├── backend/                  # Fastify 後端 API
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 業務邏輯服務
│   │   ├── middleware/     # 中介軟體
│   │   ├── utils/          # 工具函數
│   │   ├── types/          # TypeScript 型別
│   │   └── __tests__/      # Jest 測試
│   ├── prisma/             # Prisma 資料庫配置
│   └── package.json
├── docker/                   # Docker 相關配置
└── docker-compose.yml       # 開發環境配置
```

### 開發工作流程

1. **建立功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **開發和測試**
   ```bash
   # 後端測試
   cd backend
   npm run test
   npm run test:watch
   
   # 前端測試
   cd frontend
   npm run test
   npx playwright test
   ```

3. **程式碼品質檢查**
   ```bash
   # 後端
   cd backend
   npm run lint
   npm run format
   
   # 前端
   cd frontend
   npm run lint
   npm run type-check
   ```

4. **提交變更**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

### 資料庫管理

```bash
# 產生 Prisma Client
npm run db:generate

# 推送 schema 變更到資料庫
npm run db:push

# 建立和執行遷移
npm run db:migrate

# 重設資料庫並執行種子資料
npm run db:seed
```

### API 開發

API 路由位於 `backend/src/routes/` 目錄下，遵循 RESTful 設計原則：

- `GET /api/users` - 查詢使用者列表
- `POST /api/users` - 建立新使用者
- `PUT /api/users/:id` - 更新使用者
- `DELETE /api/users/:id` - 刪除使用者

### 測試策略

- **單元測試**: Jest 測試個別函數和服務
- **整合測試**: 測試 API 端點和資料庫互動
- **端對端測試**: Playwright 測試完整使用者流程

## 部署

### 生產環境部署

1. **建立生產環境配置**
   ```bash
   # 複製並編輯生產環境變數
   cp .env.example .env.production
   ```

2. **建立 Docker 映像**
   ```bash
   # 建立後端映像
   docker build -t student-attendance-backend ./backend
   
   # 建立前端映像
   docker build -t student-attendance-frontend ./frontend
   ```

3. **使用 Docker Compose 部署**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### 環境變數配置

詳細的環境變數說明請參考各目錄下的 `.env.example` 檔案。

## 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權

此專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 支援

如有問題或建議，請開啟 [Issue](../../issues) 或聯絡開發團隊。