import React, { createContext, useContext, useEffect, useState } from "react";

const ApiContext = createContext(null);

export const useApi = () => {
  return useContext(ApiContext);
};

export const ApiProvider = (props) => {
  const API_URL = import.meta.env.VITE_BASE_URL;

  const userProfile = useState([]);

  return (
    <ApiContext.Provider value={{ API_URL }}>
      {props.children}
    </ApiContext.Provider>
  );
};
