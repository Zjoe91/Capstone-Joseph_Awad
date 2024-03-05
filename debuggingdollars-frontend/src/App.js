import React from "react"; // Import the React library
import PortfolioInfo from "./components/PortfolioInfo"; // Import the PortfolioInfo component
import StockInfo from "./components/StockInfo"; // Import the StockInfo component

// Create a function called App
function App() {
  return (
    <div>
      <PortfolioInfo username="user1" />
      <StockInfo symbol="AAPL" />
    </div>
  );
}

// Export the App function
export default App;
