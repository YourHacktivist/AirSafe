import React from "react";
import { ScanResult } from "../types";

interface DeviceInfoProps {
  device: ScanResult;
}

const DeviceInfo: React.FC<DeviceInfoProps> = ({ device }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      {device.vendor && (
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Manufacturer:
          </span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {device.vendor}
          </span>
        </div>
      )}

      {device.os && (
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            OS:
          </span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {device.os}
          </span>
        </div>
      )}

      {device.deviceType && (
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Type:
          </span>
          <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
            {device.deviceType.toLowerCase() === "camera"
              ? "Possible camera"
              : device.deviceType.replace("-", " ")}
          </span>
        </div>
      )}

      {device.mac && (
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            MAC:
          </span>
          <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
            {device.mac}
          </span>
        </div>
      )}
    </div>
  );
};

export default DeviceInfo;
