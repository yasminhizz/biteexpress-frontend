import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Header2 from "../components/header6";
import "./adminGenerateCustomerReport.css";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function AdminGenerateCustomerReport() {
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      const snap = await getDocs(collection(db, "customers"));
      const monthCount = {};

      snap.forEach(doc => {
        const item = doc.data();
        if (item.createdAt?.toDate) {
          const date = item.createdAt.toDate();
          const month = date.toLocaleString("en-US", { month: "short", year: "numeric" });
          monthCount[month] = (monthCount[month] || 0) + 1;
        }
      });

      const formattedData = Object.entries(monthCount).map(([month, count]) => ({
        month,
        customers: count
      }));

      setChartData(formattedData);
    };

    fetchReport();
  }, []);

  // DOWNLOAD PDF
  const downloadPDF = async () => {
    const input = chartRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.text("Customer Registration Report", 14, 15);
    pdf.addImage(imgData, "PNG", 10, 25, pdfWidth - 20, pdfHeight - 15);
    pdf.save("Customer_Report.pdf");
  };

  return (
    <div>
      <Header2 />

      <div className="report-container">
        <h2>CUSTOMER REGISTRATION REPORT</h2>
        <p>Number of customers registered per month</p>

        <div className="chart-wrapper" ref={chartRef}>
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="customers" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* BUTTON RIGHT BELOW CHART */}
        <div className="download-area">
          <button className="download-btn" onClick={downloadPDF}>
            Download as PDF
          </button>
        </div>

      </div>
    </div>
  );
}
