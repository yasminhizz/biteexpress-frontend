import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header1";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { GoogleMap, Marker, DirectionsRenderer, useLoadScript } from "@react-google-maps/api";
import "./customerTrackOrder.css";

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

export default function CustomerTrackOrder() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [vendorLocation, setVendorLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState("");
  const [eta, setEta] = useState("");

  const latFilter = useRef(new KalmanFilter());
  const lngFilter = useRef(new KalmanFilter());

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  /* ================= Firestore Live Listener ================= */
  useEffect(() => {
    if (!id) return;

    const ref = doc(db, "orders", id);

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      setOrder({ id: snap.id, ...data });

      // Normalize customer location
      if (data.customerLocation) {
        setCustomerLocation({
          lat: data.customerLocation.lat ?? data.customerLocation._lat,
          lng: data.customerLocation.lng ?? data.customerLocation._lng,
        });
      }

      // Kalman-filtered vendor location
      if (data.vendorLocation) {
        const rawLat = data.vendorLocation.lat ?? data.vendorLocation._lat;
        const rawLng = data.vendorLocation.lng ?? data.vendorLocation._lng;

        const smoothLat = latFilter.current.filter(rawLat);
        const smoothLng = lngFilter.current.filter(rawLng);

        setVendorLocation({ lat: smoothLat, lng: smoothLng });
      }
    });

    return () => unsub();
  }, [id]);

  /* ================= Directions (Route) ================= */
  useEffect(() => {
    if (!vendorLocation || !customerLocation || !window.google) return;

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: vendorLocation,
        destination: customerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);

          const leg = result.routes[0].legs[0];
          setDistance(leg.distance.text);
          setEta(leg.duration.text);
        }
      }
    );
  }, [vendorLocation, customerLocation]);

  /* ================= Guards ================= */
  if (!isLoaded)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading map...</div>
      </>
    );

  if (!order)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading order tracking...</div>
      </>
    );

  if (!vendorLocation || !customerLocation)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>
          Waiting for delivery to start...
        </div>
      </>
    );

  /* ================= Render ================= */
  return (
    <>
      <Header />

      <div className="trackxx-page">
        <h2>Tracking Order #{order.id}</h2>

        <div className="trackxx-layout">
          {/* MAP */}
          <div className="mapxx-box">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              zoom={14}
              center={vendorLocation}
            >
              <Marker position={vendorLocation} label="V" />
              <Marker position={customerLocation} label="C" />

              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#4285F4",
                      strokeWeight: 6,
                    },
                  }}
                />
              )}
            </GoogleMap>
          </div>

          {/* DETAILS */}
          <div className="trackxx-info">
            <div className="status">Status: {order.status}</div>
            <div>Vendor: {order.vendorName || "Vendor"}</div>
            <div>Customer: {order.customerName || "Customer"}</div>
            <div>Distance: {distance || "Calculating..."}</div>
            <div>ETA: {eta || "Calculating..."}</div>
          </div>
        </div>
      </div>
    </>
  );
}
