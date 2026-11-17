import { useEffect, useState } from "react";
import { get } from "../api/client";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 20;

const cellStyle = {
    padding: "0.5rem",
    borderBottom: "1px solid #ddd",
    textAlign: "left"
};

const filterStyle = {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: "1rem"
};

const inputStyle = {
    padding: "0.4rem",
    width: "auto",
    display: "block"
};

function money(value) {
    return `R ${Number(value).toFixed(2)}`;
}

function formatDate(value) {
    return value ? new Date(value).toLocaleString() : "Never";
}

function Generated({ report }) {
    return (
        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "1rem" }}>
            {report.title} - generated {formatDate(report.generatedAt)}
        </p>
    );
}

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

    return (
        <div>
            <form
                style={filterStyle}
                onSubmit={(e) => {
                    e.preventDefault();
                    setApplied({ from, to, limit });
                }}
            >
                <label>
                    From
                    <input type="date" value={from}
                        onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
                </label>
                <label>
                    To
                    <input type="date" value={to}
                        onChange={(e) => setTo(e.target.value)} style={inputStyle} />
                </label>
                <label>
                    Top
                    <input type="number" min="1" max="100" value={limit}
                        onChange={(e) => setLimit(e.target.value)} style={inputStyle} />
                </label>
                <button type="submit">Run Report</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!report ? (
                <p>Loading report...</p>
            ) : report.rows.length === 0 ? (
                <p>No sales in this period.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Rank</th>
                            <th style={cellStyle}>Product</th>
                            <th style={cellStyle}>Units Sold</th>
                            <th style={cellStyle}>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.rows.map((row) => (
                            <tr key={row.productId}>
                                <td style={cellStyle}>{row.rank}</td>
                                <td style={cellStyle}>
                                    {row.productCode} - {row.productName}
                                </td>
                                <td style={cellStyle}>{row.unitsSold}</td>
                                <td style={cellStyle}>{money(row.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                style={filterStyle}
                onSubmit={(e) => {
                    e.preventDefault();
                    setApplied({ days, threshold });
                }}
            >
                <label>
                    In the last (days)
                    <input type="number" min="1" value={days}
                        onChange={(e) => setDays(e.target.value)} style={inputStyle} />
                </label>
                <label>
                    Sold fewer than (units)
                    <input type="number" min="1" value={threshold}
                        onChange={(e) => setThreshold(e.target.value)} style={inputStyle} />
                </label>
                <button type="submit">Run Report</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!report ? (
                <p>Loading report...</p>
            ) : report.rows.length === 0 ? (
                <p>No slow-moving products. Everything is selling.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Product</th>
                            <th style={cellStyle}>Category</th>
                            <th style={cellStyle}>In Stock</th>
                            <th style={cellStyle}>Units Sold</th>
                            <th style={cellStyle}>Last Sale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.rows.map((row) => (
                            <tr key={row.productId}>
                                <td style={cellStyle}>
                                    {row.productCode} - {row.productName}
                                </td>
                                <td style={cellStyle}>{row.categoryName}</td>
                                <td style={cellStyle}>{row.currentStock}</td>
                                <td style={cellStyle}>{row.unitsSold}</td>
                                <td style={cellStyle}>{formatDate(row.lastSaleDate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!data ? (
                <p>Loading report...</p>
            ) : data.content.length === 0 ? (
                <p>Nothing needs reordering.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Product</th>
                            <th style={cellStyle}>Category</th>
                            <th style={cellStyle}>In Stock</th>
                            <th style={cellStyle}>Minimum</th>
                            <th style={cellStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.content.map((row) => (
                            <tr key={row.productId}>
                                <td style={cellStyle}>
                                    {row.productCode} - {row.productName}
                                </td>
                                <td style={cellStyle}>{row.categoryName}</td>
                                <td style={cellStyle}>{row.currentStock}</td>
                                <td style={cellStyle}>{row.minimumStockLevel}</td>
                                <td style={cellStyle}>
                                    <StatusBadge status={row.stockStatus} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                style={filterStyle}
                onSubmit={(e) => {
                    e.preventDefault();
                    setPage(0);
                    setApplied({ from, to, type });
                }}
            >
                <label>
                    From
                    <input type="date" value={from}
                        onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
                </label>
                <label>
                    To
                    <input type="date" value={to}
                        onChange={(e) => setTo(e.target.value)} style={inputStyle} />
                </label>
                <label>
                    Type
                    <select value={type}
                        onChange={(e) => setType(e.target.value)} style={inputStyle}>
                        <option value="">All</option>
                        <option value="RECEIVED">Received</option>
                        <option value="SALE">Sale</option>
                        <option value="ADJUSTMENT">Adjustment</option>
                    </select>
                </label>
                <button type="submit">Run Report</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!data ? (
                <p>Loading report...</p>
            ) : data.content.length === 0 ? (
                <p>No stock movements match.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Date</th>
                            <th style={cellStyle}>Product</th>
                            <th style={cellStyle}>Type</th>
                            <th style={cellStyle}>Change</th>
                            <th style={cellStyle}>By</th>
                            <th style={cellStyle}>Reference / Reason</th>
                            <th style={cellStyle}>Sale #</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.content.map((row) => (
                            <tr key={row.stockMovementId}>
                                <td style={cellStyle}>{formatDate(row.movementDate)}</td>
                                <td style={cellStyle}>
                                    {row.productCode} - {row.productName}
                                </td>
                                <td style={cellStyle}>{row.movementType}</td>
                                <td
                                    style={{
                                        ...cellStyle,
                                        fontWeight: "bold",
                                        color: row.quantityChange > 0 ? "#198754" : "#dc3545"
                                    }}
                                >
                                    {row.quantityChange > 0 ? "+" : ""}
                                    {row.quantityChange}
                                </td>
                                <td style={cellStyle}>{row.userName}</td>
                                <td style={cellStyle}>
                                    {row.reference || row.reason || "-"}
                                </td>
                                <td style={cellStyle}>{row.saleId ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
    { key: "best", label: "Best Selling" },
    { key: "slow", label: "Slow Moving" },
    { key: "low", label: "Low Stock" },
    { key: "movements", label: "Stock Movements" }
];

export default function ReportsPage() {
    const [tab, setTab] = useState("best");

    return (
        <div>
            <h1>Reports</h1>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            opacity: tab === t.key ? 1 : 0.6,
                            fontWeight: tab === t.key ? "bold" : "normal"
                        }}
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