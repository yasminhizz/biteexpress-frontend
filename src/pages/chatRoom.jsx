import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import Header from "../components/header1";
import "./chat.css";

export default function ChatRoom() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);
  const userId = auth.currentUser.uid;

  /* ================= Ensure Chat Exists ================= */
  useEffect(() => {
    const initChat = async () => {
      const chatRef = doc(db, "chats", chatId);
      const snap = await getDoc(chatRef);

      if (!snap.exists()) {
        const [vendorId, customerId] = chatId.split("_");

        await setDoc(chatRef, {
          vendorId,
          customerId,
          vendorName: "Vendor",
          customerName: "Customer",
          lastMessage: "",
          updatedAt: serverTimestamp()
        });
      }
    };

    initChat();
  }, [chatId]);

  /* ================= Load Messages ================= */
  useEffect(() => {
    const q = query(
      collection(db, "messages", chatId, "items"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => d.data()));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    return () => unsub();
  }, [chatId]);

  /* ================= Send Message ================= */
  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(
      collection(db, "messages", chatId, "items"),
      {
        text,
        senderId: userId,
        createdAt: serverTimestamp()
      }
    );

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      updatedAt: serverTimestamp()
    });

    setText("");
  };

  return (
    <>
      <Header />
      <div className="chat-room">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${msg.senderId === userId ? "me" : "them"}`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </>
  );
}
