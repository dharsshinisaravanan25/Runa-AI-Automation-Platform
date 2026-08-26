/**
 * RUNA - Autonomous Agentic AI Operations Platform Runner
 * Tagline: (You define it. We run it.)
 * Launches both Express Backend and Next.js Frontend concurrently with colored logging
 */

const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

// ANSI Color Helpers
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const magenta = (text) => `\x1b[35m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

console.log('\n' + cyan('========================================================================'));
console.log(bold(green('   ⚡ RUNA // Autonomous Operations (You define it. We run it.)   ')));
console.log(cyan('========================================================================\n'));
console.log(`  🌐 Frontend:  ${bold('http://localhost:3000')}`);
console.log(`  ⚙️  Backend:   ${bold('http://localhost:5000')}`);
console.log(`  🔑 Demo User: ${bold('operator@runa.ai')} / ${bold('Operator123!')}\n`);
console.log(cyan('------------------------------------------------------------------------\n'));

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

// Spawn Backend Server Process
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: serverDir,
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, FORCE_COLOR: 'true' }
});

serverProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`${cyan('[RUNA-SERVER]')} ${line}`);
    }
  });
});

serverProcess.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.error(`${cyan('[RUNA-SERVER:ERR]')} ${line}`);
    }
  });
});

// Spawn Frontend Client Process
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, FORCE_COLOR: 'true' }
});

clientProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`${magenta('[RUNA-CLIENT]')} ${line}`);
    }
  });
});

clientProcess.stderr.on('data', (data) => {
  const lines = data.toString().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.error(`${magenta('[RUNA-CLIENT:ERR]')} ${line}`);
    }
  });
});

// Clean shutdown on Ctrl+C
const cleanup = () => {
  console.log('\n' + green('Shutting down RUNA AI services gracefully...'));
  try {
    if (isWindows) {
      if (serverProcess.pid) spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
      if (clientProcess.pid) spawn('taskkill', ['/pid', clientProcess.pid, '/f', '/t']);
    } else {
      serverProcess.kill('SIGTERM');
      clientProcess.kill('SIGTERM');
    }
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
