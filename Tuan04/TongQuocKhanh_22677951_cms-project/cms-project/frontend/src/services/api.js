import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  me:       ()               => api.get('/auth/me'),
  register: (data)           => api.post('/auth/register', data),
  users:    ()               => api.get('/auth/users'),
};

export const postsAPI = {
  list:   (params) => api.get('/posts', { params }),
  get:    (slug)   => api.get(`/posts/${slug}`),
  create: (data)   => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id)     => api.delete(`/posts/${id}`),
};

export const mediaAPI = {
  list:   (params) => api.get('/media', { params }),
  upload: (file)   => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/media/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/media/${id}`),
};

export default api;
