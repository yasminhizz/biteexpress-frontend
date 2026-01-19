import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/header4';
import './vendorViewOngoingOrder.css';

export default function VendorViewOngoingOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
        else setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return (<><Header /><div style={{ padding: 20 }}>Loading...</div></>);
  if (!order) return (<><Header /><div style={{ padding: 20 }}>Order not found</div></>);

  return (
    <>
      <Header />

      <div className="view-page">
        <div className="view-container">

          {/* Tabs */}
          <div className="tabs">
            <button className="tab active" onClick={() => navigate('/vendor/ongoing-orders')}>
              ONGOING ORDER
            </button>
            <button className="tab" onClick={() => navigate('/vendor/past-orders')}>
              PAST ORDER
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

            {/* MENU PURCHASED */}
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
                  {(order.items || []).map((it, i) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td>x{it.qty}</td>
                      <td>{Number(it.price).toFixed(2)}</td>
                      <td>{(it.price * it.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTAL */}
              <div className="total-box">
                <span>Total Paid:</span>
                <strong>RM {order.total?.toFixed(2)}</strong>
              </div>
            </div>

            {/* ACTION */}
            <div className="order-actions">
              <button className="track-btn" onClick={() => navigate('/vendor/ongoing-orders')}>
                BACK
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
