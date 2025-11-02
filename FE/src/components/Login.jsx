import { useState } from 'react';
import { login } from '../api/authApi';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(formData);

      // 토큰 저장
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);

      // 로그인 성공 콜백
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">로그인</h2>
          <p className="text-gray-600">Todo 앱에 오신 것을 환영합니다! 👋</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-xl mb-6 animate-slideIn">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              👤 사용자명
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="사용자명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-200"
          >
            {isLoading ? '🔄 로그인 중...' : '🚀 로그인'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-bold"
            >
              회원가입 ✨
            </button>
          </p>
        </div>

        <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-100">
          <p className="text-sm font-bold text-gray-700 mb-2">🔑 테스트 계정</p>
          <p className="text-sm text-gray-600">👤 Username: <span className="font-mono font-bold">admin1</span></p>
          <p className="text-sm text-gray-600">🔒 Password: <span className="font-mono font-bold">test123!</span></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
