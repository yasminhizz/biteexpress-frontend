// src/pages/CustomerProfile.jsx
// src/pages/CustomerProfile.jsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Header from '../components/header1';
import './customerProfile.css';

export default function CustomerProfile() {
  const [customer, setCustomer] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const fetchCustomer = async () => {
      try {
        const snap = await getDoc(doc(db, 'customers', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setCustomer(data);
          setFormData({
            fullName: data.fullName || '',
            username: data.username || '',
            email: data.email || '',
            id: data.id || '',          // ✅ ADD ID
            phone: data.phone || '',
            address: data.address || '',
          });
        }
      } catch (err) {
        console.error('Error fetching customer profile:', err);
      }
    };

    fetchCustomer();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'customers', auth.currentUser.uid), {
        ...formData,
      });

      setCustomer(formData);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (!customer) {
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading customer profile...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cust-profile-container">
        <div className="cust-profile-box">

          {/* HEADER */}
          <div className="cust-profile-header">
            <div className="cust-header-info">
              {!editMode ? (
                <>
                  <h2 className="cust-profile-title">{customer.fullName}</h2>
                  <p className="cust-profile-subtitle">@{customer.username}</p>
                </>
              ) : (
                <>
                  <input
                    className="cust-edit-input cust-title-input"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                  <input
                    className="cust-edit-input cust-subtitle-input"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div className="cust-detail-table">
            {[
              { label: 'Email', key: 'email' },
              { label: 'ID', key: 'id' },          // ✅ ID added here
              { label: 'Phone', key: 'phone' },
              { label: 'Address', key: 'address' },
            ].map((item) => (
              <div className="cust-detail-row" key={item.key}>
                <span className="cust-label">{item.label}</span>
                <span className="cust-value">
                  {!editMode ? (
                    formData[item.key]
                  ) : (
                    <input
                      className="cust-edit-input cust-input-active"
                      value={formData[item.key]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [item.key]: e.target.value,
                        })
                      }
                    />
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="cust-button-group">
            {!editMode ? (
              <button
                className="cust-btn cust-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  className="cust-btn cust-success"
                  onClick={handleSaveProfile}
                >
                  Save
                </button>
                <button
                  className="cust-btn cust-secondary"
                  onClick={() => {
                    setFormData({
                      fullName: customer.fullName,
                      username: customer.username,
                      email: customer.email,
                      id: customer.id,        // ✅ reset ID
                      phone: customer.phone,
                      address: customer.address,
                    });
                    setEditMode(false);
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
