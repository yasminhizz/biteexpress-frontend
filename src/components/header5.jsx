import React from "react";
import { Link } from "react-router-dom"; 
import "./header5.css"; 
import logoIcon from "../assets/logos.png"; 
import menuIcon from "../assets/menu.png"; 
import notiIcon from "../assets/notification.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";

export default function Header5() {
  return (
    <header className="header">
      {/* Left side - Logo */}
      <div className="header-left">
        <Link to="/">
          <img src={menuIcon} alt="Menu" className="menu" />
        </Link>

        <Link to="/">
          <img src={logoIcon} alt="Logo" className="logo" />
        </Link>
      </div>

      {/* Right side - Icons */}
      
      <div className="header-right">
        <Link to="/vendor/ongoing-orders">
         <img src={notiIcon} alt="noti" className="noti" />
        </Link>

        {/* Profile link */}
        <Link to="/profile">
          <img src={profileIcon} alt="Profile" className="profile" />
        </Link>

        <Link to="/">
          <img src={logoutIcon} alt="Logout" className="logout" />
        </Link>

      </div>
    </header>
  );
}
