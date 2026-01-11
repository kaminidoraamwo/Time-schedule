import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFunctions, httpsCallable } from "firebase/functions";

import { firebaseConfig } from "../config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const functions = getFunctions(app, 'us-central1'); // Region must match deploy

export { app, messaging, functions, getToken, onMessage, httpsCallable };
