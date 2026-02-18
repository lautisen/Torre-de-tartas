const firebaseConfig = {
    apiKey: "AIzaSyBJIa7dDZ3PUWiUWRO23gXZj4peEsMmUEE",
    authDomain: "torre-de-tartas.firebaseapp.com",
    databaseURL: "https://torre-de-tartas-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "torre-de-tartas",
    storageBucket: "torre-de-tartas.firebasestorage.app",
    messagingSenderId: "119201007028",
    appId: "1:119201007028:web:fd25b313bc58656cc15ee1"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const database = firebase.database();
