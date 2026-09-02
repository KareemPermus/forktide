import axios from 'axios';

const API_BASE_URL = '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const recipesApi = {
  list: () => apiClient.get('/api/recipes'),
  get: (id: number) => apiClient.get(`/api/recipes/${id}`),
  create: (data: any) => apiClient.post('/api/recipes', data),
  update: (id: number, data: any) => apiClient.put(`/api/recipes/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/recipes/${id}`),
};

export const groceryApi = {
  list: () => apiClient.get('/api/grocery-list'),
  add: (data: any) => apiClient.post('/api/grocery-list', data),
  update: (id: number, data: any) => apiClient.patch(`/api/grocery-list/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/grocery-list/${id}`),
  clearChecked: () => apiClient.delete('/api/grocery-list/clear-checked'),
  fromRecipe: (recipeId: number) => apiClient.post(`/api/grocery-list/from-recipe/${recipeId}`),
};

export default apiClient;