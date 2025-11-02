import { logout } from '../api/authApi';

function Header({ user, onLogout }) {
  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            ✨ My Todo
          </h1>
          <p className="text-sm text-purple-100 mt-1">
            안녕하세요, <span className="font-bold text-white">{user?.username}</span>님! 오늘도 화이팅! 💪
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-medium border border-white/30 hover:scale-105 duration-200"
        >
          🚪 로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;
