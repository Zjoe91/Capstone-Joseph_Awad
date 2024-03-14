import React, { useState, useEffect } from "react"; // Import the useState and useEffect hooks from React
import PortfolioInfo from "./components/PortfolioInfo"; // Import the PortfolioInfo component
import StockInfo from "./components/StockInfo"; // Import the StockInfo component
import ModifyPortfolio from "./components/ModifyPortfolio"; // Import the ModifyPortfolio component

// Function to display the main application
function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dataVersion, setDataVersion] = useState(0);

  // Function to fetch portfolio data
  const fetchPortfolioData = async () => {
    try {
      const response = await fetch("http://localhost:5000/overview"); // Fetch portfolio data from the backend
      const newData = await response.json();
      setPortfolioData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
          return { ...newData }; // Ensure we're creating a new object
        }
        return prevData; // Return previous data if unchanged to avoid unnecessary re-renders
      });
      setDataVersion((prevVersion) => prevVersion + 1); // Increment the data version
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error);
      // Handle errors appropriately
    }
  };
  // Use the useEffect hook to fetch portfolio data on mount
  useEffect(() => {
    fetchPortfolioData();
  }, []);

  // Function to handle successful portfolio modification
  const handleModificationComplete = () => {
    console.log("Portfolio modification complete.");
    // Refresh portfolio data
    fetchPortfolioData();
    // Optionally clear any existing error messages
    setErrorMessage("");
  };
  // Function to handle errors
  const handleError = (error) => {
    console.error("Error modifying portfolio:", error);
    setErrorMessage("Failed to modify portfolio. Please try again.");
  };

  return (
    <div>
      <header
        style={{
          textAlign: "center",
          borderBottom: "2px solid #000",
          backgroundColor: "#808080",
          margin: 0,
          padding: 0,
        }}
      >
        <h1 style={{ margin: 0 }}>Debugging Dollars</h1>
      </header>
      <ModifyPortfolio // Render the ModifyPortfolio component
        onModificationComplete={handleModificationComplete}
        onError={handleError}
      />
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "20px",
          padding: "20px",
        }}
      >
        {portfolioData && (
          <PortfolioInfo
            key={dataVersion} // Re-render the component when data changes
            data={portfolioData}
            onStockSelect={setSelectedSymbol}
          />
        )}
        {selectedSymbol && <StockInfo symbol={selectedSymbol} />}
      </div>
    </div>
  );
}

export default App;
