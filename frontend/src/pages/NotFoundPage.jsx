import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function NotFoundPage() {
    return (
        <div className="auth-page">
            <div className="card auth-card error-card">
                <div className="error-icon tone-primary">
                    <Icon name="empty" size={26} />
                </div>
                <div className="error-code">404</div>
                <h1>Page not found</h1>
                <p className="muted">
                    The page you are looking for does not exist or was moved.
                </p>
                <Link to="/" className="btn btn-block">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}