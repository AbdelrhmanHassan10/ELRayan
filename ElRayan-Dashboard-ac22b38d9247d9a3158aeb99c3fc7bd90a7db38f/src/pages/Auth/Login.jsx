import { useState } from "react";
import { LOGIN } from "../../Api/Api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


export default function Login() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // دالة إرسال البيانات للسيرفر
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier, password, playerId: "string" }),
            });

            const data = await response.json();

            console.log(data)
            if (response.ok) {
                toast.success(t("auth.success"));
                setTimeout(() => { navigate("/") }, 1500)
                localStorage.setItem("token", data.data.accessToken)
                console.log(data);
            } else {
                toast.error(t("auth.failed") + " " + data.message);
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(t("auth.error"));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <img src="" alt="" />
                    <h1 className="text-2xl font-bold">{t("auth.title")}</h1>
                </div>
                <h4 className="text-xl font-semibold text-gray-800 text-center">
                    {t("auth.welcome")}
                </h4>
                <p className="text-sm text-gray-500 text-center mb-6">
                    {t("auth.subtitle")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <input
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={t("auth.email")}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    {/* Password */}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("auth.password")}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-[#e3010f] text-white font-medium py-2 rounded-lg hover:bg-[#b2000b] transition"
                    >
                        {t("auth.signin")}
                    </button>
                </form>
            </div>

            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
    );
}
