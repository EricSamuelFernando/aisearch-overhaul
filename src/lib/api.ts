//  CONFIRMED BACKEND CONTRACT (IMMUTABLE)
// Backend Base URL (set NEXT_PUBLIC_API_BASE_URL in production)
import { isMlsBypassModeEnabled } from './mls-bypass-mode';

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5000";

const _COGNITO_CLIENT_ID =
    process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "10a2kdoa42lc0enni43mnbj5an";
const _COGNITO_STORAGE_KEY = `CognitoIdentityServiceProvider.${_COGNITO_CLIENT_ID}.LastAuthResult`;

/** Returns { Authorization: "Bearer <accessToken>" } when logged in, or {} for anonymous */
function getAuthHeaders(): Record<string, string> {
    try {
        if (typeof window === "undefined") return {};
        const stored = localStorage.getItem(_COGNITO_STORAGE_KEY);
        if (stored) {
            const { accessToken } = JSON.parse(stored);
            if (accessToken) return { Authorization: `Bearer ${accessToken}` };
        }
    } catch {
        // no token — anonymous request
    }
    return {};
}

export type SearchPayload = {
    query: string;
    session_id?: string | null;  //  Added for conversation memory
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
    selected_property_id?: string | number | null;
    selected_property_index?: number | null;
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
        session_id: payload.session_id
    });

    const res = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({
            query: payload.query,
            session_id: payload.session_id  //  Send session ID to backend
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
        session_id: payload.session_id
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
