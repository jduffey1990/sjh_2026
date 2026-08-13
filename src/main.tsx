import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import Schedule from "./pages/Schedule";
import DayDetail from "./pages/DayDetail";
import Travel from "./pages/Travel";
import Gallery from "./pages/Gallery";
import Board from "./pages/Board";
import MyKit from "./pages/MyKit";
import Riders from "./pages/Riders";
import AuthGate from "./components/AuthGate";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthGate>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Schedule />} />
            <Route path="/day/:id" element={<DayDetail />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/board" element={<Board />} />
            <Route path="/kit" element={<MyKit />} />
            <Route path="/riders" element={<Riders />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthGate>
  </StrictMode>,
);
