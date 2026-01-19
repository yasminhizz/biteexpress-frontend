import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import "./header6.css"; 
import logoIcon from "../assets/logos.png"; 
import menuIcon from "../assets/menu.png"; 
import notificationIcon from "../assets/notification.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import Sidebar from "./sidebar3";

export default function Header6() {
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

      <Link to="/admin/register-request">
        <img src={logoIcon} alt="Logo" className="logo" />
      </Link>
    </div>

    
    {/* Right side */}  
    <div className="header-right">
      <Link to="/admin/notification">
        <img src={notificationIcon} alt="Notification" className="notification" />
      </Link>

      <Link to="/admin/profile">
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
