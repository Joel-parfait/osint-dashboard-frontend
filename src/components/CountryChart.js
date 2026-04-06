import React, { useRef, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { getCountryFromRecord, getCountryFlag } from "../utils/phoneUtils";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * CountryChart Component
 * 
 * PURPOSE: Displays a bar chart showing distribution of records by country
 * 
 * FEATURES:
 * - Extracts country from phone numbers AND address fields
 * - Shows top 10 countries with highest record counts
 * - Interactive: Click on any bar to filter the main table
 * - Shows country flags for visual identification
 * - Displays statistics (total records, unique countries)
 * 
 * PROPS:
 * @param {Array} records - Array of all records to analyze
 * @param {Function} onSelectCountry - Callback when user clicks a country bar
 * 
 * HOW IT WORKS:
 * 1. Uses getCountryFromRecord() to extract country from each record
 * 2. Counts occurrences of each country
 * 3. Sorts by count and takes top 10
 * 4. Renders as interactive bar chart with flags
 * 5. When clicked, calls onSelectCountry() with the country name
 */
export default function CountryChart({ records = [], onSelectCountry = () => {} }) {
  const chartRef = useRef();

  // STEP 1: Count countries from records
  // Uses utility function that checks both phone numbers AND addresses
  const countryCounts = records.reduce((acc, r) => {
    const country = getCountryFromRecord(r);
    if (country) {
      acc[country] = (acc[country] || 0) + 1;
    }
    return acc;
  }, {});
  
  // DEBUG: Log first few records to see data structure
  useEffect(() => {
    if (records.length > 0) {
      console.log("=== COUNTRY CHART DEBUG ===");
      console.log("Sample records (first 3):");
      records.slice(0, 3).forEach((r, i) => {
        const extractedCountry = getCountryFromRecord(r);
        console.log(`Record ${i + 1}:`, {
          name: r.name,
          country_field: r.country,
          phonenumber: r.phonenumber,
          address1: r.address1,
          extracted_country: extractedCountry,
          flag: getCountryFlag(extractedCountry)
        });
      });
      console.log("Country counts:", countryCounts);
      console.log("========================");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records.length]); // Only re-run when number of records changes

  // STEP 2: Get top 10 countries sorted by count
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // STEP 3: Prepare labels (plain country names for onClick)
  const labels = topCountries.map(([country]) => country);
  
  // Labels with flags for display
  const flagLabels = topCountries.map(([country]) => 
    `${getCountryFlag(country)} ${country}`
  );

  // STEP 4: Configure chart data
  const data = {
    labels: flagLabels,
    datasets: [
      {
        label: "Records by Country",
        data: topCountries.map(([_, count]) => count),
        backgroundColor: [
          '#2e5bff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
          '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
        ],
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
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
            const country = labels[context[0].dataIndex];
            return `${getCountryFlag(country)} ${country}`;
          },
          label: (context) => {
            return `📊 Records: ${context.parsed.y.toLocaleString()}`;
          },
          afterLabel: (context) => {
            const totalRecords = records.length;
            const percentage = totalRecords > 0 
              ? ((context.parsed.y / totalRecords) * 100).toFixed(1)
              : '0.0';
            return `📈 ${percentage}% of total records`;
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
      const country = labels[idx]; // Use plain label without flag
      
      // Call the callback with the clicked country
      if (country) {
        console.log("Country clicked:", country);
        onSelectCountry(country);
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
          font: { size: 10 },
          padding: 5,
          callback: function(value) {
            // Format large numbers
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        },
        grid: { 
          color: "var(--text-muted)", // More visible grid lines
          borderDash: [4, 4]
        },
        border: { display: false },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Records',
          color: 'var(--text)', // Uses CSS variable for dark mode
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
    },
  };

  // STEP 7: Calculate statistics
  const totalRecords = records.length;
  const recordsWithCountry = Object.values(countryCounts).reduce((a, b) => a + b, 0);
  const countryPercentage = totalRecords > 0 
    ? ((recordsWithCountry / totalRecords) * 100).toFixed(1)
    : '0.0';
  const uniqueCountries = Object.keys(countryCounts).length;

  return (
    <div className="chart-card">
      {/* Chart Header */}
      <div className="chart-header" style={{ 
        display: 'flex',
        alignItems: "center", 
        justifyContent: "space-between" 
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            🌍 Leak Origin Countries
          </h3>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Based on phone number AND address analysis
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", textAlign: 'right' }}>
          {uniqueCountries} countries • Click to filter
        </div>
      </div>
      
      {/* Chart Canvas */}
      <div style={{ 
        height: '250px', 
        marginTop: '10px',
        cursor: 'pointer' // Show it's clickable
      }}>
        {topCountries.length > 0 ? (
          <Bar ref={chartRef} data={data} options={options} />
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--muted)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
            <div>No country data available</div>
            <div style={{ fontSize: '11px', marginTop: '0.5rem' }}>
              Add phone numbers with country codes OR addresses with country names
            </div>
          </div>
        )}
      </div>
      
      {/* Chart Footer Stats */}
      {topCountries.length > 0 && (
        <div style={{ 
          marginTop: '15px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '11px',
          color: 'var(--muted)',
        }}>
          <div style={{ 
            padding: '8px',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: 'var(--text)', 
              fontSize: '14px' 
            }}>
              {recordsWithCountry.toLocaleString()}
            </div>
            <div>Records with country data</div>
            <div>({countryPercentage}%)</div>
          </div>
          
          <div style={{ 
            padding: '8px',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: 'var(--text)', 
              fontSize: '14px' 
            }}>
              {uniqueCountries}
            </div>
            <div>Unique countries</div>
            <div>detected</div>
          </div>
        </div>
      )}
    </div>
  );
}