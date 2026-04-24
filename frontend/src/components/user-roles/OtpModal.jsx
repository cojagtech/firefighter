import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SafeIcon from "@/components/common/SafeIcon";
import toast from "react-hot-toast";
import { X } from "lucide-react";


export default function OtpModal({ isDark, otpModal, setOtpModal, updateStatus }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const API = `${API_BASE}/admin/admin-user-roles`;
  const closeModal = () => {
    setOtp("");
    setReason("");
    setOtpModal({ open: false, user: null, reason: "" });
  };

  const handleDeactivateUser = async () => {
    if (otp !== "123456") {
      toast.error("Invalid OTP");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/update_user_status.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: otpModal.user.id,
            status: 0,
            reason: reason,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("User Deactivated Successfully");

        updateStatus(otpModal.user.id, false);

        closeModal();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black/50 z-50"
    >
      <div
        className="p-6 rounded-xl w-[400px] relative"
        style={{
          backgroundColor: isDark ? "#1a1d21" : "#ffffff",
          color: isDark ? "white" : "black",
        }}
      >
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-600/30"
        >
          <X size={20} className="text-gray-300 hover:text-white" />
        </button>

        <h2 className="text-xl font-bold mb-4">Deactivate User</h2>

        <p className="text-sm mb-2">
          User: <strong>{otpModal.user?.name}</strong>
        </p>

        <label className="text-sm font-medium">Enter Deactivation Reason</label>
        <textarea
          className="w-full mt-1 p-2 rounded-lg border border-gray-400 bg-transparent"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>

        <label className="mt-4 block text-sm font-medium">Enter OTP</label>
        <input
          type="text"
          className="w-full mt-1 p-2 rounded-lg border border-gray-400 bg-transparent"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
        />

        <div className="flex justify-between mt-5">
          <Button
            onClick={closeModal}
            className="gap-2 border border-[#2E2E2E] hover:bg-[#2c2c2c] active:scale-95"
            style={{
              backgroundColor: isDark ? "none" : "#e5e7eb",
              color: isDark ? "#FAFAFA" : "#111827",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="outline"
            onClick={handleDeactivateUser}
            disabled={loading}
            className="bg-[#dc2626]"
          >
            {loading ? "Processing..." : "Confirm Deactivate"}
          </Button>
        </div>
      </div>

    </div>
  );
}
