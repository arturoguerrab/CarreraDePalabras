import React from "react";
import { useState, createContext } from "react";

export const StopContext = createContext();
const StopContextProvider = ({ children }) => {
  const timer =()=>{
    
  }

  let data = {timer
  };
  return <StopContext.Provider value={data}>{children}</StopContext.Provider>;
};

export default StopContextProvider;
