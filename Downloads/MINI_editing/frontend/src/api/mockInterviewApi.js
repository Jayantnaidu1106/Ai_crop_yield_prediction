import api from '../config/axios';

export const createInterview = async (payload) => {
  const { data } = await api.post('/api/interview/create', payload);
  return data;
};

export const generateQuestions = async (payload) => {
  const { data } = await api.post('/api/interview/generate-questions', payload);
  return data;
};

export const startSession = async (payload) => {
  const { data } = await api.post('/api/interview/session/start', payload);
  return data;
};

export const saveTurn = async (payload) => {
  const { data } = await api.post('/api/interview/session/turn', payload);
  return data;
};

export const requestFeedback = async (payload) => {
  const { data } = await api.post('/api/interview/session/feedback', payload);
  return data;
};

export const getMyInterviews = async () => {
  const { data } = await api.get('/api/interview/my');
  return data;
};

export const getFeedback = async (interviewId) => {
  const { data } = await api.get(`/api/interview/feedback/${interviewId}`);
  return data;
};
