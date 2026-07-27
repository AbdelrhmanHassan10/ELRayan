// ZoneMapModal.jsx
import React, { useEffect } from "react";
import { Modal } from "antd";
import { MapContainer, TileLayer, Polygon, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { extractLatLngsFromPolygon } from "../../utils/coords";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapResizer({ visible }) {
  const map = useMap();

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [visible, map]);

  return null;
}

export default function ZoneMapModal({ visible, onClose, zone }) {
  if (!zone) return null;
  const latlngs = extractLatLngsFromPolygon(zone.polygon);
  const center = latlngs.length ? latlngs[Math.floor(latlngs.length / 2)] : [0, 0];
  const mapKey = zone.id || 'default-map';

  return (
    <Modal 
      open={visible} 
      footer={null} 
      onCancel={onClose} 
      width={900} 
      title={
        <div className="flex items-center gap-2 text-lg font-black text-slate-800 pb-2 border-b border-slate-100">
          <span className="p-2 rounded-xl bg-[#9f1239]/10 text-[#9f1239]">📍</span>
          <span>{zone.name}</span>
        </div>
      }
      className="rounded-3xl overflow-hidden"
    >
      <div className="mb-4 mt-3 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between shadow-2xs">
        <span className="font-bold text-slate-700 flex items-center gap-2 text-sm md:text-base">
          <span>رسوم الشحن والتوصيل لهذا النطاق الجغرافي:</span>
        </span>
        <span className="text-lg font-black text-[#9f1239] bg-white px-4 py-1 rounded-xl border border-rose-200 shadow-2xs">
          {zone.shippingCost || "0.00"} EGP
        </span>
      </div>

      <div className="h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        <MapContainer
          key={mapKey}
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <MapResizer visible={visible} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {latlngs.length > 0 && (
            <Polygon 
              positions={latlngs} 
              pathOptions={{ color: "#9f1239", fillColor: "#9f1239", fillOpacity: 0.25, weight: 3 }} 
            />
          )}

          {latlngs.map((position, index) => (
            <Marker
              key={index}
              position={position}
              icon={markerIcon}
            >
              <Popup>
                <div className="font-bold text-center">
                  <span className="text-[#9f1239]">نقطة {index + 1}</span>
                  <br />
                  <span className="text-xs text-slate-500 font-mono">({position[0].toFixed(5)}, {position[1].toFixed(5)})</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Modal>
  );
}