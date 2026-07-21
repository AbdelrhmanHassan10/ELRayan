import { Sidebar } from "./SIdeBar";




import { useTranslation } from "react-i18next";
import { Button } from "antd";

export function DashboardLayout({
    children,
    sidebarItems,
    activePath,
    brandName,
}) {
    const { i18n } = useTranslation();
    const isRtl = i18n.dir() === "rtl";

    const toggleLanguage = () => {
        const newLang = i18n.language === "en" ? "ar" : "en";
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
            {
                activePath !== "/login" &&
                <Sidebar
                    items={sidebarItems}
                    activePath={activePath}
                    brandName={brandName}
                />
            }
            <main className="flex-1 overflow-auto relative">
                <div className="absolute top-4 right-4 z-50">
                    <Button onClick={toggleLanguage}>
                        {i18n.language === "en" ? "العربية" : "English"}
                    </Button>
                </div>
                <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
