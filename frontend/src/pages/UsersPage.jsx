import { useCallback, useEffect, useState } from "react";
import { get, patch, post } from "../api/client";
import { useAuth } from "../auth/authContext";
import FormField from "../components/FormField";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";

const PAGE_SIZE = 20;

const cellStyle = {
    padding: "0.5rem",
    borderBottom: "1px solid #ddd",
    textAlign: "left"
};

const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    boxSizing: "border-box"
};

const panelStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "2rem",
    maxWidth: "600px"
};

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
            setForm(emptyForm);
            setShowForm(false);
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <h1>Users</h1>
                {!showForm && (
                    <button onClick={() => setShowForm(true)}>+ Add User</button>
                )}
            </div>

            {message && (
                <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {showForm && (
                <form onSubmit={handleCreate} style={panelStyle} noValidate>
                    <h3>New User</h3>

                    <FormField label="Name" error={errors.name}>
                        <input name="name" value={form.name} onChange={handleChange}
                            maxLength={100} style={inputStyle} />
                    </FormField>

                    <FormField label="Surname" error={errors.surname}>
                        <input name="surname" value={form.surname} onChange={handleChange}
                            maxLength={100} style={inputStyle} />
                    </FormField>

                    <FormField label="Email" error={errors.email}>
                        <input name="email" type="email" value={form.email}
                            onChange={handleChange} maxLength={255} style={inputStyle} />
                    </FormField>

                    <FormField label="First password (8-72 characters)" error={errors.password}>
                        <input name="password" type="password" value={form.password}
                            onChange={handleChange} maxLength={72} style={inputStyle}
                            autoComplete="new-password" />
                    </FormField>

                    <FormField label="Role">
                        <select name="role" value={form.role} onChange={handleChange}
                            style={inputStyle}>
                            <option value="SALES_INVENTORY">Sales / Inventory</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </FormField>

                    <button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Create User"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowForm(false);
                            setForm(emptyForm);
                            setErrors({});
                        }}
                        style={{ marginLeft: "1rem" }}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {loading ? (
                <p>Loading users...</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={cellStyle}>Name</th>
                            <th style={cellStyle}>Email</th>
                            <th style={cellStyle}>Role</th>
                            <th style={cellStyle}>Status</th>
                            <th style={cellStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const isMe =
                                user.email.toLowerCase() === me?.email?.toLowerCase();

                            return (
                                <tr
                                    key={user.userId}
                                    style={{ opacity: user.active ? 1 : 0.5 }}
                                >
                                    <td style={cellStyle}>
                                        {user.name} {user.surname}
                                        {isMe && " (you)"}
                                    </td>
                                    <td style={cellStyle}>{user.email}</td>
                                    <td style={cellStyle}>
                                        {ROLE_LABELS[user.role] ?? user.role}
                                    </td>
                                    <td style={cellStyle}>
                                        <StatusBadge
                                            status={user.active ? "ACTIVE" : "INACTIVE"}
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        {!isMe && (
                                            <button
                                                onClick={() => toggleActive(user)}
                                                disabled={busyId === user.userId}
                                            >
                                                {user.active ? "Deactivate" : "Activate"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
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