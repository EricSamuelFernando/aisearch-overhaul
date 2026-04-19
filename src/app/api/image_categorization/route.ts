import { NextRequest, NextResponse } from 'next/server';
import {
  awaitImageCategorizationJobCompletion,
  ensureImageCategorizationJob,
  getImageCategorizationJobSnapshot,
  waitForImageCategorizationJob,
} from '@/lib/server/image-categorization-jobs';
import {
  allowLegacyClassifierFallback,
  ClassifierServiceError,
  postToClassifierService,
} from '@/lib/server/image-classifier-service-client';

export const runtime = 'nodejs';

const toIntOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

type ParsedPayload = {
  listingId: number | null;
  propertyId: number | null;
  propertyIdValue: unknown;
  parsedPropertyId: number | null;
  asyncMode: boolean;
  waitTimeoutMs: number | null;
};

function parsePayload(body: any): ParsedPayload {
  const listingId = toIntOrNull(body?.listingId ?? body?.listing_id);
  const propertyIdValue = body?.propertyId ?? body?.property_id;
  const parsedPropertyId =
    propertyIdValue === null || propertyIdValue === undefined || propertyIdValue === ''
      ? null
      : toIntOrNull(propertyIdValue);
  const propertyId =
    parsedPropertyId !== null && parsedPropertyId > 0 ? parsedPropertyId : null;
  const asyncMode = typeof body?.asyncMode === 'boolean' ? body.asyncMode : false;
  const waitTimeoutMsRaw = Number(body?.waitTimeoutMs);
  const waitTimeoutMs =
    Number.isFinite(waitTimeoutMsRaw) && waitTimeoutMsRaw > 0
      ? Math.min(Math.floor(waitTimeoutMsRaw), 60_000)
      : null;

  return {
    listingId,
    propertyId,
    propertyIdValue,
    parsedPropertyId,
    asyncMode,
    waitTimeoutMs,
  };
}

function validatePayload(parsed: ParsedPayload): NextResponse | null {
  if (parsed.listingId === null) {
    return NextResponse.json(
      { error: 'listingId is required and must be an integer' },
      { status: 400 },
    );
  }

  if (
    parsed.propertyIdValue !== null &&
    parsed.propertyIdValue !== undefined &&
    parsed.propertyIdValue !== '' &&
    parsed.parsedPropertyId === null
  ) {
    return NextResponse.json(
      { error: 'propertyId must be an integer when provided' },
      { status: 400 },
    );
  }

  return null;
}

async function runLegacyJobFlow(parsed: ParsedPayload): Promise<NextResponse> {
  const listingId = Number(parsed.listingId);
  const propertyId = parsed.propertyId;
  const { key, entry, started } = ensureImageCategorizationJob({
    listingId,
    propertyId,
  });
  console.log(
    `[ImageCategorization][route][legacy] listing=${listingId} property=${propertyId ?? 'n/a'} started=${started} status=${entry.status} asyncMode=${parsed.asyncMode} waitTimeoutMs=${parsed.waitTimeoutMs ?? 'none'}`,
  );

  if (parsed.asyncMode) {
    const snapshot = getImageCategorizationJobSnapshot(key) || {
      listingId,
      propertyId,
      status: started ? 'queued' : entry.status,
    };

    return NextResponse.json(
      {
        ...snapshot,
        jobQueued: started || entry.status === 'running' || entry.status === 'queued',
      },
      { status: 202 },
    );
  }

  if (parsed.waitTimeoutMs) {
    await waitForImageCategorizationJob(key, parsed.waitTimeoutMs);
    const snapshot =
      getImageCategorizationJobSnapshot(key) || {
        listingId,
        propertyId,
        status: 'queued',
      };
    return NextResponse.json(snapshot, { status: 200 });
  }

  await awaitImageCategorizationJobCompletion(key);
  const snapshot = getImageCategorizationJobSnapshot(key);
  if (!snapshot) {
    return NextResponse.json(
      { error: 'Image categorization job not found after completion' },
      { status: 500 },
    );
  }

  const failed = String(snapshot.status || '').toLowerCase() === 'failed';
  if (failed) {
    return NextResponse.json(snapshot, { status: 500 });
  }
  return NextResponse.json(snapshot, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = parsePayload(body);
  const validationError = validatePayload(parsed);
  if (validationError) return validationError;

  try {
    const payload: Record<string, unknown> = { listingId: parsed.listingId! };
    if (parsed.propertyId !== null) {
      payload.propertyId = parsed.propertyId;
    }
    if (parsed.asyncMode) payload.asyncMode = true;
    if (parsed.waitTimeoutMs !== null) payload.waitTimeoutMs = parsed.waitTimeoutMs;

    const proxied = await postToClassifierService('/api/image_categorization', payload);
    console.log(
      `[ImageCategorization][route][proxy] listing=${parsed.listingId} property=${parsed.propertyId ?? 'n/a'} status=${proxied.status} asyncMode=${parsed.asyncMode}`,
    );
    return NextResponse.json(proxied.body, { status: proxied.status });
  } catch (error) {
    if (error instanceof ClassifierServiceError) {
      const canFallback =
        allowLegacyClassifierFallback() && (error.statusCode >= 500 || error.statusCode === 502);
      if (canFallback) {
        console.warn(
          `[ImageCategorization][route] proxy failed, falling back to legacy pipeline: ${error.message}`,
        );
        return runLegacyJobFlow(parsed);
      }

      return NextResponse.json(
        error.payload || {
          error: error.message,
          details: error.details,
        },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      {
        error: 'Image categorization route failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
