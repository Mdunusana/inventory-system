import { useCallback, useEffect, useState } from "react";
import { get } from "../api/client";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

const cellStyle = {
    padding: "0.5rem",
    borderBottom: "1px solid #ddd",
    textAlign: "left"
};

const panelStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginTop: "1.5rem"
};

function money(value) {
    return `R ${Number(value).toFixed(2)}`;
}

function formatDate(value) {
    return new Date(value).toLocaleString();
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
            <h1>Sales History</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {loading ? (
                <p>Loading sales...</p>
            ) : sales.length === 0 ? (
                <p>No sales recorded yet.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Sale #</th>
                            <th style={cellStyle}>Date</th>
                            <th style={cellStyle}>Sold By</th>
                            <th style={cellStyle}>Total</th>
                            <th style={cellStyle}>Status</th>
                            <th style={cellStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr
                                key={sale.saleId}
                                style={{
                                    backgroundColor:
                                        selected?.saleId === sale.saleId
                                            ? "#e7f1ff"
                                            : "transparent"
                                }}
                            >
                                <td style={cellStyle}>{sale.saleId}</td>
                                <td style={cellStyle}>{formatDate(sale.saleDate)}</td>
                                <td style={cellStyle}>{sale.soldBy}</td>
                                <td style={cellStyle}>{money(sale.totalAmount)}</td>
                                <td style={cellStyle}>{sale.status}</td>
                                <td style={cellStyle}>
                                    <button
                                        onClick={() => viewSale(sale.saleId)}
                                        disabled={detailLoading}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPrevious={() => setPage((current) => current - 1)}
                    onNext={() => setPage((current) => current + 1)}
                />
            )}

            {selected && (
                <div style={panelStyle}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <h2>Sale #{selected.saleId}</h2>
                        <button onClick={() => setSelected(null)}>Close</button>
                    </div>

                    <p>
                        <strong>Date: </strong>
                        {formatDate(selected.saleDate)}
                        <br />
                        <strong>Sold by: </strong>
                        {selected.soldBy}
                    </p>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={cellStyle}>Product</th>
                                <th style={cellStyle}>Qty</th>
                                <th style={cellStyle}>Unit Price</th>
                                <th style={cellStyle}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selected.items.map((item) => (
                                <tr key={item.productId}>
                                    <td style={cellStyle}>
                                        {item.productCode} - {item.productName}
                                    </td>
                                    <td style={cellStyle}>{item.quantity}</td>
                                    <td style={cellStyle}>{money(item.unitPrice)}</td>
                                    <td style={cellStyle}>{money(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3>Total: {money(selected.totalAmount)}</h3>
                </div>
            )}
        </div>
    );
}