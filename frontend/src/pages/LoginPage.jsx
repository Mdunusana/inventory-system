import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

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
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Invalid email or password"
                );
            }

            const data = await response.json();

            login(data.accessToken, {
                email,
                role: readRoleFromToken(data.accessToken)
            });

            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                maxWidth: "400px",
                margin: "4rem auto",
                padding: "2rem",
                border: "1px solid #ddd",
                borderRadius: "8px"
            }}
        >
            <h2>Login</h2>

            {error && (
                <div
                    style={{
                        color: "red",
                        marginBottom: "1rem"
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1rem" }}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                        style={{
                            width: "100%",
                            padding: "0.5rem"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                        style={{
                            width: "100%",
                            padding: "0.5rem"
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Signing in..."
                        : "Login"}
                </button>
            </form>
        </div>
    );
}