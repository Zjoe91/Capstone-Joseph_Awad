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