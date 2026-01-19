import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import Header from '../components/header4';
import './vendorDashboard.css';
import { useNavigate } from 'react-router-dom';

/* ================= CATEGORY ORDER ================= */
const CATEGORY_ORDER = [
  'rice',
  'noodle',
  'western',
  'fast food',
  'dessert',
  'beverage',
  'others',
];

/* ================= CATEGORY ICONS ================= */
import allIcon from '../assets/categories/allcategory.png';
import riceIcon from '../assets/categories/rice.png';
import noodleIcon from '../assets/categories/noodle.png';
import westernIcon from '../assets/categories/western.png';
import fastFoodIcon from '../assets/categories/fastfood.png';
import dessertIcon from '../assets/categories/dessert.png';
import beverageIcon from '../assets/categories/beverage.png';
import othersIcon from '../assets/categories/others.png';
import dotIcon from '../assets/doticon.png';

const CATEGORY_ICONS = {
  all: allIcon,
  rice: riceIcon,
  noodle: noodleIcon,
  western: westernIcon,
  'fast food': fastFoodIcon,
  dessert: dessertIcon,
  beverage: beverageIcon,
  others: othersIcon,
};

/* ================= HELPERS ================= */
const normalize = v => (v || '').toLowerCase().trim();

const mapToCategory = raw => {
  const v = normalize(raw);
  if (v.includes('rice')) return 'rice';
  if (v.includes('noodle') || v.includes('mee')) return 'noodle';
  if (v.includes('western')) return 'western';
  if (v.includes('fast')) return 'fast food';
  if (v.includes('dessert') || v.includes('cake')) return 'dessert';
  if (v.includes('drink') || v.includes('beverage')) return 'beverage';
  return 'others';
};

export default function VendorDashboard() {
  const [menus, setMenus] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const navigate = useNavigate();

  const placeholderVendorImage = name =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || 'Vendor'
    )}&background=ececec&color=555`;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    getDoc(doc(db, 'vendors', user.uid)).then(snap => {
      if (snap.exists()) {
        setVendor({ id: snap.id, ...snap.data() });
      }
    });

    const q = query(
      collection(db, 'menus'),
      where('vendorId', '==', user.uid)
    );

    const unsub = onSnapshot(q, snap => {
      setMenus(
        snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            _category: mapToCategory(
              data.category || data.menuCategory || data.type
            ),
          };
        })
      );
    });

    return () => unsub();
  }, []);

  /* ✅ SAME BEHAVIOR AS customerViewVendorPage */
  const categoriesToShow = ['all', ...CATEGORY_ORDER];

  const filteredMenus = menus
    .filter(m =>
      m.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter(m =>
      activeCategory === 'all'
        ? true
        : m._category === activeCategory
    );

  return (
    <>
      <Header />

      <div className="vendor-dashboard" style={{ paddingTop: 90 }}>
        {/* ===== VENDOR HEADER ===== */}
        <div className="vendor-header-card">
          <div className="vendor-left">
            <div className="vendor-avatar">
              <img
                src={
                  vendor?.profileImageURL ||
                  placeholderVendorImage(vendor?.businessName)
                }
                alt={vendor?.businessName}
              />
            </div>
            <div className="vendor-name-text">
              {vendor?.businessName || 'Vendor'}
            </div>
          </div>
        </div>

        {/* ===== CATEGORY CARDS ===== */}
        <div className="category-card-vendorpage">
          {categoriesToShow.map(cat => (
            <button
              key={cat}
              className={`category-cards ${
                activeCategory === cat ? 'active' : ''
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              <img
                src={CATEGORY_ICONS[cat]}
                alt={cat}
                className="category-icons"
              />
              <span className="category-label">
                {cat === 'all'
                  ? 'All'
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* ===== SEARCH ===== */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ===== MENU GRID ===== */}
        <div className="menus-grid">
          {filteredMenus.map(menu => (
            <div
              key={menu.id}
              className="menu-card"
              onClick={() => navigate(`/vendor/view/${menu.id}`)}
            >
              <button
                className="menu-edit-btn"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/vendor/update/${menu.id}`);
                }}
              >
                <img src={dotIcon} alt="Edit" />
              </button>

              {menu.imageURL ? (
                <img src={menu.imageURL} alt={menu.name} />
              ) : (
                <div className="menu-placeholder">No image</div>
              )}

              <div className="menu-name">{menu.name}</div>
              <div className="menu-price">RM {menu.price}</div>
            </div>
          ))}

          {/* ADD MENU */}
          <div
            className="menu-card add-card"
            onClick={() => navigate('/vendor/add')}
          >
            <div className="plus">+</div>
            <div>ADD MENU</div>
          </div>
        </div>

        {filteredMenus.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            No menu found for this category.
          </div>
        )}
      </div>
    </>
  );
}
