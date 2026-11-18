// Where the backend lives.
// - On your laptop (npm run dev) the backend runs separately on port 8080.
// - Online, the backend serves these screens itself, so the address is the
//   same website and we only need the path (e.g. "/api/products").
// You can override it by setting VITE_API_URL before building.
export const API_BASE_URL =
    import.meta.env.VITE_API_URL ??
    (import.meta.env.DEV ? "http://localhost:8080" : "");

// Friendly messages when the server does not send its own
const STATUS_MESSAGES = {
    403: "You do not have permission to do that.",
    404: "That item could not be found. It may have been removed.",
    500: "Something went wrong on the server. Please try again."
};

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
            // "Validation failed" is vague: show the first field's reason instead
            const fieldMessages = data?.fieldErrors
                ? Object.values(data.fieldErrors)
                : [];

            const message =
                fieldMessages[0] ||
                (response.status < 500 && data?.message) ||
                STATUS_MESSAGES[response.status] ||
                `Request failed (${response.status})`;

            const error = new Error(message);
            error.status = response.status;
            error.fieldErrors = data?.fieldErrors || null;
            throw error;
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