const API_URL = "http://localhost:3000/api";

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            credentials: "include",
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(err.error || "Request failed");
        }
        return response.json();
    },
    post: async (endpoint, body) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(err.error || "Request failed");
        }
        return response.json();
    },
    patch: async (endpoint, body) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(err.error || "Request failed");
        }
        return response.json();
    },
    delete: async (endpoint) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(err.error || "Request failed");
        }
        return response.json();
    }
};
