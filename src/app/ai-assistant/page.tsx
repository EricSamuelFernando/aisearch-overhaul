import type { Metadata } from "next";
import AIAssistantChat from "@/components/ai-assistant/AIAssistantChat";

export const metadata: Metadata = {
  title: "Snaphomz | AI Real Estate Assistant",
  description: "Search MLS listings in natural language — powered by Snaphomz AI",
};

export default function AIAssistantPage() {
  return (
    <div className="h-screen">
      <AIAssistantChat />
    </div>
  );
}
