import React, { useState } from "react";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";
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
                  <Button
                    variant="view"
                    size="sm"
                    onClick={() => toggleUserStatus(u)}
                    className={isDark
                      ? "border-[#14532D] text-[#4ADE80] hover:bg-[#052E16]"
                      : "border-[#BBF7D0] text-[#16A34A] hover:bg-[#F0FDF4]"
                    }
                  >
                    {u.active ? "Active" : "Inactive"}
                  </Button>
                </td>

                <td className="p-2">
                  <div className="flex gap-2">
                    <Button
                      variant="edit"
                      size="sm"
                      onClick={() => onEdit(u.id)}
                      className={isDark
                        ? "border-[#1D4ED8] text-[#60A5FA] hover:bg-[#1E293B]"
                        : "border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]"
                      }
                    >
                      <SafeIcon name="Pencil" size={14} />
                      Edit
                    </Button>



                    <Button
                      variant="delete"
                      size="sm"
                      disabled={deletingId === u.id}
                      onClick={() => setConfirmUser(u)}
                      className={isDark
                        ? "border-[#7F1D1D] text-[#F87171] hover:bg-[#2A0E0E]"
                        : "border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]"
                      }
                    >
                      <SafeIcon name="Trash2" size={14} />
                      {deletingId === u.id ? "Deleting..." : "Delete"}
                    </Button>
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