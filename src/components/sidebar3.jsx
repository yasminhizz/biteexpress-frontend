// Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./sidebar3.css";
import homeIcon from "../assets/home.png";
import notificationIcon from "../assets/notification.png"; 
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

          <Link to="/admin" className="sidebar-item" onClick={toggleSidebar}>
            <img src={homeIcon} alt="" />
            <span>HOME</span>
          </Link>

          <Link to="/admin" className="sidebar-item" onClick={toggleSidebar}>
            <img src={notificationIcon} alt="" />
            <span>NOTIFICATION</span>
          </Link>

          <Link to="/admin/generate-customer-report" className="sidebar-item" onClick={toggleSidebar}>
            <img src={notificationIcon} alt="" />
            <span>CUSTOMER REPORT</span>
          </Link>

          <Link to="/admin/generate-vendor-report" className="sidebar-item" onClick={toggleSidebar}>
            <img src={notificationIcon} alt="" />
            <span>VENDOR REPORT</span>
          </Link>

          <Link to="/admin" className="sidebar-item" onClick={toggleSidebar}>
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
