export default function Pagination({
    page,
    totalPages,
    onPrevious,
    onNext
}) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1.5rem"
            }}
        >
            <button
                onClick={onPrevious}
                disabled={page <= 0}
            >
                Previous
            </button>

            <span>
                Page {page + 1} of {Math.max(totalPages, 1)}
            </span>

            <button
                onClick={onNext}
                disabled={page + 1 >= totalPages}
            >
                Next
            </button>
        </div>
    );
}