import { useState } from "react";
import { post } from "../api/client";
import FormField from "../components/FormField";

const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    boxSizing: "border-box"
};

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
        <div style={{ maxWidth: "500px" }}>
            <h1>Change Password</h1>

            {message && (
                <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
            )}
            {serverError && <p style={{ color: "red" }}>{serverError}</p>}

            <form onSubmit={handleSubmit} noValidate>
                <FormField label="Current password" error={errors.currentPassword}>
                    <input
                        type="password"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        style={inputStyle}
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
                        style={inputStyle}
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
                        style={inputStyle}
                    />
                </FormField>

                <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Change Password"}
                </button>
            </form>
        </div>
    );
}