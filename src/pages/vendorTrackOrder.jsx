import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Header from "../components/header4";
import "./vendorTrackOrder.css";

/* ================= Kalman Filter ================= */
class KalmanFilter {
  constructor(R = 0.01, Q = 3) {
    this.R = R;
    this.Q = Q;
    this.cov = NaN;
    this.x = NaN;
  }

  filter(z) {
    if (isNaN(this.x)) {
      this.x = z;
      this.cov = 1;
    } else {
      const predCov = this.cov + this.Q;
      const K = predCov / (predCov + this.R);
      this.x = this.x + K * (z - this.x);
      this.cov = predCov - K * predCov;
    }
    return this.x;
  }
}
/* ================================================ */

export default function VendorTrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vendorMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const watchIdRef = useRef(null);

  const latFilter = useRef(new KalmanFilter());
  const lngFilter = useRef(new KalmanFilter());

  const [order, setOrder] = useState(null);
  const [distance, setDistance] = useState("");
  const [eta, setEta] = useState("");

  /* 🔥 Listen order in real-time */
  useEffect(() => {
    const ref = doc(db, "orders", orderId);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    });
    return () => unsub();
  }, [orderId]);

  /* 🗺️ Initialize Map */
  useEffect(() => {
    if (!order || mapInstance.current || !window.google) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: order.customerLocation,
      zoom: 15,
    });

    // Customer marker
    customerMarkerRef.current = new window.google.maps.Marker({
      map: mapInstance.current,
      position: order.customerLocation,
      label: "C",
    });

    // Vendor marker
    vendorMarkerRef.current = new window.google.maps.Marker({
      map: mapInstance.current,
      label: "V",
    });

    // Directions renderer
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#4285F4",
        strokeWeight: 6,
      },
    });

    directionsRendererRef.current.setMap(mapInstance.current);
  }, [order]);

  /* 🧭 Calculate route */
  const drawRoute = (vendorPos) => {
    if (!window.google || !directionsRendererRef.current) return;

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: vendorPos,
        destination: order.customerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes[0].legs[0];
          setDistance(leg.distance.text);
          setEta(leg.duration.text);
        }
      }
    );
  };

  /* 📡 Live GPS tracking (OUT FOR DELIVERY) */
  useEffect(() => {
    if (!order || order.status !== "out for delivery") return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = latFilter.current.filter(pos.coords.latitude);
        const lng = lngFilter.current.filter(pos.coords.longitude);
        const vendorPos = { lat, lng };

        vendorMarkerRef.current.setPosition(vendorPos);
        mapInstance.current.panTo(vendorPos);

        drawRoute(vendorPos);

        await updateDoc(doc(db, "orders", orderId), {
          vendorLocation: vendorPos,
          updatedAt: new Date(),
        });
      },
      console.error,
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchIdRef.current);
  }, [order]);

  if (!order) {
    return (
      <>
        <Header />
        <div className="vendor-map-loading">Loading tracking...</div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="vendor-map-page">
        <div className="vendor-map-header">
          <h3>Live Vendor Tracking</h3>
          <p>Order ID: {orderId}</p>
          <span className="tracking-indicator">🟢 Live tracking active</span>
        </div>

        <div className="tracking-layout">
          {/* MAP */}
          <div className="map-columns">
            <div ref={mapRef} className="vendor-map-container" />
          </div>

          {/* INFO CARD */}
          <div className="info-columns">
            <div className="tracking-card">
              <h4>Tracking Information</h4>

              <div className="info-box">
                <span>Vendor</span>
                <strong>{order.vendorName || "Vendor"}</strong>
              </div>

              <div className="info-box">
                <span>Customer</span>
                <strong>{order.customerName || "Customer"}</strong>
              </div>

              <div className="info-box">
                <span>Distance</span>
                <strong>{distance || "Calculating..."}</strong>
              </div>

              <div className="info-box">
                <span>ETA</span>
                <strong>{eta || "Calculating..."}</strong>
              </div>

              <div className="status-badge">
                {order.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="vendor-map-actions">
          <button onClick={() => navigate("/vendor/ongoing-orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    </>
  );
}
