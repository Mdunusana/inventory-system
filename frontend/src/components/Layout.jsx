import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";

const ROLE_LABELS = {
    ADMIN: "Administrator",
    SALES_INVENTORY: "Sales / Inventory"
};

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div>
            <header
                style={{
                    padding: "1rem",
                    borderBottom: "1px solid #ddd",
                    marginBottom: "1rem"
                }}
            >
                <h1>Inventory System</h1>

                <nav
                    style={{
                        display: "flex",
                        gap: "1rem",
                        marginTop: "1rem"
                    }}
                >
                    <Link to="/">Dashboard</Link>
                    <Link to="/products">Products</Link>
                    <Link to="/stock">Stock</Link>
                    <Link to="/sales/new">New Sale</Link>

                    {user?.role === "ADMIN" && (
                        <>
                            <Link to="/categories">Categories</Link>
                            <Link to="/sales">Sales</Link>
                            <Link to="/reports">Reports</Link>
                            <Link to="/users">Users</Link>
                        </>
                    )}
                </nav>

                <div
                    style={{
                        marginTop: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem"
                    }}
                >
                    {user && (
                        <>
                            <span>
                                <strong>{user.email}</strong>
                                {" | "}
                                {ROLE_LABELS[user.role] ?? user.role}
                            </span>

                            <Link to="/change-password">Change Password</Link>

                            <button onClick={logout}>Logout</button>
                        </>
                    )}
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}