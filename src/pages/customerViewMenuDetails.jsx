import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import Header from '../components/header1';
import './customerViewMenuDetails.css';

export default function CustomerViewMenuDetails() {
  const { id } = useParams();
  const [menu, setMenu] = useState(null);
  const [vendorName, setVendorName] = useState('');
  const [vendorImage, setVendorImage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Fetch menu + vendor + suggestions
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const menuSnap = await getDoc(doc(db, 'menus', id));
        if (!menuSnap.exists()) return;

        const menuData = { id: menuSnap.id, ...menuSnap.data() };
        setMenu(menuData);

        if (menuData.vendorId) {
          const vendorSnap = await getDoc(doc(db, 'vendors', menuData.vendorId));
          if (vendorSnap.exists()) {
            const vendorData = vendorSnap.data();
            setVendorName(vendorData.businessName || 'Unknown Vendor');
            setVendorImage(vendorData.profileImageURL || '');
          }

          const q = query(collection(db, 'menus'), where('vendorId', '==', menuData.vendorId));
          const qSnap = await getDocs(q);
          setSuggestions(
            qSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(m => m.id !== id)
              .slice(0, 2)
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Add menu to per-customer cart
  const handleAddToCart = () => {
    // Get customer ID (logged-in or guest)
    let customerId = localStorage.getItem("currentCustomerId");
    if (!customerId) {
      customerId = localStorage.getItem("guestId");
      if (!customerId) {
        customerId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem("guestId", customerId);
      }
    }

    const CART_KEY = `cart_${customerId}`;

    // Load cart for this customer
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    // Check if menu is already in cart
    if (cart.find((i) => i.id === menu.id)) {
      alert('This menu is already in your cart.');
      navigate('/customer/cart');
      return;
    }

    // Add menu to cart
    cart.push({
      id: menu.id,
      vendorId: menu.vendorId,
      vendorName,
      name: menu.name,
      price: Number(menu.price),
      qty: 1,
      selected: true,
    });

    // Save back to localStorage
    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    alert('Menu added to cart!');
    navigate('/customer/cart');
  };

  if (!menu) {
    return (
      <>
        <Header />
        <div style={{ padding: 30 }}>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="menu-details-page">
        {/* LEFT */}
        <div className="details-left">
          {/* VENDOR HEADER */}
          <div
            className="vendor-header"
            onClick={() => navigate(`/customer/vendor/${menu.vendorId}`)}
          >
            <div className="vendor-avatar">
              {vendorImage ? (
                <img src={vendorImage} alt={vendorName} />
              ) : (
                <span>{vendorName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="vendor-name-top">
              {vendorName.charAt(0).toUpperCase() + vendorName.slice(1)}
            </div>
          </div>

          <div className="details-container">
            <h1 className="menu-title">{menu.name}</h1>

            <div className="menu-main-row">
              {/* IMAGE */}
              <div className="image-wrap">
                {menu.imageURL ? (
                  <img src={menu.imageURL} alt={menu.name} />
                ) : (
                  <div className="no-img">No Image</div>
                )}
              </div>

              {/* INFO */}
              <div className="info">
                <div className="field">
                  <span className="label">Price</span>
                  RM {menu.price}
                </div>

                <div className="field">
                  <span className="label">Status</span>
                  {menu.status}
                </div>

                <div className="field">
                  <span className="label">Description</span>
                  {menu.description || 'No description.'}
                </div>

                <div className="actions">
                  <button className="add-cart" onClick={handleAddToCart}>
                    Add To Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="details-right">
          <h2>From the same vendor:</h2>

          {suggestions.map(s => (
            <div
              key={s.id}
              className="suggestion-card"
              onClick={() => navigate(`/customer/menu/${s.id}`)}
            >
              <div className="suggestion-image">
                {s.imageURL ? (
                  <img src={s.imageURL} alt={s.name} />
                ) : (
                  <div className="no-img">No Image</div>
                )}
              </div>

              <div className="suggestion-info">
                <div className="suggestion-name">{s.name}</div>
                <div className="suggestion-price">RM {s.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
