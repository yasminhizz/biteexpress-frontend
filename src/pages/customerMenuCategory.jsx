// customerMenuCategory.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './customerMenuCategory.css';
import Header from '../components/header1';
import riceImg from '../assets/food5.jpg';
import noodleImg from '../assets/food6.jpg';
import westernImg from '../assets/food7.jpg';
import fastFoodImg from '../assets/food8.jpg';
import dessertImg from '../assets/food9.jpg';
import beverageImg from '../assets/food10.jpg';
import othersImg from '../assets/food11.jpg';

const categories = [
  // First row
  { key: 'rice', label: 'Rice', img: riceImg },
  { key: 'noodle', label: 'Noodle', img: noodleImg },
  { key: 'western', label: 'Western', img: westernImg },
  { key: 'fast food', label: 'Fast Food', img: fastFoodImg },
  // Second row
  { key: 'dessert', label: 'Dessert', img: dessertImg },
  { key: 'beverage', label: 'Beverage', img: beverageImg },
  { key: 'others', label: 'Others', img: othersImg },
];

export default function CustomerMenuCategory() {
  const navigate = useNavigate();

  const openCategory = (typeKey) => {
    navigate(`/customer/category/${encodeURIComponent(typeKey)}`);
  };

  return (
    <>
      <Header />
      <div className="customer-categories-page">
        <h1 className="page-title">Menu Category</h1>
        <div className="categories-grid">
          {categories.map((c) => (
            <button
              key={c.key}
              className="category-card"
              onClick={() => openCategory(c.key)}
              aria-label={`Open ${c.label}`}
            >
              <div className="category-image-wrap">
                <img
                  src={c.img}
                  alt={c.label}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/categories/placeholder.png';
                  }}
                />
              </div>
              <div className="category-label">{c.label}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
