import Layout from "./pages/Layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StopContainer from "./pages/StopContainer.jsx";
import GameInputContainer from "./pages/GameInputContainer.jsx";
import StopContextProvider from "./context/StopContext.jsx";

function App() {
  return (
    <BrowserRouter>
      <StopContextProvider>
        <Layout>
          <Routes>
            <Route path="/results" element={<StopContainer />} />
            <Route path="/" element={<GameInputContainer />} />
          </Routes>
        </Layout>
      </StopContextProvider>
    </BrowserRouter>
  );
}

export default App;
