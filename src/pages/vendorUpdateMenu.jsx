import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Header from '../components/header4';
import './vendorUpdateMenu.css';
import { useParams, useNavigate } from 'react-router-dom';

export default function VendorUpdateMenu() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'menus', id)).then((snap) => {
      if (snap.exists()) {
        setForm(snap.data());
        setPreview(snap.data().imageURL || null);
      }
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, imageFile: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageURL = form.imageURL || '';
      const dref = doc(db, 'menus', id);

      if (form.imageFile) {
        const ext = form.imageFile.name.split('.').pop();
        const fileRef = ref(storage, `menus/${form.vendorId}/${id}.${ext}`);

        await new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(fileRef, form.imageFile);
          uploadTask.on(
            'state_changed',
            (snap) => {
              setUploadProgress(
                Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
              );
            },
            reject,
            async () => {
              imageURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      await updateDoc(dref, {
        name: form.name,
        price: form.price,
        description: form.description,
        type: form.type,
        status: form.status,
        imageURL,
      });

      navigate('/vendor');
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!form) return (<><Header /><div style={{ padding: 20 }}>Loading...</div></>);

  return (
    <>
      <Header />
      <div className="update-menu">
        <h2>Update Menu</h2>

        <form className="update-form" onSubmit={handleSubmit}>
          <div className="form-grid">

            {/* LEFT COLUMN */}
            <div className="form-left">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />

              <label>Price (RM)</label>
              <input name="price" value={form.price} onChange={handleChange} required />

              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />

              <label>Menu Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="rice">Rice</option>
                <option value="noodle">Noodle</option>
                <option value="western">Western</option>
                <option value="fast food">Fast Food</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* RIGHT COLUMN */}
            <div className="form-right">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="available">Available</option>
                <option value="sold out">Sold Out</option>
              </select>

              <label>Menu Image</label>
              <input type="file" accept="image/*" onChange={handleChange} />

              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="bar" style={{ width: `${uploadProgress}%` }} />
              <div className="pct">{uploadProgress}%</div>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>
    </>
  );
}
