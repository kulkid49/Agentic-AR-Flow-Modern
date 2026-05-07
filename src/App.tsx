import { Routes, Route } from "react-router";
import MainFlow from "./pages/MainFlow";
import Demo from "./pages/Demo";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainFlow />} />
      <Route path="/demo" element={<Demo />} />
    </Routes>
  );
}

export default App;
