import { runPythonImageCategorization } from '@/lib/server/python-image-classifier';

export type ImageCategorizationJobStatus = 'queued' | 'running' | 'done' | 'failed';

interface JobEntry {
  status: ImageCategorizationJobStatus;
  listingId: number;
  propertyId: number | null;
  updatedAt: number;
  startedAt?: number;
  finishedAt?: number;
  error?: string;
  result?: Record<string, unknown>;
  promise?: Promise<void>;
}

interface JobInput {
  listingId: number;
  propertyId: number | null;
}

const jobs = new Map<string, JobEntry>();
const MAX_CACHE_AGE_MS = Math.max(
  60_000,
  Number(process.env.IMAGE_CLASSIFICATION_JOB_TTL_MS || 15 * 60_000),
);

function jobKey(input: JobInput): string {
  // Dedupe by listing so preview-load calls and modal-open calls share the same job.
  // propertyId often arrives later, and using it in the key can trigger duplicate work.
  return `${input.listingId}`;
}

function nowMs(): number {
  return Date.now();
}

function pruneExpiredJobs() {
  const cutoff = nowMs() - MAX_CACHE_AGE_MS;
  for (const [key, entry] of jobs.entries()) {
    if (entry.updatedAt < cutoff) {
      jobs.delete(key);
    }
  }
}

function getSnapshot(entry: JobEntry): Record<string, unknown> {
  if (entry.status === 'done' && entry.result) {
    return {
      ...entry.result,
      status: 'done',
      listingId: entry.listingId,
      propertyId: entry.propertyId,
      cacheUsed: false,
      categorizationCacheUsed: false,
    };
  }

  return {
    listingId: entry.listingId,
    propertyId: entry.propertyId,
    status: entry.status,
    error: entry.error,
    cacheUsed: false,
    categorizationCacheUsed: false,
  };
}

function startJob(input: JobInput, entry: JobEntry): Promise<void> {
  entry.status = 'running';
  entry.startedAt = nowMs();
  entry.updatedAt = entry.startedAt;
  entry.error = undefined;
  console.log(
    `[ImageCategorization] job running listing=${input.listingId} property=${input.propertyId ?? 'n/a'}`,
  );

  const promise = (async () => {
    try {
      const result = await runPythonImageCategorization({
        listingId: input.listingId,
        propertyId: input.propertyId,
      });

      entry.result = result;
      entry.status = 'done';
      entry.updatedAt = nowMs();
      entry.finishedAt = entry.updatedAt;
      entry.error = undefined;
      console.log(
        `[ImageCategorization] job done listing=${input.listingId} property=${input.propertyId ?? 'n/a'}`,
      );
    } catch (error) {
      entry.status = 'failed';
      entry.updatedAt = nowMs();
      entry.finishedAt = entry.updatedAt;
      entry.error =
        error instanceof Error ? error.message : String(error || 'Unknown error');
      console.error(
        `[ImageCategorization] job failed listing=${input.listingId} property=${input.propertyId ?? 'n/a'} error=${entry.error}`,
      );
    }
  })();

  entry.promise = promise;
  return promise;
}

export function ensureImageCategorizationJob(input: JobInput): {
  key: string;
  entry: JobEntry;
  started: boolean;
} {
  pruneExpiredJobs();
  const key = jobKey(input);
  const existing = jobs.get(key);

  if (existing) {
    if (existing.propertyId === null && input.propertyId !== null) {
      existing.propertyId = input.propertyId;
      existing.updatedAt = nowMs();
    }
    if (existing.status === 'running' || existing.status === 'queued') {
      return { key, entry: existing, started: false };
    }
    if (existing.status === 'done') {
      return { key, entry: existing, started: false };
    }
    // If previously failed, retry on next request.
  }

  const entry: JobEntry =
    existing ?? {
      status: 'queued',
      listingId: input.listingId,
      propertyId: input.propertyId,
      updatedAt: nowMs(),
    };

  entry.status = 'queued';
  entry.listingId = input.listingId;
  entry.propertyId = input.propertyId;
  entry.updatedAt = nowMs();
  entry.error = undefined;
  entry.finishedAt = undefined;
  jobs.set(key, entry);
  console.log(
    `[ImageCategorization] job queued listing=${input.listingId} property=${input.propertyId ?? 'n/a'}`,
  );
  void startJob(input, entry);

  return { key, entry, started: true };
}

export async function waitForImageCategorizationJob(
  key: string,
  timeoutMs: number,
): Promise<JobEntry | null> {
  const entry = jobs.get(key);
  if (!entry) return null;
  if (entry.status === 'done' || entry.status === 'failed') return entry;
  if (!entry.promise) return entry;

  const wait = new Promise<void>((resolve) => {
    setTimeout(resolve, timeoutMs);
  });
  await Promise.race([entry.promise, wait]);
  return jobs.get(key) ?? entry;
}

export async function awaitImageCategorizationJobCompletion(
  key: string,
): Promise<JobEntry | null> {
  const entry = jobs.get(key);
  if (!entry) return null;
  if (!entry.promise) return entry;
  await entry.promise;
  return jobs.get(key) ?? entry;
}

export function getImageCategorizationJobSnapshot(
  key: string,
): Record<string, unknown> | null {
  const entry = jobs.get(key);
  if (!entry) return null;
  return getSnapshot(entry);
}
