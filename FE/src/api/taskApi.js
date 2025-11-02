import axios from './axios';

// 모든 할 일 조회
export const getAllTasks = async () => {
  const response = await axios.get('/tasks/');
  return response.data;
};

// 오늘 할 일 조회
export const getTodayTasks = async () => {
  const response = await axios.get('/tasks/today/');
  return response.data;
};

// 이번 주 할 일 조회
export const getWeeklyTasks = async () => {
  const response = await axios.get('/tasks/weekly/');
  return response.data;
};

// 마감 지난 할 일 조회
export const getOverdueTasks = async () => {
  const response = await axios.get('/tasks/overdue/');
  return response.data;
};

// 보관된 할 일 조회
export const getArchivedTasks = async () => {
  const response = await axios.get('/tasks/archived/');
  return response.data;
};

// 할 일 상세 조회
export const getTask = async (id) => {
  const response = await axios.get(`/tasks/${id}/`);
  return response.data;
};

// 할 일 생성
export const createTask = async (taskData) => {
  const response = await axios.post('/tasks/', taskData);
  return response.data;
};

// 할 일 수정
export const updateTask = async (id, taskData) => {
  const response = await axios.patch(`/tasks/${id}/`, taskData);
  return response.data;
};

// 할 일 삭제
export const deleteTask = async (id) => {
  const response = await axios.delete(`/tasks/${id}/`);
  return response.data;
};

// 할 일 보관
export const archiveTask = async (id) => {
  const response = await axios.post(`/tasks/${id}/archive/`);
  return response.data;
};

// 할 일 복구
export const restoreTask = async (id) => {
  const response = await axios.post(`/tasks/${id}/restore/`);
  return response.data;
};
