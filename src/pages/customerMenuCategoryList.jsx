import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Header from '../components/header1';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import plusIcon from "../assets/plusicon.png";
import './customerMenuCategoryList.css';

export default function CustomerMenuCategoryList() {
  const { type } = useParams();
  const decodedType = decodeURIComponent(type || '');
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!decodedType) return;
    setLoading(true);

    (async () => {
      try {
        const menusRef = collection(db, 'menus');
        const q = query(menusRef, where('type', '==', decodedType));
        const snap = await getDocs(q);

        const menuData = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        const menusWithVendor = await Promise.all(
          menuData.map(async (menu) => {
            if (menu.vendorId) {
              const vendorSnap = await getDoc(doc(db, 'vendors', menu.vendorId));
              if (vendorSnap.exists()) {
                return {
                  ...menu,
                  vendorName: vendorSnap.data().businessName || 'Unnamed Vendor'
                };
              }
            }
            return { ...menu, vendorName: 'Unknown Vendor' };
          })
        );

        setMenus(menusWithVendor);
      } catch (err) {
        console.error('Error fetching menus by type:', err);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedType]);

  const openMenu = (id) => navigate(`/customer/menu/${id}`);
  const openVendor = (vendorId) => navigate(`/customer/vendor/${vendorId}`);

  /* ➕ ADD TO CART */
  const addToCart = (menu) => {
    const cart = JSON.parse(localStorage.getItem('cart_demo')) || [];

    const existing = cart.find(item => item.id === menu.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: menu.id,
        name: menu.name,
        price: menu.price,
        imageURL: menu.imageURL,
        vendorId: menu.vendorId,
        vendorName: menu.vendorName,
        qty: 1,
        selected: true
      });
    }

    localStorage.setItem('cart_demo', JSON.stringify(cart));
    alert('Added to cart');
  };

  const displayedMenus = menus
    .filter(menu =>
      menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortOrder) return 0;
      return sortOrder === 'asc'
        ? a.price - b.price
        : b.price - a.price;
    });

  return (
    <>
      <Header />
      <div className="category-list-page">
        <h1 className="list-title">
          {decodedType.charAt(0).toUpperCase() +
            decodedType.slice(1).toLowerCase()}
        </h1>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <button
            className="sort-btn"
            onClick={() =>
              setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
            }
            title="Sort by price"
          >
            {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>

        <div className="scroll-area">
          {loading && <div className="loading">Loading...</div>}
          {!loading && displayedMenus.length === 0 && (
            <div className="empty">No menus found.</div>
          )}

          <div className="menus-grid">
            {displayedMenus.map(menu => (
              <div key={menu.id} className="menu-card">
                <div className="menu-thumb-wrapper">
                  <button
                    className="menu-thumb"
                    onClick={() => openMenu(menu.id)}
                  >
                    {menu.imageURL ? (
                      <img src={menu.imageURL} alt={menu.name} />
                    ) : (
                      <div className="no-img">No image</div>
                    )}
                  </button>

                  <button
                    className="add-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(menu);
                    }}
                    title="Add to cart"
                  >
                    <img src={plusIcon} alt="Add" />
                  </button>
                </div>

                <div className="menu-meta">
                  <button
                    className="menu-name"
                    onClick={() => openMenu(menu.id)}
                  >
                    {menu.name}
                  </button>

                  <span className="price">RM {menu.price}</span>

                  <span
                    className="vendor-name"
                    onClick={() => openVendor(menu.vendorId)}
                  >
                    {menu.vendorName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
