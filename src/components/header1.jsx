import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./header1.css";
import logoIcon from "../assets/logos.png";
import menuIcon from "../assets/menu.png";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import Sidebar from "./sidebar1";

import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function Header1() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // logout popup states
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // ✅ cart badge
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const onClickLogout = (e) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  // ✅ same cart key logic as cart page
  const getCartKey = (user) => {
    let customerId = user?.uid;

    if (!customerId) {
      customerId = localStorage.getItem("guestId");
      if (!customerId) {
        customerId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem("guestId", customerId);
      }
    }
    return `cart_${customerId}`;
  };

  const refreshCartCount = (user = auth.currentUser) => {
    const key = getCartKey(user);

    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem(key)) || [];
      if (!Array.isArray(cart)) cart = [];
    } catch {
      cart = [];
    }

    // ✅ count how many menu rows in cart
    const count = cart.length;

    // if you prefer total qty, use this instead:
    // const count = cart.reduce((sum, it) => sum + (Number(it.qty) || 1), 0);

    setCartCount(count);
  };

  // ✅ update badge on auth change + on custom event
  useEffect(() => {
    // auth change
    const unsub = onAuthStateChanged(auth, (user) => {
      refreshCartCount(user);
    });

    // custom event (same tab updates)
    const handler = () => refreshCartCount(auth.currentUser);
    window.addEventListener("cart-updated", handler);

    // initial
    refreshCartCount(auth.currentUser);

    return () => {
      unsub();
      window.removeEventListener("cart-updated", handler);
    };
  }, []);

  const confirmLogout = async () => {
    try {
      setLogoutLoading(true);

      await signOut(auth);

      // clear old keys (optional)
      localStorage.removeItem("cart_demo");
      localStorage.removeItem("checkout_customer");
      localStorage.removeItem("lastOrderId");

      setCartCount(0);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout failed. Please try again.");
    } finally {
      setLogoutLoading(false);
      setShowLogoutConfirm(false);
    }
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
          {/* ✅ Cart icon with badge */}
          <Link to="/customer/cart" className="cart-link">
            <img src={cartIcon} alt="Cart" className="cart" />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>
            )}
          </Link>

          <Link to="/customer/profile">
            <img src={profileIcon} alt="Profile" className="profile" />
          </Link>

          {/* Logout */}
          <Link to="/" onClick={onClickLogout}>
            <img src={logoutIcon} alt="Logout" className="logout" />
          </Link>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {showLogoutConfirm && (
        <div className="logout-bar">
          <div className="logout-bar-content">
            <span>Are you sure you want to log out?</span>

            <div className="logout-bar-actions">
              <button
                className="logout-cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={logoutLoading}
              >
                Cancel
              </button>

              <button
                className="logout-confirm-btn"
                onClick={confirmLogout}
                disabled={logoutLoading}
              >
                {logoutLoading ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
