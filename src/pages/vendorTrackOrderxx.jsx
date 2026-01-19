import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header4";
import "./vendorTrackOrderxx.css";

export default function VendorTrackOrderxx() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const navigate = useNavigate();

  const [distance, setDistance] = useState("");
  const [eta, setEta] = useState("");

  // Dummy names
  const vendorName = "Smash Burger";
  const customerName = "Maizatul Mardhiah";

  useEffect(() => {
    if (!window.google || mapInstance.current) return;

    // UiTM Shah Alam dummy coordinates
    const vendorLocation = { lat: 3.0712, lng: 101.5035 };
    const customerLocation = { lat: 3.0675, lng: 101.4998 };

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: vendorLocation,
      zoom: 15,
    });

    // Vendor marker
    new window.google.maps.Marker({
      position: vendorLocation,
      map: mapInstance.current,
      label: "V",
    });

    // Customer marker
    new window.google.maps.Marker({
      position: customerLocation,
      map: mapInstance.current,
      label: "C",
    });

    // Directions (route)
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#4285F4",
        strokeWeight: 6,
      },
    });

    directionsRenderer.setMap(mapInstance.current);

    directionsService.route(
      {
        origin: vendorLocation,
        destination: customerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          setDistance(leg.distance.text);
          setEta(leg.duration.text);
        }
      }
    );
  }, []);

  return (
    <>
      <Header />

      <div className="vendor-map-page">
        <div className="vendor-map-header">
          <h3>Live Vendor Tracking</h3>
          <p>Order ID: #n891hjjkakkkagah221</p>
          <span className="tracking-indicator">🟢 Live tracking active</span>
        </div>

        {/* 2-Column Layout */}
        <div className="tracking-layout">
          {/* LEFT - MAP */}
          <div className="map-columns">
            <div ref={mapRef} className="vendor-map-container" />
          </div>

          {/* RIGHT - INFO */}
          <div className="info-columns">
            
        <div className="tracking-card">
  <h4>Tracking Information</h4>

  <div className="info-box">
    <span>Vendor</span>
    <strong>{vendorName}</strong>
  </div>

  <div className="info-box">
    <span>Customer</span>
    <strong>{customerName}</strong>
  </div>

  <div className="info-box">
    <span>Distance</span>
    <strong>{distance || "Calculating..."}</strong>
  </div>

  <div className="info-box">
    <span>ETA</span>
    <strong>{eta || "Calculating..."}</strong>
  </div>

  <div className="status-badge">Out for Delivery</div>
</div>


             
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="vendor-map-actions">
          <button onClick={() => navigate("/vendor/ongoing-orders")}>
            Back to Orders
          </button>
        </div>
      </div>
    </>
  );
}
