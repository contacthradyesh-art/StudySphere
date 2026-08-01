"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Tabs } from "@/components/shared/Tabs";
import { showToast } from "@/components/shared/Toast";
import { cn } from "@/utils/cn";
import { consumePendingAiPrompt } from "@/lib/ai/pending-prompt";
import type { ChatMessage, DoubtMode } from "../types";

const modeTabs = [{ id: "standard", label: "Standard" }, { id: "explain-like-confused", label: "Explain Like I'm Confused" }];

export function DoubtSolverContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<DoubtMode>("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const autoSentRef = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useCallback(async (text: string, imageUrl: string | null) => {
    if (!text.trim() && !imageUrl) return;
    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, role: "user", content: text || "Please analyze this image", imageUrl: imageUrl || undefined, timestamp: new Date(), mode };
    const history = [...messages, userMessage];
    setMessages(history);
    setInputText("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          mode,
          image: imageUrl || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assistant unavailable');
      const aiMessage: ChatMessage = { id: `msg-${Date.now()}-ai`, role: "assistant", content: data.reply, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      showToast("Couldn't reach the AI assistant. Please try again.", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [messages, mode]);

  const handleSend = useCallback(() => {
    sendMessage(inputText, selectedImage);
  }, [inputText, selectedImage, sendMessage]);

  // On first mount, pick up a prompt handed off from elsewhere in the app
  // (e.g. Mission IAS's "Ask AI" button, or a dashboard quick-ask button's
  // ?q= link) and send it automatically — no separate chat system needed.
  useEffect(() => {
    if (autoSentRef.current) return;
    autoSentRef.current = true;
    const fromMissionIas = consumePendingAiPrompt();
    const fromQuery = searchParams.get('q');
    const prompt = fromMissionIas || fromQuery;
    if (prompt) sendMessage(prompt, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Please upload an image file", "warning"); return; }
    if (file.size > 5 * 1024 * 1024) { showToast("Image must be under 5MB", "warning"); return; }
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }, [handleSend]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">AI Doubt Solver</h2><p className="text-charcoal-400 text-sm">Get instant help with text or photo questions</p></div>
      <Tabs tabs={modeTabs} activeTab={mode} onChange={(id) => setMode(id as DoubtMode)} />
      {mode === "explain-like-confused" && (
        <Card variant="glow-neon" padding="sm"><p className="text-xs text-neon-300">🧸 Confused Mode: I'll use super simple language, real-world analogies, and tiny steps. No jargon!</p></Card>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-4">🤖</span>
            <h3 className="text-lg font-semibold text-charcoal-200 mb-2">Ask me anything!</h3>
            <p className="text-sm text-charcoal-500 max-w-md">Type your doubt, paste a question, or upload a photo. I'll explain it step by step.</p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {["Solve: If CI on Rs 5000 at 10% for 2 years?", "Explain Syllogism rules", "What is Article 14?"].map((q) => (
                <button key={q} onClick={() => setInputText(q)} className="text-xs px-3 py-1.5 rounded-full bg-charcoal-800/50 text-charcoal-400 border border-charcoal-700/30 hover:border-electric/30 hover:text-electric-300 transition-colors">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] rounded-2xl px-4 py-3", msg.role === "user" ? "bg-electric/20 border border-electric/30 text-charcoal-100" : "glass text-charcoal-100")}>
              {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded" className="rounded-lg mb-2 max-h-48 object-contain" />}
              <div className="text-sm whitespace-pre-line leading-relaxed">
                {msg.content.split("**").map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-charcoal-50">{part}</strong> : part))}
              </div>
              <p className="text-[10px] text-charcoal-600 mt-2">{msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-electric animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-electric animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-electric animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectedImage && (
        <div className="relative inline-block">
          <img src={selectedImage} alt="Preview" className="h-16 rounded-lg border border-charcoal-700/50" />
          <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">×</button>
        </div>
      )}

      <div className="glass rounded-2xl p-3 border border-white/[0.06]">
        <div className="flex items-end gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-200 hover:bg-charcoal-800/50 transition-colors flex-shrink-0" title="Upload photo">📷</button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={mode === "explain-like-confused" ? "Ask anything... I'll keep it super simple!" : "Type your doubt here..."}
            className="flex-1 bg-transparent text-charcoal-50 placeholder:text-charcoal-600 text-sm resize-none focus:outline-none min-h-[40px] max-h-[120px]" rows={1} />
          <Button variant="primary" size="sm" onClick={handleSend} disabled={!inputText.trim() && !selectedImage} isLoading={isLoading} className="flex-shrink-0">Send</Button>
        </div>
      </div>
    </motion.div>
  );
}