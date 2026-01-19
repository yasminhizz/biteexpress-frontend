import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Header from "../components/header4";
import "./vendorPastOrder.css";
import { useNavigate } from "react-router-dom";

export default function VendorPastOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("vendorId", "==", user.uid),
      where("status", "in", ["completed", "cancelled", "delivered"])
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const formatStatus = (status) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s === "completed") return "Completed";
    if (s === "cancelled") return "Cancelled";
    if (s === "delivered") return "Delivered";
    return status;
  };

  const openOrderDetails = (order) => {
    navigate(`/vendor/view-past/${order.id}`, { state: { order } });
  };

  return (
    <>
      <Header />
      <div className="orders-page">
        <div className="orders-container">

          {/* Tabs */}
          <div className="tabs">
            <button className="tab" onClick={() => navigate("/vendor/ongoing-orders")}>
              ONGOING ORDER
            </button>
            <button className="tab active">PAST ORDER</button>
          </div>

          {/* Page title */}
          <div className="orders-content">
            <h2>Past Orders</h2>

            {loading ? (
              <div className="empty">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="empty">No past orders.</div>
            ) : (
              <ul className="order-list">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="order-row"
                    onClick={() => openOrderDetails(order)}
                  >
                    {/* LEFT SIDE - Order ID */}
                    <div className="order-left">
                      <div className="order-id">#{order.id}</div>
                    </div>

                    {/* RIGHT SIDE - Customer + Status */}
                    <div className="order-right">
                      <div className="order-vendor">{order.customerName || "Customer"}</div>
                      <div className="order-status-right">{formatStatus(order.status)}</div>
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
