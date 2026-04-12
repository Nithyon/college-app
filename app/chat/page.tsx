import { ChatClient } from "@/components/chat/ChatClient";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  const live = Boolean(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY);
  return <ChatClient initialMode={live ? "live" : "demo"} />;
}
