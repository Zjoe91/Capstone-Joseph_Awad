import React, { useState, useEffect } from "react"; // import useState and useEffect from react

// create a function called StockInfo that takes in a symbol as a prop
function StockInfo({ symbol }) {
  // create a state variable called stockData and a function to update it called setStockData
  const [stockData, setStockData] = useState(null);

  // use the useEffect hook to fetch stock information for the given symbol
  useEffect(() => {
    fetch(`https://mscbt-integration.ew.r.appspot.com/stockinfo/${symbol}`)
      .then((response) => response.json())
      .then((data) => setStockData(data))
      .catch((error) => console.error("Error:", error));
  }, [symbol]);

  // if stockData is null, return a loading message
  if (!stockData) return <div>Loading stock information...</div>;

  // otherwise, return the stock information
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

// export the StockInfo function
export default StockInfo;
