import { useState } from 'react';
import { error } from '@/components/alert/notify';

// Rewired to use /api/ai-assistant (same backend as landing page AI search)
const ASK_AI_API_URL = `/api/ai-assistant`;

interface AskAIStreamOptions {
    query: string;
    onToken: (token: string) => void;
    onDone: (fullText: string) => void;
    onError: (err: Error) => void;
}

function getUserId(): string {
    try {
        const stored = localStorage.getItem('userDetails');
        if (stored) {
            const parsed = JSON.parse(stored);
            const id = parsed.id || parsed.userId || parsed.sub;
            if (id) return id;
        }
    } catch {}
    // Fallback: persistent anonymous UUID (same pattern as LandingAIChat)
    try {
        const ANON_KEY = 'snaphomz_anon_id';
        let anon = localStorage.getItem(ANON_KEY);
        if (!anon) {
            anon = crypto.randomUUID();
            localStorage.setItem(ANON_KEY, anon);
        }
        return anon;
    } catch {}
    return crypto.randomUUID();
}

function getConversationId(): string | null {
    try {
        return sessionStorage.getItem('landing_ai_chat_conv_id');
    } catch {}
    return null;
}

export const useAskAIApi = () => {
    const [isStreaming, setIsStreaming] = useState(false);

    const streamQuery = async ({ query, onToken, onDone, onError }: AskAIStreamOptions) => {
        setIsStreaming(true);
        let accumulated = '';

        try {
            const response = await fetch(ASK_AI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({
                    message: query,
                    userId: getUserId(),
                    conversationId: getConversationId(),
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Ask AI failed with status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() ?? '';
                for (const part of parts) {
                    const line = part.trim();
                    if (!line.startsWith('data: ')) continue;
                    const payload = line.slice(6);
                    try {
                        const evt = JSON.parse(payload) as { type?: string; text?: string; message?: string };
                        if (evt.type === 'token' && typeof evt.text === 'string') {
                            accumulated += evt.text;
                            onToken(evt.text);
                        } else if (evt.type === 'error') {
                            throw new Error(evt.message || 'Stream error');
                        }
                    } catch (parseErr) {
                        // Re-throw intentional stream errors; ignore JSON parse failures on keepalive lines
                        if (parseErr instanceof Error && parseErr.message !== 'Unexpected token' && !parseErr.message.startsWith('JSON')) {
                            throw parseErr;
                        }
                    }
                }
            }

            onDone(accumulated);
        } catch (err) {
            onError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsStreaming(false);
        }
    };

    return { streamQuery, isStreaming };
};
