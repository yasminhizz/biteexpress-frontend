import React, { useState } from "react";
import Header2 from "../components/header6";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import "./adminViewCustomerReport.css";

// Register chart components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminViewCustomerReport() {
  const [months] = useState(["Jan","Feb","Mar","Apr","May"]);
  const [values] = useState([5,12,8,15,20]); // Replace with Firestore values later

  const downloadReport = () => {
    const blob = new Blob(["Customer Report Data ..."], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "customer_report.txt";
    link.click();
  };

  return (
    <div>
      <Header2 />

      <div className="report-view">
        <h2>Customer Registration Report</h2>

        <Bar data={{
          labels: months,
          datasets: [
            {
              label: "Registered Users",
              data: values,
              backgroundColor: "#00E7FF"
            }
          ]
        }} />

        <img 
          src="https://cdn-icons-png.flaticon.com/512/833/833524.png"
          className="download-icon"
          onClick={downloadReport}
        />
      </div>
    </div>
  );
}
