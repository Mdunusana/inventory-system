import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function AccessDeniedPage() {
    return (
        <div className="auth-page">
            <div className="card auth-card error-card">
                <div className="error-icon tone-danger">
                    <Icon name="lock" size={26} />
                </div>
                <div className="error-code">403</div>
                <h1>Access denied</h1>
                <p className="muted">
                    Your account does not have permission to open this page.
                    Ask an administrator if you need access.
                </p>
                <Link to="/" className="btn btn-block">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}