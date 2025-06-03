import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBPbFUv-7YXJmBeVwgvtdNmSZtC3Y1s6xg",
    authDomain: "meetupnow-78f2a.firebaseapp.com",
    projectId: "meetupnow-78f2a",
    storageBucket: "meetupnow-78f2a.firebasestorage.app",
    messagingSenderId: "106622972104",
    appId: "1:106622972104:web:3fdee873bc64d18924b5fd",
    measurementId: "G-XVBSXB20TJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);