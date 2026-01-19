import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/header1";
import "./customerPayment.css";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";

export default function CustomerPayment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState(state?.items || []);
  const [customer, setCustomer] = useState(state?.customer || {});
  const [agreed, setAgreed] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state?.items) {
      const saved = localStorage.getItem("cart_demo");
      if (saved) {
        setItems(JSON.parse(saved).filter((i) => i.selected));
      }
    }

    if (!state?.customer) {
      const savedCustomer = localStorage.getItem("checkout_customer");
      if (savedCustomer) {
        setCustomer(JSON.parse(savedCustomer));
      }
    }
  }, [state]);

  const total =
    items.reduce((sum, it) => sum + it.price * (it.qty || 1), 0) +
    (state?.shippingFee || 0);

  const onPay = async () => {
    if (!agreed) {
      setShowReminder(true);
      setTimeout(() => setShowReminder(false), 3000);
      return;
    }

    if (!customer.location) {
      alert("Please pin your delivery location before proceeding.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in to complete payment.");
        return;
      }

      setLoading(true);

      // ✅ 1. SAVE ORDER TO FIRESTORE (PENDING PAYMENT)
      const orderData = {
        customerId: user.uid,
        customerName: customer.name || "",
        customerAddress: customer.address || "",
        customerPhone: customer.phone || "",
        customerLocation: customer.location || null,
        items,
        total,
        status: "pending_payment",
        shippingFee: state?.shippingFee || 0,
        distance: state?.distance || 0,
        vendorId: items[0]?.vendorId || null,
        vendorName: items[0]?.vendorName || "Unknown Vendor",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);

      // 🔥 SAVE ORDER ID FOR SUCCESS PAGE
      localStorage.setItem("lastOrderId", docRef.id);

      // ✅ 2. CREATE TOYYIBPAY BILL
      const billResponse = await axios.post(
        "http://localhost:5000/api/payment/toyyibpay/create-bill",
        {
          orderId: docRef.id,
          customerName: customer.name,
          customerEmail: customer.email || "noemail@example.com",

          // 🔥 RM → SEN
          amount: Math.round(total * 100),
        }
      );

      // ✅ 3. REDIRECT TO FPX PAYMENT PAGE
      const billUrl = billResponse.data.billPaymentUrl;
      window.location.href = billUrl;

    } catch (error) {
      console.error("❌ Error creating order/payment:", error);
      alert("Error processing payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="payment-page">
        <h1 className="payment-title">Payment</h1>

        <div className="payment-container">
          {showReminder && (
            <div className="reminder">
              Please agree to the terms before proceeding.
            </div>
          )}

          <div className="payment-body">
            {/* LEFT */}
            <div className="pay-left">
              <h3>ORDER :</h3>

              <div className="order-list">
                {items.map((it) => (
                  <div className="pay-item" key={it.id}>
                    <div className="pi-left">
                      <div className="pi-name">{it.name}</div>
                      <div className="pi-vendor">{it.vendorName}</div>
                    </div>

                    <div className="pi-right">
                      x{it.qty} &nbsp; RM{" "}
                      {(it.price * (it.qty || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="total">
                Total: <span>RM {total.toFixed(2)}</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="pay-right">
              <div className="agreement">
                <p className="fpx-text">
                  This payment process will redirect you to FPX payment.
                </p>

                <label className="tick-label">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span className="agree-text">
                    I agree to the terms and conditions.
                  </span>
                </label>
              </div>

              <div className="pay-actions">
                <button
                  className="pay-btn"
                  onClick={onPay}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Pay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
