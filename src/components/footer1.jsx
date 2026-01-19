import React from "react";
import { Link } from "react-router-dom";
import "./footer1.css";
import { Facebook, Instagram, Twitter } from "lucide-react"; // lightweight icons

export default function Footer1() {
  return (
    <footer className="footer">
      {/* Top Footer Content */}
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <h3>BiteExpress</h3>
          <p>
            We deliver delicious meals from UiTM vendors straight to your doorstep.
            Fast, reliable, and community-driven.
          </p>
        </div>

        {/* Our Services */}
        <div className="footer-section">
          <h4>Our Services</h4>
          <ul>
            <li>Food Delivery</li>
            <li>Vendor Partnership</li>
            <li>Real-time Order Tracking</li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul>
            <li>Email: support@biteexpress.com</li>
            <li>Phone: +60 12-345 6789</li>
            <li>Location: UiTM Shah Alam</li>
          </ul>
        </div>

        {/* FAQs Section */}
        <div className="footer-section">
          <h4>FAQs</h4>
          <ul>
            <li>About Us</li>
            <li>Privacy Policy</li>
            <li>How to become a vendor?</li>
          </ul>
        </div>
      </div>

      {/* Divider Line */}
      <div className="footer-divider"></div>

      {/* Bottom Footer (Socials + Copyright) */}
      <div className="footer-bottom">
        <div className="social-icons">
          <a href="#"><Facebook size={20} /></a>
          <a href="#"><Instagram size={20} /></a>
        </div>
        <p>© 2025 BiteExpress. All rights reserved.</p>
      </div>
    </footer>
  );
}
