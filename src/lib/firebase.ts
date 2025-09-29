// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-7414184846-322f5",
  "appId": "1:262373068199:web:541f9b1186f18c1a747a82",
  "apiKey": "AIzaSyD1Oj1G53dYlzFNwZijLX3NrAwaWtCDRbE",
  "authDomain": "studio-7414184846-322f5.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "262373068199"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
