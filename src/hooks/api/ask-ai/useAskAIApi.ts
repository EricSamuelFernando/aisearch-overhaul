import { useMutation } from '@tanstack/react-query';
import { error } from '@/components/alert/notify';

const ASK_AI_API_URL = `/api/ask-ai`;

interface AskAIRequest {
    query: string;
    context?: Record<string, any>;
    contextId?: string | null;
}

interface AskAIResponse {
    answer: string;
    suggestions: string[];
    chart_data?: any;
    context_id?: string;
    metrics?: {
        model: string;
        ttft: number;
        total_time: number;
        tps: number;
        input_tokens: number;
        output_tokens: number;
    };
}

export const useAskAIApi = () => {
    const askAIMutation = useMutation({
        mutationFn: async (data: AskAIRequest) => {
            const response = await fetch(ASK_AI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                },
                body: JSON.stringify({
                    query: data.query,
                    context: data.context,
                    context_id: data.contextId || undefined,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Ask AI failed with status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let answerText = '';
            let suggestions: string[] = [];
            let contextId: string | undefined;

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
                        const evt = JSON.parse(payload) as { type?: string; text?: string; data?: any; context_id?: string };
                        if (evt.type === 'token' && typeof evt.text === 'string') {
                            answerText += evt.text;
                        } else if (evt.type === 'suggestions' && Array.isArray(evt.data)) {
                            suggestions = evt.data;
                        } else if (evt.type === 'metadata') {
                            const metaContextId =
                                evt.context_id ||
                                evt.data?.context_id;
                            if (typeof metaContextId === 'string' && metaContextId.trim()) {
                                contextId = metaContextId;
                            }
                        } else if (evt.type === 'done') {
                            // stream finished
                        } else if (evt.type === 'error') {
                            throw new Error((evt as any).message || 'Stream error');
                        }
                    } catch (parseErr) {
                        if (parseErr instanceof Error && parseErr.message?.includes('Stream error')) {
                            throw parseErr;
                        }
                        // Ignore parse errors for non-JSON keepalive lines.
                    }
                }
            }

            const result: AskAIResponse = {
                answer: answerText,
                suggestions,
                context_id: contextId,
            };
            return result;
        },
        onError: (err: any) => {
            console.error('Ask AI Error:', err);
            // Optional: show error toast. 
            // For chat interfaces, sometimes it's better to handle error in UI component to show a message bubble.
            // But keeping it here for consistency if needed.
            error({ message: 'Failed to get answer from AI. Please try again.' });
        },
    });

    return { askAIMutation };
};
