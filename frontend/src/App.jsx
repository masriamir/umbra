import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import Header from "./components/ui/Header";
import ListDetailPage from "./pages/ListDetailPage";
import ListsPage from "./pages/ListsPage";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("theme") === "dark";
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-canvas text-body">
      <Header darkMode={darkMode} onToggle={toggleDarkMode} />
      <Routes>
        <Route path="/" element={<ListsPage />} />
        <Route path="/lists/:id" element={<ListDetailPage />} />
      </Routes>
    </div>
  );
}
