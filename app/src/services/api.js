import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Party APIs
export const getParties = (params) => api.get('/parties', { params });
export const createParty = (data) => api.post('/parties', data);
export const getParty = (id) => api.get(`/parties/${id}`);
export const getPartyQuestionnaire = (id) => api.get(`/parties/${id}/questionnaire`);
export const updateParty = (id, data) => api.put(`/parties/${id}`, data);

// Questionnaire APIs
export const createQuestionnaire = (data) => api.post('/questionnaires', data);
export const getQuestionnaire = (id) => api.get(`/questionnaires/${id}`);
export const submitQuestionnaire = (id, data) => api.post(`/questionnaires/${id}/submit`, data);
export const updateQuestionnaire = (id, data) => api.put(`/questionnaires/${id}`, data);

// Verification APIs
export const getVerificationQueue = () => api.get('/verification/queue');
export const approveQuestionnaire = (id, data) => api.post(`/verification/${id}/approve`, data);
export const rejectQuestionnaire = (id, data) => api.post(`/verification/${id}/reject`, data);
export const reopenGate = (data) => api.post('/verification/reopen', data);

// Edit Request APIs
export const createEditRequest = (data) => api.post('/edit-requests', data);
export const getEditRequests = (params) => api.get('/edit-requests', { params });
export const getEditRequest = (id) => api.get(`/edit-requests/${id}`);
export const approveEditRequest = (id, data) => api.post(`/edit-requests/${id}/approve`, data);
export const rejectEditRequest = (id, data) => api.post(`/edit-requests/${id}/reject`, data);

// Amendment APIs
export const getAmendments = (params) => api.get('/amendments', { params });
export const getAmendment = (id) => api.get(`/amendments/${id}`);
export const makeAmendmentDecision = (id, data) => api.post(`/amendments/${id}/decision`, data);

// Seed API
export const seedData = () => api.post('/seed');

export default api;
