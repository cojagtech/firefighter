// src/components/common/ConfirmDeleteDialog.jsx

import { useEffect, useState } from "react";
import SafeIcon from "@/components/common/SafeIcon";

export default function ConfirmDeleteDialog({
  open,
  title = "Delete",
  description,
  itemName,
  itemSub,
  onConfirm,
  onCancel,
}) {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="rounded-xl p-6 w-full max-w-sm shadow-2xl"
        style={{
          backgroundColor: isDark ? "#111214" : "#ffffff",
          border: `1px solid ${isDark ? "#2a2b2e" : "#e2e8f0"}`,
          color: isDark ? "#e5e7eb" : "#111827",
        }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-500/10 p-3 rounded-full">
            <SafeIcon name="Trash2" size={28} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h2
          className="text-lg font-semibold text-center mb-1"
          style={{ color: isDark ? "#ffffff" : "#000000" }}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          className="text-sm text-center mb-1"
          style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
        >
          {description || "Are you sure you want to delete"}
        </p>

        {/* Item Name */}
        {itemName && (
          <p
            className="text-sm font-semibold text-center mb-1"
            style={{ color: isDark ? "#ffffff" : "#000000" }}
          >
            {itemName}{" "}
            {itemSub && (
              <span className="text-red-500">({itemSub})</span>
            )}
          </p>
        )}

        <p
          className="text-xs text-center mb-5"
          style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
        >
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition"
            style={{
              border: `1px solid ${isDark ? "#2a2b2e" : "#e2e8f0"}`,
              color: isDark ? "#9ca3af" : "#6b7280",
              backgroundColor: "transparent",
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}