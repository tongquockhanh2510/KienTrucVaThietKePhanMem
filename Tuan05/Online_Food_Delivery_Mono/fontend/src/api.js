import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'x-user-id': 'demo-user'
  }
});

export default api;
