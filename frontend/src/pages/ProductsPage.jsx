import { useEffect, useState } from "react";
import { get } from "../api/client";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await get("/api/stock");

                setProducts(data.content || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, []);

    if (loading) {
        return <p>Loading products...</p>;
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
            <h1>Products</h1>

            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product) => (
                            <tr key={product.productId}>
                                <td>{product.productCode}</td>
                                <td>{product.productName}</td>
                                <td>{product.categoryName}</td>
                                <td>{product.currentStock}</td>
                                <td>{product.stockStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}