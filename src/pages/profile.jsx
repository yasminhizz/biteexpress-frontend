import React from "react";
import "./profile.css";
import { useNavigate } from "react-router-dom";
import Header from "../components/header1";  // import header file

export default function Profile() {
  const navigate = useNavigate();

  // Example user data (later replace with Firebase / backend)
  const user = {
    username: "john_doe",
    fullName: "John Doe",
    email: "johndoe@student.uitm.edu.my",
    phone: "012-3456789",
    role: "Customer",
    studentId: "2021555555",
  };

  return (
    <>
      {/* Header at the top */}
      <Header />

      {/* Profile Content */}
      <div className="profile-container">
        <div className="profile-box">
          <h2 className="profile-title">My Profile</h2>

          <div className="profile-info">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Full Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Student ID:</strong> {user.studentId}</p>
          </div>

          <button 
            className="purchase-button"
            onClick={() => navigate("/purchases")}
          >
            My Purchases
          </button>
        </div>
      </div>
    </>
  );
}
