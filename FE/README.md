# Todo 프론트엔드

React + Vite + Tailwind CSS v4로 구축된 Todo 애플리케이션 프론트엔드입니다.

## 🚀 기술 스택

- **React 18.3+**: UI 라이브러리
- **Vite 5.3+**: 빌드 도구 및 개발 서버
- **Tailwind CSS v4 (alpha)**: 유틸리티 우선 CSS 프레임워크
- **Axios 1.7+**: HTTP 클라이언트

## ✨ 주요 기능

### 인증
- 회원가입
- 로그인
- JWT 토큰 자동 갱신
- 로그아웃

### 할 일 관리
- 할 일 CRUD (생성/조회/수정/삭제)
- 4가지 할 일 타입:
  - **한 번만**: 마감일 지정
  - **매일**: 매일 반복
  - **요일별**: 특정 요일만 반복 (월/수/금 등)
  - **기간**: 시작일~종료일 지정
- 우선순위 설정 (높음/보통/낮음)
- 할 일 보관/복구

### 필터링
- 오늘 할 일
- 이번 주 할 일
- 마감 지난 할 일
- 전체 할 일
- 보관된 할 일

### 완료 관리
- 체크박스로 완료 처리
- 완료 취소 기능
- 하루에 한 번만 완료 가능

## 📁 프로젝트 구조

```
FE/
├── index.html              # 진입 HTML
├── vite.config.js          # Vite 설정 (Tailwind 포함)
├── package.json            # 의존성
├── src/
│   ├── main.jsx           # React 진입점
│   ├── index.css          # Tailwind CSS 임포트
│   ├── App.jsx            # 메인 App 컴포넌트
│   ├── api/
│   │   ├── axios.js       # Axios 인스턴스 (인터셉터 포함)
│   │   ├── authApi.js     # 인증 API
│   │   ├── taskApi.js     # 할 일 API
│   │   └── completionApi.js # 완료 기록 API
│   └── components/
│       ├── Login.jsx      # 로그인 폼
│       ├── Register.jsx   # 회원가입 폼
│       ├── Header.jsx     # 헤더 (로그아웃 버튼)
│       ├── TodoForm.jsx   # 할 일 추가/수정 폼
│       ├── TodoList.jsx   # 할 일 목록
│       └── TodoItem.jsx   # 개별 할 일 항목
└── public/                # 정적 에셋
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 백엔드 서버 실행

먼저 백엔드 서버가 실행 중이어야 합니다:

```bash
cd ../BE
python manage.py runserver
```

백엔드는 `http://127.0.0.1:8000`에서 실행되어야 합니다.

### 3. 프론트엔드 개발 서버 실행

```bash
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 5. 프로덕션 빌드 미리보기

```bash
npm run preview
```

## 🔌 API 연결

프론트엔드는 백엔드 API와 통신하기 위해 Axios를 사용합니다.

### API 기본 URL

`src/api/axios.js`에서 설정:

```javascript
baseURL: 'http://127.0.0.1:8000/api'
```

### 프록시 설정

개발 서버에서 CORS 문제를 피하기 위해 Vite 프록시를 사용합니다 (`vite.config.js`):

```javascript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  }
}
```

### 인증 토큰

- Access Token과 Refresh Token은 `localStorage`에 저장됩니다
- Axios 인터셉터가 자동으로 모든 요청에 토큰을 추가합니다
- 401 에러 발생 시 자동으로 토큰을 갱신합니다

## 🎨 스타일링 (Tailwind CSS v4)

이 프로젝트는 Tailwind CSS v4 (alpha)를 사용합니다.

### 주요 차이점

- `@tailwind` 지시문 대신 `@import "tailwindcss"` 사용 (`src/index.css`)
- `tailwind.config.js` 대신 Vite 플러그인을 통한 설정 (`vite.config.js`)
- CSS-in-JS와 같은 방식으로 Tailwind 클래스 사용

### 커스텀 스타일

`src/index.css`에서 전역 스타일을 추가할 수 있습니다.

## 📱 컴포넌트 설명

### Login / Register

- 사용자 인증을 처리하는 컴포넌트
- JWT 토큰을 localStorage에 저장
- 에러 메시지 표시

### Header

- 사용자 정보 표시
- 로그아웃 버튼

### TodoForm

- 할 일 추가/수정 폼
- task_type에 따라 다른 필드 표시
- 요일 선택 (weekly 타입)
- 날짜 선택 (once, period 타입)

### TodoItem

- 개별 할 일 표시
- 완료 체크박스
- 우선순위 및 타입 뱃지
- 수정/보관/삭제 버튼

### TodoList

- 할 일 목록을 표시하는 컨테이너
- 빈 상태 처리

## 🧪 테스트 계정

백엔드 README에 있는 테스트 계정을 사용할 수 있습니다:

- **Username**: `admin1`
- **Password**: `test123!`

또는 회원가입을 통해 새 계정을 만들 수 있습니다.

## 🐛 문제 해결

### Tailwind 스타일이 적용되지 않음

- `src/index.css`에 `@import "tailwindcss"`가 있는지 확인
- `vite.config.js`에 `@tailwindcss/vite` 플러그인이 포함되어 있는지 확인
- 개발 서버를 재시작하세요

### API 요청 실패

- 백엔드 서버가 `http://127.0.0.1:8000`에서 실행 중인지 확인
- 백엔드의 CORS 설정 확인
- 브라우저 개발자 도구의 Network 탭에서 요청 확인

### 로그인 후 토큰 에러

- localStorage를 확인하여 토큰이 저장되어 있는지 확인
- 토큰이 만료되었을 수 있으므로 다시 로그인하세요

## 📄 라이선스

이 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.

## 👤 작성자

개발 기간: 2025년 11월
