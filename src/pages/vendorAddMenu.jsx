import React, { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Header from '../components/header4';
import './vendorAddMenu.css';
import { useNavigate } from 'react-router-dom';

export default function VendorAddMenu() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    status: 'available',
    type: 'rice',
    imageFile: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setForm(prev => ({ ...prev, imageFile: file }));
      setPreview(URL.createObjectURL(file)); // 👈 preview
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resizeImage = (file, maxWidth = 1200, maxHeight = 1200) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url);
          resolve(blob);
        }, 'image/jpeg', 0.8);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert('Not authenticated');

    setLoading(true);
    setUploadProgress(0);

    try {
      const docRef = await addDoc(collection(db, 'menus'), {
        vendorId: user.uid,
        name: form.name,
        price: form.price,
        description: form.description,
        status: form.status,
        type: form.type,
        imageURL: '',
        createdAt: serverTimestamp(),
      });

      if (form.imageFile) {
        const blob = await resizeImage(form.imageFile);
        const fileRef = ref(storage, `menus/${user.uid}/${docRef.id}.jpg`);

        await new Promise((resolve, reject) => {
          const uploadTask = uploadBytesResumable(fileRef, blob);

          uploadTask.on(
            'state_changed',
            snap => {
              setUploadProgress(
                Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
              );
            },
            reject,
            async () => {
              const imageURL = await getDownloadURL(uploadTask.snapshot.ref);
              await updateDoc(docRef, { imageURL });
              resolve();
            }
          );
        });
      }

      navigate('/vendor');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="add-menu-container">
        <h2>Add Menu</h2>

        <form className="add-menu-form two-col" onSubmit={handleSubmit}>
          {/* LEFT COLUMN */}
          <div className="col left">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Price (RM)</label>
            <input name="price" value={form.price} onChange={handleChange} required />

            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />

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
          <div className="col right">
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

          {/* SUBMIT */}
          <div className="full-width">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div className="bar" style={{ width: `${uploadProgress}%` }} />
                <div className="pct">{uploadProgress}%</div>
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
