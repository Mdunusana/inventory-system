import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, patch } from "../api/client";
import { useAuth } from "../auth/authContext";
import { useCategories } from "../hooks/useCategories";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 10;

const cellStyle = {
    padding: "0.5rem",
    borderBottom: "1px solid #ddd",
    textAlign: "left"
};

export default function ProductsPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const { categories } = useCategories();

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    // Build the address with the filters and ask the backend
    const loadProducts = useCallback(async () => {
        const params = new URLSearchParams({
            page: String(page),
            size: String(PAGE_SIZE)
        });

        if (search.trim()) {
            params.append("search", search.trim());
        }
        if (categoryId) {
            params.append("categoryId", categoryId);
        }

        try {
            const data = await get(`/api/products?${params}`);
            setProducts(data.content);
            setTotalPages(data.totalPages);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, search, categoryId]);

    // Reload whenever the page or a filter changes
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    async function toggleActive(product) {
        if (
            product.active &&
            !window.confirm(
                `Deactivate "${product.productName}"? ` +
                    "It will be hidden from new sales, " +
                    "but its history is kept."
            )
        ) {
            return;
        }

        const action = product.active ? "deactivate" : "activate";
        setBusyId(product.productId);

        try {
            await patch(`/api/products/${product.productId}/${action}`);
            await loadProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <h1>Products</h1>

                {isAdmin && (
                    <Link to="/products/new">
                        <button>+ New Product</button>
                    </Link>
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    marginBottom: "1rem"
                }}
            >
                <input
                    type="text"
                    placeholder="Search by name or code"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(0);
                    }}
                    style={{ padding: "0.5rem", flex: 1 }}
                />

                <select
                    value={categoryId}
                    onChange={(event) => {
                        setCategoryId(event.target.value);
                        setPage(0);
                    }}
                    style={{ padding: "0.5rem" }}
                >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option
                            key={category.categoryId}
                            value={category.categoryId}
                        >
                            {category.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {loading ? (
                <p>Loading products...</p>
            ) : products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Code</th>
                            <th style={cellStyle}>Name</th>
                            <th style={cellStyle}>Category</th>
                            <th style={cellStyle}>Price</th>
                            <th style={cellStyle}>Stock</th>
                            <th style={cellStyle}>Status</th>
                            <th style={cellStyle}>Active</th>
                            {isAdmin && <th style={cellStyle}>Actions</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product) => (
                            <tr
                                key={product.productId}
                                style={{
                                    opacity: product.active ? 1 : 0.5
                                }}
                            >
                                <td style={cellStyle}>{product.productCode}</td>
                                <td style={cellStyle}>{product.productName}</td>
                                <td style={cellStyle}>{product.categoryName}</td>
                                <td style={cellStyle}>
                                    R {Number(product.price).toFixed(2)}
                                </td>
                                <td style={cellStyle}>{product.currentStock}</td>
                                <td style={cellStyle}>
                                    <StatusBadge status={product.stockStatus} />
                                </td>
                                <td style={cellStyle}>
                                    {product.active ? "Yes" : "No"}
                                </td>

                                {isAdmin && (
                                    <td style={cellStyle}>
                                        <Link
                                            to={`/products/${product.productId}/edit`}
                                        >
                                            <button>Edit</button>
                                        </Link>

                                        <button
                                            onClick={() => toggleActive(product)}
                                            disabled={busyId === product.productId}
                                            style={{ marginLeft: "0.5rem" }}
                                        >
                                            {product.active
                                                ? "Deactivate"
                                                : "Activate"}
                                        </button>
                                    </td>
                                )}
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