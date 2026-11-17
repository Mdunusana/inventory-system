// Turns a status code from the backend into a soft coloured pill.
const STYLES = {
    OK: { tone: "success", label: "In stock" },
    LOW_STOCK: { tone: "warning", label: "Low stock" },
    OUT_OF_STOCK: { tone: "danger", label: "Out of stock" },
    LOW: { tone: "danger", label: "Low" },
    MEDIUM: { tone: "warning", label: "Medium" },
    HIGH: { tone: "success", label: "High" },
    ACTIVE: { tone: "success", label: "Active" },
    INACTIVE: { tone: "neutral", label: "Inactive" }
};

export default function StatusBadge({ status }) {
    const style = STYLES[status] || { tone: "neutral", label: status };

    return <span className={`badge badge-${style.tone}`}>{style.label}</span>;
}