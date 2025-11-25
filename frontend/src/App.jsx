import Layout from "./pages/Layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StopContainer from "./pages/StopContainer.jsx";

function App() {
  return (
    <BrowserRouter>
      {/* <Provider> */}
      <Layout>
        <Routes>
          <Route path="/" element={<StopContainer/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
