import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Header from "../components/header4";
import "./vendorOngoingOrder.css";
import { useNavigate } from "react-router-dom";

export default function VendorOngoingOrder() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const ONGOING_STATUSES = ["preparing", "out for delivery"];

  useEffect(() => {
    let unsubOrders = null;

    const authUnsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const q = query(collection(db, "orders"), where("vendorId", "==", user.uid));

      unsubOrders = onSnapshot(q, async (snap) => {
        const orderPromises = snap.docs.map(async (d) => {
          const data = { id: d.id, ...d.data() };

          // Auto-update paid → preparing
          if ((data.status || "").toLowerCase() === "paid") {
            await updateDoc(doc(db, "orders", data.id), { status: "preparing" });
            data.status = "preparing";
          }

          if (ONGOING_STATUSES.includes(data.status?.toLowerCase())) {
            const item = data.items?.[0];
            if (item?.menuId) {
              try {
                const menuSnap = await getDoc(doc(db, "menus", item.menuId));
                if (menuSnap.exists()) {
                  const menuData = menuSnap.data();
                  item.name = menuData.name || item.name || "Menu";
                } else {
                  item.name = item.name || "Menu";
                }
              } catch {
                item.name = item.name || "Menu";
              }
            } else {
              item.name = item.name || "Menu";
            }

            return data;
          } else {
            return null;
          }
        });

        const results = await Promise.all(orderPromises);
        setOrders(results.filter(Boolean));
      });
    });

    return () => {
      if (unsubOrders) unsubOrders();
      if (typeof authUnsub === "function") authUnsub();
    };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch (err) {
      console.error("Failed to update order status:", err);
      alert("Failed to update status");
    }
  };

  const displayStatus = (status) => {
    if (!status) return "Unknown";
    if (status === "preparing") return "Preparing";
    if (status === "out for delivery") return "Out for Delivery";
    return status;
  };

  const openOrder = (order) => {
    navigate(`/vendor/view-ongoing/${order.id}`, { state: { order } });
  };

  const openLiveMap = (order, e) => {
    e.stopPropagation();
    navigate(`/vendor/track-order/${order.id}`);
  };

  return (
    <>
      <Header />
      <div className="orders-page">
        <div className="orders-container">
          <div className="tabs">
            <button className="tab active">Ongoing Order</button>
            <button className="tab" onClick={() => navigate("/vendor/past-orders")}>
              Past Order
            </button>
          </div>

          <h2>Ongoing Order</h2>

          {orders.length === 0 ? (
            <div className="empty">No ongoing order.</div>
          ) : (
            <ul className="order-list">
              {orders.map((o) => {
                const item = o.items?.[0] || {};

                return (
                  <li key={o.id} className="order-row" onClick={() => openOrder(o)}>
                    {/* LEFT */}
                    <div className="order-left">
                      <div className="order-id">#{o.id}</div>
                      <div className="menu-row">
                        <div className="menu-details">
                  
                          <div className="order-status-left">{displayStatus(o.status)}</div>
                          {o.status === "out for delivery" && (
                            <div className="view-map-text" onClick={(e) => openLiveMap(o, e)}>
                              View live map
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="order-right">
                      <div className="order-vendor">{o.customerName || "Customer"}</div>
                      <div className="update-text">Update order:</div>

                      {o.status === "preparing" && (
                        <button
                          className="received-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(o.id, "out for delivery");
                          }}
                        >
                          OUT FOR DELIVERY
                        </button>
                      )}

                      {o.status === "out for delivery" && (
                        <button
                          className="received-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(o.id, "delivered");
                          }}
                        >
                          DELIVERED
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
