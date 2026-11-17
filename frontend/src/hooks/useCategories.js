import { useEffect, useState } from "react";
import { get } from "../api/client";

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            try {
                const data = await get(
                    "/api/categories"
                );

                if (!cancelled) {
                    setCategories(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        categories,
        loading,
        error
    };
}