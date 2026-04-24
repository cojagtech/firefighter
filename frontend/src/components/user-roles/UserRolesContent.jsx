import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "@/Context/ThemeContext";
import RegistrationForm from "./RegistrationForm";
import UserFilters from "./UserFilters";
import UsersTable from "./UsersTable";
import OtpModal from "./OtpModal";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";

export default function UserRoleManagementPage() {
  const { isDark } = useTheme();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const API = `${API_BASE}/admin/admin-user-roles`;

  const ROLES = ["Pilot", "Fire Station Command Control", "Vehicle Driver"];
  const USERS_PER_PAGE = 10;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    email: "",
    phone: "",
    designation: "",
    role: "",
    station: "",
  });

  const [filters, setFilters] = useState({
    name: "",
    station: "",
    role: "",
    status: "",
    sortBy: "",
  });

  const [otpModal, setOtpModal] = useState({ open: false, user: null });

  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/get_all_users.php`);
      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to load users");
        setUsers([]);
        return;
      }

      const normalizedUsers = data.users.map((u) => ({
        ...u,
        active: Number(u.active) === 1,
      }));

      setUsers(normalizedUsers);
    } catch (error) {
      console.error(error);
      toast.error("Server error while fetching users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = () => {
    setForm({
      fullName: "",
      address: "",
      email: "",
      phone: "",
      designation: "",
      role: "",
      station: "",
    });
    setEditUserId(null);
    setFormVisible(true);
  };

  const handleEditUser = async (userId) => {
    try {
      const res = await fetch(`${API}/get_user_by_id.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to fetch user");
        return;
      }

      const user = data.user;

      setForm({
        fullName: user.fullName || "",
        address: user.address || "",
        email: user.email || "",
        phone: user.phone || "",
        designation: user.designation || "",
        role: user.role || "",
        station: user.station || "",
      });

      setEditUserId(userId);
      setFormVisible(true);
    } catch (error) {
      console.error(error);
      toast.error("Server error while fetching user");
    }
  };

  const updateLocalStatus = (userId, isActive) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: isActive } : u))
    );
  };

  const toggleUserStatus = async (user) => {
    if (user.active) {
      setOtpModal({ open: true, user });
      return;
    }

    updateLocalStatus(user.id, true);

    try {
      const response = await fetch(`${API}/update_user_status.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status: 1, reason: "" }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error("Failed to activate user");
        updateLocalStatus(user.id, false);
        return;
      }

      toast.success("User Activated Successfully");
    } catch {
      toast.error("Server error");
      updateLocalStatus(user.id, false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const name = u.fullName?.toLowerCase() || "";
        const role = u.role?.trim().toLowerCase() || "";
        const station = u.station?.trim().toLowerCase() || "";

        const filterName = filters.name?.toLowerCase() || "";
        const filterRole = filters.role?.trim().toLowerCase() || "";
        const filterStation = filters.station?.trim().toLowerCase() || "";

        // 🔍 Name filter
        if (filterName && !name.includes(filterName)) return false;

        // 🏢 Station filter
        if (filterStation && station !== filterStation) return false;

        // 👤 Role filter (🔥 main fix)
        if (filterRole && role !== filterRole) return false;

        // 📊 Status filter
        if (filters.status === "active" && !u.active) return false;
        if (filters.status === "inactive" && u.active) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "id_asc") return a.id - b.id;
        if (filters.sortBy === "id_desc") return b.id - a.id;
        return 0;
      });
  }, [users, filters]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, users]);

  return (
    <div
      className={`min-h-screen p-6 space-y-6 ${isDark ? "bg-gray-950" : "bg-gray-50"
        }`}
    >
      <div className="flex items-center justify-between">
        <h1
          className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"
            }`}
        >
          User Management
        </h1>

        <Button variant="outline" onClick={handleAddUser} className="gap-2 active:scale-98">
          <SafeIcon name="Plus" size={18} /> Add New User
        </Button>

      </div>

      <UserFilters
        isDark={isDark}
        roles={ROLES}
        filters={filters}
        setFilters={setFilters}
      />

      <UsersTable
        isDark={isDark}
        users={paginatedUsers}
        loading={loading}
        toggleUserStatus={toggleUserStatus}
        onEdit={handleEditUser}
        onDeleted={fetchUsers}
      />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm border ${currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
                  }`}
              >
                {page}
              </button>
            );
          })}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {formVisible && (
        <RegistrationForm
          isDark={isDark}
          form={form}
          setForm={setForm}
          roles={ROLES}
          editUserId={editUserId}
          setEditUserId={setEditUserId}
          onSubmit={() => {
            fetchUsers();
            setFormVisible(false);
          }}
          onCancel={() => setFormVisible(false)}
        />
      )}

      {otpModal.open && (
        <OtpModal
          isDark={isDark}
          otpModal={otpModal}
          setOtpModal={setOtpModal}
          updateStatus={updateLocalStatus}
        />
      )}
    </div>
  );
}
