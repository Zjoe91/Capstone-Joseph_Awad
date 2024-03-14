import React, { useState, useEffect } from "react"; // Import the useState and useEffect hooks from React

// Function to display stock information
function StockInfo({ symbol }) {
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/stockinfo/${symbol}`)
      .then((response) => response.json())
      .then((data) => setStockData(data))
      .catch((error) => console.error("Error:", error));
  }, [symbol]);

  if (!stockData) return <div>Loading stock information...</div>;

  // Inline CSS for the table container
  const tableContainerStyle = {
    padding: "20px",
    margin: "20px",
    marginRight: "auto",
    maxWidth: "800px",
    backgroundColor: "#f7f7f7",
    border: "1px solid #ddd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    overflow: "hidden",
    width: "600px",
  };

  // Inline CSS for the table
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  // Inline CSS for table cells
  const cellStyle = {
    border: "1px solid #ddd", // This adds the border
    padding: "8px", // This adds some spacing inside the cells
    textAlign: "left", // Align text to the left
  };

  return (
    <div style={tableContainerStyle}>
      <h2>Stock Information for {symbol}</h2>
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
          {stockData.map((day, index) => {
            const [date, stockValues] = day;
            return (
              <tr key={index}>
                <td style={cellStyle}>{date}</td>
                <td style={cellStyle}>{stockValues["1. open"]}</td>
                <td style={cellStyle}>{stockValues["2. high"]}</td>
                <td style={cellStyle}>{stockValues["3. low"]}</td>
                <td style={cellStyle}>{stockValues["4. close"]}</td>
                <td style={cellStyle}>{stockValues["5. volume"]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StockInfo;
