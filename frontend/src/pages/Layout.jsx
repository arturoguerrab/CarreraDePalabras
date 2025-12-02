import React from "react";
import StopContainer from "./StopContainer";

const Layout = ({ children }) => {
  return (
    <main className="h-dvh ">
      <nav className="bg-[#1e212a] text-[#1e212a] w-full h-16">s</nav>
      {children}
    </main>
  );
};

export default Layout;
