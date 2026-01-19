import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import Header from '../components/header4';
import './vendorViewMenu.css';
import { useParams, useNavigate } from 'react-router-dom';

export default function VendorViewMenu() {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const dref = doc(db, 'menus', id);
    getDoc(dref)
      .then((snap) => {
        if (snap.exists()) setMenu({ id: snap.id, ...snap.data() });
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!menu)
    return (
      <> 
        <Header />
        <div style={{ padding: 20 }}>Loading...</div>
      </>
    );

  const handleDelete = async () => {
    const ok = window.confirm('Delete this menu? This cannot be undone.');
    if (!ok) return;
    try {
      // Delete storage image if exists
      if (menu.imageURL) {
        try {
          const parts = menu.imageURL.split('/o/');
          if (parts.length > 1) {
            const pathAndToken = parts[1];
            const path = decodeURIComponent(pathAndToken.split('?')[0]);
            const imageRef = ref(storage, path);
            await deleteObject(imageRef);
          }
        } catch (e) {
          console.warn('Failed to delete storage object:', e);
        }
      }

      // Delete Firestore document
      await deleteDoc(doc(db, 'menus', id));
      navigate('/vendor');
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete menu: ' + err.message);
    }
  };

  return (
    <>
      <Header />
      <div className="menu-details-page">
        <div className="vendormenu-details-container">
          <h1 className="menu-title">{menu.name}</h1>

          <div className="top-row">
            {/* Menu image */}
            <div className="image-wrap">
              {menu.imageURL ? (
                <img src={menu.imageURL} alt={menu.name} />
              ) : (
                <div className="no-img">No image</div>
              )}
            </div>

            {/* Menu info */}
            <div className="info">
              <div className="field">
                <span className="label">Price</span>: RM{menu.price}
              </div>
              <div className="field">
                <span className="label">Status</span>: {menu.status}
              </div>
              <div className="field">
                <span className="label">Description</span>:{' '}
                {menu.description || 'No description provided.'}
              </div>
              <div className="field">
                <span className="label">Type</span>: {menu.type || 'N/A'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            <button
              className="update-btn"
              onClick={() => navigate(`/vendor/update/${menu.id}`)}
            >
              Update
            </button>
            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
