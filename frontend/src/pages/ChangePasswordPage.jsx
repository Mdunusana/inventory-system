import { useState } from "react";
import { post } from "../api/client";
import FormField from "../components/FormField";
import Icon from "../components/Icon";

const emptyForm = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
};

export default function ChangePasswordPage() {
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    function validate() {
        const found = {};

        if (!form.currentPassword) {
            found.currentPassword = "Enter your current password";
        }
        if (form.newPassword.length < 8 || form.newPassword.length > 72) {
            found.newPassword = "New password must be 8 to 72 characters";
        } else if (form.newPassword === form.currentPassword) {
            found.newPassword = "New password must be different from the current one";
        }
        if (form.confirmPassword !== form.newPassword) {
            found.confirmPassword = "Passwords do not match";
        }

        return found;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setServerError("");
        setMessage("");

        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) {
            return;
        }

        setSaving(true);

        try {
            await post("/api/auth/change-password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });

            setMessage("Password changed. Use your new password next time you log in.");
            setForm(emptyForm);
        } catch (err) {
            setServerError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="narrow-page">
            <div className="page-header">
                <div>
                    <h1>Change Password</h1>
                    <p className="page-subtitle">
                        Use at least 8 characters. Don't reuse your old password.
                    </p>
                </div>
            </div>

            {message && <div className="success-message">{message}</div>}
            {serverError && <div className="error-message">{serverError}</div>}

            <form className="card" onSubmit={handleSubmit} noValidate>
                <div className="form-title">
                    <div className="stat-icon tone-primary">
                        <Icon name="lock" size={18} />
                    </div>
                    <div>
                        <h2>Your password</h2>
                        <p className="muted">You stay logged in after changing it.</p>
                    </div>
                </div>

                <FormField label="Current password" error={errors.currentPassword}>
                    <input
                        type="password"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                    />
                </FormField>

                <FormField label="New password (8-72 characters)" error={errors.newPassword}>
                    <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        maxLength={72}
                        autoComplete="new-password"
                    />
                </FormField>

                <FormField label="Confirm new password" error={errors.confirmPassword}>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        maxLength={72}
                        autoComplete="new-password"
                    />
                </FormField>

                <button type="submit" className="btn-block" disabled={saving}>
                    {saving ? "Saving..." : "Change password"}
                </button>
            </form>
        </div>
    );
}