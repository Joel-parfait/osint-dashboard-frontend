import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * AddressChart Component
 * 
 * PURPOSE: Displays a bar chart showing the top 10 most common addresses
 * 
 * FEATURES:
 * - Counts addresses from address1 field (fallback to placeofbirth)
 * - Shows top 10 addresses with highest record counts
 * - Interactive: Click on any bar to filter the main table
 * - Visual feedback: Hover effects and tooltips
 * - Responsive design
 * 
 * PROPS:
 * @param {Array} records - Array of all records to analyze
 * @param {Function} onSelectAddress - Callback when user clicks an address bar
 * 
 * HOW IT WORKS:
 * 1. Counts how many times each address appears in records
 * 2. Sorts addresses by count (descending)
 * 3. Takes top 10 addresses
 * 4. Renders as interactive bar chart
 * 5. When clicked, calls onSelectAddress() with the address name
 */
export default function AddressChart({ records = [], onSelectAddress = () => {} }) {
  const chartRef = useRef();

  // STEP 1: Count addresses from records
  const counts = records.reduce((acc, r) => {
    const address = (r.address1 || r.placeofbirth || "").trim();
    if (address && address !== "–" && address !== "") {
      acc[address] = (acc[address] || 0) + 1;
    }
    return acc;
  }, {});

  // STEP 2: Get top 10 addresses sorted by count
  const topAddresses = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // STEP 3: Prepare labels (truncated for display)
  const labels = topAddresses.map(([address]) => {
    return address.length > 20 ? address.substring(0, 20) + '...' : address;
  });
  
  // Keep full labels for tooltips and onClick
  const fullLabels = topAddresses.map(([address]) => address);

  // STEP 4: Configure chart data
  const data = {
    labels,
    datasets: [
      {
        label: "Top Addresses",
        data: topAddresses.map(([_, count]) => count),
        backgroundColor: [
          '#2e5bff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
          '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
        ],
        borderRadius: 6,
        borderWidth: 0,
        hoverBackgroundColor: [
          '#1e40ff', '#0d9668', '#d97706', '#dc2626', '#7c3aed',
          '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5'
        ],
      },
    ],
  };

  // STEP 5: Configure chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          title: (context) => {
            return `${fullLabels[context[0].dataIndex]}`;
          },
          label: (context) => {
            return `📊 Records: ${context.parsed.y}`;
          },
          afterLabel: (context) => {
            const totalRecords = records.length;
            const percentage = ((context.parsed.y / totalRecords) * 100).toFixed(1);
            return `📈 ${percentage}% of total`;
          }
        }
      },
    },
    // STEP 6: Handle click events
    onClick: (evt) => {
      const chart = chartRef.current;
      if (!chart) return;
      
      // Get the clicked element
      const elements = chart.getElementsAtEventForMode(
        evt.native, 
        "nearest", 
        { intersect: true }, 
        false
      );
      
      if (!elements || !elements.length) return;
      
      const idx = elements[0].index;
      const address = fullLabels[idx];
      
      // Call the callback with the clicked address
      if (address) {
        console.log("Address clicked:", address);
        onSelectAddress(address);
      }
    },
    scales: {
      x: {
        ticks: { 
          color: "var(--text)", // Uses CSS variable for dark mode
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 45,
          padding: 5
        },
        grid: { 
          display: false,
          color: "rgba(255,255,255,0.05)" 
        },
        border: { display: false }
      },
      y: {
        ticks: { 
          color: "var(--text)", // Uses CSS variable for dark mode
          font: { size: 11 },
          padding: 5,
          callback: function(value) {
            // Only show whole numbers
            if (value % 1 === 0) {
              return value;
            }
          }
        },
        grid: { 
          color: "var(--text-muted)", // More visible grid lines
          borderDash: [4, 4]
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-card">
      {/* Chart Header */}
      <div className="chart-header" style={{ 
        display: 'flex',
        alignItems: "center", 
        justifyContent: "space-between" 
      }}>
        <h3 style={{ margin: 0 }}>🏠 Top 10 Addresses</h3>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          {topAddresses.length} addresses • Click to filter
        </div>
      </div>
      
      {/* Chart Canvas */}
      <div style={{ 
        height: '250px', 
        marginTop: '10px',
        cursor: 'pointer' // Show it's clickable
      }}>
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      
      {/* Chart Footer Stats */}
      {topAddresses.length > 0 && (
        <div style={{ 
          marginTop: '15px', 
          fontSize: '11px', 
          color: 'var(--muted)',
          textAlign: 'center',
          padding: '8px',
          background: 'rgba(0,0,0,0.03)',
          borderRadius: '6px',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          Showing top {topAddresses.length} addresses from {records.length} records
        </div>
      )}
    </div>
  );
}