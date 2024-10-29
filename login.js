// src/components/Login.js
import React from 'react';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

function Login() {
  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => {
      console.error("Error during Google login:", error);
    });
  };

  return <button onClick={handleGoogleLogin}>Login with Google</button>;
}

export default Login;
