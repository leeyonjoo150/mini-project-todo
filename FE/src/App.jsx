import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { getCurrentUser } from './api/authApi';
import {
  getTodayTasks,
  getWeeklyTasks,
  getOverdueTasks,
  getArchivedTasks,
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  archiveTask,
  restoreTask,
} from './api/taskApi';
import { createCompletion, deleteCompletion, checkCompletion } from './api/completionApi';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [filter, setFilter] = useState('today'); // today, weekly, overdue, archived, all
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // 할 일 목록 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated, filter]);

  const loadTasks = async () => {
    setIsLoading(true);
    setError('');

    try {
      let data;
      switch (filter) {
        case 'today':
          data = await getTodayTasks();
          break;
        case 'weekly':
          data = await getWeeklyTasks();
          break;
        case 'overdue':
          data = await getOverdueTasks();
          break;
        case 'archived':
          data = await getArchivedTasks();
          break;
        case 'all':
          data = await getAllTasks();
          break;
        default:
          data = await getTodayTasks();
      }
      setTasks(data);

      // 완료 상태 확인
      if (data.length > 0) {
        const completedIds = data
          .filter((task) => task.is_completed_today)
          .map((task) => task.id);
        setCompletedTaskIds(completedIds);
      }
    } catch (err) {
      setError('할 일을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setTasks([]);
  };

  const handleAddTask = async (taskData) => {
    try {
      await createTask(taskData);
      setShowForm(false);
      loadTasks();
    } catch (err) {
      setError('할 일 추가에 실패했습니다.');
    }
  };

  const handleEditTask = async (taskData) => {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setShowForm(false);
      loadTasks();
    } catch (err) {
      setError('할 일 수정에 실패했습니다.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (err) {
      setError('할 일 삭제에 실패했습니다.');
    }
  };

  const handleArchiveTask = async (taskId) => {
    try {
      await archiveTask(taskId);
      loadTasks();
    } catch (err) {
      setError('할 일 보관에 실패했습니다.');
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      await restoreTask(taskId);
      loadTasks();
    } catch (err) {
      setError('할 일 복구에 실패했습니다.');
    }
  };

  const handleToggleComplete = async (taskId, isCurrentlyCompleted) => {
    try {
      if (isCurrentlyCompleted) {
        // 완료 취소
        const task = tasks.find((t) => t.id === taskId);
        if (task && task.completion_id) {
          await deleteCompletion(task.completion_id);
          setCompletedTaskIds(completedTaskIds.filter((id) => id !== taskId));
        }
      } else {
        // 완료 처리
        await createCompletion(taskId);
        setCompletedTaskIds([...completedTaskIds, taskId]);
      }
      loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || '완료 상태 변경에 실패했습니다.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // 로딩 중
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onRegisterSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // 메인 앱
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header user={user} onLogout={handleLogout} />

      <div className="flex justify-center px-4 py-8">
        <main className="w-full max-w-4xl">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-xl mb-8 shadow-md animate-slideIn">
            <div className="flex items-center justify-between">
              <span className="font-medium">⚠️ {error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold text-xl">
                ×
              </button>
            </div>
          </div>
        )}

        {/* 필터 버튼 */}
        <div className="flex flex-wrap justify-center gap-3" style={{ marginTop: '60px' }}>
          <button
            onClick={() => setFilter('today')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              filter === 'today'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📅 오늘
          </button>
          <button
            onClick={() => setFilter('weekly')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              filter === 'weekly'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📆 이번 주
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              filter === 'overdue'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⏰ 지난 할 일
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 전체
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              filter === 'archived'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📦 보관함
          </button>
        </div>

        {/* 새 할 일 추가 버튼 */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-200"
            style={{ marginTop: '80px' }}
          >
            ✨ 새 할 일 추가
          </button>
        )}

        {/* 할 일 폼 */}
        {showForm && (
          <div className="animate-fadeIn" style={{ marginTop: '80px' }}>
            <TodoForm
              onSubmit={editingTask ? handleEditTask : handleAddTask}
              onCancel={handleCancelForm}
              initialData={editingTask}
            />
          </div>
        )}

        {/* 할 일 목록 */}
        {isLoading ? (
          <div className="text-center py-16" style={{ marginTop: '80px' }}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">로딩 중...</p>
          </div>
        ) : (
          <div className="animate-fadeIn" style={{ marginTop: '80px' }}>
            <TodoList
              tasks={tasks}
              completedTaskIds={completedTaskIds}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDeleteTask}
              onArchive={handleArchiveTask}
              onRestore={handleRestoreTask}
              emptyMessage={
                filter === 'today'
                  ? '오늘 할 일이 없습니다.'
                  : filter === 'archived'
                  ? '보관된 할 일이 없습니다.'
                  : '할 일이 없습니다.'
              }
            />
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

export default App;
