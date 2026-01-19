/* customerPastOrder.jsx */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Header from "../components/header1";
import "./customerPastOrder.css";

export default function CustomerPastOrder() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, "orders"), where("customerId", "==", user.uid));
        const snap = await getDocs(q);

        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const past = data.filter((o) =>
          ["completed", "cancelled"].includes((o.status || "").toLowerCase())
        );

        past.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        setOrders(past);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatStatus = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s === "completed") return "Completed";
    if (s === "cancelled") return "Cancelled";
    return status;
  };

  const openOrderDetails = (order) => {
    navigate(`/customer/orders/past/${order.id}`, { state: { order } });
  };

  return (
    <>
      <Header />
      <div className="orders-page">
        <div className="orders-container">

          <div className="tabs">
            <button className="tab" onClick={() => navigate("/customer/orders/ongoing")}>
              ONGOING ORDER
            </button>
            <button className="tab active">PAST ORDER</button>
          </div>

          <div className="orders-content">
            <h2>Past Order</h2>

            {loading ? (
              <div className="empty">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="empty">No past order.</div>
            ) : (
              <ul className="order-list">
                {orders.map((o) => (
                  <li key={o.id} className="order-row" onClick={() => openOrderDetails(o)} style={{ cursor: 'pointer' }}>
                    {/* LEFT SIDE - Order ID */}
                    <div className="order-left">
                      <div className="order-id">#{o.id}</div>
                    </div>

                    {/* RIGHT SIDE - Vendor + Status BELOW */}
                    <div className="order-right">
                      <div className="order-vendor">{o.vendorName || "Vendor"}</div>
                      <div className="order-status-right">{formatStatus(o.status)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
