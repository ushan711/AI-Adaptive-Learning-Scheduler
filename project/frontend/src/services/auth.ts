import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '@/types';

const googleProvider = new GoogleAuthProvider();

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await createUserDocument(user, { displayName });
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await createUserDocument(user);
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

const createUserDocument = async (user: FirebaseUser, additionalData?: any) => {
  const userRef = doc(db, 'users', user.uid);
  const userData: Partial<User> = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName || additionalData?.displayName || '',
    photoURL: user.photoURL || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      availableTimeSlots: [],
      subjectPriorities: [],
      preferredStudyHours: 6,
      breakDuration: 15,
      maxStudySession: 90,
      studyStyle: 'focused',
      notifications: true,
      weeklyGoal: 40,
    },
  };
  
  await setDoc(userRef, userData);
};

export const updateUserPreferences = async (userId: string, preferences: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      preferences,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    throw error;
  }
};