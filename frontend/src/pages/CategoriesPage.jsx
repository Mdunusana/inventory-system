import { useEffect, useState } from "react";
import { get, post } from "../api/client";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadCategories() {
        try {
            const data = await get("/api/categories");
            setCategories(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    async function handleAddCategory() {
        if (!categoryName.trim()) {
            alert("Please enter a category name.");
            return;
        }

        try {
            await post("/api/categories", {
                categoryName
            });

            setCategoryName("");

            await loadCategories();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h1>Categories</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <div
                style={{
                    marginBottom: "1.5rem"
                }}
            >
                <input
                    type="text"
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(event) =>
                        setCategoryName(
                            event.target.value
                        )
                    }
                    style={{
                        marginRight: "1rem",
                        padding: "0.5rem"
                    }}
                />

                <button
                    onClick={handleAddCategory}
                >
                    Add Category
                </button>
            </div>

            {loading ? (
                <p>Loading categories...</p>
            ) : (
                <ul>
                    {categories.map((category) => (
                        <li
                            key={category.categoryId}
                        >
                            {category.categoryName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
