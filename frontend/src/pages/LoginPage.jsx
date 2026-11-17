import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Icon from "../components/Icon";

// The middle part of a JWT holds the user's details, encoded in base64.
// We only read it to decide what to SHOW; the backend still checks every request.
function readRoleFromToken(token) {
    try {
        const payload = token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        return JSON.parse(atob(payload)).role ?? null;
    } catch {
        return null;
    }
}

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                }
            );

            if (!response.ok) {
                throw new Error("Invalid email or password");
            }

            const data = await response.json();

            login(data.accessToken, {
                email,
                role: readRoleFromToken(data.accessToken)
            });

            navigate("/");
        } catch (err) {
            setError(
                err.message === "Failed to fetch"
                    ? "Cannot reach the server. Is the backend running?"
                    : err.message
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <div className="brand">
                    <div className="brand-logo">
                        <Icon name="products" size={20} />
                    </div>
                    <div>
                        <div className="brand-name">Retail Inventory</div>
                        <div className="brand-tagline">Stock & Sales Manager</div>
                    </div>
                </div>

                <h1>Welcome back</h1>
                <p className="muted" style={{ marginBottom: "1.5rem" }}>
                    Sign in to manage stock and record sales.
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" className="full-width" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}