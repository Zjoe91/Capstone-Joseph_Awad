import React, { useState } from "react"; // Import the useState hook from React
import { useNavigate, Link } from "react-router-dom"; // Import the useNavigate and Link components from react-router-dom

// Function to handle user registration
function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const url = "http://localhost:5000/register"; // Update with your backend API endpoint

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful", data);
        navigate("/login");
      } else {
        const errorData = await response.json();
        console.error("Registration failed", errorData);
        setErrorMessage(errorData.error); // This sets the error message to be displayed in the form
        window.alert(errorData.error); // This displays the error message in an alert dialog
      }
    } catch (error) {
      console.error("Network error", error);
      setErrorMessage(
        "Network error. Please check your connection and try again."
      );
      window.alert(
        "Network error. Please check your connection and try again."
      );
    }
  };

  const inputStyle = {
    padding: "10px",
    width: "200px", // Adjust input width as needed
    borderRadius: "5px",
    border: "1px solid #ccc", // Light grey border
  };

  const buttonStyle = {
    padding: "10px 20px",
    cursor: "pointer",
    backgroundColor: "#007bff", // Bootstrap primary color
    color: "white",
    border: "none",
    borderRadius: "5px",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px", // Adjust the space between form elements
  };

  const errorMessageStyle = {
    color: "white", // Change as per your design
    marginBottom: "10px", // Space between error message and form inputs
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Register</h2>
        {errorMessage && (
          <div style={errorMessageStyle}>{errorMessage}</div>
        )}{" "}
        {/* Display error message */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            style={inputStyle}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" style={buttonStyle}>
            Register
          </button>
        </form>
        <Link to="/login">Go back to login page</Link>
      </header>
    </div>
  );
}

export default Register;
