import React, { useRef, useEffect, useState } from "react";
import { Modal, Input, Space, Switch, Button, Form, message } from "antd";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { extractLatLngsFromPolygon } from "../../utils/coords";

const toGeoJsonPolygonCoords = (latlngs) => {
  if (!latlngs || !Array.isArray(latlngs)) return [];

  // flatten للوصول لزوج lat,lng
  const flatten = (arr) => {
    if (Array.isArray(arr[0]) && typeof arr[0][0] === "number") return arr;
    return flatten(arr[0]);
  };

  const clean = flatten(latlngs);

  const ring = clean.map(([lat, lng]) => [lng, lat]);

  // تأكيد إغلاق الشكل
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);

  return [ring];
};

export default function ZoneEditorModal({ visible, onClose, onSubmit, initialZone, loading }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [polygonLatLngs, setPolygonLatLngs] = useState([]);
  const featureGroupRef = useRef(null);
  const mapRef = useRef(null);

  const defaultCenter = [30.033333, 31.233334];

  // 🟦 useEffect الأول: تحميل البيانات فقط — دون رسم على الخريطة
  useEffect(() => {
    const featureGroup = featureGroupRef.current;
    let pts = [];

    if (featureGroup) featureGroup.clearLayers();

    if (initialZone) {
      form.setFieldsValue({
        name: initialZone.name,
        isActive: initialZone.isActive,
        shippingCost: initialZone.shippingCost,
      });

      pts = extractLatLngsFromPolygon(initialZone.polygon);
      setPolygonLatLngs(pts);
    } else {
      form.resetFields();
      setPolygonLatLngs([]);
    }

    if (visible) {
      setTimeout(() => {
        const map = mapRef.current;
        if (map) {
          map.invalidateSize();
          map.setView(
            pts.length ? pts[Math.floor(pts.length / 2)] : defaultCenter,
            13
          );
        }
      }, 150);
    }
  }, [initialZone, visible]);

  // 🟦 useEffect الثاني: رسم البوليغون فعليًا بعد ظهور المودال
  useEffect(() => {
    if (!visible) return;

    setTimeout(() => {
      const map = mapRef.current;
      const fg = featureGroupRef.current;

      if (map) map.invalidateSize();

      if (fg) {
        fg.clearLayers();

        if (polygonLatLngs.length >= 3) {
          const layer = L.polygon(polygonLatLngs);
          fg.addLayer(layer);
          if (layer.editing) layer.editing.enable();
        }
      }
    }, 250);
  }, [visible, polygonLatLngs]);

  const handleCreated = (e) => {
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);

    setPolygonLatLngs(latlngs);

    featureGroupRef.current.clearLayers();
    featureGroupRef.current.addLayer(layer);
  };

  const handleEdited = (e) => {
    e.layers.eachLayer(layer => {
      const latlngs = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);
      setPolygonLatLngs(latlngs);
    });
  };

  const handleDeleted = () => setPolygonLatLngs([]);

  const submit = async () => {
    try {
      const values = await form.validateFields();

      if (!polygonLatLngs || polygonLatLngs.length < 3) {
        message.error(t("zones.draw_polygon"));
        return;
      }

      const body = {
        name: values.name,
        polygon: {
          type: "Polygon",
          coordinates: [toGeoJsonPolygonCoords(polygonLatLngs)[0]]
        },
        isActive: values.isActive || false,
        shippingCost: values.shippingCost || "0.00"
      };

      await onSubmit(body);
    } catch (err) { }
  };

  const center =
    polygonLatLngs.length
      ? polygonLatLngs[Math.floor(polygonLatLngs.length / 2)]
      : defaultCenter;

  return (
    <Modal open={visible} onCancel={onClose} title={initialZone ? t("zones.edit_zone") : t("zones.add_zone")} footer={null} width={1000}>
      <Form layout="vertical" form={form}>
        <Form.Item name="name" label={t("zones.name")} rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="isActive" label={t("zones.active")} valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="shippingCost" label="Shipping Cost" rules={[{ required: true }]}>
          <Input prefix="EGP" type="number" step="0.01" min="0" />
        </Form.Item>


        <div style={{ height: 450, marginBottom: 12 }}>
          <MapContainer
            key={initialZone ? initialZone.id : "add"}
            ref={mapRef}
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                onDeleted={handleDeleted}
                draw={{
                  rectangle: false,
                  polyline: false,
                  circle: false,
                  marker: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>
          </MapContainer>
        </div>

        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={submit}>
            {initialZone ? "Save" : "Add"}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
