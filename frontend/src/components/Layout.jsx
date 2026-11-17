import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Icon from "./Icon";

const ROLE_LABELS = {
    ADMIN: "Administrator",
    SALES_INVENTORY: "Sales / Inventory"
};

// Pages everyone can use
const MAIN_LINKS = [
    { to: "/", label: "Dashboard", icon: "dashboard", end: true },
    { to: "/sales/new", label: "New Sale", icon: "sale" },
    { to: "/products", label: "Products", icon: "products" },
    { to: "/stock", label: "Stock", icon: "stock" }
];

// Pages only administrators see
const ADMIN_LINKS = [
    { to: "/categories", label: "Categories", icon: "categories" },
    { to: "/sales", label: "Sales History", icon: "sales", end: true },
    { to: "/reports", label: "Reports", icon: "reports" },
    { to: "/users", label: "Users", icon: "users" }
];

// One menu item. NavLink knows which page is open and adds "active".
function SideLink({ to, label, icon, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
            <Icon name={icon} />
            {label}
        </NavLink>
    );
}

export default function Layout() {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === "ADMIN";
    const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-logo">
                        <Icon name="products" size={20} />
                    </div>
                    <div>
                        <div className="brand-name">Retail Inventory</div>
                        <div className="brand-tagline">Stock & Sales Manager</div>
                    </div>
                </div>

                <nav>
                    {MAIN_LINKS.map((link) => (
                        <SideLink key={link.to} {...link} />
                    ))}

                    {isAdmin && (
                        <>
                            <div className="nav-section">Admin</div>
                            {ADMIN_LINKS.map((link) => (
                                <SideLink key={link.to} {...link} />
                            ))}
                        </>
                    )}
                </nav>

                {user && (
                    <div className="sidebar-footer">
                        <div className="user-card">
                            <div className="avatar">{initial}</div>
                            <div>
                                <div className="user-email" title={user.email}>
                                    {user.email}
                                </div>
                                <div className="user-role">
                                    {ROLE_LABELS[user.role] ?? user.role}
                                </div>
                            </div>
                        </div>

                        <SideLink to="/change-password" label="Change Password" icon="lock" />

                        <button
                            className="btn-secondary logout-button"
                            onClick={logout}
                            style={{ marginTop: "0.5rem" }}
                        >
                            <Icon name="logout" size={16} />
                            Logout
                        </button>
                    </div>
                )}
            </aside>

            <main className="content">
                <div className="content-inner">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}