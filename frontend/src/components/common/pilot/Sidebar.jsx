import { NavLink } from "react-router-dom";
import { Radio, CalendarClock, Plane } from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const menu = [
    { name: "Drones",icon: Plane,link: "/pilot-dashboard" },
    { name: "Live Incident Command",icon: Radio,link: "/pilot-live-incident-command" },
    { name: "Schedule Maintenance",icon: CalendarClock,link: "/schedule-maintenance" },
  ];

  return (
    <aside className="sidebar-container">
      {menu.map((item, index) => (
        <NavLink
          key={index}
          to={item.link}
          className={({ isActive }) =>
            `sidebar-menu-item ${isActive ? "active" : ""}`
          }
        >
          <item.icon size={18} className="sidebar-icon" />
          {item.name}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;