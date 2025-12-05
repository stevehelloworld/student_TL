# 資料庫設計文件（DB_SCHEMA）

本文件說明學生出勤系統的主要資料表結構，使用 Sequelize ORM 與 PostgreSQL 資料庫。

---

## 主要資料表

### 1. users（使用者）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 使用者ID                     | NOT NULL                     |
| name                | VARCHAR(255)        | 姓名                         | NOT NULL                     |
| email               | VARCHAR(255)        | 電子郵件                     | 可為 NULL, UNIQUE, 格式驗證   |
| password            | VARCHAR(255)        | 密碼（雜湊後）               | NOT NULL                     |
| role                | ENUM                | 角色                         | 'admin'/'teacher'/'student' |
| status              | VARCHAR(50)         | 帳號狀態                     | 'pending'/'active'/'inactive'/'suspended' |
| phone               | VARCHAR(50)         | 電話                         | 可為 NULL, 電話格式驗證      |
| address             | TEXT                | 地址                         | 可為 NULL                    |
| line_id             | VARCHAR(100)        | Line ID                      | 可為 NULL                    |
| student_no          | VARCHAR(50)         | 學號                         | 可為 NULL, UNIQUE           |
| birth_date          | DATE                | 出生日期                     | 可為 NULL                    |
| last_login          | TIMESTAMP           | 最後登入時間                 | 可為 NULL                    |
| reset_password_token| VARCHAR(255)        | 重設密碼 Token              | 可為 NULL                    |
| reset_password_expires| TIMESTAMP        | 重設密碼 Token 過期時間      | 可為 NULL                    |
| created_by          | INTEGER (FK)        | 建立者ID                     | NOT NULL, 關聯 users.id      |
| updated_by          | INTEGER (FK)        | 最後更新者ID                 | 可為 NULL, 關聯 users.id     |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

**索引**：
- 唯一索引: email, student_no
- 索引: role, status, phone

### 2. student_parents（學生家長關係）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 關聯ID                      | NOT NULL                     |
| student_id          | INTEGER (FK)        | 學生ID                      | NOT NULL, 關聯 users.id      |
| parent_name         | VARCHAR(255)        | 家長姓名                     | NOT NULL                     |
| relationship        | VARCHAR(50)         | 關係（父/母/監護人等）       | NOT NULL                     |
| phone               | VARCHAR(50)         | 電話                         | 可為 NULL, 電話格式驗證      |
| email               | VARCHAR(255)        | 電子郵件                     | 可為 NULL, 格式驗證         |
| line_id             | VARCHAR(100)        | Line ID                      | 可為 NULL                    |
| is_primary          | BOOLEAN             | 是否為主要聯絡人             | NOT NULL, DEFAULT false      |
| address             | TEXT                | 地址                         | 可為 NULL                    |
| memo                | TEXT                | 備註                         | 可為 NULL                    |
| created_by          | INTEGER (FK)        | 建立者ID                     | NOT NULL, 關聯 users.id      |
| updated_by          | INTEGER (FK)        | 最後更新者ID                 | 可為 NULL, 關聯 users.id     |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

**索引**：
- 外鍵: student_id
- 唯一複合索引: (student_id, parent_name, relationship)

### 3. class_groups（班級）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 班級ID                      | NOT NULL                     |
| name                | VARCHAR(255)        | 班級名稱                     | NOT NULL                     |
| academic_year       | VARCHAR(20)         | 學年度                       | NOT NULL                     |
| semester            | VARCHAR(10)         | 學期                         | NOT NULL, 'fall'/'spring'/'summer' |
| class_teacher_id    | INTEGER (FK)        | 班級導師ID                   | 可為 NULL, 關聯 users.id    |
| status              | VARCHAR(20)         | 班級狀態                     | 'draft'/'active'/'completed'/'archived' |
| description         | TEXT                | 班級描述                     | 可為 NULL                    |
| created_by          | INTEGER (FK)        | 建立者ID                     | NOT NULL, 關聯 users.id      |
| updated_by          | INTEGER (FK)        | 更新者ID                     | 可為 NULL, 關聯 users.id     |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

**索引**：
- 外鍵: class_teacher_id
- 索引: academic_year, semester, status

### 4. courses（課程）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 課程ID                      | NOT NULL                     |
| class_group_id      | INTEGER (FK)        | 所屬班級ID                   | NOT NULL, 關聯 class_groups.id |
| name                | VARCHAR(255)        | 課程名稱                     | NOT NULL                     |
| description         | TEXT                | 課程描述                     | 可為 NULL                    |
| teacher_id          | INTEGER (FK)        | 預設授課教師ID               | NOT NULL, 關聯 users.id      |
| start_date          | DATE                | 開始日期                     | NOT NULL                     |
| end_date            | DATE                | 結束日期                     | NOT NULL                     |
| status              | VARCHAR(20)         | 課程狀態                     | 'draft'/'active'/'completed'/'cancelled' |
| created_by          | INTEGER (FK)        | 建立者ID                     | NOT NULL, 關聯 users.id      |
| updated_by          | INTEGER (FK)        | 更新者ID                     | 可為 NULL, 關聯 users.id     |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

**索引**：
- 外鍵: class_group_id, teacher_id
- 索引: status, start_date, end_date

### 5. sessions（課程場次）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 場次ID                      | NOT NULL                     |
| course_id           | INTEGER (FK)        | 所屬課程ID                   | NOT NULL, 關聯 courses.id    |
| session_date        | DATE                | 上課日期                     | NOT NULL                     |
| start_time          | TIME                | 開始時間                     | NOT NULL                     |
| end_time            | TIME                | 結束時間                     | NOT NULL                     |
| teacher_id          | INTEGER (FK)        | 該場次授課教師ID             | NOT NULL, 關聯 users.id      |
| substitute_teacher_id| INTEGER (FK)       | 代課教師ID                   | 可為 NULL, 關聯 users.id     |
| content             | TEXT                | 課程內容/進度                | 可為 NULL                    |
| status              | VARCHAR(20)         | 場次狀態                     | 'scheduled'/'completed'/'cancelled' |
| created_by          | INTEGER (FK)        | 建立者ID                     | NOT NULL, 關聯 users.id      |
| updated_by          | INTEGER (FK)        | 更新者ID                     | 可為 NULL, 關聯 users.id     |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

**索引**：
- 外鍵: course_id, teacher_id
- 索引: session_date, status

### 6. enrollments（課程註冊）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 註冊ID                      | NOT NULL                     |
| course_id           | INTEGER (FK)        | 課程ID                      | NOT NULL, 關聯 courses.id    |
| student_id          | INTEGER (FK)        | 學生ID                      | NOT NULL, 關聯 users.id      |
| status              | VARCHAR(20)         | 註冊狀態                     | 'active'/'dropped'/'completed' |
| created_by          | INTEGER (FK)        | 建立者ID                     | NOT NULL, 關聯 users.id      |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

**索引**：
- 唯一複合索引: (course_id, student_id)

### 7. attendance_records（出勤紀錄）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 紀錄ID                      | NOT NULL                     |
| session_id          | INTEGER (FK)        | 場次ID                      | NOT NULL, 關聯 sessions.id   |
| student_id          | INTEGER (FK)        | 學生ID                      | NOT NULL, 關聯 users.id      |
| status              | VARCHAR(20)         | 出勤狀態                     | 'present'/'absent'/'late'/'excused' |
| note                | TEXT                | 備註                         | 可為 NULL                    |
| created_by          | INTEGER (FK)        | 建立者ID                     | NOT NULL, 關聯 users.id      |
| updated_by          | INTEGER (FK)        | 更新者ID                     | 可為 NULL, 關聯 users.id     |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

**索引**：
- 唯一複合索引: (session_id, student_id)
- 索引: status

### 8. leave_requests（請假申請）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 申請ID                      | NOT NULL                     |
| student_id          | INTEGER (FK)        | 學生ID                      | NOT NULL, 關聯 users.id      |
| course_id           | INTEGER (FK)        | 課程ID                      | NOT NULL, 關聯 courses.id    |
| type                | VARCHAR(20)         | 請假類型                     | 'personal'/'sick'/'other'    |
| reason              | TEXT                | 請假原因                     | NOT NULL                     |
| status              | VARCHAR(20)         | 申請狀態                     | 'pending'/'approved'/'rejected'/'cancelled' |
| rejection_reason    | TEXT                | 拒絕原因                     | 可為 NULL                    |
| approved_by         | INTEGER (FK)        | 審核者ID                     | 可為 NULL, 關聯 users.id     |
| approved_at         | TIMESTAMP           | 審核時間                     | 可為 NULL                    |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

**索引**：
- 外鍵: student_id, course_id
- 索引: status, type

### 9. leave_request_sessions（請假場次關聯）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | ID                          | NOT NULL                     |
| leave_request_id    | INTEGER (FK)        | 請假申請ID                   | NOT NULL, 關聯 leave_requests.id |
| session_id          | INTEGER (FK)        | 場次ID                      | NOT NULL, 關聯 sessions.id   |

**索引**：
- 唯一複合索引: (leave_request_id, session_id)

### 10. notifications（系統通知）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 通知ID                      | NOT NULL                     |
| user_id             | INTEGER (FK)        | 接收者ID                     | NOT NULL, 關聯 users.id      |
| title               | VARCHAR(255)        | 標題                         | NOT NULL                     |
| content             | TEXT                | 內容                         | NOT NULL                     |
| type                | VARCHAR(50)         | 通知類型                     | 'attendance'/'leave'/'system' |
| is_read             | BOOLEAN             | 是否已讀                     | DEFAULT false                |
| read_at             | TIMESTAMP           | 讀取時間                     | 可為 NULL                    |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |

**索引**：
- 外鍵: user_id
- 索引: is_read, type, created_at

### 11. notification_templates（通知範本）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 範本ID                      | NOT NULL                     |
| code                | VARCHAR(50)         | 範本代碼                     | NOT NULL, UNIQUE             |
| name                | VARCHAR(100)        | 範本名稱                     | NOT NULL                     |
| title_template      | VARCHAR(255)        | 標題範本                     | NOT NULL                     |
| content_template    | TEXT                | 內容範本                     | NOT NULL                     |
| type                | VARCHAR(50)         | 通知類型                     | NOT NULL                     |
| created_at          | TIMESTAMP           | 建立時間                     | 自動產生                     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |

### 12. system_settings（系統設定）
| 欄位                | 型態                | 說明                         | 約束條件                     |
|---------------------|---------------------|------------------------------|------------------------------|
| id                  | SERIAL (PK)         | 設定ID                      | NOT NULL                     |
| key                 | VARCHAR(100)        | 設定鍵名                     | NOT NULL, UNIQUE             |
| value               | TEXT                | 設定值                       | 可為 NULL                    |
| description         | TEXT                | 設定描述                     | 可為 NULL                    |
| updated_by          | INTEGER (FK)        | 更新者ID                     | 可為 NULL, 關聯 users.id     |
| updated_at          | TIMESTAMP           | 更新時間                     | 自動更新                     |
