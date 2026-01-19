import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export default function CustomerChatVendor() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const startChat = async () => {
      const q = query(
        collection(db, "chats"),
        where("customerId", "==", user.uid),
        where("vendorId", "==", vendorId)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        navigate(`/chat/${snap.docs[0].id}`);
        return;
      }

      const chatRef = await addDoc(collection(db, "chats"), {
        customerId: user.uid,
        customerName: user.displayName || "Customer",
        vendorId,
        vendorName: "Vendor",
        lastMessage: "",
        lastSender: "",
        updatedAt: serverTimestamp(),
      });

      navigate(`/chat/${chatRef.id}`);
    };

    startChat();
  }, [vendorId, navigate, user]);

  return null;
}
