import api from '../lib/api';

export const services = {
  getHealth: () => api.get('/health'),
  getProducts: (params?: Record<string, any>) => api.get('/products', { params }),
  getCategories: () => api.get('/categories'),
  getBrands: () => api.get('/brands'),
};
