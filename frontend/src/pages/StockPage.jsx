import { useCallback, useEffect, useState } from "react";
import { get, post } from "../api/client";
import { useAuth } from "../auth/authContext";
import FormField from "../components/FormField";
import Icon from "../components/Icon";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 10;

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

    // Active products for the two dropdowns
    const loadProducts = useCallback(async () => {
        try {
            const data = await get("/api/products?active=true&size=100");
            setProducts(data.content);
        } catch (err) {
            setFormError(err.message);
        }
    }, []);

    useEffect(() => {
        loadStock();
    }, [loadStock]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // After a change, refresh both the table and the dropdowns
    async function refreshAll() {
        await Promise.all([loadStock(), loadProducts()]);
    }

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
            await refreshAll();
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
            await refreshAll();
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
            <div className="page-header">
                <div>
                    <h1>Stock</h1>
                    <p className="page-subtitle">
                        Receive deliveries, correct counts and watch stock levels.
                    </p>
                </div>
            </div>

            {message && <div className="success-message">{message}</div>}
            {formError && <div className="error-message">{formError}</div>}

            {/* ---------- Forms ---------- */}
            <div className="panel-grid section">
                <form onSubmit={handleReceive} className="card" noValidate>
                    <div className="form-title">
                        <div className="stat-icon tone-success">
                            <Icon name="plus" size={18} />
                        </div>
                        <div>
                            <h2>Receive Stock</h2>
                            <p className="muted">A delivery arrived from a supplier.</p>
                        </div>
                    </div>

                    <FormField label="Product">
                        <select
                            value={receive.productId}
                            onChange={(e) =>
                                setReceive({ ...receive, productId: e.target.value })
                            }
                        >
                            <option value="">Choose a product</option>
                            {productOptions()}
                        </select>
                    </FormField>

                    <FormField label="Quantity received">
                        <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="e.g. 20"
                            value={receive.quantity}
                            onChange={(e) =>
                                setReceive({ ...receive, quantity: e.target.value })
                            }
                        />
                    </FormField>

                    <FormField label="Reference (optional)">
                        <input
                            type="text"
                            maxLength={100}
                            placeholder="e.g. delivery note DN-1042"
                            value={receive.reference}
                            onChange={(e) =>
                                setReceive({ ...receive, reference: e.target.value })
                            }
                        />
                    </FormField>

                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Receive Stock"}
                    </button>
                </form>

                {isAdmin && (
                    <form onSubmit={handleAdjust} className="card" noValidate>
                        <div className="form-title">
                            <div className="stat-icon tone-warning">
                                <Icon name="alert" size={18} />
                            </div>
                            <div>
                                <h2>Adjust Stock</h2>
                                <p className="muted">
                                    Fix a count after damage, loss or a stock take.
                                </p>
                            </div>
                        </div>

                        <FormField label="Product">
                            <select
                                value={adjust.productId}
                                onChange={(e) =>
                                    setAdjust({ ...adjust, productId: e.target.value })
                                }
                            >
                                <option value="">Choose a product</option>
                                {productOptions()}
                            </select>
                        </FormField>

                        <FormField label="Change (use minus for less, e.g. -2)">
                            <input
                                type="number"
                                step="1"
                                placeholder="e.g. -2"
                                value={adjust.quantityChange}
                                onChange={(e) =>
                                    setAdjust({
                                        ...adjust,
                                        quantityChange: e.target.value
                                    })
                                }
                            />
                        </FormField>

                        <FormField label="Reason (required)">
                            <input
                                type="text"
                                maxLength={255}
                                placeholder="e.g. 2 units damaged in storage"
                                value={adjust.reason}
                                onChange={(e) =>
                                    setAdjust({ ...adjust, reason: e.target.value })
                                }
                            />
                        </FormField>

                        <button type="submit" className="btn-secondary" disabled={saving}>
                            {saving ? "Saving..." : "Adjust Stock"}
                        </button>
                    </form>
                )}
            </div>

            {/* ---------- Stock levels table ---------- */}
            <h2>Stock levels</h2>

            <div className="toolbar">
                <input
                    className="search"
                    type="text"
                    placeholder="Search by name or code"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                />

                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(0);
                    }}
                >
                    <option value="">All statuses</option>
                    <option value="OK">In stock</option>
                    <option value="LOW_STOCK">Low stock</option>
                    <option value="OUT_OF_STOCK">Out of stock</option>
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <p className="muted">Loading stock...</p>
            ) : rows.length === 0 ? (
                <div className="card empty-state">No products match.</div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th className="cell-number">In stock</th>
                                <th className="cell-number">Minimum</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.productId}>
                                    <td className="cell-code">{row.productCode}</td>
                                    <td>
                                        <div className="list-title">{row.productName}</div>
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
