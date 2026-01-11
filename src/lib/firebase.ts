import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFunctions, httpsCallable } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyChbBQnMB3sBggkMC2LerQD1DY4CUAHBv8",
    authDomain: "salon-pacer-app.firebaseapp.com",
    projectId: "salon-pacer-app",
    storageBucket: "salon-pacer-app.firebasestorage.app",
    messagingSenderId: "859913575834",
    appId: "1:859913575834:web:5843dd0131839c60cf2e23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const functions = getFunctions(app, 'us-central1'); // Region must match deploy

export { app, messaging, functions, getToken, onMessage, httpsCallable };
