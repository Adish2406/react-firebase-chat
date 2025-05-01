
import { initializeApp } from "firebase/app";

import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-e595b.firebaseapp.com",
  projectId: "reactchat-e595b",
  storageBucket: "reactchat-e595b.appspot.com",
  
  messagingSenderId: "78602455504",
  appId: "1:78602455504:web:2227b2c68e60359777d1d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth(app);
export const db=getFirestore(app);

