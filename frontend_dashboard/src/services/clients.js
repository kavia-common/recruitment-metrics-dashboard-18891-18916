import { get, post, put, del } from './apiClient';

// PUBLIC_INTERFACE
/**
 * Client service: CRUD operations for /clients
 */
export const ClientService = {
  list: () => get('/clients'),
  create: (payload) => post('/clients', payload),
  update: (id, payload) => put(`/clients/${id}`, payload),
  remove: (id) => del(`/clients/${id}`),
};
