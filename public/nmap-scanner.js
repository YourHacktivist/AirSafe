const { spawn } = require('child_process');
const os = require('os');
const nmapDetector = require('./nmap-detector');

let enhancedDetector = null;
let useEnhancedDetection = false;

try {
  enhancedDetector = require('./enhanced-device-detector');
  useEnhancedDetection = true;
  console.log('Enhanced device detection loaded successfully');
} catch (error) {
  console.warn('Enhanced device detection not available, using basic detection:', error.message);
  useEnhancedDetection = false;
}

function checkNetworkConnectivity() {
  const interfaces = os.networkInterfaces();
  let hasActiveConnection = false;
  let networkInfo = {
    hasWifi: false,
    hasEthernet: false,
    hasVirtualOnly: false,
    activeInterfaces: [],
    suggestedRange: null,
    connectionType: 'none'
  };
  
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        const interfaceInfo = {
          name,
          ip: net.address,
          type: determineInterfaceType(name, net.address),
          isVirtual: isVirtualInterface(name),
          isAPipa: isAPipaAddress(net.address)
        };
        
        networkInfo.activeInterfaces.push(interfaceInfo);
        
        // Ignore APIPA interfaces (169.254.x.x) as they indicate lack of connectivity
        if (!interfaceInfo.isAPipa) {
          if (interfaceInfo.type === 'wifi' && !interfaceInfo.isVirtual) {
            networkInfo.hasWifi = true;
            hasActiveConnection = true;
          } else if (interfaceInfo.type === 'ethernet' && !interfaceInfo.isVirtual) {
            networkInfo.hasEthernet = true;
            hasActiveConnection = true;
          } else if (interfaceInfo.isVirtual) {
            networkInfo.hasVirtualOnly = true;
          }
        }
        
        console.log(`Interface analyzed: ${name} -> ${net.address} (${interfaceInfo.type}, virtual: ${interfaceInfo.isVirtual}, APIPA: ${interfaceInfo.isAPipa})`);
      }
    }
  }
  
  if (networkInfo.hasWifi) {
    networkInfo.connectionType = 'wifi';
  } else if (networkInfo.hasEthernet) {
    networkInfo.connectionType = 'ethernet';
  } else if (networkInfo.hasVirtualOnly) {
    networkInfo.connectionType = 'virtual-only';
  } else {
    networkInfo.connectionType = 'none';
  }
  
  return { hasActiveConnection, networkInfo };
}

function determineInterfaceType(name, ip) {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('wi-fi') || nameLower.includes('wifi') || 
      nameLower.includes('wlan') || nameLower.includes('wireless')) {
    return 'wifi';
  }
  
  if (nameLower.includes('ethernet') || nameLower.includes('eth') || 
      nameLower.includes('lan') || nameLower.includes('local')) {
    return 'ethernet';
  }
  
  return 'unknown';
}

function isVirtualInterface(name) {
  const virtualKeywords = [
    'vmware', 'virtualbox', 'vbox', 'hyper-v', 'docker', 'wsl',
    'vmnet', 'veth', 'tap', 'tun', 'loopback', 'teredo', 'tunnel'
  ];
  
  const nameLower = name.toLowerCase();
  return virtualKeywords.some(keyword => nameLower.includes(keyword));
}

function isAPipaAddress(ip) {
  return ip.startsWith('169.254.');
}

function isPrivateIP(ip) {
  const parts = ip.split('.').map(Number);
  
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  if (parts[0] === 10) return true;
  
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  if (parts[0] === 169 && parts[1] === 254) return true;
  
  return false;
}

function getLocalNetworkRange() {
  const { hasActiveConnection, networkInfo } = checkNetworkConnectivity();
  
  console.log('Connectivity analysis:', {
    hasActiveConnection,
    connectionType: networkInfo.connectionType,
    hasWifi: networkInfo.hasWifi,
    hasEthernet: networkInfo.hasEthernet,
    hasVirtualOnly: networkInfo.hasVirtualOnly,
    interfaceCount: networkInfo.activeInterfaces.length
  });
  
  const hasOnlyAPipa = networkInfo.activeInterfaces.every(iface => 
    iface.isAPipa || iface.isVirtual
  );
  
  if (hasOnlyAPipa) {
    console.log('ðŸš« Only APIPA or virtual addresses detected');
    throw new Error('NETWORK_DISCONNECTED_APIPA');
  }
  
  if (!hasActiveConnection) {
    if (networkInfo.connectionType === 'virtual-only') {
      console.log('âš ï¸ Only virtual interfaces detected');
      throw new Error('VIRTUAL_NETWORK_ONLY');
    }
    
    throw new Error('NETWORK_DISCONNECTED');
  }
  
  const realConnections = networkInfo.activeInterfaces.filter(iface => 
    !iface.isAPipa && !iface.isVirtual
  );
  
  if (realConnections.length === 0) {
    console.log('ðŸš« No real network connection found (only APIPA/virtual)');
    throw new Error('NO_REAL_NETWORK_CONNECTION');
  }
  
  let selectedInterface = networkInfo.activeInterfaces.find(iface => 
    iface.type === 'wifi' && !iface.isVirtual && !iface.isAPipa
  ) || networkInfo.activeInterfaces.find(iface => 
    iface.type === 'ethernet' && !iface.isVirtual && !iface.isAPipa
  );
  
  if (!selectedInterface) {
    console.log('ðŸš« No valid real network interface found');
    throw new Error('NO_REAL_NETWORK_CONNECTION');
  }
  
  const ip = selectedInterface.ip;
  console.log(`Selected interface: ${selectedInterface.name} (${selectedInterface.type}) -> ${ip}`);
  
  if (!isPrivateIP(ip) || isAPipaAddress(ip)) {
    throw new Error('NO_REAL_NETWORK_CONNECTION');
  }
  
  const range = generateNetworkRange(ip);
  console.log(`Using network: ${range}`);
  
  return { range, networkInfo };
}

function generateNetworkRange(ip) {
  if (ip.startsWith('192.168.')) {
    return `${ip.split('.').slice(0, 3).join('.')}.0/24`;
  } else if (ip.startsWith('10.')) {
    const parts = ip.split('.');
    return `10.${parts[1]}.${parts[2]}.0/24`;
  } else if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1]);
    if (second >= 16 && second <= 31) {
      const parts = ip.split('.');
      return `172.${parts[1]}.${parts[2]}.0/24`;
    } else {
      throw new Error('INVALID_PRIVATE_RANGE');
    }
  } else if (ip.startsWith('169.254.')) {
    return `${ip.split('.').slice(0, 3).join('.')}.0/24`;
  } else {
    throw new Error('UNSUPPORTED_IP_RANGE');
  }
}

function parseNmapXML(xmlData) {
  const devices = [];
  
  const hostRegex = /<host[^>]*>[\s\S]*?<\/host>/g;
  const hosts = xmlData.match(hostRegex) || [];
  
  console.log(`Parsing XML, ${hosts.length} hosts found`);
  
  hosts.forEach((hostXML, index) => {
    const device = {};
    
    const addressMatch = hostXML.match(/<address addr="([^"]+)" addrtype="ipv4"/);
    if (addressMatch) {
      device.ip = addressMatch[1];
    }
    
    const macMatch = hostXML.match(/<address addr="([^"]+)" addrtype="mac"[^>]*vendor="([^"]*)"/);
    if (macMatch) {
      device.mac = macMatch[1];
      device.vendor = macMatch[2] || 'Unknown';
    }
    
    const hostnameMatch = hostXML.match(/<hostname name="([^"]+)"/);
    if (hostnameMatch) {
      device.hostname = hostnameMatch[1];
      device.name = hostnameMatch[1];
    }
    
    const statusMatch = hostXML.match(/<status state="([^"]+)"/);
    device.status = statusMatch ? statusMatch[1] : 'unknown';
    
    device.deviceType = determineDeviceType(device);
    
    if (device.ip && (device.ip.endsWith('.1') || device.ip.endsWith('.254') || device.ip.endsWith('.100'))) {
      device.isGateway = true;
      
      if (device.deviceType !== 'isp-modem' && device.deviceType !== 'freebox') {
        device.deviceType = 'router';
      }
      
      if (device.vendor && device.vendor.toLowerCase().includes('freebox')) {
        device.deviceType = 'isp-modem';
      }
    }
    
    if (device.ip && (device.ip.startsWith('192.168.100.') || 
        device.ip.startsWith('192.168.200.') || 
        device.ip.startsWith('172.16.'))) {
      device.isVirtualGateway = true;
      device.deviceType = 'virtual-machine';
    }
    
    if (device.ip && device.status === 'up') {
      console.log(`Device ${index + 1}: ${device.ip} (${device.hostname || 'no hostname'}) - ${device.deviceType}`);
      devices.push(device);
    }
  });
  
  return devices;
}

function determineDeviceType(device) {
  if (useEnhancedDetection && enhancedDetector) {
    try {
      return enhancedDetector.determineDeviceType(device);
    } catch (error) {
      console.warn('Enhanced detection failed, using fallback:', error.message);
    }
  }
  
  return determineDeviceTypeBasic(device);
}

function determineDeviceTypeBasic(device) {
  const hostname = (device.hostname || '').toLowerCase();
  const vendor = (device.vendor || '').toLowerCase();
  const name = (device.name || '').toLowerCase();
  const ip = device.ip || '';
  
  if (vendor.includes('vmware') || hostname.includes('vmware') ||
      ip.startsWith('192.168.100.') || ip.startsWith('192.168.200.')) {
    return 'virtual-machine';
  }

const ispPatterns = [
  'freebox','orange','livebox','sfr','neufbox','numericable','bbox','bouygues',
  'dartybox','alicebox','vodafone','telekom','dt','o2','bt','verizon','comcast',
  'charter','xfinity','rogers','bell','telus','at&t','cox','spectrum','sky','virgin'
];

if (ispPatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'isp-modem';
}
  
const routerPatterns = [
  'router','gateway','netgear','linksys','tp-link','tplink','asus','d-link','dlink',
  'zyxel','huawei','xiaomi','mikrotik','ubiquiti','juniper','cisco','belkin'
];

if (ip.endsWith('.1') || routerPatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'router';
}
  
const mobilePatterns = [
  'iphone','ipad','ipod','android','phone','samsung','sm-','xiaomi','huawei',
  'oneplus','oppo','realme','vivo','sony','ericsson','lg','nokia','motorola',
  'google','pixel','zte','lenovo','honor','meizu'
];

if (mobilePatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'mobile';
}
  
const smartTvPatterns = [
  'tv','samsung','lg','sony','chromecast','firetv','roku','philips','panasonic',
  'sharp','tcl','hisense','xiaomi','mi-tv','vizio','element','insignia'
];

if (smartTvPatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'smart-tv';
}
  
const computerPatterns = [
  'desktop','laptop','pc-','macbook','imac','windows','microsoft',
  'dell','hp','lenovo','asus','acer','msi','gigabyte','razer','alienware',
  'thinkpad','chromebook','surface'
];

if (computerPatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'computer';
}
  
const smartSpeakerPatterns = [
  'echo','alexa','nest','google','homepod','amazon','sonos','samsung','bose','xiaomi','lenovo'
];

if (smartSpeakerPatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'smart-speaker';
}
  
const cameraPatterns = [
  'cam','camera','esp32','arduino','surveillance','ipcam','security',
  'hikvision','dahua','axis','reolink','ezviz','tp-link','xiaomi','yi','netatmo',
  'swann','arlo','ring','nest','logitech','foscam','amcrest','canon','sony',
  'panasonic','samsung','bosch','honeywell','ge','vivint','wyze','blink','d-link'
];

if (cameraPatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'camera';
}
  
const microcomputerPatterns = [
  'raspberry','pi','esp','arduino','beaglebone','odroid','nanopi','pine64',
  'tinkerboard','jetson','microbit','teensy','pico','banana-pi','cubieboard'
];

if (microcomputerPatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'microcomputer';
}
  
const printerPatterns = [
  'printer','print','hp','canon','epson','brother','lexmark','ricoh','kyocera',
  'samsung','xerox','okidata','konica','minolta','panasonic','dell'
];

if (printerPatterns.some(p => vendor.includes(p) || hostname.includes(p))) {
  return 'printer';
}
  
  return 'unknown';
}

function executeNmapCommand(nmapCmd, args) {
  const isWindows = process.platform === 'win32';
  let spawnCmd, spawnArgs;
  
  if (isWindows && nmapCmd.includes(' ')) {
    spawnCmd = 'cmd.exe';
    spawnArgs = ['/c', `"${nmapCmd}" ${args.join(' ')}`];
  } else {
    spawnCmd = nmapCmd;
    spawnArgs = args;
  }
  
  return spawn(spawnCmd, spawnArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: isWindows
  });
}

async function discoverNetwork() {
  const nmapCmd = await nmapDetector.findNmapCommand();
  
  if (!nmapCmd) {
    throw new Error('Nmap is not installed or accessible');
  }
  
  let networkRange, networkInfo, warning;
  
  try {
    const networkData = getLocalNetworkRange();
    networkRange = networkData.range;
    networkInfo = networkData.networkInfo;
    warning = networkData.warning;
  } catch (error) {
    if (error.message === 'NETWORK_DISCONNECTED') {
      throw new Error('NETWORK_DISCONNECTED');
    } else if (error.message === 'NETWORK_DISCONNECTED_APIPA') {
      throw new Error('NETWORK_DISCONNECTED_APIPA');
    } else if (error.message === 'NO_REAL_NETWORK_CONNECTION') {
      throw new Error('NO_REAL_NETWORK_CONNECTION');
    } else if (error.message === 'VIRTUAL_NETWORK_ONLY') {
      throw new Error('VIRTUAL_NETWORK_ONLY');
    } else if (error.message === 'PUBLIC_IP_DETECTED') {
      throw new Error('PUBLIC_IP_DETECTED');
    } else if (error.message === 'NO_VALID_INTERFACE') {
      throw new Error('NO_VALID_INTERFACE');
    } else {
      throw new Error('NETWORK_CONFIG_ERROR');
    }
  }
  
  console.log(`Scanning network: ${networkRange} with ${nmapCmd}`);
  console.log(`Network info:`, networkInfo);
  
  return new Promise((resolve, reject) => {
    const nmap = executeNmapCommand(nmapCmd, ['-sn', '-oX', '-', networkRange]);
    
    let output = '';
    let errorOutput = '';
    
    nmap.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    nmap.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    nmap.on('close', (code) => {
      console.log(`Nmap scan completed with code: ${code}`);
      
      if (code === 0) {
        try {
          const devices = parseNmapXML(output);
          
          if (networkInfo.connectionType === 'virtual-only') {
            resolve({
              devices: devices,
              warning: warning || 'VIRTUAL_NETWORK_ONLY',
              networkInfo: networkInfo
            });
          } else if (devices.length === 1 && devices[0].isGateway) {
            console.log('Only gateway found - possible limited connectivity');
            resolve({
              devices: devices,
              warning: 'MINIMAL_CONNECTIVITY',
              networkInfo: networkInfo
            });
          } else if (devices.length === 0) {
            console.log('No devices found');
            resolve({
              devices: [],
              warning: 'NO_DEVICES_FOUND',
              networkInfo: networkInfo
            });
          } else {
            console.log(`Found ${devices.length} devices`);
            resolve({
              devices: devices,
              networkInfo: networkInfo
            });
          }
        } catch (error) {
          console.error('Error parsing Nmap output:', error);
          reject(new Error('Error parsing Nmap results'));
        }
      } else {
        console.error('Nmap error output:', errorOutput);
        reject(new Error(`Network scan failed (code ${code}): ${errorOutput}`));
      }
    });
    
    nmap.on('error', (error) => {
      console.error('Nmap spawn error:', error);
      reject(new Error(`Error launching Nmap: ${error.message}`));
    });
  });
}

function parseDeviceDetails(output, ip) {
  const result = {
    ip: ip,
    ports: [],
    services: [],
    suspicionLevel: 'low',
    reasons: ['No suspicious service detected'],
    trustScore: 85,
    os: null,
    hostname: null,
    vendor: null
  };
  
  const lines = output.split('\n');
  
  for (let line of lines) {
    const portMatch = line.match(/(\d+)\/tcp\s+(open|closed|filtered)\s+([^\s]+)(?:\s+(.+))?/);
    if (portMatch) {
      const port = {
        port: portMatch[1],
        state: portMatch[2],
        service: portMatch[3],
        version: portMatch[4] || ''
      };
      
      if (port.state === 'open') {
        result.ports.push(port);
        result.services.push(port.service);
      }
    }
  }
  
  const enhancedDeviceType = determineDeviceType({
    hostname: result.hostname,
    vendor: result.vendor,
    ip: ip,
    ports: result.ports,
    services: result.services,
    mac: result.mac
  });
  
  result.deviceType = enhancedDeviceType;
  
  if (useEnhancedDetection && enhancedDetector) {
    try {
      const riskAssessment = enhancedDetector.getDeviceRiskAssessment(result, enhancedDeviceType);
      if (riskAssessment.base === 'high') {
        result.suspicionLevel = 'high';
        result.reasons = [riskAssessment.reason];
        result.trustScore = Math.min(result.trustScore, 30);
      } else if (riskAssessment.base === 'medium') {
        result.suspicionLevel = 'medium';
        result.reasons = [riskAssessment.reason];
        result.trustScore = Math.min(result.trustScore, 60);
      }
    } catch (error) {
      console.warn('Enhanced risk assessment failed, using basic assessment:', error.message);
      performBasicRiskAssessment(result, ip);
    }
  } else {
    performBasicRiskAssessment(result, ip);
  }
  
  for (let line of lines) {
    if (line.includes('OS details:')) {
      result.os = line.split('OS details:')[1].trim();
    }
    
    if (line.includes('Computer name:')) {
      result.hostname = line.split('Computer name:')[1].trim();
    }
    
    if (line.includes('http-title:')) {
      const title = line.split('http-title:')[1].trim();
      const cameraKeywords = [
        'camera', 'webcam', 'surveillance', 'ipcam', 'mjpeg', 
        'hikvision', 'dahua', 'axis', 'foscam', 'amcrest', 
        'ezviz', 'arlo', 'uniview', 'swann', 'bosch', 'panasonic', 
        'sony', 'cctv', 'nvr', 'dvr', 'rtsp', 'onvif', 'stream', 
        'snapshot', 'live view', 'netcam', 'network camera', 'h.264'
        ];
      if (cameraKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
        result.suspicionLevel = 'high';
        result.reasons = [`Camera web interface detected: "${title}"`];
        result.trustScore = Math.min(result.trustScore, 20);
      }
    }
  }
  
  return result;
}

function performBasicRiskAssessment(result, ip) {
  const isNetworkEquipment = ip.endsWith('.1') || ip.endsWith('.254') || ip.endsWith('.100');
  const isISPModem = ip.endsWith('.254');
  
  if (isISPModem) {
    result.suspicionLevel = 'medium';
    result.reasons = [`ISP modem/gateway detected (.${ip.split('.').pop()}) - verify this belongs to your host or ISP`];
    result.trustScore = 65;
    return;
  }
  
  if (isNetworkEquipment) {
    result.suspicionLevel = 'low';
    result.reasons = [`Network equipment detected (.${ip.split('.').pop()}) - normal for this device type`];
    result.trustScore = Math.max(result.trustScore, 80);
    return;
  }
  
  const suspiciousServices = ['rtsp', 'http-proxy', 'webcam', 'mjpeg-streamer'];
  const cameraKeywords = ['camera', 'webcam', 'surveillance', 'ipcam', 'mjpeg', 'hikvision', 'dahua'];
  
  let foundSuspiciousService = false;
  
  result.ports.forEach(port => {
    if (suspiciousServices.includes(port.service.toLowerCase())) {
      result.suspicionLevel = 'medium';
      result.reasons = [`Service ${port.service} detected on port ${port.port}`];
      result.trustScore = Math.min(result.trustScore, 60);
      foundSuspiciousService = true;
    }
    
    if (cameraKeywords.some(keyword => 
        port.service.toLowerCase().includes(keyword) || 
        port.version.toLowerCase().includes(keyword))) {
      result.suspicionLevel = 'high';
      result.reasons = [`Camera service detected: ${port.service} on port ${port.port}`];
      result.trustScore = Math.min(result.trustScore, 30);
      foundSuspiciousService = true;
    }
  });
  
const openPorts = result.ports.map(p => parseInt(p.port));

const cameraPortSignatures = [
  {
    ports: [80, 554],
    severity: 'high',
    reason: 'RTSP (554) + HTTP (80): classic IP camera with live video stream and web interface'
  },
  {
    ports: [554, 443],
    severity: 'high',
    reason: 'RTSP (554) + HTTPS (443): secure web interface and video stream'
  },
  {
    ports: [80, 37777],
    severity: 'high',
    reason: 'HTTP (80) + Dahua proprietary port (37777): typical Dahua DVR/NVR'
  },
  {
    ports: [80, 8000],
    severity: 'high',
    reason: 'HTTP (80) + Hikvision service port (8000): Hikvision camera/NVR'
  },
  {
    ports: [554, 8554],
    severity: 'medium',
    reason: 'Multiple RTSP services (554 and 8554): streaming endpoints often used by cameras'
  },
  {
    ports: [81, 554],
    severity: 'medium',
    reason: 'Alternative HTTP (81) + RTSP (554): common in rebranded / cheap IP cameras'
  },
  {
    ports: [8080, 554],
    severity: 'medium',
    reason: 'Alternate HTTP (8080) + RTSP (554): indicates non-standard camera web interface'
  },
  {
    ports: [21, 80, 554],
    severity: 'medium',
    reason: 'FTP (21) + HTTP (80) + RTSP (554): storage + web UI + video stream, typical DVR setup'
  },
  {
    ports: [23, 80, 554],
    severity: 'high',
    reason: 'Telnet (23) + HTTP (80) + RTSP (554): insecure camera with remote shell access'
  }
];

cameraPortSignatures.forEach(sig => {
  if (sig.ports.every(p => openPorts.includes(p))) {
    result.suspicionLevel = sig.severity;
    result.reasons = result.reasons || [];
    result.reasons.push(`Camera fingerprint detected: ${sig.reason}`);
    result.trustScore = Math.min(result.trustScore, sig.severity === 'high' ? 20 : 40);
    foundSuspiciousService = true;
  }
});
  
  if (!foundSuspiciousService && result.suspicionLevel !== 'high' && result.suspicionLevel !== 'medium') {
    result.suspicionLevel = 'low';
    result.reasons = ['No suspicious service detected'];
    result.trustScore = Math.max(result.trustScore, 85);
  }
}

async function scanDevice(ip) {
  const nmapCmd = await nmapDetector.findNmapCommand();
  
  if (!nmapCmd) {
    throw new Error('Nmap is not installed or accessible');
  }
  
  console.log(`Scanning device: ${ip} with ${nmapCmd}`);
  
  return new Promise((resolve, reject) => {
    const args = [
      '-p', '21,22,23,53,80,81,110,443,554,993,995,1935,5000,5001,5002,5003,8000,8080,8081,8443,8554,9000,37777',
      '-sV',
      '-A',
      '-O',
      '--script', 'http-title,http-headers,banner,rtsp-url-brute',
      '-T4',
      ip
    ];
    
    const nmap = executeNmapCommand(nmapCmd, args);
    
    let output = '';
    let errorOutput = '';
    
    nmap.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    nmap.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    nmap.on('close', (code) => {
      console.log(`Device scan of ${ip} completed with code: ${code}`);
      
      if (code === 0) {
        try {
          const deviceInfo = parseDeviceDetails(output, ip);
          resolve(deviceInfo);
        } catch (error) {
          console.error('Error parsing device scan:', error);
          reject(new Error('Error parsing device scan'));
        }
      } else {
        console.log('Device scan error output:', errorOutput);
        resolve({
          ip: ip,
          ports: [],
          services: [],
          suspicionLevel: 'low',
          reasons: ['Limited scan - device may be protected by firewall'],
          trustScore: 75
        });
      }
    });
    
    nmap.on('error', (error) => {
      console.error('Device scan spawn error:', error);
      reject(new Error(`Error scanning ${ip}: ${error.message}`));
    });
  });
}

module.exports = {
  discoverNetwork,
  scanDevice,
  getLocalNetworkRange,
  checkNetworkConnectivity
};