import React from "react";
import { motion } from "framer-motion";
import {
  X,
  Search,
  Shield,
  ExternalLink,
  Eye,
  Camera,
  AlertTriangle,
  Wifi,
} from "lucide-react";

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoPopup: React.FC<InfoPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white/95 dark:bg-dark-800/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-dark-700/50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6 border-b border-gray-200/50 dark:border-dark-700/50">
          <div className="flex items-center space-x-3">
            <img src="./logo.png" alt="AirSafe Logo" className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                AirSafe
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Protect your privacy in short-term rentals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Camera className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  Hidden Cameras: A Real Threat in Short-Term Rentals
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400">
                  Reports of hidden surveillance devices in Airbnb and vacation
                  rentals have increased significantly. These devices are often
                  disguised as everyday objects and connected to the property's
                  WiFi network.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              The Reality of Hidden Surveillance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50/80 dark:bg-dark-900/50 rounded-xl p-4 border border-gray-200/50 dark:border-dark-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-950/50 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Increasing Reports
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      News cases reported monthly
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/80 dark:bg-dark-900/50 rounded-xl p-4 border border-gray-200/50 dark:border-dark-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-950/50 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Hard to Detect
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Disguised as common objects
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Common Camera Hiding Spots
            </h3>
            <div className="bg-yellow-50/80 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    Bedrooms & Bathrooms:
                  </p>
                  <ul className="space-y-1 text-yellow-700 dark:text-yellow-400">
                    <li>• Smoke detectors</li>
                    <li>• Air fresheners</li>
                    <li>• Picture frames</li>
                    <li>• Alarm clocks</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    Living Areas:
                  </p>
                  <ul className="space-y-1 text-yellow-700 dark:text-yellow-400">
                    <li>• Smart TV devices</li>
                    <li>• Decorative objects</li>
                    <li>• Power outlets</li>
                    <li>• Books or ornaments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              How AirSafe Protects You
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Network Scanning
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Detects devices connected to the same WiFi network,
                    including hidden cameras that need internet access for
                    remote viewing
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/50">
                <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
                    Suspicious Device Identification
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-400">
                    Identifies devices with camera-like characteristics: RTSP
                    streams, suspicious ports, or known surveillance equipment
                    signatures
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-800/50">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">
                    Risk Assessment
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Provides clear alerts about potentially suspicious devices,
                    helping you take action to protect your privacy
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Important Limitations
            </h3>
            <div className="bg-gray-50/80 dark:bg-dark-900/50 rounded-xl p-4 border border-gray-200/50 dark:border-dark-700/50">
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>
                    AirSafe can only detect network-connected devices.
                  </strong>{" "}
                  It cannot find:
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Offline cameras recording to local storage</li>
                  <li>
                    • Devices on separate networks or using cellular connections
                  </li>
                  <li>
                    • Very sophisticated spy equipment designed to be
                    undetectable
                  </li>
                </ul>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  Always combine network scanning with physical inspection of
                  your accommodation.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Additional Privacy Protection Tips
            </h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Check smoke detectors and air fresheners for unusual LED
                  lights or lenses
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Use your phone's camera to look for infrared lights (appears
                  as white dots on camera)
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Cover or unplug devices you're unsure about during your stay
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Report suspicious devices to your host and platform (Airbnb,
                  VRBO, etc.)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Legal and Ethical Use
            </h3>
            <div className="bg-yellow-50/80 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Important:</strong> Only use AirSafe on networks you are
                authorized to access (such as your rental accommodation's WiFi).
                Network scanning without permission may violate local laws. This
                tool is designed for personal security verification in
                accommodations where you are staying.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/50 dark:border-dark-700/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Start Security Scan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                window.open(
                  "https://www.airbnb.com/help/article/887/what-are-airbnbs-rules-about-security-cameras-and-other-recording-devices",
                  "_blank"
                )
              }
              className="flex items-center justify-center space-x-2 bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-gray-300 font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Airbnb Camera Policy</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InfoPopup;
