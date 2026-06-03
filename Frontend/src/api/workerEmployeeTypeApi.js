import apiClient from "./authApi.js";

export const getWorkerEmployeeTypes = async () => {
    return apiClient.get("/worker-employee-types/all");
};

export const createWorkerEmployeeType = async (data) => {
    return apiClient.post("/worker-employee-types/add", data);
};

export const updateWorkerEmployeeType = async (id, data) => {
    return apiClient.put(`/worker-employee-types/update/${id}`, data);
};

export const deleteWorkerEmployeeType = async (id) => {
    return apiClient.delete(`/worker-employee-types/delete/${id}`);
};
