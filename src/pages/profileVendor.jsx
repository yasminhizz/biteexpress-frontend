import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Header from "../components/header4";
import "./profileVendor.css";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

export default function ProfileVendor() {
  const [vendor, setVendor] = useState(null);
  const [marker, setMarker] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    getDoc(doc(db, "vendors", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setVendor(data);
        setFormData({
          businessName: data.businessName || "",
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          ssmNumber: data.ssmNumber || "",
          address: data.address || {},
        });

        if (data.location?.lat && data.location?.lng) {
          setMarker(data.location);
        }
      }
    });
  }, []);

  const handleProfileImageChange = (e) => {
    if (e.target.files?.[0]) {
      setNewProfileImage(e.target.files[0]);
    }
  };

  /* ================= FIXED IMAGE UPLOAD ================= */
  const uploadProfileImage = async () => {
    if (!newProfileImage) return vendor.profileImageURL || "";

    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    setUploading(true);

    const storageRef = ref(
      storage,
      `vendorProfiles/${auth.currentUser.uid}/${Date.now()}_${newProfileImage.name}`
    );


    const uploadTask = uploadBytesResumable(storageRef, newProfileImage);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("IMAGE UPLOAD ERROR:", error);
          setUploading(false);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          resolve(url);
        }
      );
    });
  };
  /* ====================================================== */

  const handleSaveProfile = async () => {
    try {
      const imageUrl = await uploadProfileImage();

      await updateDoc(doc(db, "vendors", auth.currentUser.uid), {
        ...formData,
        location: marker,
        profileImageURL: imageUrl,
      });

      setVendor({
        ...vendor,
        ...formData,
        location: marker,
        profileImageURL: imageUrl,
      });

      setEditMode(false);
      setNewProfileImage(null);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("PROFILE SAVE ERROR:", err);
      alert(err.message || "Failed to update profile");
    }
  };

  if (!vendor || !isLoaded) {
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading vendor profile...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="profile--container">
        <div className="profile--box">

          {/* HEADER */}
          <div className="profile--header">
            <div className="avatar--wrappers">
              <img
                src={
                  newProfileImage
                    ? URL.createObjectURL(newProfileImage)
                    : vendor.profileImageURL ||
                      "https://ui-avatars.com/api/?name=Vendor&background=ececec&color=555"
                }
                alt="Vendor"
                className="profile--avatar"
              />

              {editMode && (
                <label className="avatar-edit-label">
                  <div className="avatar-overlay">Change</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    hidden
                  />
                </label>
              )}
            </div>

            <div>
              {!editMode ? (
                <>
                  <h2 className="profile-title">{vendor.businessName}</h2>
                  <p className="profile-subtitle">{vendor.fullName}</p>
                </>
              ) : (
                <>
                  <input
                    className="edit-input title-input"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                  />
                  <input
                    className="edit-input subtitle-input"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* DETAILS + MAP */}
          <div className="profile--content">
            <div className="detail-table">
              {[
                { label: "Email", key: "email" },
                { label: "Phone", key: "phone" },
                { label: "SSM Number", key: "ssmNumber" },
                { label: "Address Line 1", key: "line1", nested: "address" },
                { label: "Address Line 2", key: "line2", nested: "address" },
                { label: "City", key: "city", nested: "address" },
                { label: "State", key: "state", nested: "address" },
                { label: "Postcode", key: "postcode", nested: "address" },
              ].map((item) => (
                <div className="detail-row" key={item.label}>
                  <span className="label">{item.label}</span>
                  <span className="value">
                    {!editMode ? (
                      item.nested
                        ? formData[item.nested]?.[item.key] || ""
                        : formData[item.key]
                    ) : (
                      <input
                        className="edit-input"
                        value={
                          item.nested
                            ? formData[item.nested]?.[item.key] || ""
                            : formData[item.key]
                        }
                        onChange={(e) => {
                          if (item.nested) {
                            setFormData({
                              ...formData,
                              [item.nested]: {
                                ...formData[item.nested],
                                [item.key]: e.target.value,
                              },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              [item.key]: e.target.value,
                            });
                          }
                        }}
                      />
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="map-section">
              <h3 className="section-title">Business Location: </h3>
              {marker && (
                <GoogleMap
                  mapContainerClassName="map-container"
                  center={marker}
                  zoom={16}
                  onClick={
                    editMode
                      ? (e) =>
                          setMarker({
                            lat: e.latLng.lat(),
                            lng: e.latLng.lng(),
                          })
                      : undefined
                  }
                >
                  <Marker
                    position={marker}
                    draggable={editMode}
                    onDragEnd={(e) =>
                      setMarker({
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng(),
                      })
                    }
                  />
                </GoogleMap>
              )}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="button-group">
            {!editMode ? (
              <button className="btn primary" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  className="btn success"
                  onClick={handleSaveProfile}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Save"}
                </button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setFormData(vendor);
                    setMarker(vendor.location);
                    setNewProfileImage(null);
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
