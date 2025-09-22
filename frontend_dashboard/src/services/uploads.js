import { uploadFile } from './apiClient';

// PUBLIC_INTERFACE
/**
 * Upload service: Excel upload to backend.
 */
export const UploadService = {
  excel: (file) => uploadFile('/uploads/excel', file, 'file'),
};
