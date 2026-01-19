import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/header1';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import './customerViewVendorPage.css';

import plusIcon from "../assets/plusicon.png";
import messageIcon from "../assets/message.png";

/* CATEGORY ORDER */
const CATEGORY_ORDER = [
  'rice',
  'noodle',
  'western',
  'fast food',
  'dessert',
  'beverages',
  'others',
];

/* CATEGORY ICONS */
import allIcon from '../assets/categories/allcategory.png';
import riceIcon from '../assets/categories/rice.png';
import noodleIcon from '../assets/categories/noodle.png';
import westernIcon from '../assets/categories/western.png';
import fastFoodIcon from '../assets/categories/fastfood.png';
import dessertIcon from '../assets/categories/dessert.png';
import beverageIcon from '../assets/categories/beverage.png';
import othersIcon from '../assets/categories/others.png';

const CATEGORY_ICONS = {
  all: allIcon,
  rice: riceIcon,
  noodle: noodleIcon,
  western: westernIcon,
  'fast food': fastFoodIcon,
  dessert: dessertIcon,
  beverages: beverageIcon,
  others: othersIcon,
};

/* Normalize text helpers */
const normalize = v => (v || '').toString().trim().toLowerCase();

const mapToCategory = raw => {
  const v = normalize(raw);
  if (v.includes('rice')) return 'rice';
  if (v.includes('noodle') || v.includes('mee')) return 'noodle';
  if (v.includes('western')) return 'western';
  if (v.includes('fast')) return 'fast food';
  if (v.includes('dessert') || v.includes('cake')) return 'dessert';
  if (v.includes('drink') || v.includes('beverage')) return 'beverages';
  return 'others';
};

export default function CustomerViewVendorPage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const storage = getStorage();

  /* Placeholder avatar generator */
  const placeholderVendorImage = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Vendor')}&background=ececec&color=555`;

  const [vendor, setVendor] = useState(null);
  const [menus, setMenus] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch vendor data
        const vSnap = await getDoc(doc(db, 'vendors', vendorId));
        
        if (vSnap.exists()) {
          const data = { id: vSnap.id, ...vSnap.data() };
          let finalURL = '';

          // Logic to determine the image URL
          if (data.profileImageURL && data.profileImageURL.startsWith('http')) {
            finalURL = data.profileImageURL;
          } else if (data.profileImagePath) {
            try {
              const cleanPath = data.profileImagePath.startsWith('/') 
                ? data.profileImagePath.substring(1) 
                : data.profileImagePath;
              finalURL = await getDownloadURL(ref(storage, cleanPath));
            } catch (err) {
              console.error("Storage error:", err);
            }
          }

          // ✅ Map phone to whatsappPhone
          setVendor({
            ...data,
            profileImageURL: finalURL || placeholderVendorImage(data.businessName),
            whatsappPhone: data.phone || '', // <-- Use Firestore 'phone' field
          });
        }

        // 2. Fetch menus
        const q = query(collection(db, 'menus'), where('vendorId', '==', vendorId));
        const snap = await getDocs(q);
        const fetched = snap.docs.map(d => {
          const item = d.data();
          return {
            id: d.id,
            ...item,
            _category: mapToCategory(item.category || item.menuCategory || item.type),
          };
        });

        setMenus(fetched);
      } catch (error) {
        console.error("Error loading vendor page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId, storage]);

  /* Filter logic */
  const availableCategories = useMemo(() => {
    const found = new Set(menus.map(m => m._category));
    return CATEGORY_ORDER.filter(c => found.has(c));
  }, [menus]);

  const categoriesToShow = useMemo(() => ['all', ...availableCategories], [availableCategories]);

  const filteredMenus =
    activeCategory === 'all'
      ? menus
      : menus.filter(m => m._category === activeCategory);

  const openMenu = id => navigate(`/customer/menu/${id}`);

  const addToCart = (menu) => {
    const cart = JSON.parse(localStorage.getItem("cart_demo")) || [];

    const existing = cart.find(item => item.id === menu.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: menu.id,
        name: menu.name,
        price: menu.price,
        imageURL: menu.imageURL,
        vendorId: vendorId,
        vendorName: vendor?.businessName || 'Vendor',
        qty: 1,
        selected: true
      });
    }

    localStorage.setItem("cart_demo", JSON.stringify(cart));
    alert("Added to cart");
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container" style={{ paddingTop: 120, textAlign: 'center' }}>
          <p>Loading shop details...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="vendor-page" style={{ paddingTop: 80 }}>
        <div className="vendor-container">

          {/* ===== VENDOR HEADER CARD ===== */}
          <div className="vendor-header-card">
            <div className="vendor-left">
              <div className="vendor-avatar">
                <img
                  src={vendor?.profileImageURL}
                  alt={vendor?.businessName}
                  onError={(e) => {
                    e.currentTarget.src = placeholderVendorImage(vendor?.businessName);
                  }}
                />
              </div>
              <div className="vendor-name-text">{vendor?.businessName || 'Vendor'}</div>
            </div>

            {/* ===== WhatsApp Chat Button ===== */}
            <button
              className="vendor-message-btn"
              title="Chat on WhatsApp"
              onClick={() => {
                if (!vendor?.whatsappPhone) {
                  alert("Vendor has not provided a WhatsApp number.");
                  return;
                }
                const phone = vendor.whatsappPhone.replace(/\D/g, '');
                const text = encodeURIComponent(`Hi, I want to order from ${vendor.businessName}`);
                const url = `https://wa.me/${phone}?text=${text}`;
                window.open(url, "_blank");
              }}
            >
              <img src={messageIcon} alt="Message" />
            </button>
          </div>

          {/* ===== CATEGORY CARDS ===== */}
          <div className="category-card-vendorpage">
            {categoriesToShow.map(cat => (
              <button
                key={cat}
                className={`category-cards ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <img src={CATEGORY_ICONS[cat]} alt={cat} className="category-icons" />
                <span className="category-label">
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              </button>
            ))}
          </div>

          {/* ===== MENU GRID ===== */}
          <div className="menus-grid">
            {filteredMenus.map(menu => (
              <div key={menu.id} className="menu-card">
                <div className="menu-thumb-wrapper">
                  <button className="menu-thumbs" onClick={() => openMenu(menu.id)}>
                    {menu.imageURL ? (
                      <img src={menu.imageURL} alt={menu.name} />
                    ) : (
                      <div className="no-img">No image</div>
                    )}
                  </button>

                  <button
                    className="add-cart-btn"
                    onClick={(e) => { e.stopPropagation(); addToCart(menu); }}
                    title="Add to cart"
                  >
                    <img src={plusIcon} alt="Add" />
                  </button>
                </div>

                <div className="menu-meta">
                  <button className="menu-name" onClick={() => openMenu(menu.id)}>
                    {menu.name}
                  </button>
                  <span className="prices">RM {menu.price}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredMenus.length === 0 && (
            <div className="empty" style={{ textAlign: 'center', marginTop: 40 }}>
              No menu items found in this category.
            </div>
          )}

        </div>
      </div>
    </>
  );
}
