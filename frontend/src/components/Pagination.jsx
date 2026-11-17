export default function Pagination({ page, totalPages, onPrevious, onNext }) {
    return (
        <div className="pagination">
            <span>
                Page {page + 1} of {Math.max(totalPages, 1)}
            </span>

            <div className="header-actions">
                <button
                    className="btn-secondary btn-sm"
                    onClick={onPrevious}
                    disabled={page <= 0}
                >
                    Previous
                </button>
                <button
                    className="btn-secondary btn-sm"
                    onClick={onNext}
                    disabled={page + 1 >= totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}