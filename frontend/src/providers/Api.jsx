import React, { createContext, useContext, useEffect, useState } from "react";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";

const ApiContext = createContext(null);

export const useApi = () => {
  return useContext(ApiContext);
};

export const ApiProvider = (props) => {
  const [bank, setBank] = useState([]);
  const getSepay = async () => {
    const res = await axiosInstance.get(API_PATHS.PAYMENT.GET_SEPAY);
    const data = res.data.bankaccount;
    const bankdata = {
      bankName: data.bank_short_name,
      accountName: data.account_holder_name,
      accountNumber: data.account_number,
    };
    setBank(bankdata);
  };

  useEffect(() => {
    getSepay();
  }, []);

  return (
    <ApiContext.Provider value={{ bank }}>{props.children}</ApiContext.Provider>
  );
};
