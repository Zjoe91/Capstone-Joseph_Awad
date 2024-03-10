import React, { useState } from "react";
import PortfolioInfo from "./components/PortfolioInfo";
import StockInfo from "./components/StockInfo";

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  return (
    <div>
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
