import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Wifi,
  WifiOff,
  Info,
} from "lucide-react";
import DeviceCard from "./DeviceCard";
import { ScanResult } from "../types";

const ScanningScreen = ({
  scanProgress,
  currentScanningDevice,
  devicesFound,
}: {
  scanProgress: number;
  currentScanningDevice: string;
  devicesFound: number;
}) => (
  <motion.div
    key="scanning"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, x: -100 }}
    className="flex flex-col justify-center min-h-full py-8"
  >
    <div className="max-w-2xl mx-auto w-full space-y-12">
      <div className="text-center space-y-8">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-4 bg-white/20 rounded-2xl"
          />

          <Search className="w-14 h-14 text-white relative z-10" />
        </motion.div>

        <div className="space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100"
          >
            Analysis in progress
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Searching for suspicious devices on the network
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 dark:text-gray-500"
          >
            This analysis may take several minutes depending on network size
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="min-h-[3rem] flex items-center justify-center"
          >
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-center max-w-md">
              {currentScanningDevice}
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="relative">
          <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <div className="flex items-center space-x-3">
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {Math.round(scanProgress)}%
            </span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {devicesFound > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
            <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-300 font-medium">
              {devicesFound} device{devicesFound > 1 ? "s" : ""} found
            </span>
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
);

const ResultsScreen = ({
  scanResults,
  onReset,
  onExport,
  networkWarning,
  getWarningMessage,
}: {
  scanResults: ScanResult[];
  onReset: () => void;
  onExport: () => void;
  networkWarning?: string | null;
  getWarningMessage?: (warningType: string) => {
    title: string;
    message: string;
    suggestions: string[];
  } | null;
}) => {
  const highRiskDevices = scanResults.filter(
    (d) => d.suspicionLevel === "high"
  );
  const mediumRiskDevices = scanResults.filter(
    (d) => d.suspicionLevel === "medium"
  );
  const lowRiskDevices = scanResults.filter((d) => d.suspicionLevel === "low");

  const warningInfo =
    networkWarning && getWarningMessage
      ? getWarningMessage(networkWarning)
      : null;

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-8 py-8"
    >
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-green-500/25"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Analysis completed
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            {scanResults.length} device{scanResults.length > 1 ? "s" : ""}{" "}
            analyzed
          </p>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Important:</strong> A device marked as "normal" still
              requires manual verification. Network analysis cannot detect all
              types of surveillance equipment.
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-8 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {highRiskDevices.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Suspicious
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {mediumRiskDevices.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              To check
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {lowRiskDevices.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Normal
            </div>
          </div>
        </div>
      </div>

      {warningInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-yellow-50/80 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                  {warningInfo.title}
                </h3>
                <p className="text-yellow-700 dark:text-yellow-400 mb-3">
                  {warningInfo.message}
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  {warningInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {scanResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-gray-100 dark:bg-dark-800 rounded-xl max-w-2xl mx-auto"
        >
          <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No devices detected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            The network appears empty or devices are not responding to scans
          </p>
        </motion.div>
      )}

      {highRiskDevices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6" />
            <span>Suspicious devices detected</span>
          </h3>
          <div className="grid gap-6">
            {highRiskDevices.map((device, index) => (
              <DeviceCard key={device.ip} device={device} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      {mediumRiskDevices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 flex items-center space-x-3 mb-6">
            <Eye className="w-6 h-6" />
            <span>Devices to check</span>
          </h3>

          {/* Explanatory message for .254 addresses */}
          {mediumRiskDevices.some((device) => device.ip.endsWith(".254")) && (
            <div className="mb-4 p-4 bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>.254 addresses:</strong> These are typically legitimate
                network equipment (routers, modems, internet boxes). Verify that
                this is indeed your equipment or your host's equipment.
              </p>
            </div>
          )}

          <div className="grid gap-6">
            {mediumRiskDevices.map((device, index) => (
              <DeviceCard key={device.ip} device={device} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      {lowRiskDevices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 flex items-center space-x-3 mb-6">
            <CheckCircle className="w-6 h-6" />
            <span>Normal devices</span>
          </h3>
          <div className="grid gap-6">
            {lowRiskDevices.map((device, index) => (
              <DeviceCard key={device.ip} device={device} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-4 pt-8"
      >
        <div className="flex justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="btn-secondary"
          >
            New analysis
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExport}
            className="btn-primary"
          >
            Export report
          </motion.button>
        </div>

        {highRiskDevices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="alert-danger max-w-2xl mx-auto"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold">Suspicious devices detected</p>
                <p className="text-sm mt-1">
                  We recommend physically checking these devices and contacting
                  your host if you have doubts about their legitimacy.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const ErrorScreen = ({ onReset }: { onReset: () => void }) => (
  <motion.div
    key="error"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="flex flex-col justify-center min-h-full text-center space-y-8"
  >
    <div className="w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto">
      <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
    </div>

    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Analysis error
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        An error occurred during network analysis
      </p>
    </div>

    <button onClick={onReset} className="btn-primary mx-auto">
      Try again
    </button>
  </motion.div>
);

const NmapMissingScreen = ({ onCheck }: { onCheck: () => void }) => (
  <motion.div
    key="nmap-missing"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100 }}
  >
    <div className="flex flex-col justify-center min-h-full py-12">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-950/30 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Nmap required
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            AirSafe requires Nmap to function. Please install it and restart the
            application.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-left">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
              Installation instructions:
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-2">
              <li>
                • <strong>Windows:</strong> Download from{" "}
                <a
                  href="https://nmap.org/dist/nmap-7.98-setup.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-200"
                >
                  nmap.org
                </a>
              </li>
            </ul>
          </div>

          <div className="space-x-4">
            <button
              onClick={onCheck}
              className="bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
            >
              Check installation
            </button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export { ScanningScreen, ResultsScreen, ErrorScreen, NmapMissingScreen };
