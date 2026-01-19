// src/pages/customerEditProfile.jsx 
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import Header from '../components/header1';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './customerEditProfile.css';

export default function CustomerEditProfile() {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    phone: "",
    address: ""
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const loadProfile = async () => {
      const dref = doc(db, "customers", user.uid);
      const snap = await getDoc(dref);

      if (snap.exists()) {
        setForm({
          fullName: snap.data().fullName || "",
          username: snap.data().username || "",
          phone: snap.data().phone || "",
          address: snap.data().address || ""
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const dref = doc(db, "customers", user.uid);
      await updateDoc(dref, form);

      alert("Profile updated successfully!");

      navigate("/customer/profile"); // go back to profile
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading...</div>
      </>
    );

  return (
    <>
      <Header />
      <div className="edit-profile-container">
        <div className="edit-profile-box">
          <h2>CUSTOMER PROFILE</h2>

          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} />

          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} />

          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} />

          <label>Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} />

          <button className="save-btn" onClick={saveProfile}>SAVE CHANGES</button>
        </div>
      </div>
    </>
  );
}
