import {
  Home,
  Users,
  FileBarChart,
  Upload,
  FilePlus,
  BookOpen,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ Make sure this is imported
import API from "../../config/API";

export default function Sidebar({ setSidebarOpen }) {
  const navigate = useNavigate();

  const SideBarItems = [
    { name: "Dashboard", href: "/admin/Dashboard", icon: <Home /> },
    { name: "Users", href: "/admin/Users", icon: <Users /> },
    { name: "Reports", href: "/admin/Reports", icon: <FileBarChart /> },
    { name: "Upload", href: "/admin/upload", icon: <Upload /> },
    { name: "Request", href: "/admin/Request", icon: <FilePlus /> },
    { name: "Exams", href: "/admin/Exams", icon: <BookOpen /> },
  ];

  const handleLogout = async () => {
    try {
      await API.post("/Admin/Logout", null, { withCredentials: true });
      toast.success("Logout successful!");
      
      // Delay navigation slightly to allow toast to show
      setTimeout(() => {
        navigate("/institute-exam-admin-Login");
      }, 300);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && typeof setSidebarOpen === "function") {
      setSidebarOpen(false);
    }
  };

  return (
    <aside className="w-64 bg-white shadow h-full p-4">
      <ul className="space-y-3">
        {SideBarItems.map((link) => (
          <li
            key={link.name}
            className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded"
          >
            <Link to={link.href} onClick={handleLinkClick} className="flex items-center gap-2">
              {link.icon}
              <span>{link.name}</span>
            </Link>
          </li>
        ))}
        <li
          onClick={() => {
            handleLogout();
            handleLinkClick(); // Also close sidebar on mobile
          }}
          className="flex items-center gap-2 p-2 text-red-600 cursor-pointer hover:bg-red-100 rounded"
        >
          <LogOut />
          Logout
        </li>
      </ul>
    </aside>
  );
}
