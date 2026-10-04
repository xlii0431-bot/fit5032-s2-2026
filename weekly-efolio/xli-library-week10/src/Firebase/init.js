import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyALQ5vjWG9zDX_aKV54yb19Fhv87KujOxs",
  authDomain: "fit5032-f7514.firebaseapp.com",
  projectId: "fit5032-f7514",
  storageBucket: "fit5032-f7514.firebasestorage.app",
  messagingSenderId: "774406189397",
  appId: "1:774406189397:web:bd4dc85dceb6bf5a6c7fdc"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export default db
