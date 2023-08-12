// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTnnu4BEWf438zkbHCmgpHUsfhJFCBWLU",
  authDomain: "mauditsgpt.firebaseapp.com",
  projectId: "mauditsgpt",
  storageBucket: "mauditsgpt.appspot.com",
  messagingSenderId: "1016540562099",
  appId: "1:1016540562099:web:f3a43e40bb80a8c6c866c6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default db;
