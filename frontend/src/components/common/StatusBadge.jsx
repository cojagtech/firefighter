import { Badge } from "@/components/ui/badge"
import SafeIcon from "@/components/common/SafeIcon"

export default function StatusBadge({ 
  status, 
  label,
  showIcon = true,
  className = ""
}) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          color: "bg-emerald-600 text-white hover:bg-emerald-700",
          icon: "CheckCircle",
          text: label || "Active"
        }
      case "busy":
        return {
          color: "bg-amber-600 text-white hover:bg-amber-700",
          icon: "Clock",
          text: label || "Busy"
        }
      case "on-mission":
        return {
          color: "bg-blue-600 text-white hover:bg-blue-700",
          icon: "Navigation",
          text: label || "On Mission"
        }
      case "maintenance":
        return {
          color: "bg-yellow-600 text-white hover:bg-yellow-700",
          icon: "Wrench",
          text: label || "maintenance"
        }
      case "critical":
        return {
          color: "bg-destructive text-white hover:bg-destructive/90",
          icon: "AlertTriangle",
          text: label || "Critical"
        }
      case "warning":
        return {
          color: "bg-amber-600 text-white hover:bg-amber-700",
          icon: "AlertCircle",
          text: label || "Warning"
        }
      case "success":
        return {
          color: "bg-emerald-600 text-white hover:bg-emerald-700",
          icon: "CheckCircle2",
          text: label || "Success"
        }
      case "offline":
        return {
          color: "bg-muted text-muted-foreground hover:bg-muted/80",
          icon: "XCircle",
          text: label || "Offline"
        }
      case "standby":
        return {
          color: "bg-amber-600 text-white hover:bg-amber-700",
          icon: "Shield",
          text: label || "standby"
        }
      default:
        return {
          color: "bg-muted text-muted-foreground",
          icon: "Circle",
          text: label || status
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge className={`${config.color} ${className}`}>
      {showIcon && <SafeIcon name={config.icon} size={14} className="mr-1" />}
      {config.text}
    </Badge>
  )
}
