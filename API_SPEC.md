# API 規格文件（API_SPEC）

本文件說明學生出勤系統主要 RESTful API 端點，所有 API 皆回傳 JSON。

> **更新日誌**  
> - 2025-06-19: 更新使用者管理 API，移除單獨的家長帳號，改為學生關聯家長資料
> - 2025-06-18: 新增學生家長管理相關 API 端點
> - 2025-06-15: 初版 API 規格文件

---

## API 權限說明
- Admin：系統管理員
- Teacher：教師
- Student：學生

---

## 認證 (Auth)

### POST /api/auth/login
- 權限：所有角色
- 說明：使用者登入
- 輸入：
  ```json
  {
    "name": "string, 必填",
    "password": "string, 必填"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "token": "JWT_TOKEN"
  }
  ```
- 錯誤回傳：
  ```json
  {
    "success": false,
    "error": "錯誤訊息"
  }
  ```

### GET /api/auth/me
- 權限：所有登入者
- 說明：取得目前登入者資訊
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "使用者名稱",
      "email": "user@example.com",
      "role": "student",
      "status": "active",
      "grade": 3,
      "school": "學校名稱",
      "student_no": "A12345"
    }
  }
  ```

---

## 使用者管理 (Users)

### GET /api/users
- 權限：Admin
- 說明：查詢所有使用者
- 查詢參數：
  - role: 過濾角色 (admin/teacher/student)
  - status: 過濾狀態 (active/inactive/suspended)
  - page: 頁碼 (預設 1)
  - limit: 每頁筆數 (預設 10)
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "學生A",
        "email": "student@example.com",
        "role": "student",
        "status": "active",
        "grade": 3,
        "school": "XX國中",
        "student_no": "A12345"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### POST /api/users
- 權限：Admin
- 說明：新增使用者
- 輸入：
  ```json
  {
    "name": "string, 必填",
    "email": "string, 必須是有效的電子郵件",
    "password": "string, 必填, 至少6個字元",
    "role": "string, 必填, 必須是 'admin'/'teacher'/'student'",
    "status": "string, 選填, 預設 'active'",
    "grade": "number, 選填, 學生年級",
    "school": "string, 選填, 學校名稱",
    "student_no": "string, 選填, 學號"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "id": 1
  }
  ```

### GET /api/users/:userId
- 權限：Admin, Teacher (僅限查詢自己班級的學生), Student (僅限查詢自己的資料)
- 說明：取得單一使用者詳細資料
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "學生A",
      "email": "student@example.com",
      "role": "student",
      "status": "active",
      "grade": 3,
      "school": "XX國中",
      "student_no": "A12345",
      "parent_name": "家長A",
      "parent_phone": "0912345678",
      "last_login": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### PUT /api/users/:userId
- 權限：Admin 或自己的資料
- 說明：更新使用者資料
- 輸入：
  ```json
  {
    "name": "string, 選填",
    "email": "string, 選填, 必須是有效的電子郵件",
    "password": "string, 選填, 至少6個字元",
    "status": "string, 選填, 必須是 'active'/'inactive'/'suspended'",
    "grade": "number, 選填, 學生年級",
    "school": "string, 選填, 學校名稱",
    "student_no": "string, 選填, 學號",
    "parent_name": "string, 選填, 家長姓名",
    "parent_phone": "string, 選填, 家長電話"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/users/:userId
- 權限：Admin
- 說明：刪除使用者
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### POST /api/users/:userId/reset-password
- 權限：Admin 或自己的帳號
- 說明：重設使用者密碼
- 輸入：
  ```json
  {
    "oldPassword": "string, 選填, 原密碼（非管理員必填）",
    "newPassword": "string, 必填, 新密碼"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

---

## 課程管理 (Courses)

### GET /api/courses
- 權限：所有登入使用者
- 說明：查詢課程列表（分頁）
- 查詢參數：
  - status: 過濾狀態 (draft/active/completed/cancelled)
  - teacherId: 過濾授課教師 ID
  - studentId: 過濾學生 ID（學生選修的課程）
  - search: 搜尋關鍵字 (課程名稱/描述)
  - page: 頁碼 (預設 1)
  - limit: 每頁筆數 (預設 10)
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "課程名稱",
        "description": "課程描述",
        "level": "L1",
        "teacher_id": 1,
        "teacher_name": "教師姓名",
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "status": "active",
        "student_count": 10
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### POST /api/courses
- 權限：Admin, Teacher
- 說明：建立新課程
- 輸入：
  ```json
  {
    "name": "string, 必填, 課程名稱",
    "description": "string, 選填, 課程描述",
    "level": "string, 選填, 課程等級",
    "start_date": "string, 選填, 開始日期 (YYYY-MM-DD)",
    "end_date": "string, 選填, 結束日期 (YYYY-MM-DD)",
    "status": "string, 選填, 狀態 (draft/active/completed/cancelled), 預設 draft"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "id": 1
  }
  ```

### GET /api/courses/:courseId
- 權限：所有登入使用者
- 說明：取得課程詳細資料
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "課程名稱",
      "description": "課程描述",
      "level": "L1",
      "teacher_id": 1,
      "teacher_name": "教師姓名",
      "start_date": "2023-01-01",
      "end_date": "2023-12-31",
      "status": "active",
      "students": [
        {
          "id": 1,
          "name": "學生姓名",
          "email": "student@example.com",
          "student_no": "A123456789"
        }
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### PUT /api/courses/:courseId
- 權限：Admin, 課程教師
- 說明：更新課程資料
- 輸入：同 POST /api/courses
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/courses/:courseId
- 權限：Admin, 課程教師
- 說明：刪除課程（軟刪除）
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### POST /api/courses/:courseId/enroll
- 權限：Admin, 課程教師
- 說明：學生選課
- 輸入：
  ```json
  {
    "student_ids": [1, 2, 3]
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/courses/:courseId/enroll/:studentId
- 權限：Admin, 課程教師
- 說明：學生退選
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

## 課程場次 (Sessions)

### GET /api/courses/:courseId/sessions
- 權限：所有登入使用者
- 說明：查詢課程場次（分頁）
- 查詢參數：
  - start_date: 開始日期 (YYYY-MM-DD)
  - end_date: 結束日期 (YYYY-MM-DD)
  - status: 過濾狀態 (scheduled/completed/cancelled)
  - page: 頁碼 (預設 1)
  - limit: 每頁筆數 (預設 10)
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "course_id": 1,
        "session_date": "2023-01-01",
        "start_time": "09:00:00",
        "end_time": "12:00:00",
        "teacher_id": 1,
        "teacher_name": "教師姓名",
        "content": "課程內容",
        "status": "scheduled",
        "attendance_count": 10,
        "total_students": 15
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### POST /api/courses/:courseId/sessions
- 權限：Admin, 課程教師
- 說明：建立課程場次
- 輸入：
  ```json
  {
    "session_date": "string, 必填, 上課日期 (YYYY-MM-DD)",
    "start_time": "string, 必填, 開始時間 (HH:mm:ss)",
    "end_time": "string, 必填, 結束時間 (HH:mm:ss)",
    "content": "string, 選填, 課程內容"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "id": 1
  }
  ```

### GET /api/sessions/:sessionId
- 權限：所有登入使用者
- 說明：取得場次詳細資料
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "course_id": 1,
      "course_name": "課程名稱",
      "session_date": "2023-01-01",
      "start_time": "09:00:00",
      "end_time": "12:00:00",
      "teacher_id": 1,
      "teacher_name": "教師姓名",
      "content": "課程內容",
      "status": "scheduled",
      "attendance_records": [
        {
          "student_id": 1,
          "student_name": "學生姓名",
          "status": "present",
          "note": "備註"
        }
      ]
    }
  }
  ```

### PUT /api/sessions/:sessionId
- 權限：Admin, 場次教師
- 說明：更新場次資料
- 輸入：
  ```json
  {
    "session_date": "string, 選填, 上課日期 (YYYY-MM-DD)",
    "start_time": "string, 選填, 開始時間 (HH:mm:ss)",
    "end_time": "string, 選填, 結束時間 (HH:mm:ss)",
    "teacher_id": "number, 選填, 教師 ID",
    "content": "string, 選填, 課程內容",
    "status": "string, 選填, 狀態 (scheduled/completed/cancelled)"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/sessions/:sessionId
- 權限：Admin, 場次教師
- 說明：刪除場次
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

## 出勤管理 (Attendance)

### GET /api/sessions/:sessionId/attendance
- 權限：所有登入使用者
- 說明：查詢場次出勤紀錄
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "student_id": 1,
        "student_name": "學生姓名",
        "student_no": "A123456789",
        "status": "present",
        "note": "備註",
        "updated_at": "2023-01-01T00:00:00.000Z",
        "updated_by": 1,
        "updater_name": "更新者姓名"
      }
    ]
  }
  ```

### POST /api/sessions/:sessionId/attendance
- 權限：Admin, 場次教師
- 說明：批次更新場次出勤紀錄
- 輸入：
  ```json
  {
    "attendance": [
      {
        "student_id": 1,
        "status": "present|absent|late|excused",
        "note": "string, 選填, 備註"
      }
    ]
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### PUT /api/sessions/:sessionId/attendance/:studentId
- 權限：Admin, 場次教師
- 說明：更新單一學生出勤紀錄
- 輸入：
  ```json
  {
    "status": "present|absent|late|excused",
    "note": "string, 選填, 備註"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/sessions/:sessionId/attendance/:studentId
- 權限：Admin, 場次教師
- 說明：刪除單一學生出勤紀錄（將出勤狀態設為未記錄）
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

## 學生家長管理 (Student Parents)

### GET /api/students/:studentId/parents
- 權限：Admin, 學生本人, 學生的教師
- 說明：取得學生的家長/監護人列表
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "student_id": 1,
        "name": "家長姓名",
        "relationship": "父親",
        "phone": "0912345678",
        "email": "parent@example.com",
        "line_id": "parent_line_id",
        "address": "通訊地址",
        "is_primary": true,
        "notes": "備註",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

### POST /api/students/:studentId/parents
- 權限：Admin, 學生本人, 學生的教師
- 說明：新增家長/監護人
- 輸入：
  ```json
  {
    "name": "string, 必填, 家長姓名",
    "relationship": "string, 必填, 與學生關係",
    "phone": "string, 必填, 聯絡電話",
    "email": "string, 選填, 電子郵件",
    "line_id": "string, 選填, Line ID",
    "address": "string, 選填, 通訊地址",
    "is_primary": "boolean, 選填, 是否為主要聯絡人",
    "notes": "string, 選填, 備註"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "id": 1
  }
  ```

### GET /api/students/:studentId/parents/:parentId
- 權限：Admin, 學生本人, 學生的教師
- 說明：取得單一家長/監護人資料
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "student_id": 1,
      "name": "家長姓名",
      "relationship": "父親",
      "phone": "0912345678",
      "email": "parent@example.com",
      "line_id": "parent_line_id",
      "address": "通訊地址",
      "is_primary": true,
      "notes": "備註",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### PUT /api/students/:studentId/parents/:parentId
- 權限：Admin, 學生本人, 學生的教師
- 說明：更新家長/監護人資料
- 輸入：
  ```json
  {
    "name": "string, 選填, 家長姓名",
    "relationship": "string, 選填, 與學生關係",
    "phone": "string, 選填, 聯絡電話",
    "email": "string, 選填, 電子郵件",
    "line_id": "string, 選填, Line ID",
    "address": "string, 選填, 通訊地址",
    "is_primary": "boolean, 選填, 是否為主要聯絡人",
    "notes": "string, 選填, 備註"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/students/:studentId/parents/:parentId
- 權限：Admin, 學生本人, 學生的教師
- 說明：刪除家長/監護人資料
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### PUT /api/students/:studentId/parents/:parentId/set-primary
- 權限：Admin, 學生本人, 學生的教師
- 說明：設定主要聯絡人
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

## 請假管理 (Leave Requests)

### GET /api/leave-requests
- 權限：所有登入使用者
- 說明：查詢請假申請列表（分頁）

### GET /api/leave-requests/:requestId
- 權限：申請人、相關教師、管理員
- 說明：取得單一請假申請詳情
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "student_id": 1,
      "student_name": "學生姓名",
      "course_id": 1,
      "course_name": "課程名稱",
      "session_ids": [1, 2],
      "sessions": [
        {
          "id": 1,
          "session_date": "2023-01-01",
          "start_time": "09:00:00",
          "end_time": "12:00:00"
        }
      ],
      "type": "sick",
      "reason": "身體不適",
      "status": "pending",
      "rejection_reason": null,
      "approved_by": null,
      "approver_name": null,
      "approved_at": null,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### PUT /api/leave-requests/:requestId
- 權限：申請人（限狀態為 pending 或 rejected）
- 說明：更新請假申請內容
- 輸入：
  ```json
  {
    "session_ids": [1, 2, 3],
    "type": "sick|personal",
    "reason": "請假原因"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1
    }
  }
  ```
- 查詢參數：
  - status: 過濾狀態 (pending/approved/rejected/cancelled)
  - type: 過濾類型 (personal/sick/other)
  - student_id: 過濾學生 ID
  - course_id: 過濾課程 ID
  - start_date: 開始日期 (YYYY-MM-DD)
  - end_date: 結束日期 (YYYY-MM-DD)
  - page: 頁碼 (預設 1)
  - limit: 每頁筆數 (預設 10)
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "student_id": 1,
        "student_name": "學生姓名",
        "course_id": 1,
        "course_name": "課程名稱",
        "type": "personal",
        "reason": "請假原因",
        "start_date": "2023-01-01",
        "end_date": "2023-01-01",
        "status": "approved",
        "approved_by": 2,
        "approver_name": "審核者姓名",
        "approved_at": "2023-01-01T00:00:00.000Z",
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### POST /api/leave-requests
- 權限：所有登入使用者
- 說明：申請請假
- 輸入：
  ```json
  {
    "course_id": "number, 必填, 課程 ID",
    "session_ids": "array, 必填, 場次 ID 陣列",
    "type": "string, 必填, 請假類型 (personal/sick/other)",
    "reason": "string, 必填, 請假原因"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "id": 1
  }
  ```

### PUT /api/leave-requests/:requestId/status
- 權限：Admin, 課程教師
- 說明：審核請假申請
- 輸入：
  ```json
  {
    "status": "approved|rejected",
    "rejection_reason": "string, 選填, 拒絕原因"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/leave-requests/:requestId
- 權限：Admin, 申請人
- 說明：取消請假申請
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

## 補課管理 (Make-up Sessions)

### GET /api/make-up-sessions
- 權限：所有登入使用者
- 說明：查詢補課安排列表（分頁）

### GET /api/make-up-sessions/:makeUpSessionId
- 權限：相關學生、教師、管理員
- 說明：取得單一補課安排詳情
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "original_session_id": 1,
      "make_up_session_id": 2,
      "student_id": 1,
      "student_name": "學生姓名",
      "course_id": 1,
      "course_name": "課程名稱",
      "original_date": "2023-01-01",
      "make_up_date": "2023-01-08",
      "status": "scheduled",
      "attendance_status": "present",
      "created_by": 2,
      "creator_name": "建立者姓名",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### PUT /api/make-up-sessions/:makeUpSessionId
- 權限：管理員、相關教師
- 說明：更新補課安排
- 輸入：
  ```json
  {
    "make_up_session_id": 3,
    "make_up_date": "2023-01-10",
    "status": "scheduled|completed|cancelled"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```
- 查詢參數：
  - status: 過濾狀態 (scheduled/completed/cancelled)
  - student_id: 過濾學生 ID
  - course_id: 過濾課程 ID
  - start_date: 開始日期 (YYYY-MM-DD)
  - end_date: 結束日期 (YYYY-MM-DD)
  - page: 頁碼 (預設 1)
  - limit: 每頁筆數 (預設 10)
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "original_session_id": 1,
        "make_up_session_id": 2,
        "student_id": 1,
        "student_name": "學生姓名",
        "course_id": 1,
        "course_name": "課程名稱",
        "original_date": "2023-01-01",
        "make_up_date": "2023-01-08",
        "status": "scheduled",
        "attendance_status": "present",
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### POST /api/make-up-sessions
- 權限：Admin, 課程教師
- 說明：安排補課
- 輸入：
  ```json
  {
    "original_session_id": "number, 必填, 原場次 ID",
    "student_id": "number, 必填, 學生 ID",
    "make_up_session_id": "number, 必填, 補課場次 ID"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "id": 1
  }
  ```

### PUT /api/make-up-sessions/:makeUpSessionId/attendance
- 權限：Admin, 場次教師
- 說明：記錄補課出席狀態
- 輸入：
  ```json
  {
    "status": "present|absent|late",
    "note": "string, 選填, 備註"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/make-up-sessions/:makeUpSessionId
- 權限：Admin, 課程教師
- 說明：取消補課安排
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```



---

## 通知系統 (Notifications)

### GET /api/notifications
- 權限：所有登入使用者
- 說明：取得使用者的通知列表
- 查詢參數：
  - read: 過濾已讀/未讀 (true/false)
  - type: 過濾通知類型
  - page: 頁碼 (預設 1)
  - limit: 每頁筆數 (預設 10)
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "type": "leave_approved",
        "title": "請假已核准",
        "message": "您的請假申請已核准",
        "is_read": false,
        "data": {
          "leave_id": 1,
          "session_id": 1,
          "course_id": 1
        },
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### PUT /api/notifications/:notificationId/read
- 權限：通知擁有者
- 說明：標記通知為已讀
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### PUT /api/notifications/read-all
- 權限：所有登入使用者
- 說明：標記所有通知為已讀
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/notifications/:notificationId
- 權限：通知擁有者
- 說明：刪除單一通知
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```

### DELETE /api/notifications
- 權限：所有登入使用者
- 說明：批次刪除通知
- 輸入：
  ```json
  {
    "ids": [1, 2, 3],
    "all_read": false
  }
  ```
  - `ids`: 要刪除的通知ID陣列
  - `all_read`: 是否刪除所有已讀通知
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "deleted_count": 3
    }
  }
  ```

### POST /api/notifications
- 權限：系統管理員
- 說明：發送系統廣播通知
- 輸入：
  ```json
  {
    "title": "系統維護通知",
    "message": "系統將於本週日進行維護，預計停機2小時。",
    "type": "system_announcement",
    "target_roles": ["student", "teacher"],
    "target_user_ids": [1, 2, 3],
    "data": {
      "related_id": 1,
      "related_type": "maintenance"
    }
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "notification_count": 150
    }
  }
  ```

## 其他

### GET /api/reports/attendance
- 說明：教師匯出出勤報表
- 輸入：{ course_id, date_range }
- 回傳：CSV 或 JSON

### GET /api/notifications/templates
- 權限：Admin
- 說明：取得通知範本列表
- 成功回傳：
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "code": "ATTENDANCE_ABSENT",
        "name": "缺席通知",
        "title_template": "課程缺席通知：{{course_name}}",
        "content_template": "親愛的 {{student_name}}，您於 {{date}} 的 {{course_name}} 課程缺席。",
        "type": "attendance"
      }
    ]
  }
  ```

### PUT /api/notifications/templates/:id
- 權限：Admin
- 說明：更新通知範本
- 輸入：
  ```json
  {
    "title_template": "string, 必填",
    "content_template": "string, 必填"
  }
  ```
- 成功回傳：
  ```json
  {
    "success": true
  }
  ```
