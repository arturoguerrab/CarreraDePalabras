import Layout from "./pages/Layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StopContainer from "./pages/StopContainer.jsx";
import GameInputContainer from "./pages/GameInputContainer.jsx";

function App() {
  return (
    <BrowserRouter>
      {/* <Provider> */}
      <Layout>
        <Routes>
          <Route path="/results" element={<StopContainer/>} />
          <Route path="/" element={<GameInputContainer/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
