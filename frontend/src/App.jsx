import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import Header from "./components/ui/Header";
import ColorsPage from "./pages/ColorsPage";
import DashboardPage from "./pages/DashboardPage";
import ListDetailPage from "./pages/ListDetailPage";
import ListsPage from "./pages/ListsPage";
import TagsPage from "./pages/TagsPage";

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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/lists/:id" element={<ListDetailPage />} />
        <Route path="/tags" element={<TagsPage />} />
        <Route path="/colors" element={<ColorsPage />} />
      </Routes>
    </div>
  );
}
