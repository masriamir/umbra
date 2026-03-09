import { Route, Routes } from "react-router-dom";

import ListDetailPage from "./pages/ListDetailPage";
import ListsPage from "./pages/ListsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<ListsPage />} />
        <Route path="/lists/:id" element={<ListDetailPage />} />
      </Routes>
    </div>
  );
}
