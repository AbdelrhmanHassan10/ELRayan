import React, { useEffect, useState } from "react";
import { Button, message, Spin, Empty } from "antd";
import ZonesTable from "../../Components/zones/ZonesTable";
import ZoneMapModal from "../../Components/zones/ZoneMapModal";
import ZoneEditorModal from "../../Components/zones/ZoneEditorModal";
import * as api from "../../Api/Api";
import { useTranslation } from "react-i18next";
import { 
  MapPin, 
  Map, 
  Plus, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  Layers,
  Navigation
} from "lucide-react";

export default function ZonesDashboard() {
  const { t, i18n } = useTranslation();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [selectedZone, setSelectedZone] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  const isArabic = i18n.language === "ar";
  const currency = isArabic ? "ج.م" : "EGP";

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await api.getZones();
      setZones(res.data.data || []);
    } catch (err) {
      message.error(t("zones.fetch_fail") || (isArabic ? "فشل جلب المناطق" : "Failed to fetch zones"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleShowMap = (zone) => {
    setSelectedZone(zone);
    setMapVisible(true);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setEditorVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteZone(id);
      message.success(isArabic ? "تم حذف المنطقة بنجاح" : "Zone deleted successfully");
      fetchZones();
    } catch (err) {
      message.error(isArabic ? "فشل حذف المنطقة" : "Failed to delete zone");
    }
  };

  const handleToggle = async (id, checked) => {
    try {
      await api.updateZone(id, { isActive: checked });
      message.success(isArabic ? "تم تحديث حالة المنطقة" : "Zone status updated");
      fetchZones();
    } catch (err) {
      message.error(isArabic ? "فشل تحديث الحالة" : "Failed to update status");
    }
  };

  const handleAddClick = () => {
    setEditingZone(null);
    setEditorVisible(true);
  };

  const handleSubmitZone = async (body) => {
    setSubmitLoading(true);
    try {
      if (editingZone) {
        await api.updateZone(editingZone.id, body);
        message.success(t("zones.update_success") || (isArabic ? "تم تحديث المنطقة بنجاح" : "Zone updated successfully"));
      } else {
        await api.addZone(body);
        message.success(t("zones.add_success") || (isArabic ? "تمت إضافة المنطقة بنجاح" : "Zone added successfully"));
      }
      setEditorVisible(false);
      fetchZones();
    } catch (err) {
      message.error(t("zones.fetch_fail") || (isArabic ? "حدث خطأ أثناء حفظ المنطقة" : "Error saving zone"));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Stats calculation
  const totalZones = zones.length;
  const activeZones = zones.filter(z => z.isActive).length;
  const inactiveZones = totalZones - activeZones;
  const avgShippingCost = totalZones > 0 
    ? (zones.reduce((sum, z) => sum + parseFloat(z.shippingCost || 0), 0) / totalZones).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6 animate-fadeIn pb-12" dir={isArabic ? "rtl" : "ltr"}>
      {/* Burgundy / Maroon (النبيتي) Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#9f1239] to-[#f43f5e]"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-[#9f1239]/10 text-[#9f1239] rounded-2xl shrink-0 mt-1 shadow-2xs">
              <Map size={28} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#9f1239] text-xs font-bold border border-rose-200/60 mb-2">
                <Sparkles size={14} className="text-[#9f1239]" />
                <span>{isArabic ? "إدارة التوصيل ومناطق الشحن (النظام النبيتي الفاتح)" : "Shipping & Delivery Zones"}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {t("zones.title") || (isArabic ? "مناطق الشحن والتوصيل" : "Delivery Zones")}
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-xl leading-relaxed">
                {isArabic 
                  ? "قم برسم النطاقات الجغرافية لتوصيل الطلبات على الخريطة، وتحديد رسوم الشحن لكل منطقة بكل دقة وسهولة." 
                  : "Draw geographic delivery boundaries on the map and easily configure customized shipping costs per zone."}
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddClick}
            type="primary"
            className="h-11 px-6 bg-[#9f1239] hover:bg-[#881337] text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-[#9f1239]/25 hover:shadow-lg transition-all"
          >
            <Plus size={18} /> 
            <span>{t("zones.add_zone") || (isArabic ? "إضافة منطقة جديدة" : "Add New Zone")}</span>
          </Button>
        </div>
      </div>

      {/* Summary Statistics Cards with Burgundy Theme */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#9f1239]/20 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#9f1239]/10 text-[#9f1239] flex items-center justify-center shrink-0">
            <Globe size={24} />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "إجمالي المناطق" : "Total Zones"}</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{totalZones}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-emerald-500/20 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "مناطق نشطة" : "Active Zones"}</span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{activeZones}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-rose-500/20 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={24} />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "مناطق متوقفة" : "Inactive Zones"}</span>
            <span className="text-2xl font-black text-rose-600 mt-0.5 block">{inactiveZones}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#9f1239]/20 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#9f1239]/10 text-[#9f1239] flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">{isArabic ? "متوسط رسوم الشحن" : "Avg Shipping Cost"}</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-[#9f1239]">{avgShippingCost}</span>
              <span className="text-xs font-bold text-slate-500">{currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Zones Table Container */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-6 bg-[#9f1239] rounded-full"></div>
            <h2 className="text-lg font-black text-slate-800">{isArabic ? "قائمة مناطق الشحن والتوصيل" : "Zones Directory"}</h2>
          </div>
          <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
            {isArabic ? `عدد المناطق: ${totalZones}` : `Count: ${totalZones}`}
          </span>
        </div>

        <ZonesTable
          zones={zones}
          loading={loading}
          onShowMap={handleShowMap}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />
      </div>

      <ZoneMapModal visible={mapVisible} onClose={() => setMapVisible(false)} zone={selectedZone} />

      <ZoneEditorModal
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        onSubmit={handleSubmitZone}
        initialZone={editingZone}
        loading={submitLoading}
      />
    </div>
  );
}

