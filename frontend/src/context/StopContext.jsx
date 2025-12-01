import React from "react";
import { useState, createContext } from "react";

export const StopContext = createContext();
const StopContextProvider = ({ children }) => {
  let data = {
  };
  return <StopContext.Provider value={data}>{children}</StopContext.Provider>;
};

export default StopContextProvider;
