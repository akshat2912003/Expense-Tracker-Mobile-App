// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {initializeAuth, getReactNativePersistence} from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA07jsG6vczpFvfsv-mi1rE2-prXKJI1tE",
  authDomain: "expense-tracker-272ea.firebaseapp.com",
  projectId: "expense-tracker-272ea",
  storageBucket: "expense-tracker-272ea.firebasestorage.app",
  messagingSenderId: "474728038974",
  appId: "1:474728038974:web:20015b693d248401c7076f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); 

// authentication
export const auth = initializeAuth(app, {
  persistence:getReactNativePersistence(AsyncStorage)
})

//db
export const firestore = getFirestore(app);