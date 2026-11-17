import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { get, patch } from "../api/client";
import { useAuth } from "../auth/authContext";
import { useCategories } from "../hooks/useCategories";
import Icon from "../components/Icon";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 10;

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
            <div className="page-header">
                <div>
                    <h1>Products</h1>
                    <p className="page-subtitle">
                        Everything you sell, with live stock levels.
                    </p>
                </div>

                {isAdmin && (
                    <Link to="/products/new" className="btn">
                        <Icon name="plus" size={16} />
                        New Product
                    </Link>
                )}
            </div>

            <div className="toolbar">
                <input
                    className="search"
                    type="text"
                    placeholder="Search by name or code"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(0);
                    }}
                />

                <select
                    value={categoryId}
                    onChange={(event) => {
                        setCategoryId(event.target.value);
                        setPage(0);
                    }}
                >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <p className="muted">Loading products...</p>
            ) : products.length === 0 ? (
                <div className="card empty-state">No products found.</div>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th className="cell-number">Price</th>
                                <th className="cell-number">Stock</th>
                                <th>Status</th>
                                {isAdmin && <th></th>}
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => (
                                <tr
                                    key={product.productId}
                                    className={product.active ? "" : "row-inactive"}
                                >
                                    <td className="cell-code">{product.productCode}</td>
                                    <td>
                                        <div className="list-title">{product.productName}</div>
                                    </td>
                                    <td>{product.categoryName}</td>
                                    <td className="cell-number">
                                        R {Number(product.price).toFixed(2)}
                                    </td>
                                    <td className="cell-number">{product.currentStock}</td>
                                    <td>
                                        {product.active ? (
                                            <StatusBadge status={product.stockStatus} />
                                        ) : (
                                            <StatusBadge status="INACTIVE" />
                                        )}
                                    </td>

                                    {isAdmin && (
                                        <td>
                                            <div className="cell-actions">
                                                <Link
                                                    to={`/products/${product.productId}/edit`}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    className={`btn-sm ${
                                                        product.active
                                                            ? "btn-danger"
                                                            : "btn-secondary"
                                                    }`}
                                                    onClick={() => toggleActive(product)}
                                                    disabled={busyId === product.productId}
                                                >
                                                    {product.active ? "Deactivate" : "Activate"}
                                                </button>
                                            </div>
                                        </td>
                                    )}
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