import React, { useContext, useEffect } from "react";
import { useUserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

export const useUserAuth = () => {
  const { user, loading, clearUser } = useUserContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (user) return;

    if (!user) {
      clearUser();
      navigate("/");
    }
  }, [user, loading, clearUser, navigate]);
};
