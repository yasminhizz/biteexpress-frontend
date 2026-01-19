// Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./sidebar1.css";
import homeIcon from "../assets/home.png";
import nearbyIcon from "../assets/nearbyven.png";
import cartIcon from "../assets/cart.png";
import orderIcon from "../assets/orders.png"; 
import menuIcon from "../assets/category.png"; 
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

          <Link to="/customer/topsales" className="sidebar-item" onClick={toggleSidebar}>
            <img src={homeIcon} alt="" />
            <span>HOME</span>
          </Link>

          <Link to="/customer/nearby-vendors" className="sidebar-item" onClick={toggleSidebar}>
            <img src={nearbyIcon} alt="" />
            <span>NEARBY VENDORS</span>
          </Link>

          <Link to="/customer/cart" className="sidebar-item" onClick={toggleSidebar}>
            <img src={cartIcon} alt="" />
            <span>CART</span>
          </Link>

          <Link to="/customer/orders/ongoing" className="sidebar-item" onClick={toggleSidebar}>
            <img src={orderIcon} alt="" />
            <span>ORDER</span>
          </Link>

          <Link to="/customer/categories" className="sidebar-item" onClick={toggleSidebar}>
            <img src={menuIcon} alt="" />
            <span>MENU CATEGORY</span>
          </Link>

          <Link to="/customer/profile" className="sidebar-item" onClick={toggleSidebar}>
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
