export default function FormField({
    label,
    error,
    children
}) {
    return (
        <div style={{ marginBottom: "1rem" }}>
            <label
                style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold"
                }}
            >
                {label}
            </label>

            {children}

            {error && (
                <div
                    style={{
                        color: "red",
                        marginTop: "0.25rem",
                        fontSize: "0.9rem"
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
}