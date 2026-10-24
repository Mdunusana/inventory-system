import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "3rem"
            }}
        >
            <h1>404</h1>

            <h2>Page Not Found</h2>

            <p>
                The page you requested does not exist.
            </p>

            <Link to="/">
                Return to Dashboard
            </Link>
        </div>
    );
}