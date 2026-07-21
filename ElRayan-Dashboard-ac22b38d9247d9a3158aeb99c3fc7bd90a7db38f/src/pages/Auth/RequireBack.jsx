import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function RequireBack({ children }) {
  const [checking, setChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setTimeout(() => {
      if (token) setHasToken(true);
      setChecking(false);
    }, 500);
  }, []);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 font-medium">Checking login status...</p>
      </div>
    );
  }

  if (hasToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}
