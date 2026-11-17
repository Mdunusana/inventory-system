import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";

export default function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const saved =
            sessionStorage.getItem("user");

        return saved
            ? JSON.parse(saved)
            : null;
    });

    const [token, setToken] = useState(
        sessionStorage.getItem("token")
    );

    useEffect(() => {
        if (token) {
            sessionStorage.setItem(
                "token",
                token
            );
        } else {
            sessionStorage.removeItem(
                "token"
            );
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            sessionStorage.setItem(
                "user",
                JSON.stringify(user)
            );
        } else {
            sessionStorage.removeItem(
                "user"
            );
        }
    }, [user]);

    const login = (
        authToken,
        userData
    ) => {
        setToken(authToken);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);

        sessionStorage.removeItem(
            "token"
        );

        sessionStorage.removeItem(
            "user"
        );
    };

    const value = useMemo(
        () => ({
            user,
            token,
            login,
            logout,
            isAuthenticated: !!token
        }),
        [user, token]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}