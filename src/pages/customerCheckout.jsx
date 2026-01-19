import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Header from "../components/header1";
import "./customerCheckout.css";

export default function CustomerCheckout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState(state?.items || []);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    location: null,
  });

  const [distance, setDistance] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  /* ================= MAP CONFIG ================= */
  const UITM_CENTER = { lat: 3.0738, lng: 101.4973 };
  const UITM_BOUNDS = {
    north: 3.0825,
    south: 3.0650,
    east: 101.5050,
    west: 101.4880,
  };

  const VENDOR_LOCATION = {
    lat: 3.071071181887715,
    lng: 101.5000231062521,
  };

  /* ================= LOAD CART ================= */
  useEffect(() => {
    if (!state?.items) {
      const saved = localStorage.getItem("cart_demo");
      if (saved) {
        const parsed = JSON.parse(saved).filter((i) => i.selected);
        setItems(parsed);
      }
    }
  }, [state]);

  /* ================= LOAD CUSTOMER ================= */
  useEffect(() => {
    const fetchCustomer = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const dref = doc(db, "customers", user.uid);
        const snap = await getDoc(dref);

        if (snap.exists()) {
          const data = snap.data();
          const loadedCustomer = {
            name: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            location: data.location || null,
          };
          setCustomer(loadedCustomer);

          if (loadedCustomer.location) {
            calculateDistanceAndFee(loadedCustomer.location);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCustomer();
  }, []);

  /* ================= SAVE CUSTOMER DETAILS ================= */
  const saveDetails = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, "customers", user.uid), {
        fullName: customer.name,
        phone: customer.phone,
        address: customer.address,
        location: customer.location || null,
      });

      alert("Customer details updated!");
      setEditing(false);
    } catch (err) {
      alert("Failed to update details.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= MAP INITIALIZATION ================= */
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: customer.location || UITM_CENTER,
      zoom: 17,
      restriction: {
        latLngBounds: UITM_BOUNDS,
        strictBounds: true,
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    markerRef.current = new window.google.maps.Marker({
      map,
      draggable: true,
    });

    // Map click to pin location
    map.addListener("click", (e) => {
      const pos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      markerRef.current.setPosition(pos);
      setCustomer((prev) => ({ ...prev, location: pos }));
      calculateDistanceAndFee(pos);
    });

    // Show existing pinned location
    if (customer.location) {
      markerRef.current.setPosition(customer.location);
      map.setCenter(customer.location);
      calculateDistanceAndFee(customer.location);
    }
  }, []);

  /* ================= DISTANCE & SHIPPING ================= */
  const calculateDistanceAndFee = (custLoc) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(custLoc.lat - VENDOR_LOCATION.lat);
    const dLng = toRad(custLoc.lng - VENDOR_LOCATION.lng);

    const lat1 = toRad(VENDOR_LOCATION.lat);
    const lat2 = toRad(custLoc.lat);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    setDistance(d);

    let fee = 5;
    if (d < 1) fee = 2;
    else if (d < 2) fee = 3;
    else if (d < 3) fee = 4;

    setShippingFee(fee);
  };

  /* ================= PAYMENT ================= */
  const payNow = async () => {
    if (!customer.location) {
      alert("Please pin your delivery location");
      return;
    }

    try {
      setLoading(true);

      // Save pinned location to customer profile
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "customers", user.uid), {
          location: customer.location,
        });
      }

      // Pass customer location to payment page
      navigate("/customer/payment", {
        state: { items, customer, shippingFee, distance },
      });
    } catch (err) {
      console.error("Failed to save location:", err);
      alert("Failed to save location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce(
    (sum, it) => sum + it.price * (it.qty || 1),
    0
  );

  /* ================= UI ================= */
  return (
    <>
      <Header />
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-grid">

            {/* CUSTOMER DETAILS */}
            <div className="left-card">
              <div className="card-header">
                <h2>Customer Details</h2>
                {!editing ? (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                ) : (
                  <button
                    className="saves-btn"
                    onClick={saveDetails}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                )}
              </div>

              <div className="customer-form">
                <label>Full Name</label>
                <input
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  disabled={!editing}
                />

                <label>Email</label>
                <input value={customer.email} disabled />

                <label>Phone</label>
                <input
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  disabled={!editing}
                />

                <label>Address</label>
                <textarea
                  value={customer.address}
                  onChange={(e) =>
                    setCustomer({ ...customer, address: e.target.value })
                  }
                  disabled={!editing}
                />
              </div>

              <h4 style={{ marginTop: "20px" }}>Pin Location: </h4>
              <div
                ref={mapRef}
                style={{
                  width: "100%",
                  height: "250px",
                  borderRadius: "10px",
                  marginTop: "7px",
                }}
              ></div>

              {customer.location && (
                <div className="distance-info">
                  <p>
                    <b>Distance to Vendor:</b> {distance.toFixed(3)} km
                  </p>
                </div>
              )}
            </div>

            {/* ORDER SUMMARY */}
            <div className="right-card">
              <h2>Order Summary</h2>

              <div className="items-list">
                {items.map((it) => (
                  <div className="summary-item" key={it.id}>
                    <div className="s-left">
                      <div className="s-name">{it.name}</div>
                      <div className="s-vendor">{it.vendorName}</div>
                    </div>
                    <div className="s-right">
                      <div className="s-price">
                        RM {(it.price * (it.qty || 1)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-bottom">
                <div className="subtotal">
                  Subtotal: <span>RM {subtotal.toFixed(2)}</span>
                </div>
                <div className="subtotal">
                  Shipping Fee: <span>RM {shippingFee.toFixed(2)}</span>
                </div>
                <div className="total-price">
                  <strong>Total Price: </strong>
                  <span>
                    <strong>
                      RM {(subtotal + shippingFee).toFixed(2)}
                    </strong>
                  </span>
                </div>
                <button className="pay-now" onClick={payNow} disabled={loading}>
                  {loading ? "Processing..." : "Pay Now"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
