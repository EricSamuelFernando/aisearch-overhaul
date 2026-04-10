"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/shared/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function cleanContent(content: string): string {
  return content
    .replace(/\[PROFILE_UPDATE\][\s\S]*?\[\/PROFILE_UPDATE\]/g, "")
    .replace(/```mls_search[\s\S]*?```/g, "")
    .trim();
}

function ListingCard({ content }: { content: string }) {
  // Detect if content contains listing-style numbered entries
  const hasListings = /\[\d+\]/.test(content);
  if (!hasListings) return null;

  const blocks = content
    .split(/(?=\[\d+\])/)
    .filter((b) => b.trim().startsWith("["));

  return (
    <div className="space-y-3 mt-2">
      {blocks.map((block, i) => {
        const lines = block.trim().split("\n").filter(Boolean);
        const header = lines[0] ?? "";
        const details = lines.slice(1);
        return (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="font-semibold text-gray-900 text-sm">{header}</p>
            <div className="mt-1 space-y-0.5">
              {details.map((line, j) => (
                <p key={j} className="text-xs text-gray-600 leading-5">
                  {line.trim()}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AIAssistantChat() {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Snaphomz AI assistant. Tell me what you're looking for — location, budget, bedrooms, must-haves — and I'll pull up matching listings from the MLS.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userId = user?.id ?? "anon";

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    // Placeholder for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, userId }),
      });

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, user?.id]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full bg-primary-100">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-main flex items-center justify-center text-white text-base">
            ✦
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">AI Real Estate Assistant</h1>
            <p className="text-xs text-gray-500">Search MLS listings in natural language</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m, i) => {
            const clean = cleanContent(m.content);
            const isUser = m.role === "user";
            const isThinking = !isUser && !clean && loading && i === messages.length - 1;

            return (
              <div
                key={i}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-primary-main flex-shrink-0 flex items-center justify-center text-white text-xs mr-2 mt-0.5">
                    ✦
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${
                    isUser
                      ? "bg-primary-main text-white rounded-br-sm"
                      : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100"
                  }`}
                >
                  {isThinking ? (
                    <span className="flex gap-1 items-center text-gray-400">
                      <span className="animate-bounce delay-0">.</span>
                      <span className="animate-bounce delay-150">.</span>
                      <span className="animate-bounce delay-300">.</span>
                    </span>
                  ) : isUser ? (
                    <p className="whitespace-pre-wrap">{clean || m.content}</p>
                  ) : (
                    <>
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {clean || m.content}
                        </ReactMarkdown>
                      </div>
                      <ListingCard content={clean || m.content} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-4 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent transition-shadow min-h-[48px] max-h-40 overflow-y-auto"
              placeholder="3 bed, 2 bath in Austin under $600k with a pool…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 px-5 py-3 bg-primary-main text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-orange-600 transition-colors"
            >
              {loading ? (
                <span className="flex gap-0.5">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-75">.</span>
                  <span className="animate-bounce delay-150">.</span>
                </span>
              ) : (
                "Send"
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            Enter to send · Shift+Enter for new line · Preferences saved automatically
          </p>
        </div>
      </div>
    </div>
  );
}
