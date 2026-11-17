import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { get, post, put } from "../api/client";
import { useCategories } from "../hooks/useCategories";
import FormField from "../components/FormField";

const emptyForm = {
    productCode: "",
    productName: "",
    description: "",
    categoryId: "",
    price: "",
    minimumStockLevel: ""
};

// Checks the form before it goes to the server.
// The server checks again (the same rules), so this is only for speed.
function validate(form) {
    const errors = {};

    if (!form.productCode.trim()) errors.productCode = "Product code is required.";
    else if (form.productCode.trim().length > 50) errors.productCode = "Maximum 50 characters.";

    if (!form.productName.trim()) errors.productName = "Product name is required.";
    else if (form.productName.trim().length > 150) errors.productName = "Maximum 150 characters.";

    if (form.description.length > 500) errors.description = "Maximum 500 characters.";

    if (!form.categoryId) errors.categoryId = "Choose a category.";

    const price = Number(form.price);
    if (form.price === "") errors.price = "Price is required.";
    else if (Number.isNaN(price) || price < 0) errors.price = "Price cannot be negative.";
    else if (!/^\d+(\.\d{1,2})?$/.test(form.price)) errors.price = "Use at most 2 decimal places.";

    const minimum = Number(form.minimumStockLevel);
    if (form.minimumStockLevel === "") errors.minimumStockLevel = "Minimum stock level is required.";
    else if (!Number.isInteger(minimum) || minimum < 0)
        errors.minimumStockLevel = "Must be a whole number of 0 or more.";

    return errors;
}

export default function ProductFormPage() {
    const { id } = useParams();
    const editMode = Boolean(id);
    const navigate = useNavigate();
    const { categories } = useCategories();

    const [form, setForm] = useState(emptyForm);
    const [currentStock, setCurrentStock] = useState(null);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(editMode);
    const [saving, setSaving] = useState(false);

    // In edit mode, fill the form with the product's current values
    useEffect(() => {
        if (!editMode) return;

        let cancelled = false;

        async function load() {
            try {
                const product = await get(`/api/products/${id}`);
                if (!cancelled) {
                    setForm({
                        productCode: product.productCode,
                        productName: product.productName,
                        description: product.description || "",
                        categoryId: String(product.categoryId),
                        price: String(product.price),
                        minimumStockLevel: String(product.minimumStockLevel)
                    });
                    setCurrentStock(product.currentStock);
                }
            } catch (err) {
                if (!cancelled) setServerError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [editMode, id]);

    function change(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setServerError("");

        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        const body = {
            productCode: form.productCode.trim(),
            productName: form.productName.trim(),
            description: form.description.trim() || null,
            categoryId: Number(form.categoryId),
            price: Number(form.price),
            minimumStockLevel: Number(form.minimumStockLevel)
        };

        setSaving(true);

        try {
            if (editMode) {
                await put(`/api/products/${id}`, body);
            } else {
                await post("/api/products", body);
            }
            navigate("/products");
        } catch (err) {
            setServerError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <p className="muted">Loading product...</p>;
    }

    return (
        <div className="form-page">
            <div className="page-header">
                <div>
                    <h1>{editMode ? "Edit Product" : "New Product"}</h1>
                    <p className="page-subtitle">
                        {editMode
                            ? "Change the product's details. Stock is changed on the Stock page."
                            : "New products start with 0 in stock. Use Receive Stock to add some."}
                    </p>
                </div>
            </div>

            {serverError && <div className="error-message">{serverError}</div>}

            <form className="card" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    <FormField label="Product code" error={errors.productCode}>
                        <input
                            type="text"
                            placeholder="e.g. MOUSE-001"
                            value={form.productCode}
                            onChange={(e) => change("productCode", e.target.value)}
                        />
                    </FormField>

                    <FormField label="Category" error={errors.categoryId}>
                        <select
                            value={form.categoryId}
                            onChange={(e) => change("categoryId", e.target.value)}
                        >
                            <option value="">Choose a category</option>
                            {categories.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <FormField label="Product name" error={errors.productName}>
                    <input
                        type="text"
                        placeholder="e.g. Wireless Mouse"
                        value={form.productName}
                        onChange={(e) => change("productName", e.target.value)}
                    />
                </FormField>

                <FormField label="Description (optional)" error={errors.description}>
                    <textarea
                        rows="3"
                        placeholder="A short description of the product"
                        value={form.description}
                        onChange={(e) => change("description", e.target.value)}
                    />
                </FormField>

                <div className="form-grid">
                    <FormField label="Price (R)" error={errors.price}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.price}
                            onChange={(e) => change("price", e.target.value)}
                        />
                    </FormField>

                    <FormField label="Minimum stock level" error={errors.minimumStockLevel}>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="e.g. 5"
                            value={form.minimumStockLevel}
                            onChange={(e) => change("minimumStockLevel", e.target.value)}
                        />
                    </FormField>
                </div>

                {editMode && currentStock !== null && (
                    <p className="muted form-note">
                        Current stock: <strong>{currentStock}</strong>
                    </p>
                )}

                <div className="form-actions">
                    <Link to="/products" className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : editMode ? "Save changes" : "Create product"}
                    </button>
                </div>
            </form>
        </div>
    );
}