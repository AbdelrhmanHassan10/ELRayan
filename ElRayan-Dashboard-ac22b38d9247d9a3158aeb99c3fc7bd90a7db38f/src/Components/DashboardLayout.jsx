import { Sidebar } from "./SIdeBar";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import logo from "../../logo.png";
export function DashboardLayout({
    children,
    sidebarItems,
    activePath,
    brandName,
}) {
    const { i18n } = useTranslation();
    const isRtl = i18n.dir() === "rtl";
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === "en" ? "ar" : "en";
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
            {activePath !== "/login" && (
                <Sidebar
                    items={sidebarItems}
                    activePath={activePath}
                    brandName={brandName}
                    isMobileOpen={isMobileOpen}
                    onCloseMobile={() => setIsMobileOpen(false)}
                />
            )}
            <main className="flex-1 overflow-auto relative">
                {activePath !== "/login" ? (
                    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 py-3 bg-[#172554] border-b border-[#1e3a8a]/50 shadow-md shadow-[#172554]/10">
                        {/* Left side: Menu Button + Brand */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMobileOpen(!isMobileOpen)}
                                className="lg:hidden group relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white shadow-md hover:bg-white/20 active:scale-95 transition-all duration-200 cursor-pointer"
                                title={i18n.language === "ar" ? "القائمة الرئيسية" : "Menu"}
                            >
                                <Menu className="w-5 h-5 stroke-[2.5]" />
                            </button>
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="El Rayan" className="h-9 w-auto max-w-[135px] object-contain brightness-110" />
                                <div className="hidden sm:flex flex-col border-s-2 border-rose-400/40 ps-2.5 rtl:pe-2.5 rtl:ps-0 rtl:border-s-0 rtl:border-e-2 justify-center">
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-white whitespace-nowrap">
                                        El Rayan <span className="text-rose-400">Dashboard</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right side: Language Switcher */}
                        <div className="flex items-center gap-3 ms-auto">
                            <button
                                onClick={toggleLanguage}
                                className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/15 hover:border-rose-400/40 transition-all cursor-pointer"
                                title={i18n.language === "en" ? "التبديل إلى العربية" : "Switch to English"}
                            >
                                <span className="p-1 rounded-lg bg-white/10 text-rose-400 group-hover:bg-rose-400/20 transition-colors">
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </span>
                                <span className="tracking-wide font-extrabold">
                                    {i18n.language === "en" ? "العربية" : "English"}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-400/20 text-rose-400 text-3xs font-black tracking-wider uppercase border border-rose-400/30">
                                    {i18n.language === "en" ? "AR" : "EN"}
                                </span>
                            </button>
                        </div>
                    </header>
                ) : (
                    <div className="absolute top-4 right-4 z-50">
                        <button
                            onClick={toggleLanguage}
                            className="group relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md border border-slate-700/60 cursor-pointer"
                        >
                            <span className="text-rose-400">🌐</span>
                            <span>{i18n.language === "en" ? "العربية" : "English"}</span>
                        </button>
                    </div>
                )}
                <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
