export interface Device {
  name: string;
  ip: string;
  status: 'up' | 'down';
  mac?: string;
  vendor?: string;
  hostname?: string;
  os?: string;
  deviceType?: string;
  isGateway?: boolean;
}

export interface Port {
  port: string;
  service: string;
  version?: string;
  state: 'open' | 'closed' | 'filtered';
}

export interface ScanResult {
  ip: string;
  hostname?: string;
  mac?: string;
  vendor?: string;
  os?: string;
  deviceType?: string;
  ports: Port[];
  services: string[];
  suspicionLevel: 'low' | 'medium' | 'high';
  reasons: string[];
  trustScore: number;
  lastSeen?: string;
}

export interface NetworkInfo {
  hasWifi: boolean;
  hasEthernet: boolean;
  activeInterfaces: Array<{
    name: string;
    ip: string;
    type: 'wifi' | 'ethernet';
  }>;
  suggestedRange?: string;
}

export interface NetworkScanResult {
  devices: Device[];
  warning?: 'MINIMAL_CONNECTIVITY' | 'NO_DEVICES_FOUND';
  networkInfo?: NetworkInfo;
}

export type ScanStep = 'welcome' | 'scanning' | 'results' | 'error' | 'nmap-missing' | 'network-error';

export interface ElectronAPI {
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  windowIsMaximized: () => Promise<boolean>;
  checkNmap: () => Promise<boolean>;
  discoverNetwork: () => Promise<NetworkScanResult | Device[]>;
  scanDevice: (ip: string) => Promise<ScanResult>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}