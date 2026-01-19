import React from "react";
import { Link } from "react-router-dom"; 
import "./header2.css"; 
import logoIcon from "../assets/logos.png"; 
import loginIcon from "../assets/login.png";

export default function Header2() {
  return (
    <header className="header">
      {/* Left side - Logo */}
      <div className="header-left">
        <Link to="/">
          <img src={logoIcon} alt="Logo" className="logo" />
        </Link>
      </div>

      {/* Right side - Icons */}
      <div className="header-right">
        <Link to="/login">
          <img src={loginIcon} alt="Login" className="login" />
        </Link>
      </div>
    </header>
  );
}
