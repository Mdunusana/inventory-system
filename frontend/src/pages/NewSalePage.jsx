import { useCallback, useEffect, useState } from "react";
import { get, post } from "../api/client";
import StatusBadge from "../components/StatusBadge";

const cellStyle = {
    padding: "0.5rem",
    borderBottom: "1px solid #ddd",
    textAlign: "left"
};

const inputStyle = {
    padding: "0.5rem",
    boxSizing: "border-box"
};

const panelStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem"
};

function money(value) {
    return `R ${Number(value).toFixed(2)}`;
}

export default function NewSalePage() {
    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [cart, setCart] = useState([]);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const loadProducts = useCallback(async () => {
        try {
            const data = await get("/api/products?active=true&size=100");
            setProducts(data.content);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Only products that can actually be sold
    const sellable = products.filter((product) => product.currentStock > 0);

    function quantityInCart(id) {
        return cart.find((line) => line.productId === id)?.quantity ?? 0;
    }

    function handleAdd(event) {
        event.preventDefault();
        setError("");

        const product = products.find(
            (p) => p.productId === Number(productId)
        );
        const qty = Number(quantity);

        if (!product) {
            setError("Choose a product.");
            return;
        }
        if (!Number.isInteger(qty) || qty < 1) {
            setError("Quantity must be a whole number of 1 or more.");
            return;
        }

        const newQuantity = quantityInCart(product.productId) + qty;

        if (newQuantity > product.currentStock) {
            setError(
                `Only ${product.currentStock} × ${product.productName} in stock.`
            );
            return;
        }

        setCart((previous) => {
            const existing = previous.find(
                (line) => line.productId === product.productId
            );

            // Same product again: combine into one line
            if (existing) {
                return previous.map((line) =>
                    line.productId === product.productId
                        ? { ...line, quantity: newQuantity }
                        : line
                );
            }

            return [
                ...previous,
                {
                    productId: product.productId,
                    productCode: product.productCode,
                    productName: product.productName,
                    price: Number(product.price),
                    quantity: qty
                }
            ];
        });

        setProductId("");
        setQuantity("1");
    }

    function removeLine(id) {
        setCart((previous) => previous.filter((line) => line.productId !== id));
    }

    // Preview only: the server calculates the official total
    const previewTotal = cart.reduce(
        (sum, line) => sum + line.price * line.quantity,
        0
    );

    async function completeSale() {
        if (cart.length === 0) {
            return;
        }
        if (!window.confirm(`Complete this sale for ${money(previewTotal)}?`)) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            const sale = await post("/api/sales", {
                items: cart.map((line) => ({
                    productId: line.productId,
                    quantity: line.quantity
                }))
            });

            setReceipt(sale);
            setCart([]);
            await loadProducts();
        } catch (err) {
            setError(err.message);
            // Stock may have changed (e.g. another till sold it): refresh
            await loadProducts();
        } finally {
            setSaving(false);
        }
    }

    // ---------- Receipt view ----------
    if (receipt) {
        const warnings = receipt.items.filter(
            (item) => item.stockStatus !== "OK"
        );

        return (
            <div>
                <h1>Sale Complete ✔</h1>

                <div style={panelStyle}>
                    <p>
                        <strong>Sale #</strong>
                        {receipt.saleId}
                        <br />
                        <strong>Date: </strong>
                        {new Date(receipt.saleDate).toLocaleString()}
                        <br />
                        <strong>Sold by: </strong>
                        {receipt.soldBy}
                    </p>

                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={cellStyle}>Product</th>
                                <th style={cellStyle}>Qty</th>
                                <th style={cellStyle}>Unit Price</th>
                                <th style={cellStyle}>Subtotal</th>
                                <th style={cellStyle}>Stock Left</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.items.map((item) => (
                                <tr key={item.productId}>
                                    <td style={cellStyle}>
                                        {item.productCode} - {item.productName}
                                    </td>
                                    <td style={cellStyle}>{item.quantity}</td>
                                    <td style={cellStyle}>{money(item.unitPrice)}</td>
                                    <td style={cellStyle}>{money(item.subtotal)}</td>
                                    <td style={cellStyle}>
                                        {item.currentStock}{" "}
                                        <StatusBadge status={item.stockStatus} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2>Total: {money(receipt.totalAmount)}</h2>
                </div>

                {warnings.length > 0 && (
                    <p style={{ color: "#fd7e14", fontWeight: "bold" }}>
                        ⚠ Reorder soon:{" "}
                        {warnings.map((item) => item.productName).join(", ")}
                    </p>
                )}

                <button onClick={() => setReceipt(null)}>Start New Sale</button>
            </div>
        );
    }

    // ---------- Building a sale ----------
    return (
        <div>
            <h1>New Sale</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form
                onSubmit={handleAdd}
                style={{ ...panelStyle, display: "flex", gap: "1rem" }}
                noValidate
            >
                <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    style={{ ...inputStyle, flex: 3 }}
                >
                    <option value="">-- Choose a product --</option>
                    {sellable.map((product) => (
                        <option key={product.productId} value={product.productId}>
                            {product.productCode} - {product.productName} (
                            {money(product.price)}, {product.currentStock} in stock)
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                />

                <button type="submit">Add</button>
            </form>

            {cart.length === 0 ? (
                <p>No items yet. Choose a product and click Add.</p>
            ) : (
                <>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={cellStyle}>Product</th>
                                <th style={cellStyle}>Unit Price</th>
                                <th style={cellStyle}>Qty</th>
                                <th style={cellStyle}>Subtotal</th>
                                <th style={cellStyle}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((line) => (
                                <tr key={line.productId}>
                                    <td style={cellStyle}>
                                        {line.productCode} - {line.productName}
                                    </td>
                                    <td style={cellStyle}>{money(line.price)}</td>
                                    <td style={cellStyle}>{line.quantity}</td>
                                    <td style={cellStyle}>
                                        {money(line.price * line.quantity)}
                                    </td>
                                    <td style={cellStyle}>
                                        <button onClick={() => removeLine(line.productId)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h2>Total: {money(previewTotal)}</h2>

                    <button onClick={completeSale} disabled={saving}>
                        {saving ? "Processing..." : "Complete Sale"}
                    </button>
                </>
            )}
        </div>
    );
}