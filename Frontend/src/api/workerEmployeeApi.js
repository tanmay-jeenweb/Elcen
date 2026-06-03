import apiClient from "./authApi.js";

export const getWorkerEmployees = async (includeInactive = false) => {
    return apiClient.get("/worker-employees/all", {
        params: includeInactive ? { includeInactive: "true" } : {}
    });
};

export const getWorkerEmployeeById = async (id) => {
    return apiClient.get(`/worker-employees/${id}`);
};

export const createWorkerEmployee = async (data) => {
    return apiClient.post("/worker-employees/add", data);
};

export const updateWorkerEmployee = async (id, data) => {
    return apiClient.put(`/worker-employees/update/${id}`, data);
};

export const toggleWorkerEmployeeActive = async (id, active) => {
    return apiClient.patch(`/worker-employees/toggle/${id}`, { active });
};

export const deleteWorkerEmployee = async (id) => {
    return apiClient.delete(`/worker-employees/delete/${id}`);
};
