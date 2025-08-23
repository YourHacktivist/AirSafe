import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  XCircle,
  Lock,
  Heart,
  Wifi,
  Info,
  Eye,
  AlertTriangle,
  WifiOff,
  Globe,
  Router,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TitleBar from "./components/TitleBar";
import InfoPopup from "./components/InfoPopup";
import {
  ScanningScreen,
  ResultsScreen,
  ErrorScreen,
  NmapMissingScreen,
} from "./components/Screens";
import NetworkErrorScreen from "./components/NetworkErrorScreen";
import { Device, ScanResult, ScanStep } from "./types";

interface NetworkErrorMessage {
  title: string;
  message: string;
  icon: React.ReactNode;
  suggestions: string[];
}

interface NetworkWarningMessage {
  title: string;
  message: string;
  suggestions: string[];
}

function App(): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<ScanStep>("welcome");
  const [nmapAvailable, setNmapAvailable] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [currentScanningDevice, setCurrentScanningDevice] =
    useState<string>("");
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [networkWarning, setNetworkWarning] = useState<string | null>(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("airsafe-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

    setDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);

    checkNmapInstallation();
  }, []);

  const toggleDarkMode = (): void => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("airsafe-theme", newDarkMode ? "dark" : "light");
  };

  const checkNmapInstallation = async (): Promise<void> => {
    if (window.electronAPI) {
      try {
        const available = await window.electronAPI.checkNmap();
        setNmapAvailable(available);
        if (!available) {
          setCurrentStep("nmap-missing");
        }
      } catch (error) {
        console.error("Error checking Nmap:", error);
        setNmapAvailable(false);
        setCurrentStep("nmap-missing");
      }
    } else {
      console.log("Web mode detected: Nmap required for actual functionality");
      setNmapAvailable(false);
      setCurrentStep("nmap-missing");
    }
  };

  const getNetworkErrorMessage = (errorType: string): NetworkErrorMessage => {
    switch (errorType) {
      case "NETWORK_DISCONNECTED":
        return {
          title: "No network connection detected",
          message:
            "Please connect to a WiFi or Ethernet network to use AirSafe.",
          icon: (
            <WifiOff className="w-10 h-10 text-red-600 dark:text-red-400" />
          ),
          suggestions: [
            "Enable WiFi on your device",
            "Connect to your Airbnb accommodation WiFi network",
            "Check that the network is working (open a website to test)",
          ],
        };
      case "NO_REAL_NETWORK_CONNECTION":
        return {
          title: "WiFi connection required",
          message:
            "AirSafe requires a real WiFi connection to analyze your Airbnb accommodation network. Automatic connections (169.254.x.x) are not sufficient.",
          icon: (
            <WifiOff className="w-10 h-10 text-red-600 dark:text-red-400" />
          ),
          suggestions: [
            "Connect to your Airbnb accommodation WiFi network",
            "Ask your host for the WiFi password",
            "Check that you are properly connected (not just 'Connected, no internet')",
            "Restart your WiFi if necessary",
          ],
        };
      case "NETWORK_DISCONNECTED_APIPA":
        return {
          title: "Limited network connection (APIPA)",
          message:
            "Your computer has an automatic IP address (169.254.x.x) which indicates a lack of complete network connectivity.",
          icon: (
            <WifiOff className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          ),
          suggestions: [
            "Restart your WiFi router",
            "Reconnect to the WiFi network",
            "Check that DHCP is enabled on the router",
            "Contact the host if the problem persists",
          ],
        };
      case "VIRTUAL_NETWORK_ONLY":
        return {
          title: "Virtual network only",
          message:
            "Only virtual networks (VMware, VirtualBox) have been detected. To analyze an Airbnb accommodation, you must be connected to the real WiFi network.",
          icon: (
            <Router className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          ),
          suggestions: [
            "Disable virtual network adapters",
            "Connect to the accommodation WiFi network",
            "This situation is normal if you are testing the application",
          ],
        };
      case "PUBLIC_IP_DETECTED":
        return {
          title: "Public IP address detected",
          message:
            "AirSafe can only analyze private local networks for security reasons.",
          icon: (
            <Globe className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          ),
          suggestions: [
            "Connect to the local WiFi network",
            "Avoid using VPNs or proxies",
            "Check your network configuration",
          ],
        };
      case "NO_VALID_INTERFACE":
        return {
          title: "No valid network interface",
          message: "No valid network interface was found on this device.",
          icon: <Router className="w-10 h-10 text-red-600 dark:text-red-400" />,
          suggestions: [
            "Restart your computer",
            "Check your network card drivers",
            "Contact technical support if the problem persists",
          ],
        };
      default:
        return {
          title: "Network configuration error",
          message: "An error occurred during network configuration.",
          icon: (
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          ),
          suggestions: [
            "Check your network connection",
            "Restart the application",
            "Contact support if necessary",
          ],
        };
    }
  };

  const getWarningMessage = (
    warningType: string
  ): NetworkWarningMessage | null => {
    switch (warningType) {
      case "MINIMAL_CONNECTIVITY":
        return {
          title: "Limited connectivity detected",
          message:
            "Only the router/gateway has been detected. You may not be fully connected to the local network.",
          suggestions: [
            "Check that you are properly connected to WiFi",
            "Wait a few seconds and restart the scan",
            "Move closer to the WiFi router",
          ],
        };
      case "VIRTUAL_NETWORK_ONLY":
        return {
          title: "Virtual network detected",
          message:
            "You appear to be connected only to a virtual network (VMware, VirtualBox, etc.). This is not a real Airbnb network.",
          suggestions: [
            "Disable virtual network adapters",
            "Connect to the real accommodation WiFi network",
            "This situation is normal if you are testing the application",
          ],
        };
      case "NO_DEVICES_FOUND":
        return {
          title: "No devices detected",
          message:
            "The scan found no devices on the network. This may be normal in some cases.",
          suggestions: [
            "The network may be empty (normal situation)",
            "Devices may be configured to be invisible",
            "Your connection may be isolated for security",
          ],
        };
      default:
        return null;
    }
  };

  const startNetworkScan = async (): Promise<void> => {
    if (!nmapAvailable) {
      setCurrentStep("nmap-missing");
      return;
    }

    setIsScanning(true);
    setCurrentStep("scanning");
    setScanProgress(0);
    setCurrentScanningDevice("");
    setNetworkError(null);
    setNetworkWarning(null);

    try {
      setCurrentScanningDevice("Checking network connectivity...");
      setScanProgress(5);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setCurrentScanningDevice("Network discovery with Nmap...");
      setScanProgress(10);

      console.log("Starting network scan...");
      const networkResult = await window.electronAPI.discoverNetwork();

      let networkDevices: Device[];
      let warning: string | undefined;

      if (Array.isArray(networkResult)) {
        networkDevices = networkResult;
        warning = undefined;
      } else {
        networkDevices = networkResult.devices;
        warning = networkResult.warning;
      }

      console.log("Devices found:", networkDevices);
      console.log("Warning:", warning);

      setDevices(networkDevices);
      setScanProgress(30);

      if (warning) {
        setNetworkWarning(warning);

        if (warning === "VIRTUAL_NETWORK_ONLY") {
          setCurrentScanningDevice(
            "Virtual network detected - Analyzing in test mode..."
          );
        } else if (warning === "MINIMAL_CONNECTIVITY") {
          setCurrentScanningDevice(
            "Limited connectivity - Analyzing detected devices..."
          );
        } else if (warning === "NO_DEVICES_FOUND") {
          setCurrentScanningDevice(
            "No devices detected - Network probably empty"
          );
          setScanProgress(100);
          setScanResults([]);
          setCurrentStep("results");
          setIsScanning(false);
          return;
        }
      }

      if (networkDevices.length === 0) {
        setCurrentScanningDevice("No devices detected on the network");
        setScanProgress(100);
        setScanResults([]);
        setCurrentStep("results");
        setIsScanning(false);
        return;
      }

      const results: ScanResult[] = [];
      const totalDevices = networkDevices.length;

      for (let i = 0; i < totalDevices; i++) {
        const device = networkDevices[i];
        setCurrentScanningDevice(`Detailed analysis of ${device.ip}...`);

        try {
          console.log(`Scanning device: ${device.ip}`);
          const deviceInfo = await window.electronAPI.scanDevice(device.ip);

          const enrichedInfo: ScanResult = {
            ...deviceInfo,
            hostname: deviceInfo.hostname || device.hostname || device.name,
            vendor: deviceInfo.vendor || device.vendor,
            os: deviceInfo.os || device.os,
            deviceType: deviceInfo.deviceType || device.deviceType,
            mac: device.mac,
          };

          results.push(enrichedInfo);
          console.log(`Scan completed for ${device.ip}:`, enrichedInfo);
        } catch (error) {
          console.error(`Error scanning ${device.ip}:`, error);

          results.push({
            ip: device.ip,
            hostname: device.hostname || device.name,
            vendor: device.vendor,
            os: device.os,
            deviceType: device.deviceType,
            mac: device.mac,
            ports: [],
            services: [],
            suspicionLevel: "low",
            reasons: ["Limited scan - device protected or inaccessible"],
            trustScore: 70,
            lastSeen: new Date().toISOString(),
          });
        }

        const progress = 30 + (i + 1) * (65 / totalDevices);
        setScanProgress(progress);

        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setScanProgress(95);
      setCurrentScanningDevice("Analyzing results...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      setScanProgress(100);
      setCurrentScanningDevice("Analysis completed");

      console.log("Final results:", results);
      setScanResults(results);
      setCurrentStep("results");
    } catch (error) {
      console.error("Error during scan:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("NETWORK_DISCONNECTED") ||
        errorMessage.includes("NETWORK_DISCONNECTED_APIPA") ||
        errorMessage.includes("NO_REAL_NETWORK_CONNECTION") ||
        errorMessage.includes("VIRTUAL_NETWORK_ONLY") ||
        errorMessage.includes("PUBLIC_IP_DETECTED") ||
        errorMessage.includes("NO_VALID_INTERFACE") ||
        errorMessage.includes("NETWORK_CONFIG_ERROR")
      ) {
        setNetworkError(errorMessage);
        setCurrentStep("network-error");
      } else {
        setCurrentStep("error");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const resetScan = (): void => {
    setCurrentStep("welcome");
    setScanResults([]);
    setDevices([]);
    setScanProgress(0);
    setCurrentScanningDevice("");
    setNetworkError(null);
    setNetworkWarning(null);
  };

  const exportReport = (): void => {
    const highRiskDevices = scanResults.filter(
      (d) => d.suspicionLevel === "high"
    );
    const mediumRiskDevices = scanResults.filter(
      (d) => d.suspicionLevel === "medium"
    );
    const lowRiskDevices = scanResults.filter(
      (d) => d.suspicionLevel === "low"
    );

    const reportData = {
      timestamp: new Date().toISOString(),
      devicesFound: scanResults.length,
      highRiskCount: highRiskDevices.length,
      mediumRiskCount: mediumRiskDevices.length,
      lowRiskCount: lowRiskDevices.length,
      networkWarning: networkWarning,
      devices: scanResults,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `airsafe-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-500">
      <TitleBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <div className="h-[calc(100vh-3rem)]">
        <div className="container mx-auto px-6 h-full max-w-7xl">
          <AnimatePresence mode="wait">
            {currentStep === "welcome" && (
              <WelcomeScreen
                nmapAvailable={nmapAvailable}
                onStartScan={startNetworkScan}
                onShowInfo={() => setShowInfoPopup(true)}
              />
            )}

            {currentStep === "scanning" && (
              <ScanningScreen
                scanProgress={scanProgress}
                currentScanningDevice={currentScanningDevice}
                devicesFound={devices.length}
              />
            )}

            {currentStep === "results" && (
              <ResultsScreen
                scanResults={scanResults}
                onReset={resetScan}
                onExport={exportReport}
                networkWarning={networkWarning}
                getWarningMessage={getWarningMessage}
              />
            )}

            {currentStep === "error" && <ErrorScreen onReset={resetScan} />}

            {currentStep === "network-error" && (
              <NetworkErrorScreen
                errorType={networkError}
                getErrorMessage={getNetworkErrorMessage}
                onReset={resetScan}
              />
            )}

            {currentStep === "nmap-missing" && (
              <NmapMissingScreen onCheck={checkNmapInstallation} />
            )}
          </AnimatePresence>
          <InfoPopup
            isOpen={showInfoPopup}
            onClose={() => setShowInfoPopup(false)}
          />
        </div>
      </div>
    </div>
  );
}

interface WelcomeScreenProps {
  nmapAvailable: boolean | null;
  onStartScan: () => void;
  onShowInfo: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  nmapAvailable,
  onStartScan,
  onShowInfo,
}) => (
  <motion.div
    key="welcome"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100 }}
    className="flex flex-col min-h-full"
  >
    <div className="flex-1 flex flex-col justify-center py-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img
                  src="./logo.png"
                  alt="AirSafe Logo"
                  className="w-12 h-12"
                />
                <span className="text-2xl font-bold ">AirSafe</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Stay safe in your
                <span
                  className="block bg-gradient-to-r from-blue-500 to-purple-500 text-transparent"
                  style={{
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Airbnb rental
                </span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                Automatically detect hidden cameras and suspicious devices by
                analyzing the WiFi network with Nmap technology
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: nmapAvailable ? 1.02 : 1 }}
                  whileTap={{ scale: nmapAvailable ? 0.98 : 1 }}
                  onClick={onStartScan}
                  disabled={!nmapAvailable}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="flex items-center space-x-3 justify-center">
                    <Search className="w-5 h-5" />
                    <span>Analyze my network</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onShowInfo}
                  className="p-4 bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-600 dark:text-blue-400 hover:text-gray-700 dark:hover:text-blue-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  title="About AirSafe"
                >
                  <Info className="w-5 h-5" />
                </motion.button>
              </div>

              {nmapAvailable === false && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border border-red-200 dark:border-red-800 rounded-xl"
                >
                  <div className="flex items-center space-x-3 text-red-800 dark:text-red-300">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold">Nmap required</p>
                      <p className="text-sm">
                        Please install Nmap to use AirSafe
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl blur-3xl"></div>

              <div className="relative bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-dark-700/50 shadow-2xl">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Wifi className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Search className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <AlertTriangle className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Eye className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-7 h-7 text-white"
                      >
                        <path d="M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97" />
                        <path d="M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z" />
                        <path d="M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15" />
                        <path d="M2 21v-4" />
                        <path d="M7 9h.01" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Real-time analysis
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                  </div>

                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Simple
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Intuitive
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Secure
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <FeatureCard
            icon={<Search className="w-6 h-6 text-white" />}
            iconBg="from-blue-500 to-blue-600"
            title="One-click scan"
            description="Just click one button and the app does all the work for you. No technical knowledge required."
          />
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-white"
              >
                <path d="M16.75 12h3.632a1 1 0 0 1 .894 1.447l-2.034 4.069a1 1 0 0 1-1.708.134l-2.124-2.97" />
                <path d="M17.106 9.053a1 1 0 0 1 .447 1.341l-3.106 6.211a1 1 0 0 1-1.342.447L3.61 12.3a2.92 2.92 0 0 1-1.3-3.91L3.69 5.6a2.92 2.92 0 0 1 3.92-1.3z" />
                <path d="M2 19h3.76a2 2 0 0 0 1.8-1.1L9 15" />
                <path d="M2 21v-4" />
                <path d="M7 9h.01" />
              </svg>
            }
            iconBg="from-pink-500 to-purple-600"
            title="Professional technology"
            description="Uses Nmap, a trusted tool used by security experts worldwide, made simple for everyone."
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6 text-white" />}
            iconBg="from-purple-500 to-purple-600"
            title="Private & secure"
            description="No data is transmitted over the internet. Everything stays local on your device for complete privacy."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="max-w-2xl mx-auto p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start space-x-3 text-blue-800 dark:text-blue-300">
              <Wifi className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold text-sm">
                  WiFi connection required
                </p>
                <p className="text-xs mt-1">
                  You must be connected to your Airbnb accommodation WiFi
                  network to use this application. Automatic or virtual
                  connections are not sufficient.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-center"
            >
              <motion.a
                href="https://github.com/YourHacktivist"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer"
              >
                <span>Made with</span>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    color: ["#ef4444", "#f87171", "#ef4444"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                </motion.div>
                <span>by Osiris</span>
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  iconBg,
  title,
  description,
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="group p-6 rounded-2xl bg-white/60 dark:bg-dark-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-dark-700/50 hover:bg-white/80 dark:hover:bg-dark-800/80 transition-all duration-300 shadow-lg hover:shadow-xl"
  >
    <div
      className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
    >
      {icon}
    </div>
    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      {description}
    </p>
  </motion.div>
);

export default App;
