import React, { useState } from "react";
import PortfolioInfo from "./components/PortfolioInfo";
import StockInfo from "./components/StockInfo";

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  // Define the inline style for the grid container
  const gridContainerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 2fr", // Adjust the ratio between PortfolioInfo and StockInfo as needed
    gap: "20px", // Space between grid items
    padding: "20px", // Padding around the entire grid
  };

  return (
    <div style={gridContainerStyle}>
      <PortfolioInfo
        username="user1"
        onStockSelect={setSelectedSymbol}
        selectedSymbol={selectedSymbol}
      />
      {selectedSymbol && <StockInfo symbol={selectedSymbol} />}
    </div>
  );
}

export default App;
