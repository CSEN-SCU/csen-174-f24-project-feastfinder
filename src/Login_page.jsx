import React, { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import "./styleFiles/Login_page.css"; // Assuming CSS is moved to App.css
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

      // Save user data to sessionStorage
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        picture: user.photoURL,
      }
      sessionStorage.setItem("user", JSON.stringify(userData));
      console.log('session storage: ', sessionStorage.getItem('user'));

      //check if user exists - to avoid overwriting data
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if(docSnap.exists()){
        // console.log("docsnap: ", docSnap);
        console.log('existing user logged in');
      }else{
        console.log('save new user!');
        // Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), userData);
      }

      // Redirect or perform additional actions
      toast.success("Login successful!");
      setTimeout(() => {
        window.location.href = "/home";
      }, 3000); // Delay redirection for 3 seconds

    } catch (error) {
      console.error("Error during Google sign-in:", error.message);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <ToastContainer position="bottom-right" autoClose={3000} />
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