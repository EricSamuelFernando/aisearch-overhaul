import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

type JsonObject = Record<string, unknown>;

interface PythonEnvelope {
  ok?: boolean;
  status?: number;
  data?: JsonObject;
  error?: string;
}

export interface ImageCategorizationInput {
  listingId: number;
  propertyId?: number | null;
  mlsData?: JsonObject;
}

export class ClassifierExecutionError extends Error {
  readonly statusCode: number;
  readonly details?: string;

  constructor(message: string, statusCode = 500, details?: string) {
    super(message);
    this.name = 'ClassifierExecutionError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const SERVICE_DIR = path.join(process.cwd(), 'services', 'listing-image-classifier');
const SCRIPT_PATH = path.join(SERVICE_DIR, 'run_categorization_once.py');

function resolveTimeoutMs(): number {
  const raw = Number(process.env.IMAGE_CLASSIFIER_TIMEOUT_MS ?? 180000);
  if (!Number.isFinite(raw) || raw <= 0) return 180000;
  return Math.floor(raw);
}

function resolvePythonBinary(): string {
  const configured =
    process.env.IMAGE_CLASSIFIER_PYTHON_BIN ||
    process.env.PYTHON_BIN ||
    'python';

  // Resolve configured relative paths against repo root first, then service dir.
  // This lets values like `services\\listing-image-classifier\\.venv\\Scripts\\python.exe`
  // work even though child process cwd is `SERVICE_DIR`.
  if (path.isAbsolute(configured)) {
    return configured;
  }
  if (configured.includes('/') || configured.includes('\\')) {
    const fromRepoRoot = path.resolve(process.cwd(), configured);
    if (fs.existsSync(fromRepoRoot)) return fromRepoRoot;

    const fromServiceDir = path.resolve(SERVICE_DIR, configured);
    if (fs.existsSync(fromServiceDir)) return fromServiceDir;

    return fromRepoRoot;
  }

  return configured;
}

function buildClassifierEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PYTHONUNBUFFERED: '1',
    PYTHONIOENCODING: 'utf-8',
    PYTHONUTF8: '1',
  };

  // Compatibility mapping across old/new env names.
  if (!env.RE_API_KEY && env.REALESTATE_API_KEY) {
    env.RE_API_KEY = env.REALESTATE_API_KEY;
  }
  if (!env.MLS_API_KEY && env.REALESTATE_API_KEY) {
    env.MLS_API_KEY = env.REALESTATE_API_KEY;
  }

  return env;
}

function parseEnvelope(stdout: string): PythonEnvelope {
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidate = lines.at(-1);
  if (!candidate) {
    throw new ClassifierExecutionError(
      'Classifier returned an empty response',
      502,
      stdout,
    );
  }

  try {
    const parsed = JSON.parse(candidate) as PythonEnvelope;
    return parsed;
  } catch {
    throw new ClassifierExecutionError(
      'Classifier returned invalid JSON',
      502,
      candidate,
    );
  }
}

export async function runPythonImageCategorization(
  input: ImageCategorizationInput,
): Promise<JsonObject> {
  if (!fs.existsSync(SCRIPT_PATH)) {
    throw new ClassifierExecutionError(
      `Classifier script not found at ${SCRIPT_PATH}`,
      500,
    );
  }

  const payload = JSON.stringify(input);
  const timeoutMs = resolveTimeoutMs();
  const pythonBin = resolvePythonBinary();

  return new Promise<JsonObject>((resolve, reject) => {
    const child = spawn(pythonBin, [SCRIPT_PATH], {
      cwd: SERVICE_DIR,
      env: buildClassifierEnv(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(
        new ClassifierExecutionError(
          `Failed to launch python process: ${err.message}`,
          500,
        ),
      );
    });

    child.on('close', (code) => {
      clearTimeout(timer);

      if (timedOut) {
        reject(
          new ClassifierExecutionError(
            `Classifier timed out after ${timeoutMs}ms`,
            504,
            stderr || stdout,
          ),
        );
        return;
      }

      if (code !== 0 && !stdout.trim()) {
        reject(
          new ClassifierExecutionError(
            `Classifier process exited with code ${code ?? 'unknown'}`,
            500,
            stderr,
          ),
        );
        return;
      }

      let envelope: PythonEnvelope;
      try {
        envelope = parseEnvelope(stdout);
      } catch (err) {
        reject(err);
        return;
      }

      if (!envelope.ok) {
        reject(
          new ClassifierExecutionError(
            envelope.error || 'Image categorization failed',
            envelope.status ?? 500,
            stderr || stdout,
          ),
        );
        return;
      }

      resolve(envelope.data || {});
    });

    child.stdin.write(payload);
    child.stdin.end();
  });
}
