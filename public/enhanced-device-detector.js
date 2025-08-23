const fs = require('fs');
const path = require('path');

let devicePatterns = null;

function loadDevicePatterns() {
  if (!devicePatterns) {
    try {
      const patternsPath = path.join(__dirname, 'device-patterns.json');
      devicePatterns = JSON.parse(fs.readFileSync(patternsPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load device patterns:', error);
      devicePatterns = getBasicPatterns();
    }
  }
  return devicePatterns;
}

// Minimal fallback patterns if JSON file is not available
function getBasicPatterns() {
  return {
    isp_modems: {
      vendors: [
        'freebox','orange','sfr','neufbox','numericable','bouygues','dartybox',
        'alicebox','vodafone','telekom','dt','o2','bt','verizon','comcast',
        'charter','xfinity','rogers','bell','telus','at&t','cox','spectrum',
        'sky','virgin'
      ],
      hostnames: [
        'freebox','livebox','neufbox','bbox'
      ],
      type: 'isp-modem'
    },
    routers: {
      vendors: [
        'netgear','linksys','tp-link','tplink','asus','d-link','dlink','zyxel',
        'huawei','xiaomi','mikrotik','ubiquiti','juniper','cisco','belkin'
      ],
      hostnames: ['router','gateway'],
      ip_endings: ['.1','.254'],
      type: 'router'
    },
    mobile_devices: {
      vendors: [
        'apple','samsung','xiaomi','oneplus','oppo','realme','vivo','sony','ericsson',
        'lg','nokia','motorola','google','pixel','zte','lenovo','honor','meizu'
      ],
      hostnames: [
        'iphone','ipad','ipod','android','phone','samsung','sm-'
      ],
      type: 'mobile'
    },
    smart_tvs: {
      vendors: [
        'samsung','lg','sony','philips','panasonic','sharp','tcl','hisense','xiaomi',
        'mi-tv','vizio','element','insignia'
      ],
      hostnames: [
        'tv','samsung','lg','sony','chromecast','firetv','roku'
      ],
      type: 'smart-tv'
    },
    computers: {
      vendors: [
        'microsoft','dell','hp','lenovo','asus','acer','msi','gigabyte','razer',
        'alienware','thinkpad','chromebook','surface'
      ],
      hostnames: [
        'desktop','laptop','pc-','macbook','imac','windows'
      ],
      type: 'computer'
    },
    smart_speakers: {
      vendors: [
        'amazon','sonos','samsung','bose','xiaomi','lenovo'
      ],
      hostnames: [
        'echo','alexa','nest','google','homepod'
      ],
      type: 'smart-speaker'
    },
    cameras: {
      vendors: [
        'hikvision','dahua','axis','reolink','ezviz','tp-link','xiaomi','yi','netatmo',
        'swann','arlo','ring','nest','logitech','foscam','amcrest','canon','sony',
        'panasonic','samsung','bosch','honeywell','ge','vivint','wyze','blink','d-link'
      ],
      hostnames: [
        'cam','camera','esp32','arduino','surveillance','ipcam','security'
      ],
      type: 'camera'
    },
    microcomputers: {
      vendors: [
        'raspberry','arduino','beaglebone','odroid','nanopi','pine64','tinkerboard',
        'jetson','microbit','teensy','pico','banana-pi','cubieboard'
      ],
      hostnames: [
        'raspberry','pi','esp'
      ],
      type: 'microcomputer'
    },
    printers: {
      vendors: [
        'hp','canon','epson','brother','lexmark','ricoh','kyocera','samsung',
        'xerox','okidata','konica','minolta','panasonic','dell'
      ],
      hostnames: [
        'printer','print'
      ],
      type: 'printer'
    },
    virtual_machines: {
      vendors: [
        'vmware','virtualbox','vbox','hyper-v','kvm','qemu','parallels','xen','proxmox'
      ],
      hostnames: [
        'vmware','virtualbox','vbox'
      ],
      ip_ranges: ['192.168.100.','192.168.200.'],
      type: 'virtual-machine'
    }
  };
}


/**
 * Enhanced device type determination with comprehensive pattern matching
 * @param {Object} device - Device object with hostname, vendor, name, ip, ports, services
 * @returns {string} - Detected device type
 */
function determineDeviceType(device) {
  const patterns = loadDevicePatterns();
  
  const hostname = (device.hostname || '').toLowerCase();
  const vendor = (device.vendor || '').toLowerCase();
  const name = (device.name || '').toLowerCase();
  const ip = device.ip || '';
  const ports = device.ports || [];
  const services = device.services || [];
  
  const openPorts = ports.map(p => p.port || p).filter(Boolean);
  const serviceNames = [
    ...services,
    ...ports.map(p => p.service).filter(Boolean)
  ].map(s => s.toLowerCase());

  const detectionOrder = [
    'virtual',
    'cameras', 
    'security_systems',
    'isp_modems',
    'routers',
    'network_storage',
    'gaming_consoles',
    'smart_speakers',
    'smart_tvs',
    'media_players',
    'iot_devices',
    'microcomputers',
    'printers',
    'mobile_devices',
    'computers',
    'smart_appliances',
    'fitness_devices',
    'automotive',
    'medical_devices',
    'industrial_iot',
    'point_of_sale',
    'networking_infrastructure'
  ];

  for (const categoryKey of detectionOrder) {
    const category = patterns[categoryKey];
    if (!category) continue;

    const score = calculateMatchScore(device, category, {
      hostname, vendor, name, ip, openPorts, serviceNames
    });

    if (score >= 0.7) {
      return category.type;
    }
  }

  const specialType = detectSpecialCases(device, { hostname, vendor, name, ip, openPorts, serviceNames });
  if (specialType) {
    return specialType;
  }

  return 'unknown';
}

/**
 * Calculate match score for a device against a pattern category
 */
function calculateMatchScore(device, category, normalized) {
  let score = 0;
  let maxScore = 0;

  const { hostname, vendor, name, ip, openPorts, serviceNames } = normalized;

  if (category.vendors) {
    maxScore += 3;
    for (const vendorPattern of category.vendors) {
      if (vendor.includes(vendorPattern)) {
        score += 3;
        break;
      }
    }
  }

  if (category.hostnames) {
    maxScore += 3;
    for (const hostnamePattern of category.hostnames) {
      if (hostname.includes(hostnamePattern) || name.includes(hostnamePattern)) {
        score += 3;
        break;
      }
    }
  }

  if (category.services) {
    maxScore += 2;
    const categoryServices = category.services.map(s => s.toString());
    const hasMatchingService = categoryServices.some(service => 
      openPorts.includes(service) || serviceNames.some(s => s.includes(service))
    );
    if (hasMatchingService) {
      score += 2;
    }
  }

  if (category.suspicious_services) {
    maxScore += 3;
    const hasSuspiciousService = category.suspicious_services.some(service =>
      serviceNames.some(s => s.includes(service))
    );
    if (hasSuspiciousService) {
      score += 3;
    }
  }

  if (category.ip_ranges) {
    maxScore += 2;
    for (const range of category.ip_ranges) {
      if (ip.startsWith(range)) {
        score += 2;
        break;
      }
    }
  }

  if (category.ip_endings) {
    maxScore += 1;
    for (const ending of category.ip_endings) {
      if (ip.endsWith(ending)) {
        score += 1;
        break;
      }
    }
  }

  if (category.patterns) {
    maxScore += 2;
    for (const pattern of category.patterns) {
      if (hostname.includes(pattern) || name.includes(pattern)) {
        score += 2;
        break;
      }
    }
  }

  if (category.os_patterns && device.os) {
    maxScore += 1;
    const deviceOs = device.os.toLowerCase();
    for (const osPattern of category.os_patterns) {
      if (deviceOs.includes(osPattern)) {
        score += 1;
        break;
      }
    }
  }

  if (category.mac_oui && device.mac) {
    maxScore += 2;
    const deviceMac = device.mac.toUpperCase();
    for (const oui of category.mac_oui) {
      if (deviceMac.startsWith(oui.toUpperCase())) {
        score += 2;
        break;
      }
    }
  }

  return maxScore > 0 ? score / maxScore : 0;
}

/**
 * Handle special detection cases that require custom logic
 */
function detectSpecialCases(device, normalized) {
  const { hostname, vendor, name, ip, openPorts, serviceNames } = normalized;

  // Virtual machine detection (broad patterns)
  if (isVirtualMachine(normalized)) {
    return 'virtual-machine';
  }

  // Camera detection by port combination
  if (isCameraByPorts(openPorts, serviceNames)) {
    return 'camera';
  }

  // Smart home hub detection
  if (isSmartHomeHub(normalized)) {
    return 'smart-hub';
  }

  // Network infrastructure
  if (isNetworkInfrastructure(normalized)) {
    return 'network-infrastructure';
  }

  // ISP modem/gateway detection
  if (isISPGateway(normalized)) {
    return 'isp-modem';
  }

  return null;
}

function isVirtualMachine(normalized) {
  const { hostname, vendor, ip } = normalized;
  
  // Check for virtual machine indicators
  const vmKeywords = ['vm-', 'virtual', 'vbox', 'vmware', 'hyperv', 'kvm', 'xen'];
  
  return vmKeywords.some(keyword => 
    hostname.includes(keyword) || vendor.includes(keyword)
  ) || ip.startsWith('192.168.100.') || ip.startsWith('192.168.200.');
}

function isCameraByPorts(openPorts, serviceNames) {
  // Common camera port combinations
  const cameraPortCombos = [
    ['554', '80'],    // RTSP + HTTP
    ['554', '443'],   // RTSP + HTTPS
    ['8000', '554'],  // Hikvision pattern
    ['37777'],        // Dahua pattern
    ['2020'],         // ONVIF
    ['8899']          // Alternative camera management
  ];

  return cameraPortCombos.some(combo => 
    combo.every(port => openPorts.includes(port) || openPorts.includes(parseInt(port)))
  ) || serviceNames.some(service => 
    ['rtsp', 'onvif', 'mjpeg', 'webcam', 'h264', 'h265'].includes(service)
  );
}

function isSmartHomeHub(normalized) {
  const { hostname, vendor, openPorts } = normalized;
  
  const hubKeywords = ['hub', 'bridge', 'gateway', 'coordinator'];
  const hubVendors = ['philips', 'samsung', 'echo', 'nest', 'wink'];
  const hubPorts = ['80', '443', '1900', '5683']; // Common IoT ports

  return (hubKeywords.some(keyword => hostname.includes(keyword)) ||
          hubVendors.some(v => vendor.includes(v))) &&
         hubPorts.some(port => openPorts.includes(port));
}

function isNetworkInfrastructure(normalized) {
  const { hostname, vendor, ip } = normalized;
  
  const infraKeywords = ['switch', 'ap', 'access-point', 'repeater', 'extender'];
  const infraVendors = ['cisco', 'ubiquiti', 'netgear', 'tp-link'];
  
  return infraKeywords.some(keyword => hostname.includes(keyword)) ||
         infraVendors.some(v => vendor.includes(v)) ||
         (ip.endsWith('.1') && vendor.includes('cisco'));
}

function isISPGateway(normalized) {
  const { hostname, vendor, ip } = normalized;
  
  const ispKeywords = ['freebox', 'livebox', 'bbox', 'neufbox', 'speedport', 'superhub'];
  const ispVendors = ['freebox', 'orange', 'sfr', 'bouygues', 'technicolor', 'sagemcom'];
  
  return ispKeywords.some(keyword => hostname.includes(keyword)) ||
         ispVendors.some(v => vendor.includes(v)) ||
         (ip.endsWith('.254') && vendor.includes('arris'));
}

/**
 * Get device risk assessment based on type and characteristics
 */
function getDeviceRiskAssessment(device, deviceType) {
  const ip = device.ip || '';
  const isNetworkEquipment = ip.endsWith('.1') || ip.endsWith('.254') || ip.endsWith('.100');
  const isISPModem = deviceType === 'isp-modem' || ip.endsWith('.254');
  
  const riskFactors = {
    'camera': { base: 'high', reason: 'Potential surveillance device' },
    'security-system': { base: 'medium', reason: 'Security monitoring device' },
    'virtual-machine': { base: 'low', reason: 'Virtual environment' },
    'microcomputer': { base: 'medium', reason: 'Programmable device with unknown purpose' },
    'iot-device': { base: 'medium', reason: 'IoT device with potential vulnerabilities' },
    'smart-appliance': { base: 'low', reason: 'Connected home appliance' },
    'fitness-device': { base: 'low', reason: 'Exercise equipment' },
    'automotive': { base: 'low', reason: 'Vehicle entertainment system' },
    'medical-device': { base: 'high', reason: 'Medical equipment requiring security attention' },
    'industrial-device': { base: 'medium', reason: 'Industrial control system' },
    'pos-system': { base: 'high', reason: 'Payment processing system' },
    'network-infrastructure': { base: 'low', reason: 'Network equipment' },
    'router': { base: 'low', reason: 'Network router' },
    'isp-modem': { base: 'medium', reason: 'ISP modem/gateway - verify ownership' },
    'unknown': { base: 'low', reason: 'Unknown device type requires investigation' }
  };

  const assessment = riskFactors[deviceType] || { base: 'low', reason: 'Standard network device' };
  
  const result = { ...assessment };
  
  if (isISPModem) {
    result.base = 'medium';
    result.reason = 'ISP modem/gateway - verify this belongs to your host or ISP';
    return result;
  }
  
  if (isNetworkEquipment && !isISPModem) {
    result.base = 'low';
    result.reason = `Network equipment (${ip.split('.').pop()}) - normal for this device type`;
    return result;
  }
  
  if (!isNetworkEquipment) {
    if (device.ports && device.ports.length > 10) {
      result.base = result.base === 'low' ? 'medium' : 'high';
      result.reason += ' - Many open ports detected';
    }

    if (device.services && device.services.some(s => 
      ['rtsp', 'onvif', 'mjpeg', 'ssh', 'telnet', 'ftp'].includes(s.toLowerCase())
    )) {
      result.base = result.base === 'low' ? 'medium' : 'high';
      result.reason += ' - Suspicious services detected';
    }

    if (device.ports) {
      const portNumbers = device.ports.map(p => parseInt(p.port || p)).filter(Boolean);
      
      if (portNumbers.includes(554) && (portNumbers.includes(80) || portNumbers.includes(443))) {
        result.base = 'high';
        result.reason = 'Camera-like port combination detected (RTSP + HTTP/HTTPS)';
      }
      
      if (portNumbers.filter(p => [22, 23, 80, 443, 8080, 8443].includes(p)).length >= 3) {
        result.base = result.base === 'low' ? 'medium' : 'high';
        result.reason += ' - Multiple management interfaces available';
      }
    }
  }

  return result;
}

/**
 * Get human-readable device type description
 */
function getDeviceTypeDescription(deviceType) {
  const descriptions = {
    'virtual-machine': 'Virtual Machine',
    'router': 'Network Router',
    'isp-modem': 'Internet Service Provider Modem',
    'mobile': 'Mobile Device',
    'smart-tv': 'Smart TV',
    'computer': 'Computer/Laptop',
    'smart-speaker': 'Smart Speaker',
    'camera': 'IP Camera/Surveillance Device',
    'iot-device': 'IoT Smart Device',
    'gaming-console': 'Gaming Console',
    'network-storage': 'Network Storage (NAS)',
    'printer': 'Network Printer',
    'microcomputer': 'Microcomputer/Development Board',
    'media-player': 'Media Streaming Device',
    'security-system': 'Security System Component',
    'smart-hub': 'Smart Home Hub',
    'network-infrastructure': 'Network Infrastructure',
    'smart-appliance': 'Smart Home Appliance',
    'fitness-device': 'Fitness Equipment',
    'automotive': 'Vehicle Entertainment System',
    'medical-device': 'Medical Device',
    'industrial-device': 'Industrial Equipment',
    'pos-system': 'Point of Sale System',
    'unknown': 'Unknown Device'
  };

  return descriptions[deviceType] || 'Unknown Device';
}

/**
 * Get detailed device information including security recommendations
 */
function getDeviceSecurityInfo(device, deviceType) {
  const securityInfo = {
    type: deviceType,
    description: getDeviceTypeDescription(deviceType),
    riskAssessment: getDeviceRiskAssessment(device, deviceType),
    recommendations: [],
    ports: device.ports || [],
    services: device.services || []
  };

  switch (deviceType) {
    case 'camera':
      securityInfo.recommendations = [
        'Verify this camera is authorized and belongs to the property owner',
        'Check for default credentials and ensure strong passwords are used',
        'Verify the camera is not accessible from the internet',
        'Consider physical inspection to confirm camera location and purpose'
      ];
      break;
    
    case 'router':
    case 'network-infrastructure':
      securityInfo.recommendations = [
        'Ensure firmware is up to date',
        'Verify strong admin passwords are in use',
        'Check that remote management is disabled if not needed',
        'Confirm this device belongs to the network owner'
      ];
      break;
    
    case 'isp-modem':
      securityInfo.recommendations = [
        'Verify this is your host\'s or ISP\'s equipment',
        'Confirm you have permission to be on this network',
        'Check with property owner if uncertain about device ownership',
        'Ensure guest network is properly configured if available'
      ];
      break;
    
    case 'iot-device':
      securityInfo.recommendations = [
        'Check for firmware updates',
        'Verify device credentials have been changed from defaults',
        'Consider network segmentation for IoT devices',
        'Review device permissions and data collection policies'
      ];
      break;
    
    case 'unknown':
      securityInfo.recommendations = [
        'Investigate device identity and purpose',
        'Check with property owner about unknown devices',
        'Monitor network traffic from this device',
        'Consider potential security implications'
      ];
      break;
    
    default:
      securityInfo.recommendations = [
        'Verify device is authorized on this network',
        'Check for security updates if applicable',
        'Monitor for unusual network activity'
      ];
  }

  return securityInfo;
}

/**
 * Check if device appears to be a potential security threat
 */
function isHighRiskDevice(device, deviceType) {
  const ip = device.ip || '';
  const isNetworkEquipment = ip.endsWith('.1') || ip.endsWith('.254') || ip.endsWith('.100');
  
  if (isNetworkEquipment) {
    const hasHighRiskServices = device.services && device.services.some(s =>
      ['rtsp', 'onvif', 'mjpeg'].includes(s.toLowerCase())
    );
    return hasHighRiskServices;
  }
  
  const riskAssessment = getDeviceRiskAssessment(device, deviceType);
  
  const highRiskTypes = ['camera', 'medical-device', 'pos-system'];
  const hasHighRiskPorts = device.ports && device.ports.some(p => 
    ['554', '37777', '2020', '8899'].includes(p.port || p)
  );
  const hasHighRiskServices = device.services && device.services.some(s =>
    ['rtsp', 'onvif', 'mjpeg'].includes(s.toLowerCase())
  );
  
  return riskAssessment.base === 'high' || 
         highRiskTypes.includes(deviceType) ||
         hasHighRiskPorts ||
         hasHighRiskServices ||
         deviceType === 'unknown';
}

module.exports = {
  determineDeviceType,
  getDeviceRiskAssessment,
  getDeviceTypeDescription,
  getDeviceSecurityInfo,
  isHighRiskDevice,
  loadDevicePatterns
};