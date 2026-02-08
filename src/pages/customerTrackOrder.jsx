import React, { useEffect, useState, useRef, useCallback } from "react";
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

  const [distanceText, setDistanceText] = useState("");
  const [etaText, setEtaText] = useState("");

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const mapRef = useRef(null);
  const directionsRendererRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"], // not required, but safe
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

    // normalize Firestore GeoPoints / plain objects to {lat,lng}
    if (order.vendorLocation) {
      setVendorLocation({
        lat: order.vendorLocation.lat ?? order.vendorLocation._lat,
        lng:
          order.vendorLocation.lng ??
          order.vendorLocation._long ??
          order.vendorLocation._lng,
      });
    }

    if (order.customerLocation) {
      setCustomerLocation({
        lat: order.customerLocation.lat ?? order.customerLocation._lat,
        lng:
          order.customerLocation.lng ??
          order.customerLocation._long ??
          order.customerLocation._lng,
      });
    }
  }, [order]);

  /* ================= Draw route (blue line) ================= */
  const drawRoute = useCallback(() => {
    if (!window.google || !vendorLocation || !customerLocation) return;

    // init renderer once
    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#4285F4",
          strokeWeight: 6,
        },
      });
    }

    const map = mapRef.current;
    if (!map) return;

    directionsRendererRef.current.setMap(map);

    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: vendorLocation,
        destination: customerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result?.routes?.[0]?.legs?.[0]) {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes[0].legs[0];
          setDistanceText(leg.distance?.text || "");
          setEtaText(leg.duration?.text || "");

          // optional: auto-fit route on screen
          if (result.routes[0].bounds) {
            map.fitBounds(result.routes[0].bounds);
          }
        } else {
          console.warn("Directions failed:", status);
          setDistanceText("");
          setEtaText("");
        }
      }
    );
  }, [vendorLocation, customerLocation]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!vendorLocation || !customerLocation) return;
    if (!mapRef.current) return;
    drawRoute();
  }, [isLoaded, vendorLocation, customerLocation, drawRoute]);

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
        <div style={{ padding: 20 }}>Waiting for delivery location data...</div>
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
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          <Marker position={vendorLocation} label="V" />
          <Marker position={customerLocation} label="C" />
          {/* Blue route is handled by DirectionsRenderer (not a React component) */}
        </GoogleMap>

        <div className="track-info">
          <div>Status: {order.status}</div>

          {distanceText || etaText ? (
            <>
              <div>Distance: {distanceText || "Calculating..."}</div>
              <div>ETA: {etaText || "Calculating..."}</div>
            </>
          ) : (
            <div>Route: Calculating...</div>
          )}
        </div>
      </div>
    </>
  );
}
