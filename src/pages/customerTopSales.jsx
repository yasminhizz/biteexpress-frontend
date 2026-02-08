import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header1";
import "./customerTopSales.css";

export default function CustomerTopSales() {
  const navigate = useNavigate();

  const [topMenus, setTopMenus] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch Top Sales Menus
  useEffect(() => {
    const fetchTopSales = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/menus/top-sales");
        const data = await res.json();
        console.log("🔥 Top Sales API:", data);

        // Map backend field `imageUrl` to `imageURL` for frontend
        const menusWithImage = (data.menus || []).map(menu => ({
          ...menu,
          imageURL: menu.imageUrl || "", // fallback if no image
          price: Number(menu.price || 0).toFixed(2), // ensure price format
        }));

        setTopMenus(menusWithImage);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopSales();
  }, []);

  // 🔍 Search Menus
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/menus/search?q=${query}`
        );
        const data = await res.json();

        const searchMenus = (data.menus || []).map(menu => ({
          ...menu,
          imageURL: menu.imageUrl || "",
          price: Number(menu.price || 0).toFixed(2),
        }));

        setSearchResults(searchMenus);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const menusToShow = query ? searchResults : topMenus;

  return (
    <>
      <Header />

      <div className="top-sales-page">
        <h1 className="top-sales-title">Top Sales</h1>

        {/* SEARCH BAR */}
        {/* SEARCH BAR + BUTTON */}
        <div className="top-search-box-container">
          <input
            type="text"
            placeholder="Search menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="find-nearby-btn"
            onClick={() => navigate("/customer/nearby-vendors")}
          >
            Find Nearby Vendor
          </button>
        </div>


        {loading && <p className="loading-text">Searching...</p>}

        {/* MENU GRID - HORIZONTAL SCROLL */}
        <div className="top-sales-grid">
          {menusToShow.map((menu) => (
            <div
              key={menu.id}
              className="menu-card"
              onClick={() => navigate(`/customer/menu/${menu.id}`)}
            >
              {/* MENU IMAGE */}
              <div className="menu-images">
                {menu.imageURL ? (
                  <img src={menu.imageURL} alt={menu.menuName} />
                ) : (
                  <span className="menu-placeholder">🍽</span>
                )}
              </div>

              {/* MENU INFO */}
              <div className="menu-info">
                <h3 className="menu-name">{menu.menuName}</h3>
                <p className="menu-vendor">{menu.vendorName}</p>
                <p className="menu-price">RM {menu.price}</p>
              </div>
            </div>
          ))}

          {!loading && menusToShow.length === 0 && (
            <p className="empty-text">No menu found</p>
          )}
        </div>
      </div>
    </>
  );
}
