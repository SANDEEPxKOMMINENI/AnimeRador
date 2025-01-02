import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function register(username: string, email: string, password: string) {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
}

export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function getProfile() {
  const response = await api.get('/auth/profile');
  return response.data;
}