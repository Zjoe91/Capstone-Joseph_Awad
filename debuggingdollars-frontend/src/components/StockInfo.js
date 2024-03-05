import React, { useState, useEffect } from "react";

function StockInfo({ symbol }) {
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    fetch(`https://mscbt-integration.ew.r.appspot.com/stockinfo/${symbol}`) // Adjust the URL based on your actual backend URL
      .then((response) => response.json())
      .then((data) => setStockData(data))
      .catch((error) => console.error("Error:", error));
  }, [symbol]);

  if (!stockData) return <div>Loading stock information...</div>;

  return (
    <div>
      <h2>Stock Information for {symbol}</h2>
      {stockData.map((day, index) => (
        <div key={index}>
          <p>
            Date: {day[0]}, Open: {day[1]["1. open"]}, High: {day[1]["2. high"]}
            , Low: {day[1]["3. low"]}, Close: {day[1]["4. close"]}, Volume:{" "}
            {day[1]["5. volume"]}
          </p>
        </div>
      ))}
    </div>
  );
}

export default StockInfo;
