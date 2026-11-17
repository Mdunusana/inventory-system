import { useCallback, useEffect, useState } from "react";
import { get, post, put, remove } from "../api/client";
import Icon from "../components/Icon";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const loadCategories = useCallback(async () => {
        try {
            const data = await get("/api/categories");
            setCategories(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Runs one change, shows the result, then reloads the list
    async function run(action, successText) {
        setError("");
        setMessage("");
        setBusy(true);

        try {
            await action();
            setMessage(successText);
            await loadCategories();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setBusy(false);
        }
    }

    async function handleAdd(event) {
        event.preventDefault();
        const name = newName.trim();

        if (!name) {
            setError("Please enter a category name.");
            return;
        }

        const ok = await run(
            () => post("/api/categories", { categoryName: name }),
            `Category "${name}" added.`
        );
        if (ok) setNewName("");
    }

    function startEdit(category) {
        setEditingId(category.categoryId);
        setEditName(category.categoryName);
        setError("");
        setMessage("");
    }

    async function saveEdit(category) {
        const name = editName.trim();

        if (!name) {
            setError("The category name cannot be empty.");
            return;
        }

        const ok = await run(
            () => put(`/api/categories/${category.categoryId}`, { categoryName: name }),
            `Renamed to "${name}".`
        );
        if (ok) setEditingId(null);
    }

    async function handleDelete(category) {
        if (!window.confirm(`Delete the category "${category.categoryName}"?`)) {
            return;
        }

        // The server refuses if any product still uses this category
        await run(
            () => remove(`/api/categories/${category.categoryId}`),
            `Category "${category.categoryName}" deleted.`
        );
    }

    return (
        <div className="form-page">
            <div className="page-header">
                <div>
                    <h1>Categories</h1>
                    <p className="page-subtitle">
                        Group your products. A category in use cannot be deleted.
                    </p>
                </div>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form className="card add-bar" onSubmit={handleAdd} noValidate>
                <input
                    type="text"
                    maxLength={100}
                    placeholder="New category name, e.g. Office Supplies"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button type="submit" disabled={busy}>
                    <Icon name="plus" size={16} />
                    Add
                </button>
            </form>

            {loading ? (
                <p className="muted">Loading categories...</p>
            ) : categories.length === 0 ? (
                <div className="card empty-state">No categories yet. Add your first one above.</div>
            ) : (
                <div className="card list-card">
                    {categories.map((category) => (
                        <div key={category.categoryId} className="list-row">
                            {editingId === category.categoryId ? (
                                <>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={editName}
                                        autoFocus
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") saveEdit(category);
                                            if (e.key === "Escape") setEditingId(null);
                                        }}
                                    />
                                    <div className="cell-actions">
                                        <button
                                            className="btn-secondary btn-sm"
                                            onClick={() => setEditingId(null)}
                                            disabled={busy}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn-sm"
                                            onClick={() => saveEdit(category)}
                                            disabled={busy}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="category-name">
                                        <div className="stat-icon tone-primary small-icon">
                                            <Icon name="categories" size={16} />
                                        </div>
                                        <span className="list-title">{category.categoryName}</span>
                                    </div>
                                    <div className="cell-actions">
                                        <button
                                            className="btn-secondary btn-sm"
                                            onClick={() => startEdit(category)}
                                            disabled={busy}
                                        >
                                            Rename
                                        </button>
                                        <button
                                            className="btn-danger btn-sm"
                                            onClick={() => handleDelete(category)}
                                            disabled={busy}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}