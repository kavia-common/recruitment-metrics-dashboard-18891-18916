import { get, post, put, del } from './apiClient';

// PUBLIC_INTERFACE
/**
 * Interview service: CRUD operations for /interviews
 */
export const InterviewService = {
  list: () => get('/interviews'),
  create: (payload) => post('/interviews', payload),
  update: (id, payload) => put(`/interviews/${id}`, payload),
  remove: (id) => del(`/interviews/${id}`),
};
