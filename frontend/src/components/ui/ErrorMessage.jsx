export default function ErrorMessage({ error }) {
  const message =
    error?.response?.data?.detail ||
    error?.message ||
    "An unexpected error occurred.";

  return (
    <div className="rounded-lg bg-error-bg border border-error-border p-4 text-error-text text-sm">
      {message}
    </div>
  );
}
