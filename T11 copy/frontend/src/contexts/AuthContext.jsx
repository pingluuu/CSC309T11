import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Load user on first mount (hard reload)
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch(`${BACKEND_URL}/user/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then((res) => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then((data) => {
                    setUser(data.user);
                })
                .catch(() => {
                    setUser(null);
                });
        } else {
            setUser(null);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const login = async (username, password) => {
        try {
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const errData = await res.json();
                return errData.message;
            }

            const { token } = await res.json();
            localStorage.setItem("token", token);

            const userRes = await fetch(`${BACKEND_URL}/user/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!userRes.ok) throw new Error("Failed to fetch user");

            const userData = await userRes.json();
            setUser(userData.user);
            navigate("/profile");
        } catch (err) {
            return err.message || "Login failed";
        }
    };

    const register = async ({ username, firstname, lastname, password }) => {
        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, firstname, lastname, password })
            });

            if (!res.ok) {
                const errData = await res.json();
                return errData.message;
            }

            navigate("/success");
        } catch (err) {
            return err.message || "Registration failed";
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
