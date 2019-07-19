import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBNN1fLG-SoF7gWh0uMKbece0rZ--ZEeQ",
  authDomain: "vuefb-21fe9.firebaseapp.com",
  databaseURL: "https://vuefb-21fe9.firebaseio.com",
  projectId: "vuefb-21fe9",
  storageBucket: "",
  messagingSenderId: "632277419807",
  appId: "1:632277419807:web:73ba94950f945d51"
};

export const db = firebase.initializeApp(firebaseConfig).firestore();