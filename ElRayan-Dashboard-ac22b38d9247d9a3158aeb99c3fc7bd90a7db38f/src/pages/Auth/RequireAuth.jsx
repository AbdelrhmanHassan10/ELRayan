import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RequireAuth({ children }) {
    const [checking, setChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Simulate a short loading time (e.g. checking token validity)
        setTimeout(() => {
            if (token) setIsAuthenticated(true);
            setChecking(false);
        }, 500);
    }, []);

    if (checking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 font-medium">Checking authorization...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
