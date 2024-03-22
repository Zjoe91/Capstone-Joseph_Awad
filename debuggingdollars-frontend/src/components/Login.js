import "./login.css"; // Import the login.css file for styling
import React, { useState, useEffect } from "react"; // Import the useState and useEffect hooks from React
import { useNavigate, Link } from "react-router-dom"; // Make sure to import useNavigate

// Function to handle the login form
function App({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [setUsername] = useState(""); // Reintroduce username state

  // Function to log the user in
  const logUserIn = (username, password) => {
    fetch("http://localhost:5000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.logged_in) {
          setIsAuthenticated(true); // Update the authentication state
          navigate("/"); // Redirect to the home page or dashboard
        } else {
          // Handle login failure
          console.error("Login failed");
          window.alert("Login failed. Please check your credentials.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const formUsername = formData.get("username");
    const password = formData.get("password");
    logUserIn(formUsername, password);
  };

  // Function to check if the user is already logged in
  const isUserLoggedIn = () => {
    fetch("http://localhost:5000/checklogin", {
      credentials: "include",
    })
      .then((data) => data.json())
      .then((json) => {
        if (json.logged_in) {
          setLoggedIn(true);
          setUsername(json.username); // Correctly use setUsername to set the username
        } else {
          setLoggedIn(false);
        }
      });
  };

  // Use the useEffect hook to check if the user is logged in
  useEffect(isUserLoggedIn);

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px", // Adjust the space between form elements
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

  const loginPromptStyle = {
    marginBottom: "20px",
    fontSize: "25px",
    color: "#E0E0E0", // Darker text color
  };

  const welcomeStyle = {
    marginTop: "20px", // Adjust as needed to position the message higher up
    marginBottom: "100px", // Provides spacing between this message and the login prompt
    fontSize: "30px", // Larger font size for the welcome message
    color: "#FFFFFF", // Assuming a bright color for contrast against a dark background
    textAlign: "center", // Centers the text
    frontweight: "bold", // Makes the text bold
  };

  return (
    <div>
      <header className="App-header">
        {!loggedIn && (
          <>
            <div style={welcomeStyle}>Welcome to Debugging Dollars</div>
            <div style={loginPromptStyle}>Please login in here</div>
            <form onSubmit={handleSubmit} style={formStyle}>
              <input
                style={inputStyle}
                name="username"
                type="text"
                placeholder="Username"
                required
              />
              <input
                style={inputStyle}
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <button type="submit" style={buttonStyle} className="App-link">
                Log in
              </button>
            </form>
            <div>
              <Link to="/register">New user? Register here</Link>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
