import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { error } from '@/components/alert/notify';

const ASK_AI_API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/question`; // Appended /question path

interface AskAIRequest {
    question: string;
}

interface AskAIResponse {
    answer: string;
    suggestions: string[];
    chart_data?: any;
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
            // Using axios directly to avoid any base URL configuration from the custom client if specific to main backend
            const response = await axios.post<AskAIResponse>(
                ASK_AI_API_URL,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
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
