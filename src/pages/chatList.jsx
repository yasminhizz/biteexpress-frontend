import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db, auth } from "../firebase";
import Header from "../components/header1";
import "./chat.css";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();
  const vendorId = auth.currentUser.uid;

  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      where("vendorId", "==", vendorId),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setChats(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();
  }, [vendorId]);

  return (
    <>
      <Header />
      <div className="chat-list-page">
        <h2>Customer Messages</h2>

        {chats.length === 0 && (
          <div className="empty-chat">No messages yet</div>
        )}

        {chats.map(chat => (
          <div
            key={chat.id}
            className="chat-item"
            onClick={() => navigate(`/chat/vendor/${chat.id}`)}
          >
            <div className="chat-name">{chat.customerName}</div>
            <div className="chat-last">
              {chat.lastMessage || "No messages yet"}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
