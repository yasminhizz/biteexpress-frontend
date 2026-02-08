import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import Header from "../components/header3";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;
      let roleFound = false;

      // OPTIONAL: clear guest cart identity once logged in
      // (prevents your system from still using guestId)
      localStorage.removeItem("guestId");

      // ===== ADMIN =====
      const adminQuery = query(
        collection(db, "admin"),
        where("email", "==", user.email)
      );
      const adminSnapshot = await getDocs(adminQuery);
      if (!adminSnapshot.empty) {
        const adminDoc = adminSnapshot.docs[0];
        localStorage.setItem("currentRole", "admin");
        localStorage.setItem("currentCustomerId", adminDoc.id); // store id
        // or: localStorage.setItem("currentCustomerId", user.uid);

        navigate("/admin");
        roleFound = true;
      }

      // ===== CUSTOMER =====
      if (!roleFound) {
        const customerQuery = query(
          collection(db, "customers"),
          where("email", "==", user.email)
        );
        const customerSnapshot = await getDocs(customerQuery);

        if (!customerSnapshot.empty) {
          const customerDoc = customerSnapshot.docs[0];

          localStorage.setItem("currentRole", "customer");
          // ✅ store Firestore customer doc id (stable)
          localStorage.setItem("currentCustomerId", customerDoc.id);

          // optional: also keep email
          localStorage.setItem("currentEmail", user.email);

          navigate("/customer/nearby-vendors");
          roleFound = true;
        }
      }

      // ===== VENDOR =====
      if (!roleFound) {
        const vendorQuery = query(
          collection(db, "vendors"),
          where("email", "==", user.email)
        );
        const vendorSnapshot = await getDocs(vendorQuery);

        if (!vendorSnapshot.empty) {
          const vendorDoc = vendorSnapshot.docs[0];

          localStorage.setItem("currentRole", "vendor");
          localStorage.setItem("currentCustomerId", vendorDoc.id);

          navigate("/vendor");
          roleFound = true;
        }
      }

      if (!roleFound) {
        alert("User role not found in Firestore.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <>
      <Header />

      <div className="page-background">
        <div className="login-container">
          <div className="login-box">
            <h1>LOGIN</h1>

            <form onSubmit={handleLogin}>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button type="submit">LOGIN</button>
            </form>

            <p
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </p>

            <p className="register-text">Don't have an account?</p>
            <p
              className="register-link"
              onClick={() => navigate("/register-role")}
            >
              Register account
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
