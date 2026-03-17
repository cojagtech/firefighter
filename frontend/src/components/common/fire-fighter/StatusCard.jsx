import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import SafeIcon from "@/components/common/SafeIcon";

export default function StatusCard({
  title,
  value,
  icon,
  variant = "default",
  trend,
  onClick,
}) {
  // Theme observer
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

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return `border hover:border-red-400 hover:shadow-[0_0_10px_rgba(255,0,0,0.35)] transition-all duration-300 ${
          isDark ? "border-white/10" : "border-red-200"
        }`;
      case "warning":
        return "border-yellow-400/40 bg-yellow-500/10 shadow-[0_0_15px_-2px_rgba(255,200,0,0.25)]";
      case "success":
        return "border-green-500/40 bg-green-500/10 shadow-[0_0_15px_-2px_rgba(0,255,0,0.25)]";
      default:
        return isDark
          ? "border-[#2A2B2E] bg-[#17181A]"
          : "border-[#e2e8f0] bg-white";
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger": return "bg-red-500/20";
      case "warning": return "bg-yellow-400/20";
      case "success": return "bg-green-500/20";
      default: return isDark ? "bg-[#242528]" : "bg-gray-100";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "danger": return "text-red-400";
      case "warning": return "text-yellow-300";
      case "success": return "text-green-400";
      default: return isDark ? "text-gray-300" : "text-gray-600";
    }
  };

  return (
    <Card
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          onClick();
        }
      }}
      className={`
        cursor-pointer
        ${getVariantStyles()}
        rounded-xl border transition-all duration-200
        hover:scale-[1.03] hover:border-red-400
      `}
      style={{ backgroundColor: "transparent" }}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p
              className="text-xs tracking-wide"
              style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
            >
              {title}
            </p>

            <div className="flex items-baseline gap-2">
              <p
                className="text-3xl font-bold"
                style={{ color: isDark ? "#ffffff" : "#111827" }}
              >
                {value}
              </p>

              {trend && (
                <span
                  className={`text-sm font-semibold ${
                    trend.isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${getIconBg()}`}
          >
            <SafeIcon name={icon} className={`h-6 w-6 ${getIconColor()}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}