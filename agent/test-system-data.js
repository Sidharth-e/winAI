const si = require('systeminformation');

async function testSystemData() {
  console.log('Testing system data collection...');
  
  try {
    // Test individual components
    console.log('\n1. Testing CPU info...');
    const cpuInfo = await si.cpu();
    console.log('CPU Info:', {
      cores: cpuInfo.cores,
      model: cpuInfo.model,
      speed: cpuInfo.speed
    });

    console.log('\n2. Testing CPU load...');
    const cpuLoad = await si.currentLoad();
    console.log('CPU Load:', {
      currentLoad: cpuLoad.currentLoad
    });

    console.log('\n3. Testing memory...');
    const memInfo = await si.mem();
    console.log('Memory Info:', {
      total: Math.round(memInfo.total / 1024 / 1024 / 1024 * 100) / 100,
      used: Math.round(memInfo.used / 1024 / 1024 / 1024 * 100) / 100,
      free: Math.round(memInfo.free / 1024 / 1024 / 1024 * 100) / 100
    });

    console.log('\n4. Testing storage...');
    const diskInfo = await si.fsSize();
    console.log('Storage Info:', diskInfo.map(disk => ({
      device: disk.fs,
      type: disk.type,
      total: Math.round(disk.size / 1024 / 1024 / 1024 * 100) / 100,
      used: Math.round(disk.used / 1024 / 1024 / 1024 * 100) / 100
    })));

    console.log('\n5. Testing system info...');
    const systemInfo = await si.system();
    const osInfo = await si.osInfo();
    const timeInfo = await si.time();
    console.log('System Info:', {
      platform: osInfo.platform,
      arch: osInfo.arch,
      hostname: osInfo.hostname,
      uptime: Math.round(timeInfo.uptime / 3600 * 100) / 100
    });

    console.log('\n6. Testing network...');
    const networkStats = await si.networkStats();
    console.log('Network Info:', networkStats.map(net => ({
      interface: net.iface,
      bytesReceived: net.rx_bytes,
      bytesSent: net.tx_bytes
    })));

    console.log('\n7. Testing processes...');
    const processes = await si.processes();
    console.log('Process Info:', {
      total: processes.all,
      running: processes.running,
      sleeping: processes.sleeping
    });

    console.log('\n✅ All system data collection tests passed!');

  } catch (error) {
    console.error('❌ Error collecting system data:', error);
  }
}

testSystemData();
