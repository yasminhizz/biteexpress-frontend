import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "../components/header1";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import "./customerTrackOrder.css";

export default function CustomerTrackOrder() {
  const { id } = useParams();
  const { state } = useLocation();

  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!state?.order);
  const [vendorLocation, setVendorLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [distance, setDistance] = useState(null); // in km
  const [eta, setEta] = useState(null); // in minutes

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  /* ================= Fetch Order (if page refreshed) ================= */
  useEffect(() => {
    if (order || !id) return;

    const fetchOrder = async () => {
      try {
        const ref = doc(db, "orders", id);
        const snap = await getDoc(ref);
        if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, order]);

  /* ================= Load Locations ================= */
  useEffect(() => {
    if (!order) return;

    // normalize Firestore GeoPoints to {lat,lng}
    if (order.vendorLocation) {
      setVendorLocation({
        lat: order.vendorLocation.lat || order.vendorLocation._lat,
        lng: order.vendorLocation.lng || order.vendorLocation._long || order.vendorLocation._lng,
      });
    }

    if (order.customerLocation) {
      setCustomerLocation({
        lat: order.customerLocation.lat || order.customerLocation._lat,
        lng: order.customerLocation.lng || order.customerLocation._long || order.customerLocation._lng,
      });
    }
  }, [order]);

  /* ================= Calculate Distance & ETA ================= */
  useEffect(() => {
    if (!vendorLocation || !customerLocation) return;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(customerLocation.lat - vendorLocation.lat);
    const dLng = toRad(customerLocation.lng - vendorLocation.lng);
    const lat1 = toRad(vendorLocation.lat);
    const lat2 = toRad(customerLocation.lat);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    setDistance(d);

    // Assume average speed 40 km/h
    const avgSpeed = 40; // km/h
    const etaMinutes = (d / avgSpeed) * 60;
    setEta(etaMinutes);
  }, [vendorLocation, customerLocation]);

  /* ================= Guards ================= */
  if (loading)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading order tracking...</div>
      </>
    );

  if (!order)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Order not found.</div>
      </>
    );

  if (!vendorLocation || !customerLocation)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>
          Waiting for delivery location data...
        </div>
      </>
    );

  if (!isLoaded)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading map...</div>
      </>
    );

  /* ================= Render ================= */
  return (
    <>
      <Header />
      <div className="track-page">
        <h2>Tracking Order #{order.id}</h2>

        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "500px" }}
          zoom={14}
          center={vendorLocation}
          onLoad={(map) => (mapRef.current = map)}
        >
          <Marker position={vendorLocation} label="V" />
          <Marker position={customerLocation} label="C" />
        </GoogleMap>

        <div className="track-info">
          <div>Status: {order.status}</div>
          {distance !== null && eta !== null && (
            <>
              <div>Distance: {distance.toFixed(2)} km</div>
              <div>ETA: {Math.ceil(eta)} minutes</div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
