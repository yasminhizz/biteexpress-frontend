/* customeriVewPastOrder.jsx */
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Header from '../components/header1';
import './customerViewPastOrder.css';

export default function CustomerViewPastOrder() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(state?.order || null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(!state?.order);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order || !id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const dref = doc(db, 'orders', id);
        const snap = await getDoc(dref);
        if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
        else setOrder(null);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, order]);

  if (loading) return (<><Header /><div style={{ padding: 20 }}>Loading order...</div></>);
  if (!order) return (<><Header /><div style={{ padding: 20 }}>Order not found.</div></>);

  const submitFeedback = async () => {
    if (rating < 1) {
      alert('Please give at least 1 star.');
      return;
    }
    setSaving(true);
    try {
      const dref = doc(db, 'orders', order.id);
      await updateDoc(dref, {
        rating,
        feedback,
        reviewedAt: new Date()
      });
      alert('Thank you for your feedback!');
    } catch (err) {
      console.error('Error saving feedback:', err);
      alert('Failed to save feedback.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <div className="view-page">
        <div className="view-container">

          {/* Tabs */}
          <div className="tabs">
            <button className="tab" onClick={() => navigate('/customer/orders/ongoing')}>Ongoing Orders</button>
            <button className="tab active" onClick={() => navigate('/customer/orders/past')}>Past Orders</button>
          </div>

          <div className="order-box">
            <h2>ORDER: #{order.id}</h2>

            {/* Order Details Table */}
            <div className="order-info">
              <h3>ORDER DETAILS</h3>
              <table className="order-info-table">
                <tbody>
                  <tr><td>Business</td> <td>{order.vendorName || 'Vendor'}</td></tr>
                  <tr><td>Status</td> <td>{order.status}</td></tr>
                  <tr>
                    <td>Order Time</td>
                    <td>{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Items Table */}
            <div className="items">
              <h3>MENU PURCHASED</h3>

              <table className="item-table">
                <thead>
                  <tr>
                    <th>Menu Item</th>
                    <th>Quantity</th>
                    <th>Price (RM)</th>
                    <th>Total (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map(it => (
                    <tr key={it.id || it.name}>
                      <td>{it.name}</td>
                      <td>x{it.qty || 1}</td>
                      <td>{Number(it.price).toFixed(2)}</td>
                      <td>{(it.price * (it.qty || 1)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-box">
                <span>Total Paid:</span>
                <strong>RM {order.total?.toFixed(2)}</strong>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="feedback">
              <h3>RATE YOUR ORDER</h3>

              <div className="stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    className={`star ${s <= rating ? 'on' : ''}`}
                    onClick={() => setRating(s)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                placeholder="Write feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <div className="feedback-actions">
                <button className="submit-feedback" onClick={submitFeedback} disabled={saving}>
                  {saving ? 'Saving...' : 'SUBMIT'}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
