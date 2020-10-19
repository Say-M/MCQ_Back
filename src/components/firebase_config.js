import firebase from "firebase";

const config = {
    apiKey: "AIzaSyDhu3OgD4oG1e7MWoalN2V27DQmD6pL4YI",
    authDomain: "chemgenie-9fece.firebaseapp.com",
    databaseURL: "https://chemgenie-9fece.firebaseio.com",
    projectId: "chemgenie-9fece",
    storageBucket: "chemgenie-9fece.appspot.com",
    messagingSenderId: "245889354284",
    appId: "1:245889354284:web:a4a84c9a83a1f0d6525f89",
    measurementId: "G-NMXH7K8ENT",
};
firebase.initializeApp(config);
// export default firebase;
const db = firebase.firestore();
// db.settings({
//   timestampsInSnapshots: true,
// });
export const storage = firebase.storage();
export default db;