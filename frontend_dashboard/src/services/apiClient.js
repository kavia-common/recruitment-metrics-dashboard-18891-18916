import config from '../config';

/**
 * Lightweight API client built on fetch. Handles JSON requests/responses
 * and supports file uploads. All requests are prefixed with backendUrl from config.
 */
const defaultHeaders = {
  'Content-Type': 'application/json',
};

function buildUrl(path) {
  const base = config.backendUrl?.replace(/\/+$/, '') || '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

async function handleResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    if (isJson) {
      try {
        const err = await res.json();
        message = err.message || message;
      } catch {
        // ignore
      }
    } else {
      try {
        message = await res.text();
      } catch {
        // ignore
      }
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (isJson) {
    return res.json();
  }
  return res.text();
}

// PUBLIC_INTERFACE
export async function get(path) {
  const res = await fetch(buildUrl(path), {
    method: 'GET',
    headers: { ...defaultHeaders },
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function post(path, data) {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { ...defaultHeaders },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function put(path, data) {
  const res = await fetch(buildUrl(path), {
    method: 'PUT',
    headers: { ...defaultHeaders },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function del(path) {
  const res = await fetch(buildUrl(path), {
    method: 'DELETE',
    headers: { ...defaultHeaders },
  });
  return handleResponse(res);
}

// PUBLIC_INTERFACE
export async function uploadFile(path, file, fieldName = 'file') {
  const formData = new FormData();
  formData.append(fieldName, file);
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    // Let browser set multipart/form-data boundary; do not set Content-Type
    body: formData,
  });
  return handleResponse(res);
}
