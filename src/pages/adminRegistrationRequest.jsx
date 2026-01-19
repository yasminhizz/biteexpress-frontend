import React, { useEffect, useState } from "react";
import Header from "../components/header6";
import "./adminRegistrationRequest.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminRegistrationRequest() {
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email);
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH BY EMAIL ================= */
  useEffect(() => {
    if (!decodedEmail) return;

    const fetchRequest = async () => {
      try {
        const q = query(
          collection(db, "registrationRequests"),
          where("email", "==", decodedEmail)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          alert("Request not found");
          navigate("/admin/notification");
          return;
        }

        // take the first matching document
        const docSnap = snapshot.docs[0];

        setRequest({
          id: docSnap.id, // keep doc ID for updates
          ...docSnap.data(),
        });
      } catch (err) {
        console.error(err);
        alert("Failed to fetch request");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [decodedEmail, navigate]);

  /* ================= APPROVE / DECLINE ================= */
  const handleStatusUpdate = async (status) => {
    if (!request) return;

    try {
      const docRef = doc(db, "registrationRequests", request.id);

      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });

      alert(`Request ${status.toUpperCase()} successfully`);
      navigate("/admin/notification");
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (!request) return null;

  return (
    <>
      <Header />
      <div className="admin-request-container">
        <div className="admin-request-box">
          <div className="request-header">
            <h2>REGISTRATION REQUEST</h2>
          </div>

          <div className="request-details">
            <DetailRow label="NAME" value={request.fullName} />
            <DetailRow label="EMAIL" value={request.email} />
            <DetailRow label="BUSINESS NAME" value={request.businessName} />
            <DetailRow label="SSM NUMBER" value={request.ssmNumber} />

            <DetailRow
              label="LICENSE CERT"
              value={
                <a
                  href={request.certificateURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📁 View Certificate
                </a>
              }
            />

            <DetailRow
              label="PROFILE IMAGE"
              value={
                request.profileImageURL ? (
                  <img
                    src={request.profileImageURL}
                    alt="Profile"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "N/A"
                )
              }
            />

            <DetailRow
              label="ADDRESS"
              value={`${request.address.line1}, ${request.address.line2}, ${request.address.city}, ${request.address.state}, ${request.address.postcode}`}
            />

            <DetailRow
              label="LOCATION"
              value={`Lat: ${request.location.lat}, Lng: ${request.location.lng}`}
            />
          </div>

          <div className="action-buttons">
            {request.status === "pending" ? (
              <>
                <button
                  className="btn approve"
                  onClick={() => handleStatusUpdate("approved")}
                >
                  APPROVE
                </button>
                <button
                  className="btn decline"
                  onClick={() => handleStatusUpdate("declined")}
                >
                  DECLINE
                </button>
              </>
            ) : (
              <span className={`status ${request.status}`}>
                {request.status.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= DETAIL ROW ================= */
function DetailRow({ label, value }) {
  return (
    <div className="detail-row">
      <div className="detail-label">{label}</div>
      <div className="detail-value">{value}</div>
    </div>
  );
}
