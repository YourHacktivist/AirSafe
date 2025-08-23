const { spawn, exec } = require('child_process');
const path = require('path');

function findNmapCommand() {
  return new Promise((resolve) => {
    console.log('Starting Nmap detection...');
    console.log('Platform:', process.platform);
    console.log('Environment variables:');
    console.log('  PROGRAMFILES:', process.env.PROGRAMFILES);
    console.log('  PROGRAMFILES(X86):', process.env['PROGRAMFILES(X86)']);
    
    const whichCommand = process.platform === 'win32' ? 'where' : 'which';
    
    console.log(`Trying ${whichCommand} command...`);
    
    exec(`${whichCommand} nmap`, { timeout: 10000 }, (error, stdout, stderr) => {
      if (!error && stdout.trim()) {
        const nmapPath = stdout.trim().split('\n')[0];
        console.log(`Found via ${whichCommand}: ${nmapPath}`);
        
        testNmapCommand(nmapPath).then(works => {
          if (works) {
            resolve(nmapPath);
          } else {
            console.log(`Path from ${whichCommand} doesn't work, trying alternatives...`);
            tryAlternativePaths(resolve);
          }
        });
        return;
      }
      
      console.log(`${whichCommand} command failed:`, error?.message || 'Command not found');
      console.log('Stderr:', stderr);
      tryAlternativePaths(resolve);
    });
  });
}

function tryAlternativePaths(resolve) {
  const commonPaths = process.platform === 'win32' 
    ? [
        'nmap.exe',
        'nmap',
        'C:\\Program Files (x86)\\Nmap\\nmap.exe',
        'C:\\Program Files\\Nmap\\nmap.exe',
        path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Nmap', 'nmap.exe'),
        path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Nmap', 'nmap.exe'),
        'C:/Program Files (x86)/Nmap/nmap.exe',
        'C:/Program Files/Nmap/nmap.exe'
      ]
    : [
        'nmap',
        '/usr/bin/nmap',
        '/usr/local/bin/nmap',
        '/opt/homebrew/bin/nmap',
        '/usr/sbin/nmap',
        '/usr/local/sbin/nmap'
      ];

  console.log('Testing alternative paths:', commonPaths);
  
  let attempts = 0;
  
  const tryNext = () => {
    if (attempts >= commonPaths.length) {
      console.log('Nmap not found in any tested paths');
      resolve(null);
      return;
    }
    
    const cmd = commonPaths[attempts++];
    console.log(`Testing path ${attempts}/${commonPaths.length}: ${cmd}`);
    
    testNmapCommand(cmd).then(works => {
      if (works) {
        console.log(`SUCCESS: Nmap works with: ${cmd}`);
        resolve(cmd);
      } else {
        console.log(`FAILED: Path ${cmd} doesn't work`);
        tryNext();
      }
    });
  };
  
  tryNext();
}

function testNmapCommand(cmd) {
  return new Promise((resolve) => {
    console.log(`Testing command: "${cmd}"`);
    
    const isWindows = process.platform === 'win32';
    let spawnCmd, spawnArgs;
    
    if (isWindows && cmd.includes(' ')) {
      spawnCmd = 'cmd.exe';
      spawnArgs = ['/c', `"${cmd}" --version`];
    } else {
      spawnCmd = cmd;
      spawnArgs = ['--version'];
    }
    
    const test = spawn(spawnCmd, spawnArgs, { 
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows,
      timeout: 10000
    });
    
    let stdout = '';
    let stderr = '';
    
    test.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    test.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    test.on('close', (code) => {
      console.log(`Test result for "${cmd}":`);
      console.log(`  Exit code: ${code}`);
      console.log(`  Stdout: "${stdout.substring(0, 100)}"`);
      console.log(`  Stderr: "${stderr.substring(0, 100)}"`);
      
      if (code === 0 && stdout.toLowerCase().includes('nmap')) {
        console.log(`âœ“ Nmap working with: ${cmd}`);
        resolve(true);
      } else {
        console.log(`âœ— Nmap failed with: ${cmd}`);
        resolve(false);
      }
    });
    
    test.on('error', (error) => {
      console.log(`Error testing ${cmd}:`, error.message);
      resolve(false);
    });
    
    setTimeout(() => {
      console.log(`Timeout testing ${cmd}`);
      test.kill();
      resolve(false);
    }, 10000);
  });
}

module.exports = {
  findNmapCommand,
  testNmapCommand
};