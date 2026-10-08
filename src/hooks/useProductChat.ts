'use client';

import { useState } from 'react';
import { apiClient } from '../lib/api-client';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  isInformationGap?: boolean;
}

export function useProductChat(productId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (question: string, language: string = 'ku') => {
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.aiProductChat(productId, question, language);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.answer,
          isInformationGap: response.isInformationGap,
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to get answer');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to connect to product assistant. Please check merchant specifications.',
          isInformationGap: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    ask,
    clearChat,
  };
}
