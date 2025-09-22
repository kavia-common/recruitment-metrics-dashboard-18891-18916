import { get } from './apiClient';

// PUBLIC_INTERFACE
/**
 * Notifications service: fetch notification list.
 */
export const NotificationsService = {
  list: () => get('/metrics/notifications'),
};
