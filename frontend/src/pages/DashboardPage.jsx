import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get } from "../api/client";
import { useAuth } from "../auth/authContext";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";

function money(value) {
    return `R ${Number(value ?? 0).toFixed(2)}`;
}

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function StatCard({ label, value, sub, icon, tone }) {
    return (
        <div className="card stat-card">
            <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
                {sub && <div className="stat-sub">{sub}</div>}
            </div>
            <div className={`stat-icon tone-${tone}`}>
                <Icon name={icon} size={20} />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const [data, setData] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                // Ask for all three at the same time
                const [dashboard, low, sales] = await Promise.all([
                    get("/api/dashboard"),
                    get("/api/stock/low?size=5"),
                    isAdmin
                        ? get("/api/sales?size=5")
                        : Promise.resolve({ content: [] })
                ]);

                if (!cancelled) {
                    setData(dashboard);
                    setLowStock(low.content);
                    setRecentSales(sales.content);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [isAdmin]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!data) {
        return <p className="muted">Loading dashboard...</p>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>
                        {greeting()}
                        {user?.email ? `, ${user.email.split("@")[0]}` : ""}
                    </h1>
                    <p className="page-subtitle">
                        Here's how your shop is doing today.
                    </p>
                </div>

                <div className="header-actions">
                    <Link to="/stock" className="btn btn-secondary">
                        <Icon name="stock" size={16} />
                        Receive Stock
                    </Link>
                    <Link to="/sales/new" className="btn">
                        <Icon name="plus" size={16} />
                        New Sale
                    </Link>
                </div>
            </div>

            <div className="stat-grid">
                <StatCard
                    label="Sales today"
                    value={money(data.salesTodayTotal)}
                    sub={`${data.salesTodayCount} sale${data.salesTodayCount === 1 ? "" : "s"}`}
                    icon="money"
                    tone="success"
                />
                <StatCard
                    label="Active products"
                    value={data.activeProducts}
                    sub={`${data.unitsInStock} units in stock`}
                    icon="products"
                    tone="primary"
                />
                <StatCard
                    label="Low stock"
                    value={data.lowStockCount}
                    sub="At or below minimum"
                    icon="alert"
                    tone="warning"
                />
                <StatCard
                    label="Out of stock"
                    value={data.outOfStockCount}
                    sub="Cannot be sold"
                    icon="empty"
                    tone="danger"
                />
                <StatCard
                    label="Stock value"
                    value={money(data.inventoryValue)}
                    sub="Price x stock on hand"
                    icon="stock"
                    tone="primary"
                />
            </div>

            <div className="panel-grid">
                <div className="card">
                    <div className="panel-header">
                        <h2>Needs reordering</h2>
                        <Link to="/stock">View stock</Link>
                    </div>

                    {lowStock.length === 0 ? (
                        <div className="empty-state">
                            Everything is well stocked.
                        </div>
                    ) : (
                        lowStock.map((item) => (
                            <div key={item.productId} className="list-row">
                                <div>
                                    <div className="list-title">{item.productName}</div>
                                    <div className="list-meta">
                                        {item.productCode} · {item.currentStock} left
                                        (minimum {item.minimumStockLevel})
                                    </div>
                                </div>
                                <StatusBadge status={item.stockStatus} />
                            </div>
                        ))
                    )}
                </div>

                {isAdmin && (
                    <div className="card">
                        <div className="panel-header">
                            <h2>Recent sales</h2>
                            <Link to="/sales">View all</Link>
                        </div>

                        {recentSales.length === 0 ? (
                            <div className="empty-state">No sales yet.</div>
                        ) : (
                            recentSales.map((sale) => (
                                <div key={sale.saleId} className="list-row">
                                    <div>
                                        <div className="list-title">
                                            Sale #{sale.saleId}
                                        </div>
                                        <div className="list-meta">
                                            {new Date(sale.saleDate).toLocaleString()} ·{" "}
                                            {sale.soldBy}
                                        </div>
                                    </div>
                                    <strong>{money(sale.totalAmount)}</strong>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}