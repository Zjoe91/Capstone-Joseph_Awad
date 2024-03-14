import React, { useEffect, useState } from "react"; // Import the useEffect and useState hooks from React

// Function to modify the portfolio
function ModifyPortfolio({ onModificationComplete, onError }) {
  const [stockSymbol, setStockSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [action, setAction] = useState("add"); // Default action is 'add'
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (searchTerm && searchTerm !== stockSymbol) {
      const timeoutId = setTimeout(() => {
        fetch(
          `http://localhost:5000/api/searchTickers?query=${encodeURIComponent(
            searchTerm
          )}`
        )
          .then((response) => response.json())
          .then((data) => {
            // Only show search results if the searchTerm hasn't been selected yet
            if (searchTerm !== stockSymbol) {
              setSearchResults(data);
            }
          })
          .catch((error) =>
            console.error("Error fetching search results:", error)
          );
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]); // Clear results if the search term is cleared or matches the selected symbol
    }
  }, [searchTerm, stockSymbol]); // Add stockSymbol as a dependency

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submit action

    const payload = {
      stocksymbol: stockSymbol.toUpperCase(), // Convert to uppercase to match your backend expectations
      quantity: parseInt(quantity, 10), // Ensure quantity is an integer
      action: action,
    };

    // POST request to the backend
    fetch("http://localhost:5000/modifyPortfolio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Invalid stock symbol or Requested quantity exceeds stocks in portfolio"
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        alert("Portfolio updated successfully");
        // Reset form after successful submission
        setSearchTerm("");
        setStockSymbol("");
        setQuantity("");
        setAction("add");
        if (typeof onModificationComplete === "function") {
          onModificationComplete();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error modifying portfolio: " + error.message);
        if (typeof onError === "function") {
          onError(error);
        }
      });
  };

  const formElementStyle = {
    width: "90%",
    padding: "8px",
    marginBottom: "10px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "20px 0 20px 20px",
        maxWidth: "600px",
        padding: "20px",
        backgroundColor: "#f7f7f7",
        border: "1px solid #ddd",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <h2>Manage Investments</h2>
      <p>Search for the stock of your choice and select it from suggestions</p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {/* Search Input */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder="Search Stock Symbol"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            style={{ padding: "8px", width: "90%" }}
            required
          />
          {searchResults.length > 0 && (
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                position: "absolute",
                width: "100%",
                zIndex: 1,
                backgroundColor: "#fff",
                boxShadow: "0px 4px 5px rgba(0,0,0,0.2)",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {searchResults.map((result) => (
                <li
                  key={result.symbol}
                  onClick={() => {
                    setStockSymbol(result.symbol);
                    setSearchTerm(result.symbol);
                    setSearchResults([]);
                  }}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {result.symbol} - {result.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={formElementStyle}
          required
        />
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <label>
            <input
              type="radio"
              value="add"
              checked={action === "add"}
              onChange={() => setAction("add")}
            />
            Add
          </label>
          <label style={{ marginLeft: "10px" }}>
            <input
              type="radio"
              value="remove"
              checked={action === "remove"}
              onChange={() => setAction("remove")}
            />
            Remove
          </label>
        </div>
        <button type="submit" style={formElementStyle}>
          Modify Portfolio
        </button>
      </form>
    </div>
  );
}

export default ModifyPortfolio;
