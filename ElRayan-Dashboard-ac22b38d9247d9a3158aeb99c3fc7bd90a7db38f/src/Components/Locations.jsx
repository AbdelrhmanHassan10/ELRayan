import { useEffect, useState } from "react";
import axios from "axios";
import { Spin } from "antd";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// fix leaflet icons
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function Locations() {
    const [data, setData] = useState([]);
    const [limit, setLimit] = useState(100);
    const [loading, setLoading] = useState(true);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `https://api.maghni.acwad.tech/api/v1/vendor/dashboard/locations?limit=${limit}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setData(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, [limit]);

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Vendor Locations Map</h2>

                <div className="flex items-center gap-2">
                    <label className="text-gray-600">Limit:</label>
                    <input
                        type="number"
                        value={limit}
                        min="1"
                        className="border px-3 py-1 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onChange={(e) => setLimit(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {data.length === 0 ? (
                        <p className="text-gray-500 text-center">No locations available</p>
                    ) : (
                        <MapContainer
                            center={[30.0444, 31.2357]} // Cairo as default
                            zoom={6}
                            scrollWheelZoom={true}
                            style={{ height: "500px", width: "100%", borderRadius: "12px" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {data.map((vendor) => (
                                <Marker
                                    key={vendor.id}
                                    position={[
                                        parseFloat(vendor.latitude),
                                        parseFloat(vendor.longitude),
                                    ]}
                                >
                                    <Popup>
                                        <div className="font-semibold text-lg">{vendor.name}</div>
                                        <div>
                                            Status:{" "}
                                            <span
                                                style={{
                                                    color: vendor.isOpen ? "green" : "red",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {vendor.isOpen ? "Open" : "Closed"}
                                            </span>
                                        </div>
                                        <div>Lat: {vendor.latitude}</div>
                                        <div>Lng: {vendor.longitude}</div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </>
            )}
        </div>
    );
}
