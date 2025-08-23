import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface DeviceSecurityProps {
  reasons: string[];
  suspicionLevel: "low" | "medium" | "high";
}

const DeviceSecurity: React.FC<DeviceSecurityProps> = ({
  reasons,
  suspicionLevel,
}) => {
  if (reasons.length === 0) return null;

  const getRiskPercentage = () => {
    switch (suspicionLevel) {
      case "high":
        return "85%";
      case "medium":
        return "45%";
      default:
        return "15%";
    }
  };

  const getRiskColor = () => {
    switch (suspicionLevel) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-red-600";
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600";
      default:
        return "bg-gradient-to-r from-green-500 to-green-600";
    }
  };

  const getTextColor = () => {
    switch (suspicionLevel) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Security analysis
          </p>
        </div>
        <ul className="space-y-1">
          {reasons.map((reason, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2"
            >
              <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full flex-shrink-0" />
              <span>{reason}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-dark-600/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Risk level</span>
          <span className={`font-semibold ${getTextColor()}`}>
            {getRiskPercentage()}
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: getRiskPercentage() }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-full rounded-full ${getRiskColor()}`}
          />
        </div>
      </div>
    </>
  );
};

export default DeviceSecurity;
