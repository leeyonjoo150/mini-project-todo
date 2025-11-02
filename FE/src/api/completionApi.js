import axios from './axios';

// 완료 기록 목록 조회
export const getAllCompletions = async () => {
  const response = await axios.get('/completions/');
  return response.data;
};

// 완료 처리
export const createCompletion = async (taskId) => {
  const response = await axios.post('/completions/', { task_id: taskId });
  return response.data;
};

// 완료 취소
export const deleteCompletion = async (id) => {
  const response = await axios.delete(`/completions/${id}/`);
  return response.data;
};

// 오늘 완료 여부 확인
export const checkCompletion = async (taskId) => {
  const response = await axios.get(`/completions/check/?task_id=${taskId}`);
  return response.data;
};

// 완료 히스토리
export const getCompletionHistory = async (taskId) => {
  const response = await axios.get(`/completions/history/?task_id=${taskId}`);
  return response.data;
};

// 주간 통계
export const getWeeklyStats = async (taskId) => {
  const response = await axios.get(`/completions/weekly_stats/?task_id=${taskId}`);
  return response.data;
};

// 월간 통계
export const getMonthlyStats = async (taskId) => {
  const response = await axios.get(`/completions/monthly_stats/?task_id=${taskId}`);
  return response.data;
};

// 연속 달성일 (Streak)
export const getStreak = async (taskId) => {
  const response = await axios.get(`/completions/streak/?task_id=${taskId}`);
  return response.data;
};
