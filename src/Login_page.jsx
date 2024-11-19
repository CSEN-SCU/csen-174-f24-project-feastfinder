import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import "./styleFiles/Login_page.css"; // Assuming CSS is moved to App.css

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgVa39o_UF2xXEf-8lsXQL_s7BVpaYafc",
  authDomain: "feast-finder-95126.firebaseapp.com",
  projectId: "feast-finder-95126",
  storageBucket: "feast-finder-95126.appspot.com",
  messagingSenderId: "980022816970",
  appId: "1:980022816970:web:2540ab37fe127a74ee0433",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Login_page = () => {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user data to localStorage
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        picture: user.photoURL,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      // Redirect or perform additional actions
      alert("Login successful!");
      window.location.href = "/home";
    } catch (error) {
      console.error("Error during Google sign-in:", error.message);
    }
  };

  return (
    <div className="container">
      <h1>Welcome to Feast Finder</h1>
      <button className="button" onClick={handleGoogleLogin}>
        {/* <img
          className="google-icon"
          src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Google_2015_logo.svg"
          alt="Google Icon"
        /> */}
        Login with Google
      </button>
    </div>
  );
};

export default Login_page;