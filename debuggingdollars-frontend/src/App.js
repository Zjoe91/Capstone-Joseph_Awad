import React from "react";
import PortfolioInfo from "./components/PortfolioInfo";
import StockInfo from "./components/StockInfo";

function App() {
  return (
    <div>
      <PortfolioInfo username="user1" />
      <StockInfo symbol="AAPL" />
    </div>
  );
}

export default App;
