// ZoneMapModal.jsx
import React, { useEffect } from "react"; // استيراد useEffect
import { Modal } from "antd";
// استيراد Marker و useMap (مهم لإعادة حساب الحجم)
import { MapContainer, TileLayer, Polygon, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet"; // استيراد Leaflet
import "leaflet/dist/leaflet.css"; // تأكد من استيراد CSS
import { extractLatLngsFromPolygon } from "../../utils/coords";

// ----------------------------------------------------
// 1. تحديد الأيقونة (كما فعلت في التاب)
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 2. المكون الذي يعيد حساب حجم الخريطة عند ظهور المودال
function MapResizer({ visible }) {
  const map = useMap();

  useEffect(() => {
    if (visible) {
      // يجب أن يكون التأخير ضرورياً لانتهاء انتقال ظهور المودال
      setTimeout(() => {
        map.invalidateSize();
      }, 100); // 100ms تأخير جيد للتجربة
    }
  }, [visible, map]);

  return null;
}
// ----------------------------------------------------


export default function ZoneMapModal({ visible, onClose, zone }) {
  if (!zone) return null;
  // تأكد أن latlngs هنا بصيغة [Lat, Long]
  const latlngs = extractLatLngsFromPolygon(zone.polygon);

  // مركز الخريطة سيكون متوسط الإحداثيات أو [0,0]
  const center = latlngs.length ? latlngs[Math.floor(latlngs.length / 2)] : [0, 0];

  // لضمان إعادة تهيئة الخريطة عند تغيير المنطقة (Zone)
  const mapKey = zone.id || 'default-map';

  return (
    <Modal open={visible} footer={null} onCancel={onClose} width={900} title={zone.name}>

      {/* shipping cost */}
      <div style={{ marginBottom: 12, fontWeight: "bold", color: "#333" }}>
        Shipping Cost:  <span style={{ color: "#e3010f" }}>EGP {zone.shippingCost}</span>
      </div>


      <div style={{ height: 500 }}>
        <MapContainer
          key={mapKey} // مفتاح لإعادة تهيئة الخريطة
          center={center}
          // اضبط الزوم ليكون مناسباً لعرض المنطقة بالكامل، جرب 13
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          {/* 🚀 إضافة المكون الذي يعالج مشكلة ظهور الخريطة داخل Modal */}
          <MapResizer visible={visible} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* عرض المضلع */}
          {latlngs.length > 0 && <Polygon positions={latlngs} />}

          {/* عرض النقاط (كما طلبنا سابقاً) */}
          {latlngs.map((position, index) => (
            <Marker
              key={index}
              position={position}
              icon={markerIcon} // استخدام الأيقونة المحددة
            >
              <Popup>
                نقطة {index + 1}: ({position[0].toFixed(5)}, {position[1].toFixed(5)})
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Modal>
  );
}