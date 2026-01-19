import React from "react";
import { Link } from "react-router-dom"; 
import "./header3.css"; 
import logoIcon from "../assets/logos.png"; 

export default function Header2() {
  return (
    <header className="header">
      {/* Left side - Logo */}
      <div className="header-left">
        <Link to="/">
          <img src={logoIcon} alt="Logo" className="logo" />
        </Link>
      </div>
    </header>
  );
}
