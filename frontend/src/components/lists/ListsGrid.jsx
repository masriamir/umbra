import { useState } from "react";

import { useDeleteList, useUpdateList } from "../../hooks/useLists";
import Modal from "../ui/Modal";
import ListCard from "./ListCard";
import ListForm from "./ListForm";

export default function ListsGrid({ lists }) {
  const updateList = useUpdateList();
  const deleteList = useDeleteList();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteList.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (e) {
      const detail = e?.response?.data?.detail;
      setDeleteError(detail || "Failed to delete list.");
    }
  };

  if (lists.length === 0) {
    return (
      <p className="text-center text-gray-400 py-16">
        No lists yet. Create one to get started!
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        ))}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <ListForm
            initialValues={editing}
            isPending={updateList.isPending}
            onSubmit={async (data) => {
              await updateList.mutateAsync({ id: editing.id, data });
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Delete &ldquo;{deleting.name}&rdquo;?</h2>
            <p className="text-sm text-gray-600">
              This will permanently delete the list and all its items.
            </p>
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteList.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-red-700 transition-colors"
              >
                {deleteList.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
