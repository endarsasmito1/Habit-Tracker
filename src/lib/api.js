import { authClient } from "./auth-client";

const API_URL = "http://localhost:3000/api";

export const api = {
    get: async (endpoint) => {
        const { data, error } = await authClient.fetch(`${API_URL}${endpoint}`);
        if (error) throw error;
        return data;
    },
    post: async (endpoint, body) => {
        const { data, error } = await authClient.fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        });
        if (error) throw error;
        return data;
    },
    patch: async (endpoint, body) => {
        const { data, error } = await authClient.fetch(`${API_URL}${endpoint}`, {
            method: "PATCH",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        });
        if (error) throw error;
        return data;
    },
    delete: async (endpoint) => {
        const { data, error } = await authClient.fetch(`${API_URL}${endpoint}`, {
            method: "DELETE"
        });
        if (error) throw error;
        return data;
    }
};
