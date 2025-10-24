---
name: Django REST Todo Backend
description: Django REST Framework 기반 Todo 백엔드 API 개발 스킬. JWT 인증, Service 레이어 패턴, 반복 할 일 처리 로직 포함. 학습용 및 포트폴리오 프로젝트에 최적화.
---
# Django REST Framework Todo Backend Skill

## 프로젝트 개요

### 기본 정보
- **프로젝트명**: Django REST Todo API
- **목적**: 학습용 + 포트폴리오
- **개발 기간**: 1일 (8시간 목표)
- **난이도**: 중급

### 기술 스택
```yaml
Framework: Django 5.0.1 + DRF 3.14.0
Database: SQLite (개발용)
Authentication: JWT (djangorestframework-simplejwt)
Documentation: drf-spectacular (Swagger UI)
Testing: pytest + pytest-django
CORS: django-cors-headers
```

### 개발 철학
1. **API 문서 우선 개발**: drf-spectacular를 통한 OpenAPI 문서 기반 개발
2. **다층 검증 시스템**: Model Validator → Serializer → View 단계별 검증
3. **도메인 기반 설계**: 명확한 책임에 따른 앱 분리
4. **Service 레이어 패턴**: 비즈니스 로직과 View 분리

---

## 필수 패키지 (requirements.txt)

```txt
Django==5.0.1
djangorestframework==3.16.1
djangorestframework-simplejwt==5.5.1
drf-spectacular==0.28.0
python-dotenv==1.0.1
django-cors-headers==4.9.0
django-filter==25.2
Pillow==10.2.0
psycopg2-binary==2.9.9
django-ratelimit==4.1.0
pytest==7.4.4
pytest-django==4.7.0
pytest-cov==4.1.0
```

---

## 환경 변수 (.env.example)

```env
# Django 설정
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# 데이터베이스
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# JWT 설정
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1

# CORS 설정
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 프로젝트 구조

```
todo_project/
├── manage.py
├── requirements.txt
├── .env
├── .env.example
├── pytest.ini
├── config/                          # 프로젝트 설정
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── __init__.py
│   ├── users/                       # 👤 사용자 인증
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests.py
│   ├── tasks/                       # 📝 할 일 관리
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py              # ⭐ 비즈니스 로직
│   │   ├── validators.py
│   │   ├── urls.py
│   │   ├── admin.py
│   │   └── tests.py
│   └── completions/                 # ✅ 완료 기록
│       ├── __init__.py
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── services.py              # ⭐ 비즈니스 로직
│       ├── urls.py
│       ├── admin.py
│       └── tests.py
└── tests/                           # 통합 테스트
    ├── __init__.py
    └── test_integration.py
```

---

## 앱 구조 및 책임

### 1. users 앱 (사용자 인증)

**책임:**
- 회원가입
- 로그인 (JWT 토큰 발급)
- 토큰 갱신
- 사용자 프로필 조회

**주요 API:**
```
POST /api/users/register/     # 회원가입
POST /api/users/login/        # 로그인
POST /api/users/refresh/      # 토큰 갱신
GET  /api/users/me/           # 내 정보
```

**핵심 구현:**
- Django 기본 User 모델 사용
- djangorestframework-simplejwt로 JWT 인증
- 모든 비밀번호는 Django의 validate_password로 검증
- 회원가입 시 자동으로 JWT 토큰 발급

---

### 2. tasks 앱 (할 일 관리)

**책임:**
- 할 일 CRUD
- 반복 패턴 처리 (once/daily/weekly/period)
- 오늘/주간 할 일 필터링
- 상태 관리 (active/archived)

**주요 API:**
```
# 기본 CRUD
GET    /api/tasks/              # 전체 할 일
POST   /api/tasks/              # 할 일 생성
GET    /api/tasks/{id}/         # 할 일 상세
PUT    /api/tasks/{id}/         # 할 일 수정
PATCH  /api/tasks/{id}/         # 할 일 부분 수정
DELETE /api/tasks/{id}/         # 할 일 삭제

# 필터링
GET    /api/tasks/today/        # 오늘 할 일
GET    /api/tasks/weekly/       # 이번 주 할 일
GET    /api/tasks/overdue/      # 마감 지난 할 일
GET    /api/tasks/archived/     # 보관된 할 일

# 상태 관리
POST   /api/tasks/{id}/archive/ # 보관
POST   /api/tasks/{id}/restore/ # 복구
```

**핵심 구현:**
- **Service 레이어 패턴**: `TaskService` 클래스로 비즈니스 로직 분리
- `TaskService.get_today_tasks()`: 오늘 할 일 필터링
- `TaskService._should_show_today()`: 반복 패턴에 따른 표시 여부 판단
- 할 일 타입 (task_type):
  - `once`: 한 번만 (due_date가 오늘이면 표시)
  - `daily`: 매일 (항상 표시)
  - `weekly`: 요일별 (repeat_days에 오늘 요일이 포함되면 표시)
  - `period`: 기간 (start_date ~ end_date 사이면 표시)

---

### 3. completions 앱 (완료 기록)

**책임:**
- 완료 기록 생성/삭제
- 날짜별 완료 여부 확인
- 통계 계산 (완료율, 연속 달성일)

**주요 API:**
```
# 완료 관리
POST   /api/completions/                    # 완료 처리
DELETE /api/completions/{id}/               # 완료 취소
GET    /api/completions/?task_id={id}       # 완료 기록 조회

# 통계
GET    /api/completions/check/{task_id}/    # 오늘 완료 여부
GET    /api/completions/history/{task_id}/  # 완료 히스토리
GET    /api/completions/stats/{task_id}/    # 주간 통계
```

**핵심 구현:**
- **Service 레이어 패턴**: `CompletionService` 클래스
- `CompletionService.mark_complete()`: 완료 처리
- `CompletionService.is_completed_on_date()`: 특정 날짜 완료 확인
- `CompletionService.get_weekly_stats()`: 주간 완료율 계산
- `CompletionService.get_streak()`: 연속 달성일 계산
- **unique_together**: 같은 할 일은 하루에 한 번만 완료 가능

---

## 데이터베이스 설계

### ERD

```
┌─────────────────┐
│   auth_user     │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password        │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────────┐
│   tasks_task                │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK)                │
│ title                       │
│ description                 │
│ task_type                   │  ← once/daily/weekly/period
│ priority                    │  ← high/medium/low
│ status                      │  ← active/archived
│ repeat_days                 │  ← "Mon,Wed,Fri"
│ start_date                  │
│ end_date                    │
│ due_date                    │
│ created_at                  │
│ updated_at                  │
│ archived_at                 │
└─────────────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────────────┐
│   completions_completion     │
├──────────────────────────────┤
│ id (PK)                      │
│ task_id (FK)                 │
│ completed_date               │
│ completed_time               │
│ note                         │
│ created_at                   │
│ UNIQUE(task_id, completed_date) │  ← 하루 한 번만 완료
└──────────────────────────────┘
```

### Task 모델 필드 상세

```python
class Task(models.Model):
    # 관계
    user = ForeignKey(User)                    # 소유자
    
    # 기본 정보
    title = CharField(max_length=200)          # 제목 (필수)
    description = TextField(blank=True)        # 상세 설명
    
    # 타입 및 상태
    task_type = CharField                      # once/daily/weekly/period
    priority = CharField                       # high/medium/low
    status = CharField                         # active/archived
    
    # 반복 설정
    repeat_days = CharField                    # "Mon,Wed,Fri" 형태
    
    # 날짜
    start_date = DateField(null=True)          # 시작일
    end_date = DateField(null=True)            # 종료일
    due_date = DateField(null=True)            # 마감일
    
    # 메타 정보
    created_at = DateTimeField                 # 생성일시
    updated_at = DateTimeField                 # 수정일시
    archived_at = DateTimeField(null=True)     # 보관일시
```

### Completion 모델 필드 상세

```python
class Completion(models.Model):
    task = ForeignKey(Task)                    # 할 일
    completed_date = DateField                 # 완료 날짜
    completed_time = TimeField                 # 완료 시각
    note = TextField(blank=True)               # 메모
    created_at = DateTimeField                 # 생성일시
    
    # 제약 조건
    unique_together = ['task', 'completed_date']  # 하루 한 번만 완료
```

---

## 핵심 비즈니스 로직

### 1. 오늘 할 일 필터링 (TaskService)

**위치**: `apps/tasks/services.py`

**핵심 메서드**:
```python
TaskService.get_today_tasks(user)
    → 오늘 표시할 할 일 목록 반환

TaskService._should_show_today(task, today, weekday)
    → 특정 할 일을 오늘 보여줄지 판단
```

**로직**:
1. `once` 타입: `due_date == today`이면 표시
2. `daily` 타입: 항상 표시 (단, start_date/end_date 확인)
3. `weekly` 타입: `weekday in repeat_days`이면 표시
4. `period` 타입: `start_date <= today <= end_date`이면 표시

**예시**:
```python
# 데이터
Task(title="운동하기", task_type="daily")
Task(title="영어공부", task_type="weekly", repeat_days="Mon,Wed,Fri")
Task(title="회의", task_type="once", due_date="2024-01-20")

# 오늘이 2024-01-20 (토요일)
TaskService.get_today_tasks(user)
→ ["운동하기", "회의"]  # 영어공부는 토요일이라 제외
```

---

### 2. 완료 처리 (CompletionService)

**위치**: `apps/completions/services.py`

**핵심 메서드**:
```python
CompletionService.mark_complete(task, completed_date, note)
    → 완료 기록 생성

CompletionService.is_completed_on_date(task_id, check_date)
    → 특정 날짜 완료 여부 확인

CompletionService.get_weekly_stats(task_id)
    → 주간 완료율 계산
```

**로직**:
- 완료 처리: `Completion` 레코드 생성 (중복 방지: unique_together)
- 완료 확인: 해당 날짜에 `Completion` 레코드가 있는지 조회
- 통계: 최근 7일간 `Completion` 레코드 개수 계산

**예시**:
```python
# 완료 처리
CompletionService.mark_complete(task, date(2024, 1, 15))
→ Completion(task_id=1, completed_date='2024-01-15') 생성

# 오늘 완료 확인
CompletionService.is_completed_on_date(task_id=1, date.today())
→ True or False

# 주간 통계
CompletionService.get_weekly_stats(task_id=1)
→ {
    'total_days': 7,
    'completed_days': 5,
    'completion_rate': 71.4,
    'dates': ['2024-01-15', '2024-01-17', ...]
}
```

---

## Serializer 계층 구조

### Task Serializers

```python
TaskListSerializer          # 목록용 (간단)
    - id, title, task_type, priority, status
    - is_completed_today (SerializerMethodField)

TaskDetailSerializer        # 상세용 (통계 포함)
    - 모든 필드
    - is_completed_today
    - completion_count
    - completion_rate
    - streak (연속 달성일)

TaskCreateUpdateSerializer  # 생성/수정용 (검증 강화)
    - title, description, task_type, priority
    - repeat_days, start_date, end_date, due_date
    - validate(): 타입별 필수 필드 검증
```

### Completion Serializers

```python
CompletionSerializer        # 기본
    - id, task, completed_date, note
    - task_title, task_type (read_only)

CompletionCreateSerializer  # 생성용
    - task_id, completed_date, note
    - validate_task_id(): 권한 확인

CompletionStatsSerializer   # 통계용
    - total_days, completed_days, completion_rate, dates
```

---

## 검증 계층

### 3단계 검증 시스템

```
1단계: Model.clean()
    ↓ 기본 제약 조건 (날짜 범위, 필수 필드)
    
2단계: Serializer.validate_*()
    ↓ 필드별 검증
    
3단계: Serializer.validate()
    ↓ 전체 데이터 교차 검증
    
4단계: View (Service 호출)
    ↓ 비즈니스 로직 실행
```

### 검증 예시

**Task 생성 시**:
```python
# Serializer 검증
1. validate_title(): 공백 체크, 길이 체크
2. validate_repeat_days(): 올바른 요일 형식 체크
3. validate(): 
   - weekly 타입인데 repeat_days 없으면 에러
   - period 타입인데 start_date/end_date 없으면 에러
   - start_date > end_date면 에러
```

---

## API 설계 원칙

### 1. RESTful 규칙

```
GET     /api/tasks/              # 목록 조회
POST    /api/tasks/              # 생성
GET     /api/tasks/{id}/         # 상세 조회
PUT     /api/tasks/{id}/         # 전체 수정
PATCH   /api/tasks/{id}/         # 부분 수정
DELETE  /api/tasks/{id}/         # 삭제

# Custom Actions
GET     /api/tasks/today/        # @action(detail=False)
POST    /api/tasks/{id}/archive/ # @action(detail=True)
```

### 2. 응답 형식

**성공 (200/201)**:
```json
{
  "message": "성공 메시지",
  "data": { ... },
  "task": { ... }
}
```

**에러 (400/401/403/404)**:
```json
{
  "detail": "에러 메시지",
  "field_name": ["필드별 에러 메시지"]
}
```

### 3. 페이지네이션 (옵션)

```python
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}
```

---

## 인증 및 권한

### JWT 인증 흐름

```
1. 회원가입/로그인
   POST /api/users/login/
   → { "access": "...", "refresh": "..." }

2. API 요청
   GET /api/tasks/
   Headers: Authorization: Bearer <access_token>

3. 토큰 만료 시
   POST /api/users/refresh/
   Body: { "refresh": "<refresh_token>" }
   → { "access": "새토큰" }
```

### 권한 설정

```python
# 모든 ViewSet
permission_classes = [IsAuthenticated]

# 회원가입/로그인만
permission_classes = [AllowAny]
```

### 사용자별 데이터 분리

```python
# View에서
def get_queryset(self):
    return Task.objects.filter(user=self.request.user)

# Serializer 검증에서
def validate_task(self, value):
    if value.user != self.context['request'].user:
        raise ValidationError('권한이 없습니다.')
```

---

## 개발 단계별 가이드

### Phase 1: 프로젝트 세팅 (30분)

```bash
# 1. 프로젝트 생성
django-admin startproject config .

# 2. 앱 생성
python manage.py startapp apps.users
python manage.py startapp apps.tasks
python manage.py startapp apps.completions

# 3. 패키지 설치
pip install -r requirements.txt

# 4. settings.py 설정
- INSTALLED_APPS 추가
- REST_FRAMEWORK 설정
- SIMPLE_JWT 설정
- CORS 설정
- drf-spectacular 설정

# 5. .env 파일 생성
cp .env.example .env
```

**체크포인트**: `python manage.py runserver` 실행 성공

---

### Phase 2: Users 앱 구현 (1시간)

**순서**:
1. Serializers 작성
   - UserRegistrationSerializer
   - UserLoginSerializer
   - UserSerializer

2. Views 작성
   - UserRegistrationView
   - UserLoginView
   - UserProfileView

3. URLs 연결
   - `apps/users/urls.py`
   - `config/urls.py`에 포함

4. 테스트 (Swagger UI)
   - 회원가입 → 토큰 발급 확인
   - 로그인 → 토큰 발급 확인
   - 내 정보 조회 → 인증 필요 확인

**체크포인트**: Swagger에서 회원가입/로그인 성공

---

### Phase 3: Tasks 앱 구현 (2.5시간)

**순서**:
1. Models 작성
   - Task 모델
   - clean() 메서드로 검증

2. Serializers 작성
   - TaskListSerializer
   - TaskDetailSerializer
   - TaskCreateUpdateSerializer

3. Services 작성 ⭐
   - TaskService.get_today_tasks()
   - TaskService._should_show_today()
   - TaskService.get_weekly_tasks()

4. Views 작성
   - TaskViewSet (CRUD)
   - @action 메서드들 (today, weekly, archive, restore)

5. URLs 연결

6. Admin 등록 (선택)

7. 마이그레이션
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

8. 테스트 (Swagger UI)
   - 할 일 생성 (각 타입별)
   - 오늘 할 일 조회
   - 필터링 확인

**체크포인트**: 
- daily 타입 할 일이 today API에 나타남
- weekly 타입 할 일이 해당 요일에만 나타남

---

### Phase 4: Completions 앱 구현 (2시간)

**순서**:
1. Models 작성
   - Completion 모델
   - unique_together 설정

2. Serializers 작성
   - CompletionSerializer
   - CompletionCreateSerializer
   - CompletionStatsSerializer

3. Services 작성 ⭐
   - CompletionService.mark_complete()
   - CompletionService.is_completed_on_date()
   - CompletionService.get_weekly_stats()
   - CompletionService.get_streak()

4. Views 작성
   - CompletionViewSet
   - 통계 관련 @action 메서드들

5. URLs 연결

6. 마이그레이션

7. 테스트
   - 완료 처리
   - 중복 완료 방지 확인
   - 통계 확인

**체크포인트**:
- 같은 할 일을 같은 날짜에 두 번 완료 시도 → 에러
- 주간 통계가 정확하게 계산됨

---

### Phase 5: 통합 및 테스트 (1.5시간)

**시나리오 테스트**:
```
1. 회원가입
2. 로그인 (토큰 발급)
3. 매일 반복 할 일 생성
4. 요일별 할 일 생성 (월/수/금)
5. 오늘 할 일 조회 → 2개 나타남
6. 하나 완료 처리
7. 다시 오늘 할 일 조회 → is_completed_today: true 확인
8. 통계 조회
9. 내일 날짜로 다시 조회 → 자동으로 미완료 상태
```

**Swagger 문서 확인**:
- `/api/schema/swagger-ui/` 접속
- 모든 엔드포인트 문서화 확인
- Try it out으로 실제 호출 테스트

**CORS 테스트**:
- 프론트엔드에서 호출 가능한지 확인

---

### Phase 6: 마무리 (30분)

**배포 준비**:
1. requirements.txt 업데이트
   ```bash
   pip freeze > requirements.txt
   ```

2. .env.example 업데이트

3. README.md 작성
   - 프로젝트 소개
   - 설치 방법
   - API 문서 링크

4. Git 커밋
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Todo API"
   ```

---

## settings.py 핵심 설정

```python
# INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'corsheaders',
    'django_filters',
    
    # Local apps
    'apps.users',
    'apps.tasks',
    'apps.completions',
]

# MIDDLEWARE
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST_FRAMEWORK
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

# JWT
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True

# drf-spectacular
SPECTACULAR_SETTINGS = {
    'TITLE': 'Todo API',
    'DESCRIPTION': 'Django REST Framework 기반 Todo 백엔드 API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
```

---

## URL 라우팅 구조

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API
    path('api/users/', include('apps.users.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/completions/', include('apps.completions.urls')),
    
    # Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
```

```python
# apps/tasks/urls.py
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet

router = DefaultRouter()
router.register('', TaskViewSet, basename='task')

urlpatterns = router.urls
```

---

## 테스트 작성 가이드

### pytest 설정 (pytest.ini)

```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings
python_files = tests.py test_*.py *_tests.py
addopts = --cov=apps --cov-report=html
```

### 테스트 예시

```python
# apps/tasks/tests.py
import pytest
from django.contrib.auth.models import User
from apps.tasks.models import Task
from apps.tasks.services import TaskService
from datetime import date

@pytest.fixture
def user():
    return User.objects.create_user(username='testuser', password='testpass')

@pytest.fixture
def daily_task(user):
    return Task.objects.create(
        user=user,
        title='운동하기',
        task_type='daily'
    )

@pytest.mark.django_db
def test_daily_task_shows_today(user, daily_task):
    """매일 반복 할 일은 항상 오늘 할 일에 포함"""
    today_tasks = TaskService.get_today_tasks(user)
    assert daily_task in today_tasks

@pytest.mark.django_db
def test_weekly_task_shows_only_on_specified_days(user):
    """요일별 할 일은 해당 요일에만 표시"""
    task = Task.objects.create(
        user=user,
        title='영어공부',
        task_type='weekly',
        repeat_days='Mon,Wed,Fri'
    )
    
    today = date.today()
    weekday = today.strftime('%a')
    
    today_tasks = TaskService.get_today_tasks(user)
    
    if weekday in ['Mon', 'Wed', 'Fri']:
        assert task in today_tasks
    else:
        assert task not in today_tasks
```

---

## 주의사항 및 베스트 프랙티스

### 1. Service 레이어 사용

❌ **나쁜 예 (View에 로직 직접)**:
```python
class TaskViewSet(viewsets.ModelViewSet):
    @action(detail=False)
    def today(self, request):
        tasks = Task.objects.filter(user=request.user)
        result = []
        for task in tasks:
            if task.task_type == 'daily':
                result.append(task)
            # ... 복잡한 로직
        return Response(result)
```

✅ **좋은 예 (Service 레이어 사용)**:
```python
class TaskViewSet(viewsets.ModelViewSet):
    @action(detail=False)
    def today(self, request):
        tasks = TaskService.get_today_tasks(request.user)
        serializer = TaskListSerializer(tasks, many=True)
        return Response(serializer.data)
```

---

### 2. Serializer 선택

- **목록 조회**: 간단한 Serializer (성능)
- **상세 조회**: 풍부한 Serializer (통계 포함)
- **생성/수정**: 검증 강화 Serializer

```python
def get_serializer_class(self):
    if self.action == 'list':
        return TaskListSerializer
    elif self.action == 'retrieve':
        return TaskDetailSerializer
    return TaskCreateUpdateSerializer
```

---

### 3. 권한 체크

모든 ViewSet에서:
```python
def get_queryset(self):
    # 자신의 데이터만 조회
    return Task.objects.filter(user=self.request.user)
```

Serializer 검증에서:
```python
def validate_task(self, value):
    if value.user != self.context['request'].user:
        raise ValidationError('권한이 없습니다.')
    return value
```

---

### 4. N+1 쿼리 방지

```python
# ❌ 나쁜 예
tasks = Task.objects.all()
for task in tasks:
    print(task.user.username)  # 매번 DB 조회

# ✅ 좋은 예
tasks = Task.objects.select_related('user').all()
for task in tasks:
    print(task.user.username)  # 한 번에 조회
```

---

### 5. 검증 순서 지키기

```
Model.clean()           # 기본 제약 (DB 제약과 일치)
    ↓
Serializer.validate_*() # 필드별 검증
    ↓
Serializer.validate()   # 전체 검증
    ↓
View (Service)          # 비즈니스 로직
```

---

## 트러블슈팅

### 문제 1: CORS 에러

**증상**: 프론트엔드에서 API 호출 시 CORS 에러

**해결**:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # 프론트엔드 주소 추가
]
CORS_ALLOW_CREDENTIALS = True
```

---

### 문제 2: JWT 토큰 만료

**증상**: 401 Unauthorized

**해결**:
1. 프론트엔드에서 refresh 토큰으로 새 access 토큰 발급
2. 토큰 만료 시간 조정:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),  # 1시간으로 연장
}
```

---

### 문제 3: 반복 할 일이 제대로 안 나타남

**원인**: repeat_days 형식 오류

**확인**:
- 올바른 형식: `"Mon,Wed,Fri"` (쉼표로 구분, 대소문자 정확)
- 잘못된 형식: `"월,수,금"`, `"mon,wed,fri"`

**디버깅**:
```python
# TaskService._should_show_today()에 print 추가
print(f"task_type: {task.task_type}")
print(f"repeat_days: {task.repeat_days}")
print(f"weekday: {weekday}")
print(f"result: {weekday in task.repeat_days}")
```

---

### 문제 4: unique_together 제약 위반

**증상**: 같은 날 두 번 완료 시도 시 IntegrityError

**해결**:
- CompletionService.mark_complete()는 이미 처리됨 (get_or_create 사용)
- View에서 try-except로 처리하거나
- Serializer 검증에서 미리 확인

---

## 확장 아이디어

프로젝트 완성 후 추가할 수 있는 기능들:

1. **알림 기능**
   - 마감일 D-3, D-1 알림
   - 매일 아침 오늘 할 일 요약

2. **서브태스크**
   - 할 일 안에 작은 할 일들
   - Task 모델에 parent_task FK 추가

3. **태그 시스템**
   - Tag 모델 추가
   - ManyToMany 관계

4. **공유 기능**
   - 할 일을 다른 사용자와 공유
   - SharedTask 모델 추가

5. **통계 대시보드**
   - 월간/연간 완료율
   - 가장 많이 완료한 할 일
   - 생산성 그래프

6. **파일 첨부**
   - Task에 파일 업로드 (Pillow 사용)
   - FileField 추가

---

## 체크리스트

### 개발 완료 체크리스트

- [ ] 프로젝트 세팅 완료
- [ ] users 앱 구현 (회원가입/로그인)
- [ ] tasks 앱 구현 (CRUD + 필터링)
- [ ] completions 앱 구현 (완료 기록)
- [ ] Service 레이어 구현
- [ ] Swagger 문서 확인
- [ ] 시나리오 테스트 통과
- [ ] CORS 설정 완료
- [ ] README.md 작성
- [ ] Git 커밋

### 배포 전 체크리스트

- [ ] DEBUG=False 설정
- [ ] SECRET_KEY 변경
- [ ] ALLOWED_HOSTS 설정
- [ ] 정적 파일 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 환경 변수 설정

---

## 참고 자료

- [Django 공식 문서](https://docs.djangoproject.com/)
- [DRF 공식 문서](https://www.django-rest-framework.org/)
- [drf-spectacular 문서](https://drf-spectacular.readthedocs.io/)
- [JWT 인증 가이드](https://django-rest-framework-simplejwt.readthedocs.io/)

---

## 마무리

이 스킬 문서를 따라 개발하면:

✅ **학습 목표 달성**
- Django REST Framework 실전 경험
- Service 레이어 패턴 이해
- JWT 인증 구현
- API 설계 원칙 습득

✅ **포트폴리오 완성**
- 완전한 백엔드 API
- Swagger 문서화
- 체계적인 코드 구조
- 테스트 코드 포함

✅ **실무 준비**
- 앱 분리 설계
- 비즈니스 로직 분리
- 검증 계층 구조
- 에러 처리

**예상 개발 시간**: 6~8시간 (처음이면 +2시간)

화이팅! 🚀