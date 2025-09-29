// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "TODO: your api key",
  authDomain: "TODO: your auth domain",
  projectId: "TODO: your project id",
  storageBucket: "TODO: your storage bucket",
  messagingSenderId: "TODO: your messaging sender id",
  appId: "TODO: your app id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
