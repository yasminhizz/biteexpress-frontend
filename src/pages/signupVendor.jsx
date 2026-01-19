import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import "./signupVendor.css";
import Header from "../components/header3";

export default function SignupVendor() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    id: "",
    phone: "",
    password: "",
    ssmNumber: "",
    certificateFile: null,
    profileImage: null,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
    lat: "",
    lng: "",
  });

  const [showMap, setShowMap] = useState(false);
  const [marker, setMarker] = useState(null);

  /* ------------------ HANDLE INPUT ------------------ */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "ssmNumber") {
      const cleaned = value.replace(/\D/g, "").slice(0, 12);
      setFormData((prev) => ({ ...prev, ssmNumber: cleaned }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  /* ------------------ VALIDATE 1:1 IMAGE ------------------ */
  const validateSquareImage = (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => (img.width === img.height ? resolve(true) : reject("Profile image must be square"));
      img.onerror = () => reject("Invalid image file.");
    });

  /* ------------------ MAP ------------------ */
  const handleOpenMap = () => {
    const { addressLine1, city, state, postcode } = formData;
    if (!addressLine1 || !city || !state || !postcode) {
      alert("Please fill in complete address before confirming.");
      return;
    }
    setShowMap(true);
    if (formData.lat && formData.lng) setMarker({ lat: Number(formData.lat), lng: Number(formData.lng) });
  };

  const handleSaveLocation = () => {
    if (!marker) return alert("Please pin your location on the map!");
    setFormData((prev) => ({ ...prev, lat: marker.lat, lng: marker.lng }));
    setShowMap(false);
  };

  /* ------------------ SUBMIT ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) return alert("Please confirm your location on the map.");
    if (!formData.certificateFile) return alert("Please upload your SSM certificate (PDF).");

    try {
      // 1️⃣ Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await user.getIdToken(true);

      // 2️⃣ Upload SSM certificate
      const certExt = formData.certificateFile.name.split(".").pop();
      const certRef = ref(storage, `ssmCertificates/${user.uid}/certificate.${certExt}`);
      await uploadBytes(certRef, formData.certificateFile);
      const certificateURL = await getDownloadURL(certRef);

      // 3️⃣ Upload profile image (optional)
      let profileImageURL = "";
      if (formData.profileImage) {
        await validateSquareImage(formData.profileImage);
        const imgRef = ref(storage, `vendorProfiles/${user.uid}/profile.jpg`);
        await uploadBytes(imgRef, formData.profileImage);
        profileImageURL = await getDownloadURL(imgRef);
      }

      // 4️⃣ Save registration request (to be approved by admin)
      await addDoc(collection(db, "registrationRequests"), {
        fullName: formData.fullName,
        businessName: formData.businessName,
        email: formData.email,
        id: formData.id,
        phone: formData.phone,
        ssmNumber: formData.ssmNumber,
        certificateURL,
        profileImageURL,
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
        },
        location: { lat: Number(formData.lat), lng: Number(formData.lng) },
        status: "pending", // pending, approved, declined
        createdAt: serverTimestamp(),
      });

      alert("Vendor registration submitted! Admin will review it.");
      navigate("/"); // redirect to homepage or login

    } catch (err) {
      console.error(err);
      alert(err.message || "Registration failed.");
    }
  };

  /* ------------------ GOOGLE MAP ------------------ */
  const libraries = ["places"];
  const defaultCenter = { lat: 3.0738, lng: 101.4973 };
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  return (
    <>
      <Header />
      <div className="page-background">
        <div className="register-container">
          <div className="register-box">
            <form className="register-form" onSubmit={handleSubmit}>
              <h2 className="register-title">VENDOR REGISTRATION</h2>
              <div className="form-grid">
                <div className="left-column">
                  {[
                    ["fullName", "Full Name"],
                    ["businessName", "Business Name"],
                    ["email", "Email", "email"],
                    ["id", "ID"],
                    ["phone", "Phone"],
                    ["password", "Password", "password"],
                    ["ssmNumber", "SSM Number"],
                  ].map(([name, label, type]) => (
                    <div className="input-group" key={name}>
                      <label>{label}</label>
                      <input type={type || "text"} name={name} value={formData[name]} onChange={handleChange} className="input-field" />
                    </div>
                  ))}
                  <div className="input-group">
                    <label>Upload SSM Certificate (PDF)</label>
                    <input type="file" name="certificateFile" accept="application/pdf" onChange={handleChange} />
                    {formData.certificateFile && <p>{formData.certificateFile.name}</p>}
                  </div>
                </div>

                <div className="right-column">
                  <div className="section-title">Profile Picture</div>
                  <input type="file" name="profileImage" accept="image/*" onChange={handleChange} />
                  {formData.profileImage && (
                    <img
                      src={URL.createObjectURL(formData.profileImage)}
                      alt="Preview"
                      style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "1px solid #ccc", marginBottom: "12px" }}
                    />
                  )}

                  <div className="section-title">Business Address</div>
                  {["addressLine1", "addressLine2"].map((field) => (
                    <div className="input-group" key={field}>
                      <label>{field}</label>
                      <input name={field} value={formData[field]} onChange={handleChange} className="input-field" />
                    </div>
                  ))}

                  <div className="row">
                    {["city", "state"].map((field) => (
                      <div className="input-group" key={field}>
                        <label>{field}</label>
                        <input name={field} value={formData[field]} onChange={handleChange} className="input-field" />
                      </div>
                    ))}
                  </div>

                  <div className="input-group">
                    <label>Postcode</label>
                    <input name="postcode" value={formData.postcode} onChange={handleChange} className="input-field" />
                  </div>

                  <button type="button" className="confirmaddress-button" onClick={handleOpenMap}>
                    CONFIRM ADDRESS
                  </button>

                  {formData.lat && formData.lng && (
                    <p style={{ color: "green", fontSize: "13px" }}>
                      ✓ Location pinned at {formData.lat}, {formData.lng}
                    </p>
                  )}
                </div>
              </div>

              <button type="submit" className="register-button">
                SUBMIT
              </button>
            </form>
          </div>
        </div>

        {showMap && isLoaded && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
            <div style={{ width: "90%", maxWidth: "600px", background: "#fff", borderRadius: "8px", padding: "16px" }}>
              <h3>Pin Business Location</h3>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "400px" }}
                center={marker || defaultCenter}
                zoom={17}
                onClick={(e) => setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
              >
                {marker && <Marker position={marker} draggable onDragEnd={(e) => setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />}
              </GoogleMap>
              <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
                <button onClick={handleSaveLocation} style={{ padding: "8px 12px", background: "black", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>SAVE LOCATION</button>
                <button onClick={() => setShowMap(false)} style={{ padding: "8px 12px", background: "#ccc", color: "#000", border: "none", borderRadius: "6px", cursor: "pointer" }}>CANCEL</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
