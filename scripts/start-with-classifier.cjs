const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');
const dotenv = require('dotenv');

const repoRoot = path.resolve(__dirname, '..');
const classifierDir = path.join(repoRoot, 'services', 'listing-image-classifier');
const classifierEntrypoint = path.join(classifierDir, 'run_server.py');

// Load env files so local `npm run start` picks IMAGE_CLASSIFIER_PYTHON_BIN and related vars.
dotenv.config({ path: path.join(repoRoot, '.env.local') });
dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config();

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

function envTruthy(name, fallback) {
  const value = String(process.env[name] ?? fallback ?? '').trim().toLowerCase();
  return TRUTHY.has(value);
}

function resolveClassifierBaseUrl() {
  const configured = String(
    process.env.IMAGE_CLASSIFIER_SERVICE_URL ||
      process.env.IMAGE_CLASSIFIER_INTERNAL_BASE_URL ||
      '',
  ).trim();

  if (configured) return configured.replace(/\/+$/, '');
  const port = String(process.env.IMAGE_CLASSIFIER_PORT || '8010').trim();
  return `http://127.0.0.1:${port}`;
}

function shouldAutostartClassifier(serviceUrl) {
  if (!envTruthy('IMAGE_CLASSIFIER_AUTOSTART', 'true')) return false;
  let parsed;
  try {
    parsed = new URL(serviceUrl);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}

function resolvePythonBinary() {
  const winVenvPy = path.join(classifierDir, '.venv', 'Scripts', 'python.exe');
  const unixVenvPy = path.join(classifierDir, '.venv', 'bin', 'python');
  const configured =
    process.env.IMAGE_CLASSIFIER_PYTHON_BIN || process.env.PYTHON_BIN || 'python';

  if (path.isAbsolute(configured)) return configured;

  if (configured.includes('/') || configured.includes('\\')) {
    const fromRepoRoot = path.resolve(repoRoot, configured);
    if (fs.existsSync(fromRepoRoot)) return fromRepoRoot;
    const fromClassifier = path.resolve(classifierDir, configured);
    if (fs.existsSync(fromClassifier)) return fromClassifier;
    return fromRepoRoot;
  }

  if (fs.existsSync(winVenvPy)) return winVenvPy;
  if (fs.existsSync(unixVenvPy)) return unixVenvPy;

  return configured;
}

function healthcheck(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2500 }, (res) => {
      const ok = (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300;
      res.resume();
      resolve(ok);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForClassifierHealth(baseUrl, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  const target = `${baseUrl}/api/health`;
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await healthcheck(target);
    if (ok) return true;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  return false;
}

function waitForClassifierExit(child) {
  return new Promise((resolve) => {
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
}

function spawnCommand(bin, args, options) {
  const child = spawn(bin, args, options);
  child.on('error', (error) => {
    console.error(`[start] failed to launch "${bin}": ${error.message}`);
  });
  return child;
}

function spawnNextServer(nextPort) {
  const nextCliPath = path.join(repoRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (!fs.existsSync(nextCliPath)) {
    throw new Error(`Next CLI not found at ${nextCliPath}. Run npm install first.`);
  }

  return spawnCommand(process.execPath, [nextCliPath, 'start', '-p', String(nextPort)], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(nextPort) },
    stdio: 'inherit',
  });
}

async function main() {
  const classifierBaseUrl = resolveClassifierBaseUrl();
  const autostartClassifier = shouldAutostartClassifier(classifierBaseUrl);
  const nextPort = String(process.env.PORT || '8001');
  const children = [];

  let classifierChild = null;

  if (autostartClassifier) {
    if (!fs.existsSync(classifierEntrypoint)) {
      console.error(`[start] classifier entrypoint missing: ${classifierEntrypoint}`);
      process.exit(1);
    }

    const pythonBin = resolvePythonBinary();
    const parsedBase = new URL(classifierBaseUrl);
    const classifierPort = parsedBase.port || '8010';
    const classifierEnv = {
      ...process.env,
      PORT: classifierPort,
      PYTHONUNBUFFERED: '1',
      PYTHONIOENCODING: 'utf-8',
      PYTHONUTF8: '1',
    };

    console.log(
      `[start] launching listing image classifier (${pythonBin} ${path.basename(
        classifierEntrypoint,
      )}) on ${classifierBaseUrl}`,
    );
    classifierChild = spawnCommand(pythonBin, [classifierEntrypoint], {
      cwd: classifierDir,
      env: classifierEnv,
      stdio: 'inherit',
    });
    children.push(classifierChild);

    const bootTimeoutMs = Math.max(
      10_000,
      Number(process.env.IMAGE_CLASSIFIER_BOOT_TIMEOUT_MS || 240_000),
    );
    console.log(
      `[start] waiting for classifier health (${classifierBaseUrl}/api/health) timeout=${bootTimeoutMs}ms`,
    );

    const readyOrExit = await Promise.race([
      waitForClassifierHealth(classifierBaseUrl, bootTimeoutMs).then((ready) => ({
        type: 'health',
        ready,
      })),
      waitForClassifierExit(classifierChild).then((exit) => ({ type: 'exit', ...exit })),
    ]);

    if (readyOrExit.type === 'exit') {
      console.error(
        `[start] classifier exited before becoming healthy (code=${readyOrExit.code ?? 'unknown'} signal=${readyOrExit.signal ?? 'none'})`,
      );
      process.exit(1);
    }

    if (!readyOrExit.ready) {
      console.error(
        `[start] classifier did not become healthy at ${classifierBaseUrl}/api/health within timeout (${bootTimeoutMs}ms)`,
      );
      classifierChild.kill('SIGTERM');
      process.exit(1);
    }
    console.log('[start] classifier healthcheck passed');
  } else {
    console.log(
      `[start] classifier autostart skipped (IMAGE_CLASSIFIER_AUTOSTART=false or non-local service URL: ${classifierBaseUrl})`,
    );
  }

  const nextChild = spawnNextServer(nextPort);
  children.push(nextChild);

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const child of children) {
      if (child && !child.killed) {
        child.kill(signal);
      }
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  nextChild.on('exit', (code, signal) => {
    if (classifierChild && !classifierChild.killed) {
      classifierChild.kill('SIGTERM');
    }
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  if (classifierChild) {
    classifierChild.on('exit', (code) => {
      if (shuttingDown) return;
      if (code === 0) return;
      console.error(`[start] classifier exited unexpectedly (code=${code ?? 'unknown'})`);
      if (!nextChild.killed) nextChild.kill('SIGTERM');
      process.exit(code ?? 1);
    });
  }
}

main().catch((error) => {
  console.error(`[start] fatal error: ${error?.message || error}`);
  process.exit(1);
});
