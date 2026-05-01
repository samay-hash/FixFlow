const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api/logs/agent/ingest';
const TOKEN = process.env.LOG_INGEST_TOKEN || 'fixflow_secure_agent_token_2026';

const logs = [
  { level: 'INFO', message: 'Starting Nginx server...' },
  { level: 'INFO', message: 'Database connection established securely on port 27017' },
  { level: 'INFO', message: 'Server is listening on port 5000' },
  { level: 'WARN', message: 'Spike in API requests detected from IP 192.168.1.5' },
  { level: 'WARN', message: 'Memory usage exceeding 80% threshold on Worker-01' },
  { level: 'ERROR', message: 'Connection to upstream database timed out after 10000ms' },
  { level: 'ERROR', message: 'Nginx upstream prematurely closed connection while reading response header from upstream, request: "GET /api/v1/auth", host: "api.fixflow.io"' },
  { level: 'FATAL', message: 'Out of memory: Killed process 8492 (node)' },
  { level: 'ERROR', message: 'UnhandledPromiseRejectionWarning: MongoNetworkError: failed to connect to server [cluster-0:27017] on first connect' },
  { level: 'WARN', message: 'Attempting to reboot crashed processes...' },
  { level: 'ERROR', message: 'PM2 cluster failed to restart, port 5000 is still bound' },
  { level: 'FATAL', message: 'System halted due to kernel panic: VFS: Unable to mount root fs on unknown-block(0,0)' }
];

async function injectForCompany(companyId) {
  console.log(`\n🔥 Injecting CHAOS logs for company: ${companyId}...`);
  for (let i = 0; i < logs.length; i++) {
    await axios.post(API_URL, {
      companyId: companyId.toString(),
      serverIp: 'ip-172-31-45-12.ec2.internal',
      source: 'syslog',
      level: logs[i].level,
      message: logs[i].message
    }, {
      headers: { 'x-agent-token': TOKEN }
    });
    console.log(`📡 Streamed: [${logs[i].level}] ${logs[i].message}`);
    await new Promise(r => setTimeout(r, 200));
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    
    // If a specific companyId is passed as CLI arg, use that
    const cliCompanyId = process.argv[2];
    if (cliCompanyId) {
      await injectForCompany(cliCompanyId);
      console.log('\n✅ Simulation complete! Check your FixFlow Log Intelligence page.');
      process.exit(0);
    }
    
    // Otherwise inject for ALL companies so every user can see logs
    const companies = await db.collection('companies').find({}).toArray();
    if (!companies.length) {
      console.error('❌ No company found in DB. Make sure you are registered.');
      process.exit(1);
    }

    console.log(`\n📋 Found ${companies.length} company(s). Injecting for ALL of them...`);
    for (const company of companies) {
      await injectForCompany(company._id);
    }
    
    console.log('\n✅ Simulation complete! Check your FixFlow Log Intelligence page.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during simulation:', err.message);
    process.exit(1);
  }
}

run();
