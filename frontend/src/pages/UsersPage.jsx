import { useCallback, useEffect, useState } from "react";
import { get, patch, post } from "../api/client";
import { useAuth } from "../auth/authContext";
import FormField from "../components/FormField";
import Icon from "../components/Icon";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 20;

const emptyForm = {
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "SALES_INVENTORY"
};

const ROLE_LABELS = {
    ADMIN: "Administrator",
    SALES_INVENTORY: "Sales / Inventory"
};

export default function UsersPage() {
    const { user: me } = useAuth();

    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const loadUsers = useCallback(async () => {
        try {
            const data = await get(`/api/users?page=${page}&size=${PAGE_SIZE}`);
            setUsers(data.content);
            setTotalPages(data.totalPages);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    // Same rules as CreateUserRequest on the backend
    function validate() {
        const found = {};

        if (!form.name.trim()) found.name = "Name is required";
        if (!form.surname.trim()) found.surname = "Surname is required";
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
            found.email = "Enter a valid email address";
        }
        if (form.password.length < 8 || form.password.length > 72) {
            found.password = "Password must be 8 to 72 characters";
        }

        return found;
    }

    function closeForm() {
        setShowForm(false);
        setForm(emptyForm);
        setErrors({});
    }

    async function handleCreate(event) {
        event.preventDefault();
        setMessage("");
        setError("");

        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }

        setSaving(true);

        try {
            const created = await post("/api/users", {
                name: form.name.trim(),
                surname: form.surname.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role
            });

            setMessage(
                `User ${created.name} ${created.surname} created. ` +
                    "Give them their first password; they can change it after logging in."
            );
            closeForm();
            await loadUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function toggleActive(user) {
        if (
            user.active &&
            !window.confirm(
                `Deactivate ${user.name} ${user.surname}? ` +
                    "They will not be able to log in or use the system."
            )
        ) {
            return;
        }

        const action = user.active ? "deactivate" : "activate";
        setBusyId(user.userId);
        setMessage("");

        try {
            await patch(`/api/users/${user.userId}/${action}`);
            await loadUsers();
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
                    <h1>Users</h1>
                    <p className="page-subtitle">
                        Who can log in, and what they are allowed to do.
                    </p>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)}>
                        <Icon name="plus" size={16} />
                        Add User
                    </button>
                )}
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            {showForm && (
                <form onSubmit={handleCreate} className="card section form-page" noValidate>
                    <h2>New user</h2>

                    <div className="form-grid">
                        <FormField label="Name" error={errors.name}>
                            <input name="name" value={form.name} onChange={handleChange}
                                maxLength={100} />
                        </FormField>

                        <FormField label="Surname" error={errors.surname}>
                            <input name="surname" value={form.surname} onChange={handleChange}
                                maxLength={100} />
                        </FormField>
                    </div>

                    <FormField label="Email" error={errors.email}>
                        <input name="email" type="email" value={form.email}
                            onChange={handleChange} maxLength={255} />
                    </FormField>

                    <div className="form-grid">
                        <FormField label="First password (8-72 characters)" error={errors.password}>
                            <input name="password" type="password" value={form.password}
                                onChange={handleChange} maxLength={72}
                                autoComplete="new-password" />
                        </FormField>

                        <FormField label="Role">
                            <select name="role" value={form.role} onChange={handleChange}>
                                <option value="SALES_INVENTORY">Sales / Inventory</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </FormField>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={closeForm}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Create user"}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <p className="muted">Loading users...</p>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const isMe =
                                    user.email.toLowerCase() === me?.email?.toLowerCase();

                                return (
                                    <tr
                                        key={user.userId}
                                        className={user.active ? "" : "row-inactive"}
                                    >
                                        <td>
                                            <div className="user-cell">
                                                <div className="avatar">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="list-title">
                                                        {user.name} {user.surname}
                                                        {isMe && <span className="you-tag">You</span>}
                                                    </div>
                                                    <div className="list-meta">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    user.role === "ADMIN"
                                                        ? "badge-primary"
                                                        : "badge-neutral"
                                                }`}
                                            >
                                                {ROLE_LABELS[user.role] ?? user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge
                                                status={user.active ? "ACTIVE" : "INACTIVE"}
                                            />
                                        </td>
                                        <td>
                                            <div className="cell-actions">
                                                {!isMe && (
                                                    <button
                                                        className={`btn-sm ${
                                                            user.active
                                                                ? "btn-danger"
                                                                : "btn-secondary"
                                                        }`}
                                                        onClick={() => toggleActive(user)}
                                                        disabled={busyId === user.userId}
                                                    >
                                                        {user.active ? "Deactivate" : "Activate"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
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