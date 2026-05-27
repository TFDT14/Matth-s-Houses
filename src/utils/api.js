import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const quotesApi = {
  getNextNumber: ()         => api.get('/quotes/next-number'),
  getAll:        (params)   => api.get('/quotes', { params }),
  create:        (data)     => api.post('/quotes', data),
  updateStatus:  (id, statut) => api.patch(`/quotes/${id}/status`, { statut }),
};

export const mediaApi = {
  getAll:  (category) => api.get('/media', { params: category ? { category } : {} }),
  upload:  (form)     => api.post('/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  (id)       => api.delete(`/media/${encodeURIComponent(id)}`),
};

export default api;
