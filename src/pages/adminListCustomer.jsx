import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/header6";
import "./adminListCustomer.css";

export default function AdminListCustomer() {
  const [groupedCustomers, setGroupedCustomers] = useState({});
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const rowRefs = useRef({});

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const data = snap.docs.map(d => {
        const item = { id: d.id, ...d.data() };
        if (item.createdAt?.toDate) {
          const date = item.createdAt.toDate();
          item.month = date.toLocaleString("en-US", { month: "long", year: "numeric" });
        } else item.month = "Unknown Date";
        return item;
      });

      setAllCustomers(data);

      const grouped = data.reduce((acc, c) => {
        if (!acc[c.month]) acc[c.month] = [];
        acc[c.month].push(c);
        return acc;
      }, {});
      setGroupedCustomers(grouped);
    };
    fetchUsers();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) return setSuggestions([]);
    const filtered = allCustomers.filter(
      c => c.username.toLowerCase().includes(value.toLowerCase()) ||
      c.email.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 5));
  };

  const scrollToUser = (id) => {
    setSuggestions([]);
    setSearchText("");

    setTimeout(() => {
      if (rowRefs.current[id]) {
        rowRefs.current[id].scrollIntoView({ behavior: "smooth", block: "center" });
        rowRefs.current[id].style.background = "#f2ffb2";
        setTimeout(() => rowRefs.current[id].style.background = "", 1500);
      }
    }, 200);
  };

  return (
    <div>
      <Header2 />

      <div className="customer-list-page">
        <h2>LIST REGISTERED CUSTOMERS</h2>

        <div className="top-controls">
          <button className="generate-btn" onClick={() => navigate("/admin/generate-customer-report")}>
            GENERATE REPORT
          </button>

          <div className="search-container">
            <input
              className="search-input"
              placeholder="Search customer"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {suggestions.length > 0 && (
              <ul className="suggestion-box">
                {suggestions.map(s => (
                  <li key={s.id} onClick={() => scrollToUser(s.id)}>
                    {s.username} • {s.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="customer-list-content">
          {Object.keys(groupedCustomers).map((month, i) => (
            <div key={i} className="month-section">
              <h3>{month}</h3>

              <table className="customer-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Username</th>
                    <th>Email</th>
                  </tr>
                </thead>

                <tbody>
                  {groupedCustomers[month].map((c, idx) => (
                    <tr
                      key={c.id}
                      ref={el => rowRefs.current[c.id] = el}
                      className="table-row"
                      onClick={() => navigate(`/admin/customers/${c.username}`)}
                    >
                      <td>{idx + 1}</td>
                      <td>{c.username}</td>
                      <td>{c.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
