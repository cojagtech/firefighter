import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/Context/ThemeContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";
import SafeIcon from "@/components/common/pilot/SafeIcon";
import logoutUser from "../auth/logout";
import useUserInfo from "@/components/common/auth/useUserInfo";

import "./PilotHeader.css";

export default function PilotHeader({ notificationCount = 0 }) {
  const [mounted, setMounted] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { name, role, initials } = useUserInfo();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="pilot-header">
      <div className="pilot-header__container">

        {/* LEFT */}
        <div className="pilot-header__left">
          <div className="pilot-header__logo">
            <div className="pilot-header__logo-icon">
              <SafeIcon name="Drone" size={20} />
            </div>
            <span className="pilot-header__logo-text">Pilot Dashboard</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="pilot-header__right">

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="pilot-header__notification-button">
            <SafeIcon name="Bell" size={20} />
            {notificationCount > 0 && (
              <Badge className="pilot-header__notification-badge">
                {notificationCount > 9 ? "9+" : notificationCount}
              </Badge>
            )}
          </Button>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="pilot-header__profile-button">

                <Avatar className="pilot-header__profile-avatar">
                  <AvatarImage src="https://spark-builder.s3.us-east-1.amazonaws.com/image/2025/11/20/382b2788-4a1a-42b3-ad58-7ff36533b34a.png" alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="pilot-header__profile-info">
                  <span className="pilot-header__profile-name">{name}</span>
                  <span className="pilot-header__profile-role">{role}</span>
                </div>

                <SafeIcon name="ChevronDown" size={16} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="pilot-header__dropdown">

              <DropdownMenuLabel className="pilot-header__dropdown-label">
                Pilot Account
              </DropdownMenuLabel>

              <div className="divider" />

              <DropdownMenuItem className="pilot-header__dropdown-item">
                <SafeIcon name="User" size={16} />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={toggleTheme}
                className="pilot-header__dropdown-item"
              >
                <SafeIcon name={isDark ? "Sun" : "Moon"} size={16} />
                {isDark ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>

              <div className="divider" />

              <DropdownMenuItem
                onClick={logoutUser}
                className="pilot-header__dropdown-item logout"
              >
                <SafeIcon name="LogOut" size={16} />
                Logout
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}