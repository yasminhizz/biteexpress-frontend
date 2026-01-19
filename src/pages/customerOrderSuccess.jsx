/* customerOrderSuccess.jsx */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/header1';
import './customerOrderSuccess.css';

export default function CustomerOrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const [order, setOrder] = useState(null);
  const [updating, setUpdating] = useState(true);
  const [status, setStatus] = useState(''); // success or failed

  useEffect(() => {
    const init = async () => {
      try {
        // 1️⃣ Get orderId from state or query params or localStorage
        const stateOrder = location.state?.order;
        let orderId = stateOrder?.id || query.get('order_id') || localStorage.getItem('lastOrderId');

        if (!orderId) {
          alert('Order not found');
          navigate('/');
          return;
        }

        // 2️⃣ Get status from query params (ToyyibPay)
        const status_id = query.get('status_id');
        setStatus(status_id === '1' ? 'success' : 'failed');

        // 3️⃣ Fetch order from Firestore if not passed in state
        if (!stateOrder) {
          const snap = await getDoc(doc(db, 'orders', orderId));
          if (snap.exists()) {
            setOrder({ id: snap.id, ...snap.data() });
          } else {
            alert('Order not found in database');
            navigate('/');
            return;
          }
        } else {
          setOrder(stateOrder);
        }

        // 4️⃣ Update order status to "preparing" only if successful
        if (status_id === '1') {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, { status: 'preparing' });
        }
      } catch (err) {
        console.error('Error loading order:', err);
        alert('Error loading order');
        navigate('/');
      } finally {
        setUpdating(false);
      }
    };

    init();
  }, [location, navigate, query]);

  if (!order) {
    return (
      <>
        <Header />
        <div style={{ padding: 20 }}>Loading order...</div>
      </>
    );
  }

  const total = order.total != null
    ? Number(order.total)
    : (order.items || []).reduce((sum, it) => sum + (Number(it.price || 0) * (it.qty || 1)), 0);

  return (
    <>
      <Header />
      <div className="success-page">
        <div className="success-container">
          <div className="success-box">
            <div className="success-emoji">{status === 'success' ? '✅' : '❌'}</div>
            <h2>{status === 'success' ? 'Order Placed Successfully' : 'Payment Failed'}</h2>
            <p className="order-id">Order ID: <strong>{order.id}</strong></p>

            <div className="order-summary">
              <h4>ITEMS :</h4>
              <ul>
                {(order.items || []).map(it => (
                  <li key={it.id || Math.random()}>
                    {it.qty} x {it.name || 'Item'} ({it.vendorName || ''}) - RM {(Number(it.price || 0) * (it.qty || 1)).toFixed(2)}
                  </li>
                ))}
              </ul>
              {status === 'success' && (
                <p className="total">
                  Total Paid: <strong>RM {total.toFixed(2)}</strong>
                </p>
              )}
            </div>

            <div className="success-actions">
              <button
                onClick={() => navigate('/customer/categories')}
                className="continue"
              >
                CONTINUE BROWSING
              </button>
              {status === 'success' && (
                <button
                  onClick={() => navigate('/customer/orders/ongoing')}
                  className="view-orders"
                  disabled={updating}
                >
                  {updating ? "Loading..." : "VIEW ORDER"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
