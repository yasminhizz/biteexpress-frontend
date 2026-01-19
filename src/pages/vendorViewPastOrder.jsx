/* vendorViewPastOrder.jsx */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/header4';
import './vendorViewPastOrder.css';

export default function VendorViewPastOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const ref = doc(db, 'orders', orderId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
        setResponse(snap.data().vendorResponse || '');
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  const submitResponse = async () => {
    await updateDoc(doc(db, 'orders', orderId), {
      vendorResponse: response
    });
    alert('Response sent!');
  };

  if (loading) return <><Header /><div style={{ padding: 20 }}>Loading...</div></>;
  if (!order) return <><Header /><div style={{ padding: 20 }}>Order not found</div></>;

  return (
    <>
      <Header />
      <div className="view-page">
        <div className="view-container">

          {/* Tabs (same as customer) */}
          <div className="tabs">
            <button className="tab" onClick={() => navigate('/vendor/ongoing-orders')}>
              Ongoing Orders
            </button>
            <button className="tab active" onClick={() => navigate('/vendor/past-orders')}>
              Past Orders
            </button>
          </div>

          <div className="order-box">
            <h2>ORDER: #{order.id}</h2>

            {/* ORDER DETAILS */}
            <div className="order-info">
              <h3>ORDER DETAILS</h3>
              <table className="order-info-table">
                <tbody>
                  <tr><td>Customer</td><td>{order.customerName || '-'}</td></tr>
                  <tr><td>Status</td><td>{order.status}</td></tr>
                  <tr>
                    <td>Order Time</td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ITEMS */}
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
                    <tr key={it.name}>
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

            {/* CUSTOMER FEEDBACK (read-only) */}
            <div className="feedback">
              <h3>CUSTOMER RATING</h3>

              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <span
                    key={s}
                    className={`star ${s <= (order.rating || 0) ? 'on' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                readOnly
                value={order.feedback || 'No feedback provided.'}
              />

              {/* Vendor Response */}
              <h3 style={{ marginTop: 25 }}>YOUR RESPONSE</h3>

              <textarea
                placeholder="Write your response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />

              <div className="feedback-actions">
                <button className="submit-feedback" onClick={submitResponse}>
                  SEND RESPONSE
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
