import React, { useState } from "react";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API = `${API_BASE}/admin/admin-user-roles`;

export default function UsersTable({ isDark, users, toggleUserStatus, onEdit, onDeleted }) {
  const [confirmUser, setConfirmUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteConfirmed = async () => {
    const user = confirmUser;
    setConfirmUser(null);
    setDeletingId(user.id);

    try {
      const res = await fetch(`${API}/delete_user.php`, {
        method: "POST",
        // credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const data = await res.json();

      if (data?.success) {
        toast.success(data.message || "User deleted successfully");
        onDeleted && onDeleted();
      } else {
        toast.error(data?.message || "Failed to delete user");
      }
    } catch (e) {
      console.error(e);
      toast.error("Server error while deleting user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <table
        className="w-full border mt-4 text-sm"
        style={{
          borderColor: isDark ? "#1d1f23" : "#cccccc",
          backgroundColor: isDark ? "#0f1114" : "#ffffff",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: isDark ? "#171b20" : "#f2f2f2",
              color: isDark ? "white" : "black",
            }}
          >
            <th className="p-2 text-left">User ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Station</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr
                key={u.id}
                className="border-b"
                style={{ borderColor: isDark ? "#1d1f23" : "#e0e0e0" }}
              >
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.fullName}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.station}</td>

                <td className="p-2">
                                    <button
                    onClick={() => toggleUserStatus(u)}
                    className="px-3 py-1 rounded text-xs border border-green-500/50 text-green-500 hover:bg-green-500/10 transition-all duration-200 active:scale-[0.95] disabled:opacity-50"
                  >
                    {u.active ? "Active" : "Inactive"}
                  </button>
                </td>

                <td className="p-2">
                  <div className="flex gap-2">
                                        <button
                      onClick={() => onEdit(u.id)}
                       className="px-3 py-1 rounded text-xs border border-blue-500/50 text-blue-500 hover:bg-blue-500/10 transition-all duration-200 active:scale-[0.95] disabled:opacity-50"
                    >
                      Edit
                    </button>


                    <button
                      disabled={deletingId === u.id}
                      onClick={() => setConfirmUser(u)}
                      className="px-3 py-1 rounded text-xs border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all duration-200 active:scale-[0.95] disabled:opacity-50"
                    >
                      {deletingId === u.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ConfirmDeleteDialog
        open={!!confirmUser}
        title="Delete User"
        description="Are you sure you want to delete"
        itemName={confirmUser?.fullName}
        itemSub={confirmUser?.role}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmUser(null)}
      />
    </>
  );
}