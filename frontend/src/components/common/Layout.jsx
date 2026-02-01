const Layout = ({ children }) => {
  return (
    <main className="h-dvh ">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>
      <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-white border-b-4 border-black shadow-sm"></nav>
      {children}
    </main>
  );
};

export default Layout;
