import React from "react"; 
import { useNavigate } from "react-router-dom";
import "./registerRole.css"; 
import Header from "../components/header3"; 
import customerImg from "../assets/customer.jpg";
import vendorImg from "../assets/vendor.jpg";

export default function RegisterRole() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <div className="page-background">   {/* background wrapper */}

        <div className="main-container">

          <h2>WELCOME TO BITEEXPRESS!</h2>
          <p>Register as:</p>

          <div className="cards-container">

            <div className="role-card" onClick={() => navigate("/register-customer")}>
              <img src={customerImg} alt="Customer" />
              <button>CUSTOMER</button>
            </div>

            <div className="role-card" onClick={() => navigate("/register-vendor")}>
              <img src={vendorImg} alt="Vendor" />
              <button>VENDOR</button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
