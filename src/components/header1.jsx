import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import "./header1.css"; 
import logoIcon from "../assets/logos.png"; 
import menuIcon from "../assets/menu.png"; 
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import Sidebar from "./sidebar1";

export default function Header1() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
    <header className="header">
        
    {/* Left side */}
    <div className="header-left">
      <img 
        src={menuIcon} 
        alt="Menu" 
        className="menu" 
        onClick={toggleSidebar}
        style={{ cursor: "pointer" }}
      />

      <Link to="/customer/nearby-vendors">
        <img src={logoIcon} alt="Logo" className="logo" />
      </Link>
    </div>


    {/* Right side */}
    <div className="header-right">
        <Link to="/customer/cart">
          <img src={cartIcon} alt="Cart" className="cart" />
        </Link>

        <Link to="/customer/profile">
          <img src={profileIcon} alt="Profile" className="profile" />
        </Link>

        <Link to="/">
          <img src={logoutIcon} alt="Logout" className="logout" />
        </Link>
    </div>
    </header>

    {/* Sidebar Component */}
    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
}
