import React, { useState, useEffect } from "react"; // Import the useState and useEffect hooks from React
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"; // Import the necessary components from recharts

// Function to display stock information
function StockInfo({ symbol }) {
  const [stockData, setStockData] = useState(null);
  const [chartOption, setChartOption] = useState("close"); // Adjusted for compatibility with transformedData keys

  // Use the useEffect hook to fetch stock information
  useEffect(() => {
    fetch(`http://localhost:5000/stockinfo/${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        // Reverse the data array to display dates from oldest to newest
        const reversedData = [...data].reverse();
        setStockData(reversedData);
      })
      .catch((error) => console.error("Error:", error));
  }, [symbol]);

  // Function to handle the change in chart option
  const handleOptionChange = (event) => {
    setChartOption(event.target.value);
  };

  if (!stockData) return <div>Loading stock information...</div>;

  // Transform the stock data for use in the LineChart component
  const transformedData = stockData.map((item) => ({
    date: item[0],
    open: parseFloat(item[1]["1. open"]),
    high: parseFloat(item[1]["2. high"]),
    low: parseFloat(item[1]["3. low"]),
    close: parseFloat(item[1]["4. close"]),
    volume: parseInt(item[1]["5. volume"], 10),
  }));

  // Function to format the Y-axis tick values
  const formatYAxisTick = (value) => {
    if (chartOption === "volume") {
      if (value >= 1e9) {
        return `${(value / 1e9).toFixed(1)}B`;
      } else if (value >= 1e6) {
        return `${(value / 1e6).toFixed(1)}M`;
      } else if (value >= 1e3) {
        return `${(value / 1e3).toFixed(1)}K`;
      }
    }
    return value.toLocaleString();
  };

  // Inline CSS for the table and cells
  const tableContainerStyle = {
    padding: "20px",
    margin: "20px",
    maxWidth: "1000px",
    border: "1px solid #ddd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#f7f7f7",
    borderRadius: "10px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const cellStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  };

  return (
    <div style={tableContainerStyle}>
      <h2>Stock Information for {symbol}</h2>
      <select value={chartOption} onChange={handleOptionChange}>
        <option value="open">Open</option>
        <option value="high">High</option>
        <option value="low">Low</option>
        <option value="close">Close</option>
        <option value="volume">Volume</option>
      </select>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={transformedData}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatYAxisTick} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={chartOption}
            stroke="#8884d8"
            yAxisId={0}
          />
        </LineChart>
      </ResponsiveContainer>
      <div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Date</th>
              <th style={cellStyle}>Open</th>
              <th style={cellStyle}>High</th>
              <th style={cellStyle}>Low</th>
              <th style={cellStyle}>Close</th>
              <th style={cellStyle}>Volume</th>
            </tr>
          </thead>
          <tbody>
            {transformedData.map((row, index) => (
              <tr key={index}>
                <td style={cellStyle}>{row.date}</td>
                <td style={cellStyle}>{row.open}</td>
                <td style={cellStyle}>{row.high}</td>
                <td style={cellStyle}>{row.low}</td>
                <td style={cellStyle}>{row.close}</td>
                <td style={cellStyle}>{row.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockInfo;
