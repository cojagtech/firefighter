import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default async function logoutUser() {
  try {
    // 🔥 backend call
    await fetch(`${API_BASE}/common/login/logout.php`, {
      method: "POST",
      credentials: "include",
    });

    // 🔥 clear session
    sessionStorage.removeItem("fireOpsSession");

    toast.success("Logged out successfully!");

    // 🔥 redirect
    setTimeout(() => {
      window.location.href = "/";
    }, 500);

  } catch (error) {
    toast.error("Logout failed");
    console.error(error);
  }
}