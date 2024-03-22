import React, { useEffect, useState } from "react"; // Import the useEffect and useState hooks from React
import "./MarketBanner.css"; // Import the MarketBanner.css file for styling

// Function to display the MarketBanner component
const MarketBanner = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use the useEffect hook to fetch market data on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/market-data")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => setError(error.toString()));
  }, []);

  // Use the useEffect hook to cycle through the tickers
  useEffect(() => {
    // Set up an interval to cycle through the tickers
    const intervalId = setInterval(() => {
      setCurrentIndex((currentIndex) => (currentIndex + 1) % data.length);
    }, 3000); // Change ticker every 3 seconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, [data.length]);

  if (error) return <div>Error: {error}</div>;
  if (data.length === 0) return <div>Loading...</div>;

  // Render the currently active ticker
  const activeTicker = data[currentIndex];
  return (
    <div className="market-banner">
      <div className="banner-title">
        Top Stock Market Gainers (US Daily Update)
      </div>{" "}
      {/* Add the title */}
      <div style={{ margin: "20px" }}>
        <span style={{ marginRight: "10px" }}>
          Ticker: {activeTicker.ticker}
        </span>
        <span style={{ marginRight: "10px" }}>Price: {activeTicker.price}</span>
        <span style={{ marginRight: "10px" }}>
          Change Amount: {activeTicker.change_amount}
        </span>
        <span style={{ marginRight: "10px" }}>
          Change Percentage: {activeTicker.change_percentage}
        </span>
      </div>
    </div>
  );
};

export default MarketBanner;
