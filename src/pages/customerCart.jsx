// src/pages/customerCart.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header1';
import './customerCart.css';

export default function CustomerCart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [selectAllVendors, setSelectAllVendors] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Generate unique cart key per customer/guest
  const [CART_KEY, setCartKey] = useState("cart_guest");

  useEffect(() => {
    // Try to get logged-in customer ID from localStorage or auth
    let customerId = localStorage.getItem("currentCustomerId");
    if (!customerId) {
      // If no customer, generate a guest ID
      customerId = localStorage.getItem("guestId");
      if (!customerId) {
        customerId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem("guestId", customerId);
      }
    }

    const key = `cart_${customerId}`;
    setCartKey(key);

    // Load cart for this user
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (err) {
        console.error('Error parsing cart:', err);
      }
    }

    setLoading(false);
  }, []);

  // ✅ Persist cart changes to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      const vendors = {};
      cart.forEach((item) => {
        if (!vendors[item.vendorId]) vendors[item.vendorId] = true;
        if (!item.selected) vendors[item.vendorId] = false;
      });
      setSelectAllVendors(vendors);
    }
  }, [cart, loading, CART_KEY]);

  // ✅ Toggle individual item
  const toggleItem = (id) => {
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  // ✅ Toggle all items under a vendor
  const toggleVendor = (vendorId) => {
    const currentlySelected = selectAllVendors[vendorId] === true;
    setCart((prev) =>
      prev.map((it) =>
        it.vendorId === vendorId ? { ...it, selected: !currentlySelected } : it
      )
    );
  };

  // ✅ Adjust quantity
  const changeQty = (id, qty) => {
    const q = Math.max(1, Number(qty) || 1);
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: q } : it))
    );
  };

  // ✅ Delete item
  const deleteItem = (id) => {
    const updated = cart.filter((it) => it.id !== id);
    setCart(updated);
  };

  // ✅ Proceed to checkout
  const placeOrder = () => {
    const items = cart.filter((it) => it.selected);
    if (items.length === 0) {
      alert('Please select at least one menu to place order.');
      return;
    }
    navigate('/customer/checkout', { state: { items } });
  };

  // ✅ Group items by vendor
  const grouped = cart.reduce((acc, it) => {
    if (!acc[it.vendorId]) acc[it.vendorId] = { vendorName: it.vendorName, items: [] };
    acc[it.vendorId].items.push(it);
    return acc;
  }, {});

  // 🕒 Loading state
  if (loading)
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading your cart...</div>
      </>
    );

  return (
    <>
      <Header />
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Cart</h1>

          <div className="cart-list">
            {cart.length === 0 ? (
              <div className="empty">Your cart is empty.</div>
            ) : (
              Object.entries(grouped).map(([vendorId, group]) => (
                <div className="vendor-block" key={vendorId}>
                  <div
                    className="vendor_header"
                    onClick={() => toggleVendor(vendorId)}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectAllVendors[vendorId]}
                      readOnly
                    />
                    <span className="vendor-names">{group.vendorName}</span>
                  </div>

                  {group.items.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="item-left">
                        <input
                          type="checkbox"
                          checked={!!item.selected}
                          onChange={() => toggleItem(item.id)}
                        />
                        <div className="item-info">
                          <div className="item-name">{item.name}</div>
                          <div className="item-price">
                            RM {Number(item.price).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="item-right">
                        <div className="qty-control">
                          <button
                            onClick={() => changeQty(item.id, item.qty - 1)}
                          >
                            −
                          </button>
                          <input
                            value={item.qty}
                            onChange={(e) => changeQty(item.id, e.target.value)}
                          />
                          <button
                            onClick={() => changeQty(item.id, item.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="delete_btn"
                          onClick={() => deleteItem(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-actions">
              <button className="place-order" onClick={placeOrder}>
                Place Order
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
