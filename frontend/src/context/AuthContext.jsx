import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// 1. PLACE THIS AT THE VERY TOP (After the imports)
const API_URL = "https://taskmanager-app-2uke.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  // 2. UPDATE THIS LOGIN FUNCTION
  const login = async (email, password) => {
    // Notice the backticks (`) and the ${API_URL}
    const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    setToken(res.data.token);
    setUser(res.data);
  };

  // 3. UPDATE THIS REGISTER FUNCTION
  const register = async (name, email, password) => {
    // Notice the backticks (`) and the ${API_URL}
    const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    setToken(res.data.token);
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};