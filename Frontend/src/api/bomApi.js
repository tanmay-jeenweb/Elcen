import apiClient from './authApi.js';

export const createBOM = (data) => {
    return apiClient.post('/boms', data);
};

export const getBOMs = () => {
    return apiClient.get('/boms');
};

export const getBOMById = (id) => {
    return apiClient.get(`/boms/${id}`);
};

export const updateBOM = (id, data) => {
    return apiClient.put(`/boms/${id}`, data);
};

export const deleteBOM = (id) => {
    return apiClient.delete(`/boms/${id}`);
};
