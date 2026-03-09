import { useMemo, useState } from "react";

import { useCreateList, useLists } from "../hooks/useLists";
import Modal from "../components/ui/Modal";
import ErrorMessage from "../components/ui/ErrorMessage";
import Spinner from "../components/ui/Spinner";
import ListForm from "../components/lists/ListForm";
import ListsGrid from "../components/lists/ListsGrid";

const SORT_OPTIONS = [
  { value: "name-asc",  label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
  { value: "date-desc", label: "Date Created (Newest)" },
  { value: "date-asc",  label: "Date Created (Oldest)" },
];

function sortLists(lists, sortBy) {
  return [...lists].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-asc":
        return new Date(a.created_date) - new Date(b.created_date);
      case "date-desc":
        return new Date(b.created_date) - new Date(a.created_date);
      default:
        return 0;
    }
  });
}

export default function ListsPage() {
  const { data: lists, isLoading, error } = useLists();
  const createList = useCreateList();
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("name-asc");

  const sortedLists = useMemo(
    () => (lists ? sortLists(lists, sortBy) : []),
    [lists, sortBy],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Lists</h1>
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            + New List
          </button>
        </div>
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {lists && <ListsGrid lists={sortedLists} />}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <ListForm
            isPending={createList.isPending}
            onSubmit={async (data) => {
              await createList.mutateAsync(data);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}
