import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import "./header4.css"; 
import logoIcon from "../assets/logos.png"; 
import menuIcon from "../assets/menu.png"; 
import messageIcon from "../assets/message.png";
import orderIcon from "../assets/order.jpg";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import Sidebar from "./sidebar2";

export default function Header4() {
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

      <Link to="/">
        <img src={logoIcon} alt="Logo" className="logo" />
      </Link>
    </div>

    
    {/* Right side */}  
    <div className="header-right">
      <Link to="/vendor/chats">
        <img src={messageIcon} alt="Message" className="message" />
      </Link>

      <Link to="/vendor/ongoing-orders">
        <img src={orderIcon} alt="Order" className="order" />
      </Link>

      <Link to="/profile">
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
