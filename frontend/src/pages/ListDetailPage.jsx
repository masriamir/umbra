import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useDeleteItem, useCreateItem, useItems, useUpdateItem } from "../hooks/useItems";
import { useLists } from "../hooks/useLists";
import Modal from "../components/ui/Modal";
import ErrorMessage from "../components/ui/ErrorMessage";
import Spinner from "../components/ui/Spinner";
import ItemForm from "../components/items/ItemForm";
import ItemList from "../components/items/ItemList";

export default function ListDetailPage() {
  const { id } = useParams();
  const listId = parseInt(id, 10);

  const { data: lists } = useLists();
  const list = lists?.find((l) => l.id === listId);

  const { data: items = [], isLoading, error } = useItems(listId);
  const createItem = useCreateItem(listId);
  const updateItem = useUpdateItem(listId);
  const deleteItem = useDeleteItem(listId);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [exportWarningItems, setExportWarningItems] = useState(null);

  const triggerListExport = () => {
    window.open(`/api/lists/${listId}/export/`, "_blank");
  };

  const handleExportList = () => {
    const skipped = items.filter((i) => !i.completed && !i.due_date);
    if (skipped.length > 0) {
      setExportWarningItems(skipped);
    } else {
      triggerListExport();
    }
  };

  const handleExportItem = (item) => {
    if (!item.due_date) {
      setExportWarningItems([item]);
    } else {
      window.open(`/api/lists/${listId}/items/${item.id}/export/`, "_blank");
    }
  };

  const handleToggleComplete = (item) => {
    updateItem.mutate({ itemId: item.id, data: { completed: !item.completed } });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      await deleteItem.mutateAsync(deletingItem.id);
      setDeletingItem(null);
    } catch {
      setDeleteError("Failed to delete item.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/lists"
          className="text-primary hover:text-primary-hover text-sm font-medium transition-colors"
        >
          ← Back
        </Link>
        {list && (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: list.color.hex_code }}
            />
            <h1 className="text-2xl font-bold text-body">{list.name}</h1>
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleExportList}
            className="bg-success text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-success-hover transition-colors shadow-sm"
          >
            Export .ics
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
          >
            + Add Item
          </button>
        </div>
      </div>

      {isLoading && <Spinner />}
      {error && <ErrorMessage error={error} />}

      {!isLoading && !error && (
        <ItemList
          listId={listId}
          items={items}
          onEdit={handleEdit}
          onDelete={setDeletingItem}
          onToggleComplete={handleToggleComplete}
          onExport={handleExportItem}
        />
      )}

      {showForm && (
        <Modal onClose={handleCloseForm}>
          <ItemForm
            initialValues={editingItem}
            isPending={editingItem ? updateItem.isPending : createItem.isPending}
            onSubmit={async (data) => {
              if (editingItem) {
                await updateItem.mutateAsync({ itemId: editingItem.id, data });
              } else {
                await createItem.mutateAsync(data);
              }
              handleCloseForm();
            }}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}

      {exportWarningItems && (
        <Modal onClose={() => setExportWarningItems(null)}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Export to Calendar</h2>
            {exportWarningItems.length === 1 && !exportWarningItems[0].due_date ? (
              <p className="text-sm text-secondary">
                <strong>&ldquo;{exportWarningItems[0].title}&rdquo;</strong> has no due
                date and cannot be exported to a calendar.
              </p>
            ) : (
              <>
                <p className="text-sm text-secondary">
                  The following {exportWarningItems.length} item
                  {exportWarningItems.length !== 1 ? "s" : ""} have no due date and will
                  be skipped:
                </p>
                <ul className="text-sm text-muted list-disc list-inside space-y-0.5 max-h-40 overflow-y-auto">
                  {exportWarningItems.map((i) => (
                    <li key={i.id}>{i.title}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setExportWarningItems(null)}
                className="px-4 py-2 text-sm text-secondary hover:text-body"
              >
                Cancel
              </button>
              {!(exportWarningItems.length === 1 && !exportWarningItems[0].due_date) && (
                <button
                  onClick={() => {
                    setExportWarningItems(null);
                    triggerListExport();
                  }}
                  className="px-4 py-2 bg-success text-white rounded-lg text-sm font-medium hover:bg-success-hover transition-colors"
                >
                  Export anyway
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {deletingItem && (
        <Modal onClose={() => setDeletingItem(null)}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Delete &ldquo;{deletingItem.title}&rdquo;?</h2>
            <p className="text-sm text-secondary">This item will be permanently removed.</p>
            {deleteError && <p className="text-sm text-danger">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 text-sm text-secondary hover:text-body"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteItem.isPending}
                className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-danger-hover transition-colors"
              >
                {deleteItem.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
