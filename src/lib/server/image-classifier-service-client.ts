type JsonValue = Record<string, unknown>;

export class ClassifierServiceError extends Error {
  readonly statusCode: number;
  readonly payload?: JsonValue;
  readonly details?: string;

  constructor(message: string, statusCode = 502, payload?: JsonValue, details?: string) {
    super(message);
    this.name = 'ClassifierServiceError';
    this.statusCode = statusCode;
    this.payload = payload;
    this.details = details;
  }
}

const DEFAULT_SERVICE_URL = 'http://127.0.0.1:8010';

function resolveServiceBaseUrl(): string {
  const raw =
    process.env.IMAGE_CLASSIFIER_SERVICE_URL ||
    process.env.IMAGE_CLASSIFIER_INTERNAL_BASE_URL ||
    DEFAULT_SERVICE_URL;
  return String(raw).trim().replace(/\/+$/, '');
}

function resolveTimeoutMs(): number {
  const raw = Number(process.env.IMAGE_CLASSIFIER_SERVICE_TIMEOUT_MS || 90_000);
  if (!Number.isFinite(raw) || raw <= 0) return 90_000;
  return Math.floor(raw);
}

async function parseJsonSafe(response: Response): Promise<JsonValue> {
  try {
    const data = await response.json();
    return (data && typeof data === 'object' ? data : {}) as JsonValue;
  } catch {
    return {};
  }
}

export async function postToClassifierService(
  path: string,
  payload: Record<string, unknown>,
): Promise<{ status: number; body: JsonValue }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), resolveTimeoutMs());
  const base = resolveServiceBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal,
    });
    const body = await parseJsonSafe(response);
    if (!response.ok) {
      throw new ClassifierServiceError(
        String(body.error || body.detail || `Classifier service error (${response.status})`),
        response.status,
        body,
      );
    }
    return { status: response.status, body };
  } catch (error) {
    if (error instanceof ClassifierServiceError) {
      throw error;
    }
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? `Classifier service request timed out (${resolveTimeoutMs()}ms)`
        : `Classifier service request failed: ${error instanceof Error ? error.message : String(error)}`;
    throw new ClassifierServiceError(message, 502);
  } finally {
    clearTimeout(timeout);
  }
}

export function allowLegacyClassifierFallback(): boolean {
  const value = String(process.env.IMAGE_CLASSIFIER_ALLOW_FALLBACK ?? 'true').toLowerCase();
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}
