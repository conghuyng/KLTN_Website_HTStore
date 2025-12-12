import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
const firebaseConfig = {
  apiKey: "AIzaSyDaR3MmZderLZhSH4eS_J-gIVTmiat8xmw",
  authDomain: "htstore-6e3a9.firebaseapp.com",
  projectId: "htstore-6e3a9",
  storageBucket: "htstore-6e3a9.firebasestorage.app",
  messagingSenderId: "1044955657636",
  appId: "1:1044955657636:web:c8712db24c876315823d31",
  measurementId: "G-6VC61RZZ7L"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export default firebase;
export const authentication = getAuth(initializeApp(firebaseConfig))