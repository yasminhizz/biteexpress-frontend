import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import Header2 from "../components/header6";
import "./adminViewVendor.css";

export default function AdminViewVendor() {
  const { businessName } = useParams();
  const [vendor, setVendor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!businessName) return;

      try {
        const q = query(collection(db, "vendors"), where("businessName", "==", businessName));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const docData = snap.docs[0];
          setVendor({ id: docData.id, ...docData.data() });
        } else {
          console.log("❌ Vendor not found in Firestore");
        }
      } catch (err) {
        console.error("Error fetching vendor:", err);
      }
    };

    fetchData();
  }, [businessName]);

  if (!vendor) return <p className="loading-text">Loading vendor details...</p>;

  return (
    <div>
      <Header2 />
      <div className="vendor-detail-container">
  <h2>VENDOR DETAILS</h2>

  <div className="vendor-two-column">

    {/* LEFT SIDE */}
    <div className="vendor-col">
      <div className="row"><span className="label">Full Name</span><span className="value">{vendor.fullName}</span></div>
      <div className="row"><span className="label">Business Name</span><span className="value">{vendor.businessName}</span></div>
      <div className="row"><span className="label">Email</span><span className="value">{vendor.email}</span></div>
      <div className="row"><span className="label">ID</span><span className="value">{vendor.id}</span></div>
      <div className="row"><span className="label">Phone</span><span className="value">{vendor.phone ?? "Not Provided"}</span></div>
      <div className="row"><span className="label">SSM Number</span><span className="value">{vendor.ssmNumber ?? "Not Provided"}</span></div>
      <div className="row">
        <span className="label">SSM Certificate</span>
        <span className="value">
          {vendor.certificateURL ? (
            <a href={vendor.certificateURL} target="_blank" rel="noopener noreferrer">View Certificate</a>
          ) : "Not Provided"}
        </span>
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="vendor-col">
      <div className="row"><span className="label">Address Line 1</span> <span className="value">{vendor.address?.line1 ?? "Not Provided"}</span></div>
      <div className="row"><span className="label">Address Line 2</span> <span className="value">{vendor.address?.line2 ?? "Not Provided"}</span></div>
      <div className="row"><span className="label">City</span><span className="value">{vendor.address?.city ?? "Not Provided"}</span></div>
      <div className="row"><span className="label">State</span><span className="value">{vendor.address?.state ?? "Not Provided"}</span></div>
      <div className="row"><span className="label">Postcode</span><span className="value">{vendor.address?.postcode ?? "Not Provided"}</span></div>
      <div className="row"><span className="label">Latitude</span><span className="value">{vendor.location?.lat ?? "Not Provided"}</span></div>
      <div className="row"><span className="label">Longitude</span><span className="value">{vendor.location?.lng ?? "Not Provided"}</span></div>
      <div className="row"><span className="label">Register Time</span><span className="value">{vendor.createdAt?.toDate?.().toLocaleString() ?? "Unknown"}</span></div>
    </div>


  </div>

  <button className="back-btn" onClick={() => navigate(-1)}>BACK</button>
</div>

    </div>
  );
}
