import React, { useState } from "react";
import PortfolioInfo from "./components/PortfolioInfo";
import StockInfo from "./components/StockInfo";

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [username, setUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [userNotFound, setUserNotFound] = useState(false); // State to handle user not found

  const gridContainerStyle = {
    // Grid container style reintroduced
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "20px",
    padding: "20px",
  };

  const handleUsernameChange = (e) => {
    setInputUsername(e.target.value);
    if (userNotFound) setUserNotFound(false); // Reset user not found state on input change
  };

  const handleFetchPortfolio = () => {
    setUsername(inputUsername);
  };

  const handleUserNotFound = () => {
    setUsername("");
    setSelectedSymbol(null);
    setUserNotFound(true);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter username..."
        value={inputUsername}
        onChange={handleUsernameChange}
      />
      <button onClick={handleFetchPortfolio}>Fetch Portfolio</button>
      {userNotFound && <div>User does not exist.</div>}
      {!userNotFound && username && (
        <div style={gridContainerStyle}>
          <PortfolioInfo
            username={username}
            onStockSelect={setSelectedSymbol}
            selectedSymbol={selectedSymbol}
            onUserNotFound={handleUserNotFound}
          />
          {selectedSymbol && <StockInfo symbol={selectedSymbol} />}
        </div>
      )}
    </div>
  );
}

export default App;
