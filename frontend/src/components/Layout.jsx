import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";

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

                <div style={{ marginTop: "1rem" }}>
                    {user && (
                        <>
                            <strong>
                                {user.name} {user.surname}
                            </strong>
                            {" | "}
                            {user.role}
                            {" | "}
                            <button
                                onClick={logout}
                                style={{ marginLeft: "1rem" }}
                            >
                                Logout
                            </button>
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