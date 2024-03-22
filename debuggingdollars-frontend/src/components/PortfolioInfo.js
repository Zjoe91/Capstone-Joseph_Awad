import React, { useState, useEffect } from "react"; // Import the useState and useEffect hooks from React

// create a function called PortfolioInfo that takes in onStockSelect and selectedSymbol as props
function PortfolioInfo({ onStockSelect, selectedSymbol }) {
  const [portfolio, setPortfolio] = useState(null);

  // We no longer need username here, as we will use the hardcoded userID in the API endpoint
  useEffect(() => {
    // Directly access the overview route with the hardcoded userID
    fetch(`http://localhost:5000/overview`, {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error fetching portfolio");
        return response.json();
      })
      .then((data) => setPortfolio(data))
      .catch((error) => console.error("Error:", error));
  }, []); // The empty dependency array ensures this effect runs once on mount

  if (!portfolio) return <div>Loading portfolio information...</div>;

  // otherwise, return the portfolio information
  const stockItemStyle = {
    padding: "10px",
    margin: "5px 0",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "background-color 0.3s ease", // Smooth transition for hover effect
    border: "1px solid #ddd",
    display: "flex",
  };

  const stockItemSelectedStyle = {
    ...stockItemStyle,
    backgroundColor: "#f0f0f0", // Different background for selected item
    fontWeight: "bold", // Make the selected item bold
  };

  const newContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "20px auto",
    maxWidth: "600px",
    padding: "20px",
    backgroundColor: "#f7f7f7",
    border: "1px solid #ddd",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    overflow: "hidden",
  };

  return (
    <div style={newContainerStyle}>
      <h2>Portfolio Overview</h2>
      <p>Total Value: {portfolio.total_value}</p>
      <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        Click on a Symbol to display its historical data
      </p>

      {portfolio.symbols &&
        Object.entries(portfolio.symbols).map(([symbol, details]) => (
          <div
            key={symbol}
            style={
              symbol === selectedSymbol
                ? stockItemSelectedStyle
                : stockItemStyle
            }
            onClick={() => onStockSelect(symbol)}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#e9ecef")
            } // Lighter shade on hover
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor =
                symbol === selectedSymbol ? "#f0f0f0" : "transparent")
            } // Revert on mouse out
          >
            <p>
              {symbol} - Quantity: {details.quantity} - Value: {details.value}
            </p>
          </div>
        ))}
    </div>
  );
}

// export the PortfolioInfo function
export default PortfolioInfo;
