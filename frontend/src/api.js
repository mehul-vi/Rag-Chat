import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// POST helper that turns any failure into an Error with a readable message
const post = async (url, body, fallbackMessage) => {
  try {
    const { data } = await api.post(url, body);
    return data;
  } catch (error) {
    const { error: detail, message } = error.response?.data ?? {};
    throw new Error(detail || message || fallbackMessage);
  }
};

// GET helper
const get = async (url, fallbackMessage) => {
  try {
    const { data } = await api.get(url);
    return data;
  } catch (error) {
    const { error: detail, message } = error.response?.data ?? {};
    throw new Error(detail || message || fallbackMessage);
  }
};

// PUT helper
const put = async (url, body, fallbackMessage) => {
  try {
    const { data } = await api.put(url, body);
    return data;
  } catch (error) {
    const { error: detail, message } = error.response?.data ?? {};
    throw new Error(detail || message || fallbackMessage);
  }
};

// DELETE helper
const del = async (url, fallbackMessage) => {
  try {
    const { data } = await api.delete(url);
    return data;
  } catch (error) {
    const { error: detail, message } = error.response?.data ?? {};
    throw new Error(detail || message || fallbackMessage);
  }
};

// Returns { documentId, fileName, totalPages, totalChunks }
export const uploadPdf = (file) => {
  const formData = new FormData();
  formData.append('pdf', file);
  return post('/pdf/upload', formData, 'Failed to upload PDF');
};

// Returns { answer, sources }
export const sendChatMessage = (question, documentId) =>
  post('/chat', { question, documentId }, 'Failed to generate answer');

// MongoDB History endpoints
export const fetchMongoHistory = (uid) =>
  get(`/history?uid=${encodeURIComponent(uid)}`, 'Failed to load chat history from MongoDB');

export const createMongoSession = (sessionData) =>
  post('/history', sessionData, 'Failed to save chat session to MongoDB');

export const updateMongoSession = (sessionId, sessionData) =>
  put(`/history/${sessionId}`, sessionData, 'Failed to update chat session in MongoDB');

export const deleteMongoSession = (sessionId) =>
  del(`/history/${sessionId}`, 'Failed to delete chat session from MongoDB');
