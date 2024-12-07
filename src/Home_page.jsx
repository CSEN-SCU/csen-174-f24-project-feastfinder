import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Assumes React Router is used
import "./styleFiles/Home_page.css"; // Move styles to a separate CSS file

const Home_page = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for user in localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      // Redirect to login page if no user is found
      navigate("/");
    }
  }, [navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="container">
      <h1>Welcome to Feast Finder</h1>
      <button
        className="button"
        onClick={() => handleNavigation("/create")} // Replace with the voting route
      >
        Go to Voting
      </button>
      <button
        className="button"
        onClick={() => handleNavigation("/profile")} // Replace with the profile route
      >
        Go to Profile
      </button>
    </div>
  );
};

export default Home_page;
