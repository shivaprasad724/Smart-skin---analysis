import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Safety timeout in case Firebase auth initialization or network hangs
    const safetyTimer = setTimeout(() => {
      setIsLoadingAuth((loading) => {
        if (loading) {
          console.warn("Auth initialization timed out, proceeding to app.");
          return false;
        }
        return false;
      });
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Timeout helper for Firestore getDoc call (max 2.5s)
          const fetchUserData = async () => {
            const userDocPromise = getDoc(doc(db, "users", firebaseUser.uid));
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Firestore fetch timeout")), 2500)
            );
            return await Promise.race([userDocPromise, timeoutPromise]);
          };

          let userData = {};
          try {
            const userDoc = await fetchUserData();
            if (userDoc && userDoc.exists()) {
              userData = userDoc.data();
            }
          } catch (e) {
            console.warn("Could not fetch user profile from Firestore, using basic auth profile:", e);
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setAuthError(error.message);
      } finally {
        clearTimeout(safetyTimer);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const register = async (email, password, extraData = {}) => {
    try {
      setAuthError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (extraData.fullName) {
        await updateProfile(userCredential.user, {
          displayName: extraData.fullName
        });
      }

      // Create user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName: extraData.fullName || "",
        createdAt: new Date().toISOString(),
        ...extraData
      });
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authError,
      login,
      register,
      logout,
      resetPassword,
      isLoadingPublicSettings: false // Kept for compatibility with existing UI if needed
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
