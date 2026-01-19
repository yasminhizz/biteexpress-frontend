// landingPage.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/header2';
import Footer from '../components/footer1';
import logoImg from '../assets/landingpage1.png';
import { useNavigate } from 'react-router-dom';
import './landingPage.css';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import section1bg from '../assets/section1bg.png';
import section2bg from '../assets/section2bg.png';
import logos from '../assets/logos.png';
import food1 from '../assets/food1.png';
import food2 from '../assets/food2.png';
import food3 from '../assets/food3.png';
import food4 from '../assets/food4.png';


export default function LandingPage() {
  return (
    <div className="landing-page">
    {/* Header Section */}
      <Header />

    {/* Section 1 - Hero section with background image */}
      <section
        className="section1"
        style={{ backgroundImage: `url(${section1bg})` }} >
        <div className="overlay">
        <h1 className="brand-title">BITEEXPRESS</h1>
        <p className="brand-tagline">We Deliver. You Devour.</p>
      </div>
      </section>


    {/* Section 2 - About / Platform info */}
      <section
        className="section section2"
        style={{ backgroundImage: `url(${section2bg})` }} >
      
        <div className="about-container">
       
      </div>
      </section>


    {/* Section 3 - Top Sales */}
      <section className="section section3">
        <h2 className="top-sales-title">TOP SALES</h2>
        <div className="food-gallery">
          <div className="food-item">
            <img src={food1} alt="Nasi Goreng Cina" />
            <p>Nasi Goreng Cina</p>
          </div>
          <div className="food-item">
            <img src={food2} alt="Mee Kari" />
            <p>Mee Kari</p>
          </div>
          <div className="food-item">
            <img src={food3} alt="Nasi Berlauk" />
            <p>Nasi Berlauk</p>
          </div>
          <div className="food-item">
            <img src={food4} alt="Burger BBQ" />
            <p>Burger BBQ</p>
          </div>
        </div>
      </section>

      {/* Footer Section */} <Footer />

    </div>
  );
}
