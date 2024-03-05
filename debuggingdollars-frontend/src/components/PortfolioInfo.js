import React, { useState, useEffect } from "react";

function PortfolioInfo({ username }) {
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    fetch(
      `https://mscbt-integration.ew.r.appspot.com/portfolioinfo/${username}`
    ) // Adjust the URL based on your actual backend URL
      .then((response) => response.json())
      .then((data) => setPortfolio(data))
      .catch((error) => console.error("Error:", error));
  }, [username]);

  if (!portfolio) return <div>Loading portfolio information...</div>;