import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/loginPage";
import Chat from "./pages/chatPage";

// Styles
import './index.css';

const USER_STORAGE_KEY = "chat_user";
const THEME_STORAGE_KEY = "theme";

/**
 * App Component
 * Root entry point handling Global Auth State and Theme Sync.
 */
function App() {
  // 1. Initial State: Fast-boot from LocalStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  /**
   * Global Theme Manager
   * Applies 'dark' class to document root for Tailwind support.
   */
  const applyTheme = useCallback(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  /**
   * Syncing Logic: Handles multi-tab logout and theme changes.
   */
  useEffect(() => {
    applyTheme();

    const handleStorageChange = (e) => {
      // If user is cleared in another tab, update state here
      if (e.key === USER_STORAGE_KEY) {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
      // Sync theme across tabs
      if (e.key === THEME_STORAGE_KEY) {
        applyTheme();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [applyTheme]);

  // --- Auth Handlers ---

  const handleLogin = (userData) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Route: Login 
          If already logged in, skip directly to the AI interface.
        */}
        <Route 
          path="/" 
          element={
            !user ? (
              <Login onLoginSuccess={handleLogin} />
            ) : (
              <Navigate to="/chat" replace />
            )
          } 
        />

        {/* Protected Route: Chat 
          Requires 'user' object. Redirects to login if session is missing.
        */}
        <Route 
          path="/chat" 
          element={
            user ? (
              <Chat user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;