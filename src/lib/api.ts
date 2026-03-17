//  CONFIRMED BACKEND CONTRACT (IMMUTABLE)
// Backend Base URL (set NEXT_PUBLIC_API_BASE_URL in production)
import { PROPERTY_SEARCH_AI_URL, MLS_SEARCH_LIVE_URL } from '@/shared/constants/env';
import { isMlsBypassModeEnabled } from './mls-bypass-mode';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";
const AI_BASE =
    process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI ?? API_BASE;

const _COGNITO_CLIENT_ID =
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "6240jv1q945bmdv86kj7m1dqc4";
const _COGNITO_STORAGE_KEY = `CognitoIdentityServiceProvider.${_COGNITO_CLIENT_ID}.LastAuthResult`;

/** Returns { Authorization: "Bearer <accessToken>" } when logged in, or {} for anonymous */
function getAuthHeaders(): Record<string, string> {
    try {
        if (typeof window === "undefined") return {};
        // Token stored by useUserAuthApi after login
        const accessToken = localStorage.getItem("userAccessToken");
        if (accessToken) return { Authorization: `Bearer ${accessToken}` };
    } catch {
        // no token - anonymous request
    }
    return {};
}

export type SearchPayload = {
    query: string;
    session_id?: string | null;  //  Added for conversation memory
    system_prompt?: string | null;
    assistant_mode?: string | null;
    state?: string | null;
    city?: string | null;
    zip_code?: string | null;
    min_price?: number | null;
    max_price?: number | null;
    beds?: number | null;
    baths?: number | null;
    school_rating_min?: number | null;
    use_cache?: boolean | null;
};

export type RentVsBuyPayload = {
    location?: string;      // Full state name (e.g., "California")
    budget?: number;        // Included as per user requirement (Backend might ignore or use)
    income?: number;        // Annual income
    down_payment?: number;  // Optional, defaults to backend value
    loan_term?: number;     // Optional, defaults to 30
    mortgage_rate?: number; // Optional, defaults to backend value
};

export type QuestionPayload = {
    question: string;
    session_id?: string | null;
    system_prompt?: string | null;
    assistant_mode?: string | null;
    selected_property_id?: string | number | null;
    selected_property_index?: number | null;
};

export type ThinkingEvent = {
    id?: string;
    label?: string;
    title?: string;
    detail?: string;
    bullets?: string[];
    status?: 'pending' | 'active' | 'done' | 'error';
    source?: string;
    metrics?: Record<string, string | number | boolean>;
    started_at?: string | null;
    ended_at?: string | null;
    durationMs?: number;
    agentName?: string;
};

export type ThinkingProgressResponse = {
    session_id?: string;
    steps: ThinkingEvent[];
    is_done: boolean;
    updated_at?: number;
};

export async function searchProperties(payload: SearchPayload, signal?: AbortSignal) {
    if (isMlsBypassModeEnabled()) {
        const res = await fetch('/api/mls/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(payload),
            signal,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('[MLS Bypass] Search Error:', res.status, errorText);
            throw new Error('MLS search request failed');
        }

        return res.json();
    }

    console.log('[API] Search Request:', {
        query: payload.query,
        session_id: payload.session_id,
        assistant_mode: payload.assistant_mode
    });

    // Use the local Next.js proxy to bypass CORS (hits our src/app/api/search/route.ts)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    // const res = await fetch(`${baseUrl}/api/search`, {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            query: payload.query,
            session_id: payload.session_id,  //  Send session ID to backend
            system_prompt: payload.system_prompt,
            assistant_mode: payload.assistant_mode,
        }),
        signal, // Pass signal to fetch
    });

    if (!res.ok) {
        throw new Error("Backend request failed");
    }

    const data = await res.json();
    console.log('[API] Search Response:', {
        session_id: data.session_id,
        properties_count: data.properties?.length || 0
    });

    return data;  //  Return full response including session_id
}


// NOTE: Rent vs Buy is now computed locally (no API dependency).
// export async function rentVsBuy(payload: RentVsBuyPayload) {
//   // Log the request for debugging
//   console.log('[API] Rent vs Buy Request:', JSON.stringify(payload, null, 2));
//
//   const res = await fetch(`${API_BASE}/rent-vs-buy`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json"
//     },
//     body: JSON.stringify(payload),
//   });
//
//   if (!res.ok) {
//     const errorText = await res.text();
//     console.error('[API] Rent vs Buy Error:', res.status, errorText);
//     if (res.status === 422) {
//       throw new Error("Missing required details to calculate rent vs buy. Please provide state, budget, and monthly income.");
//     }
//     throw new Error("Service temporarily unavailable. Please try again.");
//   }
//
//   return res.json();
// }

export async function askQuestion(payload: QuestionPayload, signal?: AbortSignal) {
    if (isMlsBypassModeEnabled()) {
        return {
            intent: 'question',
            answer:
                'AI Q&A is currently bypassed. Turn off "Direct MLS" mode to use chat answers, or ask for a property search (city/ZIP, beds, baths, budget).',
            suggestions: [
                '3-bedroom homes in Los Angeles under 1.5M',
                'Homes in 90266 with a pool',
                '4 bed homes in Austin, TX'
            ],
            metadata: { response_mode: 'text_only', source: 'mls_bypass' }
        };
    }

    // Use /question endpoint (not /api/question)
    console.log('[API] Question Request:', {
        question: payload.question,
        session_id: payload.session_id,
        assistant_mode: payload.assistant_mode
    });

    const res = await fetch(`${API_BASE}/question`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
        signal, // Pass signal to fetch
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('[API] Question Error:', res.status, errorText);
        throw new Error("Service temporarily unavailable. Please try again.");
    }

    const data = await res.json();
    if (data.session_id) {
        console.log('[API] Question Response Session:', data.session_id);
    }
    return data;
}

export async function cancelActiveTask(session_id: string) {
    try {
        console.log('[API] Sending Cancellation Signal for:', session_id);
        await fetch(`${API_BASE}/api/cancel-task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ session_id }),
        });
    } catch (e) {
        console.error("[API] Failed to send cancellation signal:", e);
    }
}

export async function fetchHistory() {
    if (isMlsBypassModeEnabled()) return [];
    try {
        const res = await fetch(`${API_BASE}/api/history`, {
            headers: { ...getAuthHeaders() },
        });
        const data = await res.json();
        return data.sessions || [];
    } catch (e) {
        console.error("Failed to fetch history:", e);
        return [];
    }
}

export async function fetchSessionDetails(session_id: string) {
    if (isMlsBypassModeEnabled()) return null;
    try {
        const res = await fetch(`${API_BASE}/api/history/${session_id}`, {
            headers: { ...getAuthHeaders() },
        });
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch session:", e);
        return null;
    }
}

export async function clearHistoryAPI() {
    if (isMlsBypassModeEnabled()) return true;
    try {
        const res = await fetch(`${API_BASE}/api/history`, {
            method: 'DELETE',
            headers: { ...getAuthHeaders() },
        });
        return res.ok;
    } catch (e) {
        console.error("Failed to clear history:", e);
        return false;
    }
}

export async function fetchThinkingProgress(sessionId: string): Promise<ThinkingProgressResponse> {
    if (!sessionId) return { steps: [], is_done: true };
    try {
        const res = await fetch(`${API_BASE}/api/thinking/${encodeURIComponent(sessionId)}`, {
            headers: {
                "Accept": "application/json",
                ...getAuthHeaders(),
            },
        });
        if (!res.ok) return { steps: [], is_done: false };
        const payload = await res.json();
        return {
            session_id: payload?.session_id,
            steps: Array.isArray(payload?.steps) ? payload.steps : [],
            is_done: Boolean(payload?.is_done),
            updated_at: payload?.updated_at,
        };
    } catch {
        return { steps: [], is_done: false };
    }
}

// --- Address Autocomplete ---------------------------------------------------

export type AddressSuggestion = {
    address: string;
    id: string;
    listingId: string;
    city: string;
    state: string;
    zip_code: string;
};

/**
 * Fetches MLS property address suggestions for the given partial address string.
 * Used by the hero search box to show a live autocomplete dropdown.
 * Returns an empty array on any error so it never breaks the UI.
 */
export async function suggestAddresses(q: string, limit = 5): Promise<AddressSuggestion[]> {
    const params = new URLSearchParams({ q, limit: String(limit) });
    const baseCandidates = [AI_BASE, API_BASE].filter(Boolean);
    const uniqueBases = Array.from(new Set(baseCandidates));

    for (const base of uniqueBases) {
        try {
            const res = await fetch(`${base}/api/address/suggest?${params.toString()}`, {
                headers: {
                    "Accept": "application/json",
                    ...getAuthHeaders(),
                },
            });
            if (!res.ok) continue;
            const data = await res.json();
            if (Array.isArray(data)) return data;
        } catch {
            // Try next base candidate.
        }
    }
    return [];
}