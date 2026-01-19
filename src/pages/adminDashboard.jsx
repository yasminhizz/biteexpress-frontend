import React from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/header6";
import "./adminDashboard.css";
import customerImg from "../assets/customer.jpg";   // adjust path if different
import vendorImg from "../assets/vendor.jpg";       // adjust path if different

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <Header2 />

      <div className="admin-dashboard">
        <h1>ADMIN DASHBOARD</h1>

        <div className="dashboard-container">

          {/* Customer */}
          <div className="dash-card" onClick={() => navigate("/admin/customers")}>
            <img src={customerImg} alt="Customers" />
            <button>CUSTOMERS</button>
          </div>

          {/* Vendor */}
          <div className="dash-card" onClick={() => navigate("/admin/vendors")}>
            <img src={vendorImg} alt="Vendors" />
            <button>VENDORS</button>
          </div>

        </div>
      </div>
    </div>
  );
}
