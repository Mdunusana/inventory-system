import { useCallback, useEffect, useState } from "react";
import { get } from "../api/client";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

function money(value) {
    return `R ${Number(value).toFixed(2)}`;
}

function formatDate(value) {
    return new Date(value).toLocaleString();
}

// "COMPLETED" -> "Completed"
function nice(text) {
    if (!text) return "";
    return text.charAt(0) + text.slice(1).toLowerCase();
}

export default function SalesHistoryPage() {
    const [sales, setSales] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selected, setSelected] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadSales = useCallback(async () => {
        try {
            const data = await get(
                `/api/sales?page=${page}&size=${PAGE_SIZE}`
            );
            setSales(data.content);
            setTotalPages(data.totalPages);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    // Load one sale's full details (with its items)
    async function viewSale(saleId) {
        setDetailLoading(true);
        setError("");

        try {
            const sale = await get(`/api/sales/${saleId}`);
            setSelected(sale);
        } catch (err) {
            setError(err.message);
        } finally {
            setDetailLoading(false);
        }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Sales History</h1>
                    <p className="page-subtitle">
                        Every completed sale. Click a sale to see what was sold.
                    </p>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className={selected ? "sale-layout" : ""}>
                <div>
                    {loading ? (
                        <p className="muted">Loading sales...</p>
                    ) : sales.length === 0 ? (
                        <div className="card empty-state">No sales recorded yet.</div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sale</th>
                                        <th>Date</th>
                                        <th>Sold by</th>
                                        <th className="cell-number">Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map((sale) => (
                                        <tr
                                            key={sale.saleId}
                                            className={`row-clickable ${
                                                selected?.saleId === sale.saleId
                                                    ? "row-selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                !detailLoading && viewSale(sale.saleId)
                                            }
                                        >
                                            <td className="list-title">#{sale.saleId}</td>
                                            <td>{formatDate(sale.saleDate)}</td>
                                            <td>{sale.soldBy}</td>
                                            <td className="cell-number">
                                                <strong>{money(sale.totalAmount)}</strong>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        sale.status === "COMPLETED"
                                                            ? "badge-success"
                                                            : "badge-neutral"
                                                    }`}
                                                >
                                                    {nice(sale.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onPrevious={() => setPage((current) => current - 1)}
                            onNext={() => setPage((current) => current + 1)}
                        />
                    )}
                </div>

                {selected && (
                    <div className="card summary">
                        <div className="panel-header">
                            <h2>Sale #{selected.saleId}</h2>
                            <button
                                className="btn-secondary btn-sm"
                                onClick={() => setSelected(null)}
                            >
                                Close
                            </button>
                        </div>

                        <p className="muted detail-meta">
                            {formatDate(selected.saleDate)}
                            <br />
                            Sold by {selected.soldBy}
                        </p>

                        {selected.items.map((item) => (
                            <div key={item.productId} className="list-row">
                                <div>
                                    <div className="list-title">{item.productName}</div>
                                    <div className="list-meta">
                                        {item.quantity} × {money(item.unitPrice)}
                                    </div>
                                </div>
                                <span>{money(item.subtotal)}</span>
                            </div>
                        ))}

                        <div className="summary-row total-row">
                            <span>Total</span>
                            <span>{money(selected.totalAmount)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}