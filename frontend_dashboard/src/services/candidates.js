import { get, post, put, del } from './apiClient';

// PUBLIC_INTERFACE
/**
 * Candidate service: CRUD operations for /candidates
 */
export const CandidateService = {
  list: () => get('/candidates'),
  create: (payload) => post('/candidates', payload),
  update: (id, payload) => put(`/candidates/${id}`, payload),
  remove: (id) => del(`/candidates/${id}`),
};
