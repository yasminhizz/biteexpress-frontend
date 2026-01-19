import React, { useEffect, useState } from "react";
import Header from "../components/header6";
import "./adminNotification.css";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminNotification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "registrationRequests"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id, // still keep document ID internally
        ...doc.data(),
      }));
      setNotifications(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header />
      <div className="admin-notification-container">
        <div className="admin-notification-box">
          <div className="notification-header">
            <h2>NOTIFICATION</h2>
          </div>

          <div className="notification-list">
            {notifications.length === 0 && (
              <p style={{ textAlign: "center" }}>
                No registration requests.
              </p>
            )}

            {notifications.map((item) => (
              <div className="notification-card" key={item.id}>
                <div>
                  <p className="notification-title">
                    {item.businessName} - {item.fullName}
                  </p>
                  <p className="notification-date">
                    {item.createdAt?.toDate().toLocaleString() || "Just now"}
                  </p>
                </div>

                {item.status === "pending" ? (
                  <button
                    className="view-btn"
                    onClick={() =>
                      navigate(
                        `/admin/request/email/${encodeURIComponent(item.email)}`
                      )
                    }
                  >
                    VIEW
                  </button>
                ) : (
                  <span className={`status ${item.status}`}>
                    {item.status.toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
