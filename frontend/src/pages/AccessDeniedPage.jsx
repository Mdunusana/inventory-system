import { Link } from "react-router-dom";

export default function AccessDeniedPage() {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "3rem"
            }}
        >
            <h1>403</h1>

            <h2>Access Denied</h2>

            <p>
                You do not have permission to view this page.
            </p>

            <Link to="/">
                Return to Dashboard
            </Link>
        </div>
    );
}