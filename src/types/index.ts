import MessageList from "@/components/MessageList.vue";

// src/types/index.ts
export interface Message {
  id: string | number;
  content: string;
}
export type MessageList = Message[];

