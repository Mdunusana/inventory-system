const API_BASE_URL = "http://localhost:8080";

function getToken() {
    return sessionStorage.getItem("token");
}

export async function apiRequest(
    endpoint,
    options = {}
) {
    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

        if (response.status === 401) {
            sessionStorage.removeItem("token");

            window.location.href = "/login";

            throw new Error(
                "Your session has expired."
            );
        }

        const contentType =
            response.headers.get("content-type");

        let data = null;

        if (
            contentType &&
            contentType.includes("application/json")
        ) {
            data = await response.json();
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                    `Request failed (${response.status})`
            );
        }

        return data;
    } catch (error) {
        if (
            error.message === "Failed to fetch"
        ) {
            throw new Error(
                "Cannot reach the server. Is the backend running?"
            );
        }

        throw error;
    }
}

export function get(endpoint) {
    return apiRequest(endpoint);
}

export function post(endpoint, body) {
    return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
    });
}

export function patch(endpoint, body) {
    return apiRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body)
    });
}

export function put(endpoint, body) {
    return apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(body)
    });
}

export function remove(endpoint) {
    return apiRequest(endpoint, {
        method: "DELETE"
    });
}