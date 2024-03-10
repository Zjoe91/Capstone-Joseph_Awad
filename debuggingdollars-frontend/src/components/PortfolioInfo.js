import React, { useState, useEffect } from "react"; // import useState and useEffect from react

// create a function called PortfolioInfo that takes in a username as a prop
function PortfolioInfo({ username, onStockSelect, selectedSymbol }) {
  // create a state variable called portfolio and a function to update it called setPortfolio
  const [portfolio, setPortfolio] = useState(null);

  // use the useEffect hook to fetch portfolio information for the given username
  useEffect(() => {
    fetch(`http://localhost:5000/${username}`)
      .then((response) => response.json())
      .then((data) => setPortfolio(data))
      .catch((error) => console.error("Error:", error));
  }, [username]);

  // if portfolio is null, return a loading message
  if (!portfolio) return <div>Loading portfolio information...</div>;

  // otherwise, return the portfolio information
  const stockItemStyle = {
    padding: "10px",
    margin: "5px 0",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "background-color 0.3s ease", // Smooth transition for hover effect
  };

  const stockItemSelectedStyle = {
    ...stockItemStyle,
    backgroundColor: "#f0f0f0", // Different background for selected item
    fontWeight: "bold", // Make the selected item bold
  };

  return (
    <div>
      <h2>{username}'s Portfolio</h2>
      <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
        Click on a Symbol below of your choice to display its history data.
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
              Symbol: {symbol}, Quantity: {details.quantity}, Value:{" "}
              {details.value}
            </p>
          </div>
        ))}
      <p>Total Value: {portfolio.total_value}</p>
    </div>
  );
}

// export the PortfolioInfo function
export default PortfolioInfo;
