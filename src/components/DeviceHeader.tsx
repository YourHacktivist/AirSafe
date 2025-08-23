import React from "react";
import { Smartphone, Router, Tv, HardDrive, Monitor } from "lucide-react";
import { ScanResult } from "../types";

interface DeviceHeaderProps {
  device: ScanResult;
  config: {
    color: string;
    icon: React.ReactNode;
    label: string;
    pulse: string;
  };
}

const DeviceHeader: React.FC<DeviceHeaderProps> = ({ device, config }) => {
  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-6 h-6 text-blue-500" />;
      case "router":
        return <Router className="w-6 h-6 text-green-500" />;
      case "smart-tv":
        return <Tv className="w-6 h-6 text-purple-500" />;
      case "computer":
        return (
          <HardDrive className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        );
      default:
        return <Monitor className="w-6 h-6 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-gray-100 dark:bg-dark-700 rounded-xl flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-dark-600 transition-colors duration-300">
          {getDeviceIcon(device.deviceType)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3 mb-2">
          <div
            className={`${config.color} ${config.pulse} transition-all duration-300 group-hover:scale-110`}
          >
            {config.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 font-mono">
              {device.ip}
            </h4>
            {device.hostname && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {device.hostname}
              </p>
            )}
          </div>
          <div
            className={`status-indicator ${
              device.suspicionLevel === "high"
                ? "status-high"
                : device.suspicionLevel === "medium"
                ? "status-medium"
                : "status-low"
            }`}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${config.color}`}>
            Suspicion level: {config.label}
          </span>
          {device.trustScore && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Score:
              </span>
              <span
                className={`text-xs font-semibold ${
                  device.trustScore >= 90
                    ? "text-green-600 dark:text-green-400"
                    : device.trustScore >= 70
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {device.trustScore}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceHeader;
