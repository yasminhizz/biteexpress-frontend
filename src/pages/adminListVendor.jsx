import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Header2 from "../components/header6";
import "./adminListVendor.css";

export default function AdminListVendor() {
  const [groupedVendors, setGroupedVendors] = useState({});
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const navigate = useNavigate();

  const rowRefs = useRef({});

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, "vendors"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const data = snap.docs.map(d => {
        const item = { id: d.id, ...d.data() };
        if (item.createdAt?.toDate) {
          const date = item.createdAt.toDate();
          item.month = date.toLocaleString("en-US", { month: "long", year: "numeric" });
        } else item.month = "Unknown Date";
        return item;
      });

      setAllVendors(data);

      const grouped = data.reduce((acc, v) => {
        if (!acc[v.month]) acc[v.month] = [];
        acc[v.month].push(v);
        return acc;
      }, {});
      setGroupedVendors(grouped);
    };
    fetchUsers();
  }, []);

  // search vendor logic
  const handleSearch = (value) => {
    setSearchText(value);
    if (!value) return setSuggestions([]);

    const filtered = allVendors.filter(
      v =>
        v.businessName.toLowerCase().includes(value.toLowerCase()) ||
        v.email.toLowerCase().includes(value.toLowerCase())
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
        setTimeout(() => (rowRefs.current[id].style.background = ""), 1500);
      }
    }, 200);
  };

  const generateReport = () => navigate("/admin/generate-vendor-report");

  return (
    <div>
      <Header2 />

      <div className="vendor-list-page">
        <h2>LIST REGISTERED VENDORS</h2>

        <div className="top-controls">
          <button className="generate-btn" onClick={generateReport}>
            GENERATE REPORT
          </button>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search vendor"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {suggestions.length > 0 && (
              <ul className="suggestion-box">
                {suggestions.map(s => (
                  <li key={s.id} onClick={() => scrollToUser(s.id)}>
                    {s.businessName} - {s.email}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="vendor-list-content">
          {Object.keys(groupedVendors).map((month, i) => (
            <div key={i} className="month-section">
              <h3>{month}</h3>

              <table className="vendor-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Business Name</th>
                    <th>Email</th>
                  </tr>
                </thead>

                <tbody>
                  {groupedVendors[month].map((v, idx) => (
                    <tr
                      key={v.id}
                      ref={el => (rowRefs.current[v.id] = el)}
                      className="table-row"
                      onClick={() => navigate(`/admin/vendors/${v.businessName}`)}
                    >
                      <td>{idx + 1}</td>
                      <td>{v.businessName}</td>
                      <td>{v.email}</td>
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
