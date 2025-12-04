import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
const firebaseConfig = {
  apiKey: "AIzaSyBolPnO5I21KZ9LXjgKhS_goXigdBhH2SU",
  authDomain: "htstore-598f7.firebaseapp.com",
  projectId: "htstore-598f7",
  storageBucket: "htstore-598f7.firebasestorage.app",
  messagingSenderId: "850462667400",
  appId: "1:850462667400:web:2328b8f2f62ac5b4e8253d",
  measurementId: "G-3VZ9752NE4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
export default firebase;
export const authentication = getAuth(initializeApp(firebaseConfig))