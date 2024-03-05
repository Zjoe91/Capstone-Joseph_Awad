import React, { useState, useEffect } from "react";

function PortfolioInfo({ username }) {
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    fetch(
      `https://mscbt-integration.ew.r.appspot.com/portfolioinfo/${username}`
    )
      .then((response) => response.json())
      .then((data) => setPortfolio(data))
      .catch((error) => console.error("Error:", error));
  }, [username]);

  if (!portfolio) return <div>Loading portfolio information...</div>;

  return (
    <div>
      <h2>{username}'s Portfolio</h2>
      {portfolio.symbols &&
        Object.entries(portfolio.symbols).map(([symbol, details]) => (
          <div key={symbol}>
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

export default PortfolioInfo;
