export default function ErrorMessage({ error }) {
  const message =
    error?.response?.data?.detail ||
    error?.message ||
    "An unexpected error occurred.";

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
      {message}
    </div>
  );
}
