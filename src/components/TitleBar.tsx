import React, { useState, useEffect } from "react";
import { Moon, Sun, Minus, Square, X } from "lucide-react";
import { motion } from "framer-motion";

interface TitleBarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({ darkMode, toggleDarkMode }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI) {
        try {
          const maximized = await window.electronAPI.windowIsMaximized();
          setIsMaximized(maximized);
        } catch (error) {
          console.error("Error checking maximized state:", error);
        }
      }
    };
    checkMaximized();
  }, []);

  const handleMinimize = async () => {
    if (window.electronAPI) {
      try {
        console.log("Minimize button clicked");
        await window.electronAPI.windowMinimize();
      } catch (error) {
        console.error("Error minimizing window:", error);
      }
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      try {
        console.log("Maximize button clicked");
        await window.electronAPI.windowMaximize();
        const newState = await window.electronAPI.windowIsMaximized();
        setIsMaximized(newState);
      } catch (error) {
        console.error("Error maximizing window:", error);
      }
    }
  };

  const handleClose = async () => {
    if (window.electronAPI) {
      try {
        console.log("Close button clicked");
        await window.electronAPI.windowClose();
      } catch (error) {
        console.error("Error closing window:", error);
      }
    }
  };

  const handleToggleDarkMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Dark mode toggle clicked");
    toggleDarkMode();
  };

  return (
    <div className="titlebar">
      <div className="titlebar-content">
        <img
          src="./logo.png"
          alt="AirSafe Logo"
          className="w-8 h-8 rounded-lg"
        />
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          AirSafe
        </span>
      </div>

      <div className="titlebar-controls">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleDarkMode}
          className="titlebar-button"
          title={darkMode ? "Mode clair" : "Mode sombre"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </motion.button>

        <div className="window-controls">
          <button
            onClick={handleMinimize}
            className="window-control"
            title="Réduire"
          >
            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleMaximize}
            className="window-control"
            title={isMaximized ? "Restaurer" : "Agrandir"}
          >
            <Square className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleClose}
            className="window-control close"
            title="Fermer"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
