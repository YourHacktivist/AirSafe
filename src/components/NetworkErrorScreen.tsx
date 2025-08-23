import React from "react";
import { motion } from "framer-motion";
import { RotateCcw, ExternalLink } from "lucide-react";

interface NetworkErrorScreenProps {
  errorType: string | null;
  getErrorMessage: (errorType: string) => {
    title: string;
    message: string;
    icon: React.ReactNode;
    suggestions: string[];
  };
  onReset: () => void;
}

const NetworkErrorScreen: React.FC<NetworkErrorScreenProps> = ({
  errorType,
  getErrorMessage,
  onReset,
}) => {
  if (!errorType) return null;

  const errorInfo = getErrorMessage(errorType);

  return (
    <motion.div
      key="network-error"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col justify-center min-h-full py-12"
    >
      <div className="text-center space-y-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center border border-red-200 dark:border-red-800">
            {errorInfo.icon}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 dark:text-gray-100"
          >
            {errorInfo.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto"
          >
            {errorInfo.message}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-dark-700/50 text-left max-w-2xl mx-auto"
        >
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 text-center">
            Suggested solutions:
          </h3>
          <ul className="space-y-3">
            {errorInfo.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start space-x-3 text-gray-700 dark:text-gray-300"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="leading-relaxed">{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Retry analysis</span>
          </motion.button>

          {errorType === "NETWORK_DISCONNECTED" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open("ms-availablenetworks:", "_blank");
                }
              }}
              className="flex items-center space-x-3 bg-white dark:bg-dark-800 hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 font-medium px-6 py-3 rounded-xl border border-gray-200 dark:border-dark-600 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Network settings</span>
            </motion.button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NetworkErrorScreen;
