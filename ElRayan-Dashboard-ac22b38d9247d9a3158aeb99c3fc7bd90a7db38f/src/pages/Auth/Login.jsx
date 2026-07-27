import { useState } from "react";
import { LOGIN } from "../../Api/Api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import logo from "../../../logo.png";

export default function Login() {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // دالة إرسال البيانات للسيرفر
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch(LOGIN, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier, password, playerId: "string" }),
            });

            const data = await response.json();

            console.log(data);
            if (response.ok) {
                toast.success(t("auth.success") || "مرحباً بك مجدداً! تم تسجيل الدخول إلى نظام الريان بنجاح");
                setTimeout(() => { navigate("/") }, 1500);
                localStorage.setItem("token", data.data.accessToken);
            } else {
                toast.error(t("auth.failed") + " " + (data.message || "⚠️ فشل تسجيل الدخول، يرجى التحقق من البيانات"));
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(t("auth.error") || "حدث خطأ في الاتصال بالخادم");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-4 font-sans relative overflow-hidden" dir="rtl">
            {/* Soft ambient background glows for light mode */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Centered Executive Luxury Card */}
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-slate-200/80 border border-slate-100 p-8 sm:p-10 relative z-10 transition-all duration-300">
                {/* Top accent gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-[#e3010f] to-red-600 rounded-t-[2rem]" />

                {/* Header & Brand Section */}
                <div className="flex flex-col items-center justify-center text-center mb-8 pt-3">
                    {/* Top capsule pill badge */}

                    {/* Logo Jewel Box */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-100 shadow-sm mb-4 inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                        <img
                            src={logo}
                            alt="El Rayan Store Logo"
                            className="h-16 sm:h-18 w-auto max-w-[190px] object-contain drop-shadow-xs"
                        />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                        {t("auth.welcome") || "أهلاً بك مجدداً!"}
                    </h1>
                    <p className="text-sm font-semibold text-slate-500 mt-1 max-w-xs">
                        {t("auth.subtitle") || "سجل الدخول بحساب المسؤول للمتابعة إلى لوحة التحكم"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4.5">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                            {t("auth.email") || "البريد الإلكتروني"}
                        </label>
                        <div className="relative rounded-2xl shadow-2xs transition-all duration-200 focus-within:ring-4 focus-within:ring-red-500/10 focus-within:border-red-600 group">
                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-600 transition-colors">
                                <Mail className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <input
                                type="email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="admin@elrayan.com"
                                className="w-full py-3.5 ps-12 pe-4 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-slate-900 font-semibold text-sm rounded-2xl border border-slate-200 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                            {t("auth.password") || "كلمة المرور"}
                        </label>
                        <div className="relative rounded-2xl shadow-2xs transition-all duration-200 focus-within:ring-4 focus-within:ring-red-500/10 focus-within:border-red-600 group">
                            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-red-600 transition-colors">
                                <Lock className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full py-3.5 ps-12 pe-12 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-slate-900 font-semibold text-sm rounded-2xl border border-slate-200 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 end-0 pe-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-[#e3010f] to-red-600 text-white font-black text-base shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>جاري التحقق...</span>
                            </div>
                        ) : (
                            <span>{t("auth.signin") || "تسجيل الدخول"}</span>
                        )}
                    </button>
                </form>

                {/* Bottom Trust Badge */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>© {new Date().getFullYear()} الريان ماركت</span>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer position="top-center" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick rtl pauseOnFocusLoss draggable pauseOnHover theme="light" />
        </div>
    );
}
