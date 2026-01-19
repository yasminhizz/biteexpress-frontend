import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header3";
import "./signupVendor.css";
import { auth, db, storage } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

export default function VendorConfirmLocation() {
  const navigate = useNavigate();

  const [basicData, setBasicData] = useState({});
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
  });

  /* ================= RESTORE DATA ================= */
  useEffect(() => {
    setBasicData(JSON.parse(sessionStorage.getItem("vendor_basic_data") || "{}"));
    setAddress(JSON.parse(sessionStorage.getItem("vendor_address") || "{}"));
    setMarker(JSON.parse(sessionStorage.getItem("vendor_marker")));
  }, []);

  /* ================= PERSIST DATA ================= */
  useEffect(() => {
    sessionStorage.setItem("vendor_address", JSON.stringify(address));
  }, [address]);

  useEffect(() => {
    if (marker) sessionStorage.setItem("vendor_marker", JSON.stringify(marker));
  }, [marker]);

  const handleSave = () => {
    sessionStorage.setItem("vendor_address", JSON.stringify(address));
    if (marker) sessionStorage.setItem("vendor_marker", JSON.stringify(marker));
    alert("Draft saved!");
  };

  const handleBack = () => {
    navigate("/register-vendor");
  };

  const handleSubmit = async () => {
    if (!marker) return alert("Please pin business location");

    const certBase64 = sessionStorage.getItem("vendor_certificate_base64");
    const imgBase64 = sessionStorage.getItem("vendor_profile_base64");

    const userCred = await createUserWithEmailAndPassword(
      auth,
      basicData.email,
      basicData.password
    );
    const uid = userCred.user.uid;

    let certURL = "";
    let imgURL = "";

    if (certBase64) {
      const blob = await (await fetch(certBase64)).blob();
      const refCert = ref(storage, `ssmCertificates/${uid}/certificate.pdf`);
      await uploadBytes(refCert, blob);
      certURL = await getDownloadURL(refCert);
    }

    if (imgBase64) {
      const blob = await (await fetch(imgBase64)).blob();
      const refImg = ref(storage, `vendorProfiles/${uid}/profile.jpg`);
      await uploadBytes(refImg, blob);
      imgURL = await getDownloadURL(refImg);
    }

    await setDoc(doc(db, "vendors", uid), {
      ...basicData,
      address,
      location: marker,
      certificateURL: certURL,
      profileImageURL: imgURL,
      role: "vendor",
      createdAt: new Date(),
    });

    sessionStorage.clear();
    alert("Vendor registered successfully!");
    navigate("/vendor");
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <>
      <Header />
      <div className="page-background">
        <div className="register-container">
          <div className="register-box">
            <form className="register-form">
              <h2 className="register-title">CONFIRM BUSINESS ADDRESS</h2>

              <div className="form-grid">
                <div className="left-column">
                  {["addressLine1", "addressLine2", "city", "state", "postcode"].map(
                    (f) => (
                      <div className="input-group" key={f}>
                        <label>{f}</label>
                        <input
                          value={address[f] || ""}
                          onChange={(e) =>
                            setAddress((p) => ({ ...p, [f]: e.target.value }))
                          }
                          className="input-field"
                        />
                      </div>
                    )
                  )}

                  <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                    <button type="button" className="back-button" onClick={handleBack}>
                      BACK
                    </button>
                    <button type="button" className="confirmaddress-button" onClick={handleSave}>
                      SAVE
                    </button>
                  </div>
                </div>

                <div className="right-column">
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "300px" }}
                    center={marker || { lat: 3.0738, lng: 101.4973 }}
                    zoom={17}
                    onClick={(e) =>
                      setMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() })
                    }
                  >
                    {marker && <Marker position={marker} draggable />}
                  </GoogleMap>

                  <button
                    type="button"
                    className="confirmaddress-button"
                    style={{ marginTop: "10px" }}
                    onClick={handleSubmit}
                  >
                    SUBMIT VENDOR
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
