import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Header from '../components/header4';
import './vendorUpdateOngoingOrder.css';

export default function VendorUpdateOngoingOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrder() {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder(docSnap.data());
        setStatus(docSnap.data().status);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  async function handleStatusUpdate() {
    if (!order) return;
    await updateDoc(doc(db, 'orders', orderId), { status });
    navigate('/vendor/ongoing-orders');
  }

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <>
      <Header />
      <div className="update-order-container">
        <h2 className="order-title">Update Order Status</h2>
        <div className="order-info">
          <div><b>Order ID:</b> {orderId}</div>
          <div><b>Customer:</b> {order.customerName || order.customerId}</div>
          <div><b>Items:</b> {order.items ? order.items.map((item,i)=>(<span key={i}>{item.name} x{item.qty}; </span>)) : 'N/A'}</div>
          <div><b>Status:</b> {order.status}</div>
        </div>
        <div className="order-actions">
          <label htmlFor="status">Update Status:</label>
          <select id="status" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
          </select>
          <button className="update-btn" onClick={handleStatusUpdate}>Update</button>
          <button className="back-btn" onClick={()=>navigate('/vendor/ongoing-orders')}>Back</button>
        </div>
      </div>
    </>
  );
}
