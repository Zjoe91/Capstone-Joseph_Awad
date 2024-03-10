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
  return (
    <div>
      <h2>{username}'s Portfolio</h2>
      {portfolio.symbols &&
        Object.entries(portfolio.symbols).map(([symbol, details]) => (
          <div
            key={symbol}
            style={{
              background:
                symbol === selectedSymbol ? "lightgrey" : "transparent",
            }}
            onClick={() => onStockSelect(symbol)}
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
