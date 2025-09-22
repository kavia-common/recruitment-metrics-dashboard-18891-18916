import { get } from './apiClient';

// PUBLIC_INTERFACE
/**
 * Metrics service: fetch summary KPIs.
 */
export const MetricsService = {
  summary: () => get('/metrics/summary'),
};
