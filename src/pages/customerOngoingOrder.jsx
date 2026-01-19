/* customerOngoingOrder.jsx */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import Header from "../components/header1";
import "./customerOngoingOrder.css";

export default function CustomerOngoingOrder() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const ONGOING_STATUSES = ["preparing", "out for delivery", "delivered"];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("customerId", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o) => ONGOING_STATUSES.includes(o.status?.toLowerCase() || ""))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setOrders(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const openOrder = (order) => {
    navigate(`/customer/orders/ongoing/${order.id}`, { state: { order } });
  };

  const displayStatus = (status) => {
    if (!status) return "Unknown";
    const s = status.toLowerCase();
    if (s === "preparing") return "Preparing";
    if (s === "out for delivery") return "Out for Delivery";
    return status;
  };

  const markReceived = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "completed" });
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  return (
    <>
      <Header />
      <div className="orders-page">
        <div className="orders-container">
          <div className="tabs">
            <button className="tab active">Ongoing Order</button>
            <button
              className="tab"
              onClick={() => navigate("/customer/orders/past")}
            >
              Past Order
            </button>
          </div>

          <div className="orders-content">
            <h2>Ongoing Order</h2>

            {loading ? (
              <div className="empty">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="empty">No ongoing order.</div>
            ) : (
              <ul className="order-list">
                {orders.map((o) => (
                  <li key={o.id} className="order-row">
                    {/* ------------------------- */}
                    {/* LEFT SIDE: ID + STATUS UNDER IT */}
                    {/* ------------------------- */}
                    <div className="order-left" onClick={() => openOrder(o)}>
                      <div className="order-id">#{o.id}</div>
                      <div className="order-status-left">{displayStatus(o.status)}</div>
                    </div>

                    {/* ------------------------- */}
                    {/* RIGHT SIDE: VENDOR NAME + BUTTON BELOW */}
                    {/* ------------------------- */}
                    <div className="order-right">
                      <div className="order-vendor">
                        {o.vendorName || o.items?.[0]?.vendorName || "Vendor"}
                      </div>

                      {o.status?.toLowerCase() === "delivered" && (
                        <button
                          className="received-btn"
                          onClick={() => markReceived(o.id)}
                        >
                          RECEIVED
                        </button>
                      )}
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
