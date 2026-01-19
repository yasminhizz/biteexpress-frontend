import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../components/header3";
import "./forgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Please check your inbox.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="page-background">
        <div className="forgot-container">
          <div className="forgot-box">
            <h1>Reset Password</h1>
            <form onSubmit={handleReset}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p
              className="back-to-login"
              onClick={() => navigate("/login")}
            >
              Back to login
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
