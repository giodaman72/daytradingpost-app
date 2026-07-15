"use client";

export function AdminDeleteButton({
  action,
  label,
}: {
  action: () => void | Promise<void>;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${label}? This cannot be undone.`))
          event.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-button danger"
        aria-label={`Delete ${label}`}
      >
        Delete
      </button>
    </form>
  );
}
