import React, { createContext, useEffect, useState, useContext } from "react";
import axiosInstance from "../utils/axiosIntence";
import { API_PATHS } from "../utils/apiPaths";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    if (user) return;

    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        console.error("User not authenticated", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token);
    setLoading(false);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const handleLogout = () => {
    setIsLoggingOut(true);

    localStorage.clear();
    clearUser();

    navigate("/");
    scrollTo(0, 0);
  };

  const getToken = () => {
    if (user) return localStorage.getItem("token");
  };
  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        updateUser,
        clearUser,
        handleLogout,
        getToken,
        isLoggingOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
