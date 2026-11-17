import { useCallback, useEffect, useState } from "react";
import { get, post } from "../api/client";
import { useAuth } from "../auth/authContext";
import FormField from "../components/FormField";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 10;

const cellStyle = {
    padding: "0.5rem",
    borderBottom: "1px solid #ddd",
    textAlign: "left"
};

const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    boxSizing: "border-box"
};

const panelStyle = {
    flex: 1,
    minWidth: "280px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem"
};

const emptyReceive = { productId: "", quantity: "", reference: "" };
const emptyAdjust = { productId: "", quantityChange: "", reason: "" };

export default function StockPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    // ----- Stock levels table -----
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ----- Forms -----
    const [products, setProducts] = useState([]);
    const [receive, setReceive] = useState(emptyReceive);
    const [adjust, setAdjust] = useState(emptyAdjust);
    const [message, setMessage] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const loadStock = useCallback(async () => {
        const params = new URLSearchParams({
            page: String(page),
            size: String(PAGE_SIZE),
            active: "true"
        });

        if (search.trim()) {
            params.append("search", search.trim());
        }
        if (status) {
            params.append("status", status);
        }

        try {
            const data = await get(`/api/stock?${params}`);
            setRows(data.content);
            setTotalPages(data.totalPages);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, search, status]);

    useEffect(() => {
        loadStock();
    }, [loadStock]);

    // Active products for the two dropdowns (loaded once)
    useEffect(() => {
        let cancelled = false;

        async function loadProducts() {
            try {
                const data = await get("/api/products?active=true&size=100");
                if (!cancelled) {
                    setProducts(data.content);
                }
            } catch (err) {
                if (!cancelled) {
                    setFormError(err.message);
                }
            }
        }

        loadProducts();

        return () => {
            cancelled = true;
        };
    }, []);

    // Turns the backend's answer into a friendly sentence
    function describe(result) {
        const sign = result.quantityChange > 0 ? "+" : "";
        return (
            `${result.productName}: ${sign}${result.quantityChange} ` +
            `(stock ${result.previousStock} → ${result.currentStock})`
        );
    }

    async function handleReceive(event) {
        event.preventDefault();
        setMessage("");
        setFormError("");

        const quantity = Number(receive.quantity);

        if (!receive.productId) {
            setFormError("Choose a product to receive.");
            return;
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            setFormError("Quantity received must be a whole number of 1 or more.");
            return;
        }

        setSaving(true);

        try {
            const result = await post("/api/stock/receive", {
                productId: Number(receive.productId),
                quantity,
                reference: receive.reference.trim() || null
            });

            setMessage(`Stock received. ${describe(result)}`);
            setReceive(emptyReceive);
            await loadStock();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleAdjust(event) {
        event.preventDefault();
        setMessage("");
        setFormError("");

        const quantityChange = Number(adjust.quantityChange);

        if (!adjust.productId) {
            setFormError("Choose a product to adjust.");
            return;
        }
        if (!Number.isInteger(quantityChange) || quantityChange === 0) {
            setFormError(
                "Adjustment must be a whole number that is not 0 (e.g. 5 or -2)."
            );
            return;
        }
        if (!adjust.reason.trim()) {
            setFormError("A reason is required for every adjustment.");
            return;
        }

        setSaving(true);

        try {
            const result = await post("/api/stock/adjust", {
                productId: Number(adjust.productId),
                quantityChange,
                reason: adjust.reason.trim()
            });

            setMessage(`Stock adjusted. ${describe(result)}`);
            setAdjust(emptyAdjust);
            await loadStock();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    // One dropdown used by both forms
    function productOptions() {
        return products.map((product) => (
            <option key={product.productId} value={product.productId}>
                {product.productCode} - {product.productName} (stock{" "}
                {product.currentStock})
            </option>
        ));
    }

    return (
        <div>
            <h1>Stock</h1>

            {/* ---------- Forms ---------- */}
            {message && (
                <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
            )}
            {formError && <p style={{ color: "red" }}>{formError}</p>}

            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "2rem"
                }}
            >
                <form onSubmit={handleReceive} style={panelStyle} noValidate>
                    <h3>Receive Stock</h3>

                    <FormField label="Product">
                        <select
                            value={receive.productId}
                            onChange={(e) =>
                                setReceive({ ...receive, productId: e.target.value })
                            }
                            style={inputStyle}
                        >
                            <option value="">-- Choose a product --</option>
                            {productOptions()}
                        </select>
                    </FormField>

                    <FormField label="Quantity received">
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={receive.quantity}
                            onChange={(e) =>
                                setReceive({ ...receive, quantity: e.target.value })
                            }
                            style={inputStyle}
                        />
                    </FormField>

                    <FormField label="Reference (optional, e.g. delivery note)">
                        <input
                            type="text"
                            maxLength={100}
                            value={receive.reference}
                            onChange={(e) =>
                                setReceive({ ...receive, reference: e.target.value })
                            }
                            style={inputStyle}
                        />
                    </FormField>

                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Receive Stock"}
                    </button>
                </form>

                {isAdmin && (
                    <form onSubmit={handleAdjust} style={panelStyle} noValidate>
                        <h3>Adjust Stock (Admin)</h3>

                        <FormField label="Product">
                            <select
                                value={adjust.productId}
                                onChange={(e) =>
                                    setAdjust({ ...adjust, productId: e.target.value })
                                }
                                style={inputStyle}
                            >
                                <option value="">-- Choose a product --</option>
                                {productOptions()}
                            </select>
                        </FormField>

                        <FormField label="Change (use minus for less, e.g. -2)">
                            <input
                                type="number"
                                step="1"
                                value={adjust.quantityChange}
                                onChange={(e) =>
                                    setAdjust({
                                        ...adjust,
                                        quantityChange: e.target.value
                                    })
                                }
                                style={inputStyle}
                            />
                        </FormField>

                        <FormField label="Reason (required)">
                            <input
                                type="text"
                                maxLength={255}
                                value={adjust.reason}
                                onChange={(e) =>
                                    setAdjust({ ...adjust, reason: e.target.value })
                                }
                                style={inputStyle}
                            />
                        </FormField>

                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Adjust Stock"}
                        </button>
                    </form>
                )}
            </div>

            {/* ---------- Stock levels table ---------- */}
            <h2>Stock Levels</h2>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <input
                    type="text"
                    placeholder="Search by name or code"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                    style={{ padding: "0.5rem", flex: 2 }}
                />

                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(0);
                    }}
                    style={{ padding: "0.5rem", flex: 1 }}
                >
                    <option value="">All statuses</option>
                    <option value="OK">OK</option>
                    <option value="LOW_STOCK">Low stock</option>
                    <option value="OUT_OF_STOCK">Out of stock</option>
                </select>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {loading ? (
                <p>Loading stock...</p>
            ) : rows.length === 0 ? (
                <p>No products match.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Code</th>
                            <th style={cellStyle}>Name</th>
                            <th style={cellStyle}>Category</th>
                            <th style={cellStyle}>In Stock</th>
                            <th style={cellStyle}>Minimum</th>
                            <th style={cellStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.productId}>
                                <td style={cellStyle}>{row.productCode}</td>
                                <td style={cellStyle}>{row.productName}</td>
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

            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPrevious={() => setPage((current) => current - 1)}
                    onNext={() => setPage((current) => current + 1)}
                />
            )}
        </div>
    );
}