import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyBI1mx2FXsrgcBEwZNKgohW3m5La6CD2jU",
  authDomain: "ai-adaptive-learning-scheduler.firebaseapp.com",
  projectId: "ai-adaptive-learning-scheduler",
  storageBucket: "ai-adaptive-learning-scheduler.appspot.com",
  messagingSenderId: "752130632987",
  appId: "1:752130632987:web:e8137aacbfc34a333437be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Configure functions for development
// if (import.meta.env.DEV) {
//   // Connect to functions emulator in development
//   // connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export default app;