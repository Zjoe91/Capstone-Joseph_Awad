import React, { useState, useEffect } from "react"; // Import the useState and useEffect hooks from React
import PortfolioInfo from "./components/PortfolioInfo"; // Import the PortfolioInfo component
import StockInfo from "./components/StockInfo"; // Import the StockInfo component
import ModifyPortfolio from "./components/ModifyPortfolio"; // Import the ModifyPortfolio component
import Login from "./components/Login"; // Import the login component
import Register from "./components/Register"; // Import the login component
import MarketBanner from "./components/MarketBanner";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; // Import the BrowserRouter, Route, and Routes components from react-router-dom
import { HashRouter } from "react-router-dom"; // Import the HashRouter component from react-router-dom

// Function to display the main application
function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dataVersion, setDataVersion] = useState(0);
  const [isAuthenticated, setIsAuthenticatedRaw] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  const setIsAuthenticated = (authState) => {
    localStorage.setItem("isAuthenticated", authState.toString());
    setIsAuthenticatedRaw(authState);
  };

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
    if (isAuthenticated) {
      fetchPortfolioData();
    }
  }, [isAuthenticated]);

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

  // Function to log the user out
  const logUserOut = () => {
    fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((data) => data.json())
      .then((json) => {
        console.log(json.message);
        setIsAuthenticated(false);
        setSelectedSymbol(null); // Reset the selectedSymbol state
        setPortfolioData(null); // Reset the portfolioData state
        //window.location.href = "/login";
      })
      .catch((err) => console.error(err));
  };

  return (
    <HashRouter>
      <div>
        {/* MarketBanner will be displayed on every page */}
        <MarketBanner />
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate replace to="/" />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register setIsAuthenticated={setIsAuthenticated} />
              ) : (
                <Navigate replace to="/" />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <div style={{ backgroundColor: "#AEC6CF", minHeight: "100vh" }}>
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
                    <button
                      onClick={logUserOut}
                      style={{
                        cursor: "pointer",
                        padding: "10px 20px",
                        marginTop: "10px",
                      }}
                    >
                      Logout
                    </button>
                  </header>
                  <ModifyPortfolio // Render the ModifyPortfolio component
                    onModificationComplete={handleModificationComplete}
                    onError={handleError}
                  />
                  {errorMessage && (
                    <div style={{ color: "red" }}>{errorMessage}</div>
                  )}
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
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
