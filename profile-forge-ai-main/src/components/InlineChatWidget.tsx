import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Trash2, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useProfileStore } from "../store/profileStore";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const API_BASE = (import.meta as any).env.VITE_API_URL || "";

const InlineChatWidget = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: "👋 Hi! I'm your AI Profile Assistant. Ask me about your profile or tell me what to update!", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateProfile } = useProfileStore();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping || !user?.email) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, email: user.email })
      });
      const data = await res.json();

      if (data.updates) {
        updateProfile(data.updates);
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        toast({ title: "Profile updated", description: "Changes synced using AI assistant." });
      }

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply || "No response received.", timestamp: new Date() }]);
    } catch (e) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Error connecting to backend.", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, updateProfile, queryClient, toast, user]);

  const clearChat = () => {
    setMessages([{ id: "welcome", role: "assistant", content: "👋 Chat cleared! How can I help you?", timestamp: new Date() }]);
  };

  return (
    <div className="w-full h-[600px] lg:h-[calc(100vh-8rem)] glass-card rounded-2xl border border-border/50 shadow-glow flex flex-col overflow-hidden">
      {/* Header */}
      <div className="gradient-primary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-foreground">
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <button onClick={clearChat} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" title="Clear chat">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
              ? "gradient-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
              }`}>
              <div className="whitespace-pre-line" dangerouslySetInnerHTML={{
                __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} />
              <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-3 py-2 bg-muted rounded-2xl rounded-bl-md w-fit">
            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your profile..."
            className="h-10 text-sm"
            disabled={isTyping}
          />
          <Button onClick={sendMessage} size="icon" className="h-10 w-10 gradient-primary text-primary-foreground shrink-0" disabled={!input.trim() || isTyping}>
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InlineChatWidget;
