# Django REST Framework Todo Backend API

Django REST Framework 기반의 할 일 관리 백엔드 API입니다.

## 🔑 테스트 계정

### 관리자 계정 (Admin)
- **URL**: `http://127.0.0.1:8000/admin/`
- **Username**: `admin`
- **Password**: `test123!`

### 일반 사용자 계정
- **Username**: `admin1`
- **Password**: `test123!`

## 📋 프로젝트 개요

- **목적**: 학습용 + 포트폴리오
- **기술 스택**: Django 5.0.1 + DRF 3.14.0
- **인증**: JWT (djangorestframework-simplejwt)
- **문서화**: drf-spectacular (Swagger UI)
- **데이터베이스**: SQLite (개발용)
- **Python**: 3.12

## ✨ 주요 기능

### 1. 사용자 인증 (Users)
- 회원가입 & 자동 JWT 토큰 발급
- 로그인
- 토큰 갱신
- 사용자 정보 조회

### 2. 할 일 관리 (Tasks)
- 할 일 CRUD (생성/조회/수정/삭제)
- 4가지 할 일 타입 지원:
  - `once`: 한 번만 (마감일 지정)
  - `daily`: 매일 반복
  - `weekly`: 요일별 반복 (월/수/금 등)
  - `period`: 기간 지정 (시작일~종료일)
- 스마트 필터링:
  - 오늘 할 일
  - 이번 주 할 일
  - 마감 지난 할 일
  - 보관된 할 일
- 보관/복구 기능

### 3. 완료 기록 (Completions)
- 완료 처리 (하루에 한 번만 가능)
- 완료 취소
- 완료 여부 확인
- 통계:
  - 주간 완료율
  - 월간 완료율
  - 연속 달성일 (Streak)
  - 완료 히스토리

## 🏗️ 아키텍처

### Service 레이어 패턴
비즈니스 로직을 View에서 분리하여 재사용성과 테스트 용이성 향상

```
View → Service → Model
       ↓
   Serializer
```

### 3단계 검증 시스템
```
1. Model.clean()      # 기본 제약 조건
2. Serializer         # 필드별 검증 + 전체 검증
3. View (Service)     # 비즈니스 로직
```

### 앱 구조
```
BE/
├── config/           # 프로젝트 설정
├── users/            # 사용자 인증
├── tasks/            # 할 일 관리
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── services.py   # 비즈니스 로직
│   └── urls.py
├── completions/      # 완료 기록
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── services.py   # 비즈니스 로직
│   └── urls.py
└── manage.py
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
cd BE
```

### 2. Conda 가상환경 생성 및 활성화
```bash
conda create -n todo python=3.12
conda activate todo
```

### 3. 패키지 설치
```bash
pip install -r requirements.txt
```

### 4. 환경 변수 설정
`.env.example`을 복사하여 `.env` 파일 생성 (이미 생성되어 있음)

### 5. 데이터베이스 마이그레이션
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. 서버 실행
```bash
python manage.py runserver
```

서버가 `http://127.0.0.1:8000/`에서 실행됩니다.

### 7. API 문서 확인
브라우저에서 접속:
```
http://127.0.0.1:8000/api/schema/swagger-ui/
```

## 📡 API 엔드포인트

### Users (인증)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/users/register/` | 회원가입 |
| POST | `/api/users/login/` | 로그인 |
| POST | `/api/users/refresh/` | 토큰 갱신 |
| GET | `/api/users/me/` | 내 정보 조회 |

### Tasks (할 일)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/tasks/` | 할 일 목록 |
| POST | `/api/tasks/` | 할 일 생성 |
| GET | `/api/tasks/{id}/` | 할 일 상세 |
| PUT/PATCH | `/api/tasks/{id}/` | 할 일 수정 |
| DELETE | `/api/tasks/{id}/` | 할 일 삭제 |
| GET | `/api/tasks/today/` | 오늘 할 일 |
| GET | `/api/tasks/weekly/` | 이번 주 할 일 |
| GET | `/api/tasks/overdue/` | 마감 지난 할 일 |
| GET | `/api/tasks/archived/` | 보관된 할 일 |
| POST | `/api/tasks/{id}/archive/` | 할 일 보관 |
| POST | `/api/tasks/{id}/restore/` | 할 일 복구 |

### Completions (완료 기록)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/completions/` | 완료 기록 목록 |
| POST | `/api/completions/` | 완료 처리 |
| DELETE | `/api/completions/{id}/` | 완료 취소 |
| GET | `/api/completions/check/?task_id={id}` | 오늘 완료 여부 |
| GET | `/api/completions/history/?task_id={id}` | 완료 히스토리 |
| GET | `/api/completions/weekly_stats/?task_id={id}` | 주간 통계 |
| GET | `/api/completions/monthly_stats/?task_id={id}` | 월간 통계 |
| GET | `/api/completions/streak/?task_id={id}` | 연속 달성일 |

## 💡 사용 예시

### 1. 회원가입
```bash
POST /api/users/register/
{
  "username": "testuser",
  "email": "test@test.com",
  "password": "securepass123!",
  "password2": "securepass123!"
}
```

**응답:**
```json
{
  "message": "회원가입이 완료되었습니다.",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@test.com"
  }
}
```

### 2. 할 일 생성 (매일 반복)
```bash
POST /api/tasks/
Authorization: Bearer <access_token>

{
  "title": "운동하기",
  "description": "매일 30분 운동",
  "task_type": "daily",
  "priority": "high"
}
```

### 3. 할 일 생성 (요일별 반복)
```bash
POST /api/tasks/
Authorization: Bearer <access_token>

{
  "title": "영어 공부",
  "task_type": "weekly",
  "repeat_days": "Mon,Wed,Fri",
  "priority": "medium"
}
```

### 4. 오늘 할 일 조회
```bash
GET /api/tasks/today/
Authorization: Bearer <access_token>
```

**응답:**
```json
[
  {
    "id": 1,
    "title": "운동하기",
    "task_type": "daily",
    "priority": "high",
    "status": "active",
    "is_completed_today": false
  }
]
```

### 5. 완료 처리
```bash
POST /api/completions/
Authorization: Bearer <access_token>

{
  "task_id": 1
}
```

### 6. 주간 통계 조회
```bash
GET /api/completions/weekly_stats/?task_id=1
Authorization: Bearer <access_token>
```

**응답:**
```json
{
  "total_days": 7,
  "completed_days": 5,
  "completion_rate": 71.4,
  "dates": ["2025-10-20", "2025-10-21", "2025-10-22", "2025-10-23", "2025-10-24"]
}
```

## 🔐 인증

모든 API (회원가입/로그인 제외)는 JWT 인증이 필요합니다.

### Header 형식
```
Authorization: Bearer <access_token>
```

### 토큰 갱신
Access Token이 만료되면 Refresh Token으로 갱신:
```bash
POST /api/users/refresh/
{
  "refresh": "<refresh_token>"
}
```

## 🗄️ 데이터베이스 설계

### ERD
```
auth_user (Django 기본)
    ↓ 1:N
tasks_task
    ├─ task_type: once/daily/weekly/period
    ├─ priority: high/medium/low
    ├─ status: active/archived
    └─ repeat_days: "Mon,Wed,Fri"
    ↓ 1:N
completions_completion
    ├─ completed_date
    └─ UNIQUE(task, completed_date)  # 하루에 한 번만
```

## 🧪 테스트

### Admin 계정 생성
```bash
python manage.py createsuperuser
```

Admin 페이지: `http://127.0.0.1:8000/admin/`

### Swagger UI에서 테스트
1. `http://127.0.0.1:8000/api/schema/swagger-ui/` 접속
2. 회원가입 또는 로그인하여 토큰 받기
3. 우측 상단 "Authorize" 버튼 클릭
4. `Bearer <access_token>` 입력
5. 각 API 테스트

## 📦 의존성

주요 패키지:
- Django 5.0.1
- djangorestframework 3.14.0
- djangorestframework-simplejwt 5.3.1
- drf-spectacular 0.27.1
- django-cors-headers 4.3.1
- python-dotenv 1.0.1

전체 목록은 `requirements.txt` 참조

## 🌐 CORS 설정

프론트엔드 연동을 위해 CORS가 설정되어 있습니다.

`.env`에서 허용할 도메인 설정:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🎯 핵심 비즈니스 로직

### 오늘 할 일 필터링 (TaskService)

- **once**: `due_date`가 오늘인 것만
- **daily**: 항상 표시 (start_date/end_date로 기간 제한 가능)
- **weekly**: `repeat_days`에 오늘 요일이 포함된 것만
- **period**: `start_date ~ end_date` 범위 안에 오늘이 포함된 것만

### 완료 처리 (CompletionService)

- 같은 할 일은 하루에 한 번만 완료 가능 (DB unique constraint)
- `get_or_create`로 중복 방지
- 통계는 실시간 계산

## 📝 라이선스

이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.

## 👤 작성자

개발 기간: 2025년 10월

## 🔗 관련 링크

- [Django 공식 문서](https://docs.djangoproject.com/)
- [DRF 공식 문서](https://www.django-rest-framework.org/)
- [drf-spectacular 문서](https://drf-spectacular.readthedocs.io/)
