import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Header from "../components/header4";
import "./vendorEditProfile.css";

export default function EditVendorProfile() {
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const dref = doc(db, "vendors", user.uid);

    getDoc(dref).then((snap) => {
      if (snap.exists()) {
        setFormData({
          ...snap.data(),
          certificateFile: null,
        });
      }
    });
  }, []);

  if (!formData)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading...</div>
      </>
    );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) return;

    let certificateURL = formData.certificateURL;

    try {
      // upload NEW file if selected
      if (formData.certificateFile) {
        const ext = formData.certificateFile.name.split(".").pop();
        const fileRef = ref(storage, `ssmCertificates/${user.uid}.${ext}`);
        await uploadBytes(fileRef, formData.certificateFile);
        certificateURL = await getDownloadURL(fileRef);
      }

      const dref = doc(db, "vendors", user.uid);

      await updateDoc(dref, {
        fullName: formData.fullName,
        businessName: formData.businessName,
        phone: formData.phone,
        ssmNumber: formData.ssmNumber,
        certificateURL,
        address: {
          line1: formData.address.line1,
          line2: formData.address.line2,
          city: formData.address.city,
          state: formData.address.state,
          postcode: formData.address.postcode,
        },
      });

      alert("Profile updated successfully!");
      navigate("/edit-profile");
    } catch (err) {
      console.error(err);
      alert("Update failed: " + err.message);
    }
  };

  return (
    <>
      <Header />
      <div className="edit-container">
        <div className="edit-box">
          <h2 className="edit-title">EDIT VENDOR PROFILE</h2>

          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="form-grid">

              {/* LEFT COLUMN */}
              <div className="left-col">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>Business Name</label>
                  <input
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>SSM Number</label>
                  <input
                    name="ssmNumber"
                    value={formData.ssmNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>Upload New SSM Certificate (PDF)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    name="certificateFile"
                    onChange={handleChange}
                  />
                  {formData.certificateURL && (
                    <a
                      href={formData.certificateURL}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "13px" }}
                    >
                      View Current Certificate
                    </a>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="right-col">

                <div className="section-title">Business Address</div>

                <div className="input-group">
                  <label>Address Line 1</label>
                  <input
                    name="line1"
                    value={formData.address.line1}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line1: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="input-group">
                  <label>Address Line 2</label>
                  <input
                    name="line2"
                    value={formData.address.line2}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, line2: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="row">
                  <div className="input-group">
                    <label>City</label>
                    <input
                      name="city"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value },
                        }))
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>State</label>
                    <input
                      name="state"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, state: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Postcode</label>
                  <input
                    name="postcode"
                    value={formData.address.postcode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: { ...prev.address, postcode: e.target.value },
                      }))
                    }
                  />
                </div>

              </div>
            </div>

            <button className="save-button" type="submit">
              SAVE CHANGES
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
