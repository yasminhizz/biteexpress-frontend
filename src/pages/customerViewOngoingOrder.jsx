/* cusomerViewOngoingOrder */
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../components/header1';
import './customerViewOngoingOrder.css';

export default function CustomerViewOngoingOrder() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!state?.order);

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

  if (loading) return (<><Header /><div style={{padding:20}}>Loading order...</div></>);
  if (!order) return (<><Header /><div style={{padding:20}}>Order not found.</div></>);

  const trackOrder = () => {
    navigate(`/customer/track-order/${order.id}`);
  };

  return (
    <>
      <Header />
      <div className="view-page">
        <div className="view-container">
          
          {/* Tabs */}
          <div className="tabs">
            <button className="tab active" onClick={()=>navigate('/customer/orders/ongoing')}>Ongoing Orders</button>
            <button className="tab" onClick={()=>navigate('/customer/orders/past')}>Past Orders</button>
          </div>

          <div className="order-box">
            <h2>ORDER: #{order.id}</h2>

            {/* Order Details */}
            <div className="order-info">
              <h3>ORDER DETAILS</h3>
              <table className="order-info-table">
                <tbody>
                  <tr><td>Vendor</td> <td>{order.vendorName || 'Vendor'}</td></tr>
                  <tr><td>Status</td> <td>{order.status}</td></tr>
                  <tr>
                    <td>Order Time</td>
                    <td>{order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Menu List Table */}
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

              {/* Total Price Box */}
              <div className="total-box">
                <span>Total Paid:</span>
                <strong>RM {order.total?.toFixed(2) || 0}</strong>
              </div>
            </div>

            {/* Track Order Button (only if out for delivery) */}
            {order.status?.toLowerCase() === 'out for delivery' && (
              <div className="order-actions">
                <button className="track-btn" onClick={trackOrder}>TRACK ORDER</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
