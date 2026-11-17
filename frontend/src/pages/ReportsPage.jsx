import { useEffect, useState } from "react";
import { get } from "../api/client";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 20;

function money(value) {
    return `R ${Number(value).toFixed(2)}`;
}

function formatDate(value) {
    return value ? new Date(value).toLocaleString() : "Never";
}

function Generated({ report }) {
    return (
        <p className="report-footer">
            {report.title} · generated {formatDate(report.generatedAt)}
        </p>
    );
}

function Loading() {
    return <p className="muted">Loading report...</p>;
}

function Empty({ text }) {
    return <div className="card empty-state">{text}</div>;
}

const MOVEMENT_TONES = {
    RECEIVED: "badge-success",
    SALE: "badge-neutral",
    ADJUSTMENT: "badge-warning"
};

// ---------------------------------------------------------------
// Best Selling
// ---------------------------------------------------------------
function BestSellingReport() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [limit, setLimit] = useState("10");
    const [applied, setApplied] = useState({ from: "", to: "", limit: "10" });
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const params = new URLSearchParams({ limit: applied.limit || "10" });
            if (applied.from) params.append("from", applied.from);
            if (applied.to) params.append("to", applied.to);

            try {
                const data = await get(`/api/reports/best-selling?${params}`);
                if (!cancelled) {
                    setReport(data);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [applied]);

    // The top seller fills the whole bar; the others are a share of it
    const topUnits = report?.rows[0]?.unitsSold || 1;

    return (
        <div>
            <form
                className="card filter-bar"
                onSubmit={(e) => {
                    e.preventDefault();
                    setApplied({ from, to, limit });
                }}
            >
                <div>
                    <label>From</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div>
                    <label>To</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div>
                    <label>Top</label>
                    <input type="number" min="1" max="100" value={limit}
                        onChange={(e) => setLimit(e.target.value)} />
                </div>
                <button type="submit">Run report</button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {!report ? (
                <Loading />
            ) : report.rows.length === 0 ? (
                <Empty text="No sales in this period." />
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Product</th>
                                <th>Units sold</th>
                                <th className="cell-number">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.rows.map((row) => (
                                <tr key={row.productId}>
                                    <td>
                                        <span className={`rank rank-${row.rank}`}>{row.rank}</span>
                                    </td>
                                    <td>
                                        <div className="list-title">{row.productName}</div>
                                        <div className="list-meta">{row.productCode}</div>
                                    </td>
                                    <td>
                                        <div className="bar-cell">
                                            <div className="bar">
                                                <div
                                                    className="bar-fill"
                                                    style={{
                                                        width: `${(row.unitsSold / topUnits) * 100}%`
                                                    }}
                                                />
                                            </div>
                                            <span>{row.unitsSold}</span>
                                        </div>
                                    </td>
                                    <td className="cell-number">
                                        <strong>{money(row.revenue)}</strong>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {report && <Generated report={report} />}
        </div>
    );
}

// ---------------------------------------------------------------
// Slow Moving
// ---------------------------------------------------------------
function SlowMovingReport() {
    const [days, setDays] = useState("30");
    const [threshold, setThreshold] = useState("5");
    const [applied, setApplied] = useState({ days: "30", threshold: "5" });
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const params = new URLSearchParams({
                days: applied.days || "30",
                threshold: applied.threshold || "5"
            });

            try {
                const data = await get(`/api/reports/slow-moving?${params}`);
                if (!cancelled) {
                    setReport(data);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [applied]);

    return (
        <div>
            <form
                className="card filter-bar"
                onSubmit={(e) => {
                    e.preventDefault();
                    setApplied({ days, threshold });
                }}
            >
                <div>
                    <label>In the last (days)</label>
                    <input type="number" min="1" value={days}
                        onChange={(e) => setDays(e.target.value)} />
                </div>
                <div>
                    <label>Sold fewer than (units)</label>
                    <input type="number" min="1" value={threshold}
                        onChange={(e) => setThreshold(e.target.value)} />
                </div>
                <button type="submit">Run report</button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {!report ? (
                <Loading />
            ) : report.rows.length === 0 ? (
                <Empty text="No slow-moving products. Everything is selling." />
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th className="cell-number">In stock</th>
                                <th className="cell-number">Units sold</th>
                                <th>Last sale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.rows.map((row) => (
                                <tr key={row.productId}>
                                    <td>
                                        <div className="list-title">{row.productName}</div>
                                        <div className="list-meta">{row.productCode}</div>
                                    </td>
                                    <td>{row.categoryName}</td>
                                    <td className="cell-number">{row.currentStock}</td>
                                    <td className="cell-number">{row.unitsSold}</td>
                                    <td className={row.lastSaleDate ? "" : "muted"}>
                                        {formatDate(row.lastSaleDate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {report && <Generated report={report} />}
        </div>
    );
}

// ---------------------------------------------------------------
// Low Stock
// ---------------------------------------------------------------
function LowStockReport() {
    const [page, setPage] = useState(0);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const result = await get(
                    `/api/reports/low-stock?page=${page}&size=${PAGE_SIZE}`
                );
                if (!cancelled) {
                    setData(result);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [page]);

    return (
        <div>
            {error && <div className="error-message">{error}</div>}

            {!data ? (
                <Loading />
            ) : data.content.length === 0 ? (
                <Empty text="Nothing needs reordering." />
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th className="cell-number">In stock</th>
                                <th className="cell-number">Minimum</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.content.map((row) => (
                                <tr key={row.productId}>
                                    <td>
                                        <div className="list-title">{row.productName}</div>
                                        <div className="list-meta">{row.productCode}</div>
                                    </td>
                                    <td>{row.categoryName}</td>
                                    <td className="cell-number">{row.currentStock}</td>
                                    <td className="cell-number">{row.minimumStockLevel}</td>
                                    <td>
                                        <StatusBadge status={row.stockStatus} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={data.totalPages}
                    onPrevious={() => setPage((current) => current - 1)}
                    onNext={() => setPage((current) => current + 1)}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------------
// Stock Movements (audit trail)
// ---------------------------------------------------------------
function StockMovementsReport() {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [type, setType] = useState("");
    const [applied, setApplied] = useState({ from: "", to: "", type: "" });
    const [page, setPage] = useState(0);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const params = new URLSearchParams({
                page: String(page),
                size: String(PAGE_SIZE)
            });
            if (applied.from) params.append("from", applied.from);
            if (applied.to) params.append("to", applied.to);
            if (applied.type) params.append("type", applied.type);

            try {
                const result = await get(`/api/reports/stock-movements?${params}`);
                if (!cancelled) {
                    setData(result);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [applied, page]);

    return (
        <div>
            <form
                className="card filter-bar"
                onSubmit={(e) => {
                    e.preventDefault();
                    setPage(0);
                    setApplied({ from, to, type });
                }}
            >
                <div>
                    <label>From</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div>
                    <label>To</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
                <div>
                    <label>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">All</option>
                        <option value="RECEIVED">Received</option>
                        <option value="SALE">Sale</option>
                        <option value="ADJUSTMENT">Adjustment</option>
                    </select>
                </div>
                <button type="submit">Run report</button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {!data ? (
                <Loading />
            ) : data.content.length === 0 ? (
                <Empty text="No stock movements match." />
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Type</th>
                                <th className="cell-number">Change</th>
                                <th>By</th>
                                <th>Reference / reason</th>
                                <th>Sale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.content.map((row) => (
                                <tr key={row.stockMovementId}>
                                    <td className="nowrap">{formatDate(row.movementDate)}</td>
                                    <td>
                                        <div className="list-title">{row.productName}</div>
                                        <div className="list-meta">{row.productCode}</div>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                MOVEMENT_TONES[row.movementType] || "badge-neutral"
                                            }`}
                                        >
                                            {row.movementType.charAt(0) +
                                                row.movementType.slice(1).toLowerCase()}
                                        </span>
                                    </td>
                                    <td
                                        className={`cell-number ${
                                            row.quantityChange > 0 ? "text-success" : "text-danger"
                                        }`}
                                    >
                                        <strong>
                                            {row.quantityChange > 0 ? "+" : ""}
                                            {row.quantityChange}
                                        </strong>
                                    </td>
                                    <td>{row.userName}</td>
                                    <td className={row.reference || row.reason ? "" : "muted"}>
                                        {row.reference || row.reason || "-"}
                                    </td>
                                    <td>{row.saleId ? `#${row.saleId}` : <span className="muted">-</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={data.totalPages}
                    onPrevious={() => setPage((current) => current - 1)}
                    onNext={() => setPage((current) => current + 1)}
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------------
// The page with tabs
// ---------------------------------------------------------------
const TABS = [
    { key: "best", label: "Best selling" },
    { key: "slow", label: "Slow moving" },
    { key: "low", label: "Low stock" },
    { key: "movements", label: "Stock movements" }
];

export default function ReportsPage() {
    const [tab, setTab] = useState("best");

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Reports</h1>
                    <p className="page-subtitle">
                        See what sells, what doesn't, and every stock change.
                    </p>
                </div>
            </div>

            <div className="tabs">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        className={`tab ${tab === t.key ? "tab-active" : ""}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === "best" && <BestSellingReport />}
            {tab === "slow" && <SlowMovingReport />}
            {tab === "low" && <LowStockReport />}
            {tab === "movements" && <StockMovementsReport />}
        </div>
    );
}