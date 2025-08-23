import React from "react";
import { motion } from "framer-motion";
import { Wifi } from "lucide-react";
import { Port } from "../types";

interface DevicePortsProps {
  ports: Port[];
}

const DevicePorts: React.FC<DevicePortsProps> = ({ ports }) => {
  if (ports.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Wifi className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Open ports ({ports.length})
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {ports.map((port, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-600 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors duration-200"
          >
            <div className="font-mono font-medium">
              {port.port} • {port.service}
            </div>
            {port.version && (
              <div className="text-gray-500 dark:text-gray-400 mt-1 truncate">
                {port.version}
              </div>
            )}
            {port.state && (
              <div
                className={`text-xs mt-1 font-medium ${
                  port.state === "open"
                    ? "text-green-600 dark:text-green-400"
                    : port.state === "closed"
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {port.state}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DevicePorts;
