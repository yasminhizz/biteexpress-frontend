import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./signupCustomer.css";
import Header from "../components/header3";

export default function SignupCustomer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    id: "",
    phone: "",
    address: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(doc(db, "customers", userCredential.user.uid), {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        id: formData.id,
        phone: formData.phone,
        address: formData.address,
        role: "customer",
        createdAt: serverTimestamp()
      });

      alert("Customer account created successfully!");
      navigate("/customer");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Header />
      <div className="page-background">
        <div className="signup-customer-container">
          <form className="signup-customer-form" onSubmit={handleSubmit}>
            <h2 className="form-title">CUSTOMER REGISTRATION</h2>

            <div className="form-grid-wrapper">
              <div className="left-column">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Username</label>
                  <input
                    name="username"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Staff email or student email"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>ID</label>
                  <input
                    name="id"
                    placeholder="Staff ID or student ID"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="vertical-divider"></div>

              <div className="right-column">
                <div className="input-group">
                  <label>Phone</label>
                  <input
                    name="phone"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Address</label>
                  <input
                    name="address"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="button-wrapper">
              <button type="submit">SIGN UP</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
