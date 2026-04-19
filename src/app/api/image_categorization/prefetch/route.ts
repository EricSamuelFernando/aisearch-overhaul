import { NextRequest, NextResponse } from 'next/server';
import {
  ensureImageCategorizationJob,
  getImageCategorizationJobSnapshot,
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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const listingId = toIntOrNull(body?.listingId ?? body?.listing_id);
  const propertyIdValue = body?.propertyId ?? body?.property_id;
  const parsedPropertyId =
    propertyIdValue === null || propertyIdValue === undefined || propertyIdValue === ''
      ? null
      : toIntOrNull(propertyIdValue);
  const propertyId =
    parsedPropertyId !== null && parsedPropertyId > 0 ? parsedPropertyId : null;

  if (listingId === null) {
    return NextResponse.json(
      { error: 'listingId is required and must be an integer' },
      { status: 400 },
    );
  }
  if (
    propertyIdValue !== null &&
    propertyIdValue !== undefined &&
    propertyIdValue !== '' &&
    parsedPropertyId === null
  ) {
    return NextResponse.json(
      { error: 'propertyId must be an integer when provided' },
      { status: 400 },
    );
  }

  try {
    const payload: Record<string, unknown> = { listingId };
    if (propertyId !== null) {
      payload.propertyId = propertyId;
    }

    const proxied = await postToClassifierService('/api/image_categorization/prefetch', payload);
    console.log(
      `[ImageCategorization][prefetch][proxy] listing=${listingId} property=${propertyId ?? 'n/a'} status=${proxied.status}`,
    );
    return NextResponse.json(proxied.body, { status: proxied.status });
  } catch (error) {
    if (error instanceof ClassifierServiceError) {
      const canFallback =
        allowLegacyClassifierFallback() && (error.statusCode >= 500 || error.statusCode === 502);
      if (canFallback) {
        console.warn(
          `[ImageCategorization][prefetch] proxy failed, falling back to legacy pipeline: ${error.message}`,
        );
        const { key, entry, started } = ensureImageCategorizationJob({
          listingId,
          propertyId,
        });
        console.log(
          `[ImageCategorization][prefetch][legacy] listing=${listingId} property=${propertyId ?? 'n/a'} started=${started} status=${entry.status}`,
        );
        const snapshot = getImageCategorizationJobSnapshot(key) || {
          listingId,
          propertyId,
          status: started ? 'queued' : entry.status,
        };

        return NextResponse.json(
          {
            ...snapshot,
            scheduled: started,
            deduped: !started,
          },
          { status: 200 },
        );
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
        error: 'Failed to prefetch image categorization',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
