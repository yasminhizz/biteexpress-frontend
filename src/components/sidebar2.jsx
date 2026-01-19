// Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./sidebar2.css";
import homeIcon from "../assets/home.png";
import orderIcon from "../assets/orders.png"; 
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      {/* overlay OUTSIDE */}
      <div 
        className={`overlay ${isOpen ? "show" : ""}`} 
        onClick={toggleSidebar}
      ></div>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <h2 className="sidebar-title">BITEEXPRESS</h2>

          <Link to="/vendor" className="sidebar-item" onClick={toggleSidebar}>
            <img src={homeIcon} alt="" />
            <span>HOME</span>
          </Link>

          <Link to="/vendor/ongoing-orders" className="sidebar-item" onClick={toggleSidebar}>
            <img src={orderIcon} alt="" />
            <span>ORDER</span>
          </Link>

          <Link to="/profile" className="sidebar-item" onClick={toggleSidebar}>
            <img src={profileIcon} alt="" />
            <span>PROFILE</span>
          </Link>

          <Link to="/" className="sidebar-item" onClick={toggleSidebar}>
            <img src={logoutIcon} alt="" />
            <span>LOGOUT</span>
          </Link>
        </div>
      </div>
    </>
  );
}
