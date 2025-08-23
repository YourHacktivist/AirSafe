import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Eye, CheckCircle } from "lucide-react";
import { ScanResult } from "../types";
import DeviceHeader from "./DeviceHeader";
import DeviceInfo from "./DeviceInfo";
import DevicePorts from "./DevicePorts";
import DeviceSecurity from "./DeviceSecurity";

interface DeviceCardProps {
  device: ScanResult;
  index: number;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, index }) => {
  const getSuspicionConfig = (level: string) => {
    switch (level) {
      case "high":
        return {
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50/80 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          glowColor: "glow-danger",
          icon: <AlertTriangle className="w-5 h-5" />,
          label: "High",
          pulse: "animate-pulse",
        };
      case "medium":
        return {
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50/80 dark:bg-yellow-950/30",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          glowColor: "glow-warning",
          icon: <Eye className="w-5 h-5" />,
          label: "Medium",
          pulse: "",
        };
      default:
        return {
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50/80 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-800",
          glowColor: "glow-success",
          icon: <CheckCircle className="w-5 h-5" />,
          label: "Low",
          pulse: "",
        };
    }
  };

  const config = getSuspicionConfig(device.suspicionLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className={`card ${config.bgColor} ${config.borderColor} ${config.glowColor} border-l-4 cursor-pointer group`}
    >
      <div className="space-y-4">
        {/* Header with main information */}
        <DeviceHeader device={device} config={config} />

        {/* Detailed device information */}
        <DeviceInfo device={device} />

        {/* Open ports */}
        {device.ports && device.ports.length > 0 && (
          <DevicePorts ports={device.ports} />
        )}

        {/* Security analysis and risk bar */}
        {device.reasons && device.reasons.length > 0 && (
          <DeviceSecurity
            reasons={device.reasons}
            suspicionLevel={device.suspicionLevel}
          />
        )}
      </div>
    </motion.div>
  );
};

export default DeviceCard;
