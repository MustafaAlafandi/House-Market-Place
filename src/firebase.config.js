// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLOUnQ8NuZQRV17-DJF_lTIx3aniXMiWU",
  authDomain: "house-market-place-app-a37fb.firebaseapp.com",
  projectId: "house-market-place-app-a37fb",
  storageBucket: "house-market-place-app-a37fb.firebasestorage.app",
  messagingSenderId: "143198370514",
  appId: "1:143198370514:web:86816ee4cffb8882c10b0b"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();