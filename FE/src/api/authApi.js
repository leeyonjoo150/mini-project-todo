import axios from './axios';

// 회원가입
export const register = async (userData) => {
  const response = await axios.post('/users/register/', userData);
  return response.data;
};

// 로그인
export const login = async (credentials) => {
  const response = await axios.post('/users/login/', credentials);
  return response.data;
};

// 토큰 갱신
export const refreshToken = async (refreshToken) => {
  const response = await axios.post('/users/refresh/', { refresh: refreshToken });
  return response.data;
};

// 사용자 정보 조회
export const getCurrentUser = async () => {
  const response = await axios.get('/users/me/');
  return response.data;
};

// 로그아웃 (로컬 토큰 삭제)
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
