// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCgVa39o_UF2xXEf-8lsXQL_s7BVpaYafc",
  authDomain: "feast-finder-95126.firebaseapp.com",
  projectId: "feast-finder-95126",
  storageBucket: "feast-finder-95126.appspot.com",
  messagingSenderId: "980022816970",
  appId: "1:980022816970:web:2540ab37fe127a74ee0433"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
