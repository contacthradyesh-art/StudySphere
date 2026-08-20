import type { SubjectArea } from "@/types/common";

export type DoubtMode = "standard" | "explain-like-confused";
export type InputType = "text" | "photo";

export interface Doubt {
  id: string; question: string; imageUrl?: string; mode: DoubtMode; subject?: SubjectArea; createdAt: Date;
}

export interface DoubtResponse {
  id: string; doubtId: string; explanation: string; steps?: string[]; keyPoints?: string[];
  relatedTopics?: string[]; difficulty?: string; createdAt: Date;
}

export interface ChatMessage {
  id: string; role: "user" | "assistant"; content: string; imageUrl?: string; timestamp: Date; mode?: DoubtMode;
}

export interface DoubtSession {
  id: string; messages: ChatMessage[]; subject?: SubjectArea; mode: DoubtMode; createdAt: Date;
}
