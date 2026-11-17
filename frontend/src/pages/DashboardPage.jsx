import { useEffect, useState } from "react";
import { get } from "../api/client";

export default function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                const data = await get(
                    "/api/stock/summary"
                );

                setSummary(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    if (error) {
        return (
            <p style={{ color: "red" }}>
                {error}
            </p>
        );
    }

    return (
        <div>
            <h2>Dashboard</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginTop: "1rem"
                }}
            >
                <div
                    style={{
                        border: "1px solid #ddd",
                        padding: "1rem",
                        borderRadius: "8px"
                    }}
                >
                    <h3>Total Products</h3>
                    <p>
                        {summary?.activeProducts ?? 0}
                    </p>
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        padding: "1rem",
                        borderRadius: "8px"
                    }}
                >
                    <h3>Low Stock</h3>
                    <p>
                        {summary?.lowStockCount ?? 0}
                    </p>
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        padding: "1rem",
                        borderRadius: "8px"
                    }}
                >
                    <h3>Out of Stock</h3>
                    <p>
                        {summary?.outOfStockCount ?? 0}
                    </p>
                </div>
            </div>
        </div>
    );
}