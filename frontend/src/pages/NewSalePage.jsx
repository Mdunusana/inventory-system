import { useCallback, useEffect, useState } from "react";
import { get, post } from "../api/client";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";

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
    const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

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
            <div className="receipt">
                <div className="card">
                    <div className="receipt-head">
                        <div className="success-circle">✓</div>
                        <h1>Sale complete</h1>
                        <p className="muted">
                            Sale #{receipt.saleId} ·{" "}
                            {new Date(receipt.saleDate).toLocaleString()} · sold by{" "}
                            {receipt.soldBy}
                        </p>
                    </div>

                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th className="cell-number">Qty</th>
                                    <th className="cell-number">Unit price</th>
                                    <th className="cell-number">Subtotal</th>
                                    <th>Stock left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipt.items.map((item) => (
                                    <tr key={item.productId}>
                                        <td>
                                            <div className="list-title">{item.productName}</div>
                                            <div className="list-meta">{item.productCode}</div>
                                        </td>
                                        <td className="cell-number">{item.quantity}</td>
                                        <td className="cell-number">{money(item.unitPrice)}</td>
                                        <td className="cell-number">{money(item.subtotal)}</td>
                                        <td>
                                            <div className="badge-line">
                                                {item.currentStock}
                                                <StatusBadge status={item.stockStatus} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="summary-row total-row">
                        <span>Total</span>
                        <span>{money(receipt.totalAmount)}</span>
                    </div>

                    {warnings.length > 0 && (
                        <div className="warning-message">
                            Reorder soon:{" "}
                            {warnings.map((item) => item.productName).join(", ")}
                        </div>
                    )}

                    <button className="btn-block" onClick={() => setReceipt(null)}>
                        <Icon name="plus" size={16} />
                        Start new sale
                    </button>
                </div>
            </div>
        );
    }

    // ---------- Building a sale ----------
    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>New Sale</h1>
                    <p className="page-subtitle">
                        Add products to the cart, then complete the sale.
                    </p>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="sale-layout">
                <div>
                    <form onSubmit={handleAdd} className="card add-bar" noValidate>
                        <select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        >
                            <option value="">Choose a product</option>
                            {sellable.map((product) => (
                                <option key={product.productId} value={product.productId}>
                                    {product.productCode} - {product.productName} (
                                    {money(product.price)}, {product.currentStock} in stock)
                                </option>
                            ))}
                        </select>

                        <input
                            className="qty-input"
                            type="number"
                            min="1"
                            step="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />

                        <button type="submit">
                            <Icon name="plus" size={16} />
                            Add
                        </button>
                    </form>

                    {cart.length === 0 ? (
                        <div className="card empty-state">
                            <Icon name="sale" size={28} />
                            <p>The cart is empty. Choose a product and click Add.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th className="cell-number">Unit price</th>
                                        <th className="cell-number">Qty</th>
                                        <th className="cell-number">Subtotal</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((line) => (
                                        <tr key={line.productId}>
                                            <td>
                                                <div className="list-title">{line.productName}</div>
                                                <div className="list-meta">{line.productCode}</div>
                                            </td>
                                            <td className="cell-number">{money(line.price)}</td>
                                            <td className="cell-number">{line.quantity}</td>
                                            <td className="cell-number">
                                                {money(line.price * line.quantity)}
                                            </td>
                                            <td>
                                                <div className="cell-actions">
                                                    <button
                                                        className="btn-danger btn-sm"
                                                        onClick={() => removeLine(line.productId)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="card summary">
                    <h2>Order summary</h2>

                    <div className="summary-row">
                        <span className="muted">Items</span>
                        <span>{itemCount}</span>
                    </div>
                    <div className="summary-row">
                        <span className="muted">Products</span>
                        <span>{cart.length}</span>
                    </div>
                    <div className="summary-row total-row">
                        <span>Total</span>
                        <span>{money(previewTotal)}</span>
                    </div>

                    <button
                        className="btn-block"
                        onClick={completeSale}
                        disabled={saving || cart.length === 0}
                    >
                        {saving ? "Processing..." : "Complete Sale"}
                    </button>

                    <p className="muted summary-note">
                        Stock is checked again by the server when you complete the sale.
                    </p>
                </div>
            </div>
        </div>
    );
}