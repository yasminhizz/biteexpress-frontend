import React from "react";
import Header from "../components/header6";
import "./adminProfile.css";

export default function AdminProfile() {
  // 🔹 Dummy admin data
  const admin = {
    name: "FARID",
  };

  return (
    <>
      <Header />
      <div className="admin-profile-container">
        <div className="admin-profile-box">

          <div className="profile-header">
            <h2>PROFILE</h2>
          </div>

          <div className="profile-content">
            <div className="profile-avatar">
              <span className="avatar-icon">👤</span>
            </div>

            <p className="profile-name">{admin.name}</p>

            <button className="logout-btn">LOGOUT</button>
          </div>

        </div>
      </div>
    </>
  );
}
