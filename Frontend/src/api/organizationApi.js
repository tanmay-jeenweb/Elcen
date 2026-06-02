import apiClient from './authApi.js';

export const getOrganizationDetails = () => {
    return apiClient.get('/organization-details');
};

export const upsertOrganizationDetails = (data) => {
    return apiClient.post('/organization-details', data);
};
