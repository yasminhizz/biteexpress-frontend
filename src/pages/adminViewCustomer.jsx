import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import Header2 from "../components/header6";
import "./adminViewCustomer.css";

export default function AdminViewCustomer() {
  const { username } = useParams(); // get the username from URL
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!username) return; // safety check

      try {
        const q = query(collection(db, "customers"), where("username", "==", username));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const docData = snap.docs[0];
          setCustomer({ id: docData.id, ...docData.data() });
        } else {
          console.log("❌ Customer not found in Firestore");
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
      }
    };

    fetchData();
  }, [username]);

  if (!customer) return <p className="loading-text">Loading customer details...</p>;

  return (
    <div>
      <Header2 />
      <div className="customer-detail-container">
  <h2>CUSTOMER DETAILS</h2>

  <table className="customer-details-table">
    <tbody>
      <tr>
        <th>FULL NAME</th>
        <td>{customer.fullName ?? "Not Provided"}</td>
      </tr>
      <tr>
        <th>USERNAME</th>
        <td>{customer.username}</td>
      </tr>
      <tr>
        <th>EMAIL</th>
        <td>{customer.email}</td>
      </tr>
      <tr>
        <th>ID</th>
        <td>{customer.id}</td>
      </tr>
      <tr>
        <th>PHONE</th>
        <td>{customer.phone ?? "Not Provided"}</td>
      </tr>
      <tr>
        <th>ADDRESS</th>
        <td>{customer.address ?? "Not Provided"}</td>
      </tr>
      <tr>
        <th>REGISTER TIME</th>
        <td>{customer.createdAt?.toDate?.().toLocaleString() ?? "Unknown"}</td>
      </tr>
    </tbody>
  </table>

  <button className="back-btn" onClick={() => navigate(-1)}>BACK</button>
</div>


    </div>
  );
}
