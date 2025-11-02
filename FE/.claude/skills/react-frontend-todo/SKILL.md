---
name: todo-frontend
description: React + Vite + Tailwind CSS v4 기반의 Todo 애플리케이션 프론트엔드 개발 스킬. useState로 상태를 관리하고 Axios로 백엔드 API와 통신하는 완전한 CRUD 기능의 Todo 앱을 구축할 때 사용
---

# Todo 프론트엔드

Vite, Tailwind CSS v4, useState를 사용한 상태 관리, Axios를 사용한 API 통신으로 최신 React Todo 애플리케이션을 구축합니다.

## 빠른 시작

새로운 Todo 프론트엔드 프로젝트를 생성하려면:

1. `assets/react-vite-template/`의 보일러플레이트 템플릿을 작업 디렉토리로 복사
2. `src/api/axios.js`를 올바른 백엔드 API 기본 URL로 업데이트
3. `npm install`을 실행하여 의존성 설치
4. `npm run dev`를 실행하여 개발 서버 시작

템플릿에 포함된 내용:
- React가 사전 구성된 Vite
- Tailwind CSS v4 설정 (`@import "tailwindcss"` 사용)
- 인터셉터가 포함된 Axios 인스턴스
- 바로 사용 가능한 Todo API 함수들
- 기본 프로젝트 구조

## 기술 스택

- **React 18.3+**: 컴포넌트 라이브러리
- **Vite 5.3+**: 빌드 도구 및 개발 서버
- **Tailwind CSS v4 (alpha)**: 유틸리티 우선 CSS 프레임워크
- **Axios 1.7+**: API 요청을 위한 HTTP 클라이언트
- **useState**: 상태 관리를 위한 React 훅

**중요:** 이 스킬은 Tailwind CSS v4를 사용하며, v3와 설정이 다릅니다. 자세한 내용은 `references/tailwind-v4.md`를 참조하세요.

## 프로젝트 구조

```
project-root/
├── index.html              # 진입 HTML 파일
├── vite.config.js          # Vite + Tailwind 설정
├── package.json            # 의존성
├── src/
│   ├── main.jsx           # React 진입점
│   ├── index.css          # Tailwind 임포트: @import "tailwindcss"
│   ├── App.jsx            # 메인 App 컴포넌트
│   ├── api/
│   │   ├── axios.js       # Axios 인스턴스 설정
│   │   └── todoApi.js     # Todo API 함수들
│   └── components/
│       ├── TodoForm.jsx   # 새 todo 추가 폼
│       ├── TodoList.jsx   # Todo 목록
│       ├── TodoItem.jsx   # 개별 todo 항목
│       └── TodoFilter.jsx # 필터 컨트롤
└── public/                # 정적 에셋
```

## 핵심 워크플로우

### 1. 프로젝트 초기화

템플릿을 복사하고 의존성을 설치합니다:

```bash
cp -r assets/react-vite-template/* ./project-name/
cd project-name
npm install
```

### 2. API 연결 설정

`src/api/axios.js`를 백엔드 URL로 업데이트합니다:

```javascript
const instance = axios.create({
  baseURL: 'http://localhost:8080/api', // 이 부분을 업데이트하세요
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 3. 컴포넌트 구축

`references/component-patterns.md`의 패턴을 따라 컴포넌트를 생성합니다:

- **TodoForm**: 새 todo 생성을 위한 입력 폼
- **TodoList**: todo를 표시하는 컨테이너
- **TodoItem**: 편집/삭제 액션이 있는 개별 todo
- **TodoFilter**: todo 필터링을 위한 컨트롤 (전체/진행중/완료)

### 4. 상태 관리 구현

App.jsx에서 `useState`를 사용하여 다음을 관리합니다:
- Todo 목록 데이터
- 필터 상태 (전체/진행중/완료)
- 로딩 상태
- 에러 상태

예시:

```jsx
function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 마운트 시 todo 로드
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const data = await todoApi.getAllTodos();
        setTodos(data);
      } catch (err) {
        setError('Todo를 불러오는데 실패했습니다');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  // 현재 필터를 기반으로 todo 필터링
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Todo 앱</h1>
        {error && <ErrorMessage message={error} />}
        <TodoForm onAdd={handleAdd} />
        <TodoFilter filter={filter} onFilterChange={setFilter} />
        <TodoList todos={filteredTodos} onUpdate={handleUpdate} onDelete={handleDelete} />
      </div>
    </div>
  );
}
```

### 5. CRUD 작업 구현

`src/api/todoApi.js`의 API 함수들을 사용합니다:

```jsx
// 생성
const handleAdd = async (todoData) => {
  try {
    const newTodo = await todoApi.createTodo(todoData);
    setTodos([...todos, newTodo]);
  } catch (err) {
    setError('Todo 추가에 실패했습니다');
  }
};

// 수정
const handleUpdate = async (id, todoData) => {
  try {
    const updated = await todoApi.updateTodo(id, todoData);
    setTodos(todos.map((todo) => (todo.id === id ? updated : todo)));
  } catch (err) {
    setError('Todo 업데이트에 실패했습니다');
  }
};

// 삭제
const handleDelete = async (id) => {
  try {
    await todoApi.deleteTodo(id);
    setTodos(todos.filter((todo) => todo.id !== id));
  } catch (err) {
    setError('Todo 삭제에 실패했습니다');
  }
};
```

### 6. Tailwind CSS v4로 스타일링

JSX에서 Tailwind 유틸리티 클래스를 직접 적용합니다:

```jsx
<button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300">
  Todo 추가
</button>
```

**v4의 주요 차이점:**
- `@tailwind` 지시문 대신 `@import "tailwindcss"` 사용
- `tailwind.config.js` 대신 Vite 플러그인을 통한 설정
- 전체 가이드는 `references/tailwind-v4.md` 참조

## 개발 워크플로우

1. 개발 서버 시작: `npm run dev`
2. 프로덕션 빌드: `npm run build`
3. 프로덕션 빌드 미리보기: `npm run preview`

## 일반적인 패턴

### 로딩 상태

```jsx
if (isLoading) {
  return <div className="text-center py-8">로딩중...</div>;
}
```

### 에러 처리

```jsx
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    {error}
  </div>
)}
```

### 빈 상태

```jsx
{todos.length === 0 && (
  <div className="text-center py-8 text-gray-500">
    아직 todo가 없습니다. 하나를 만들어 시작하세요!
  </div>
)}
```

## 참고 자료

- **API 명세**: 전체 Todo 백엔드 API 문서는 `references/api-spec.md` 참조
- **컴포넌트 패턴**: 상세한 React 컴포넌트 예제는 `references/component-patterns.md` 참조
- **Tailwind v4 가이드**: Tailwind CSS v4 관련 정보는 `references/tailwind-v4.md` 참조

## 문제 해결

**Tailwind 스타일이 작동하지 않음:**
- `src/index.css`에 `@import "tailwindcss"`가 있는지 확인
- `vite.config.js`에 `@tailwindcss/vite` 플러그인이 포함되어 있는지 확인
- 설정 변경 후 개발 서버 재시작

**API 요청 실패:**
- 백엔드가 설정된 URL에서 실행 중인지 확인
- 백엔드의 CORS 설정 확인
- 브라우저 DevTools의 네트워크 탭 확인

**상태가 업데이트되지 않음:**
- 기존 배열/객체를 변경하지 않고 새 배열/객체를 생성하고 있는지 확인
- 스프레드 연산자 또는 새 배열을 반환하는 배열 메서드 사용