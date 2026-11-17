export default function StatusBadge({ status }) {
    const colors = {
        OK: "#198754",
        LOW_STOCK: "#fd7e14",
        OUT_OF_STOCK: "#dc3545",
        LOW: "#dc3545",
        MEDIUM: "#ffc107",
        HIGH: "#198754",
        ACTIVE: "#198754",
        INACTIVE: "#6c757d"
    };

    const backgroundColor =
        colors[status] || "#0d6efd";

    return (
        <span
            style={{
                display: "inline-block",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.5rem",
                color: "#fff",
                backgroundColor,
                fontSize: "0.85rem",
                fontWeight: "bold"
            }}
        >
            {status}
        </span>
    );
}