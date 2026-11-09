'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { DESIGN_ENDPOINTS } from '@/lib/designEndpoints';

/**
 * useAIChat Hook
 * Manages full conversational AI design studio:
 * - User conversation threads list & active thread state
 * - Multi-turn messaging with text prompt + single reference image upload
 * - Generated artworks gallery
 * - 5 free daily tokens ledger & balance sync
 * - Deletion of conversations and artworks
 */
export default function useAIChat(initialChatId = null) {
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(initialChatId);
  const [activeConversation, setActiveConversation] = useState(null);
  const [tokenBalance, setTokenBalance] = useState({
    available_tokens: 5,
    daily_free_tokens: 5,
    purchased_tokens: 0,
  });

  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch token balance
  const fetchTokenBalance = useCallback(async () => {
    try {
      const data = await apiGet(DESIGN_ENDPOINTS.AI_STUDIO.TOKEN_BALANCE);
      if (data) {
        setTokenBalance(data);
      }
    } catch (err) {
      console.warn('Failed to fetch token balance:', err);
    }
  }, []);

  // Fetch all user conversations
  const fetchConversations = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const data = await apiGet(DESIGN_ENDPOINTS.AI_STUDIO.CHATS);
      const list = data?.results || (Array.isArray(data) ? data : []);
      setConversations(list);
      return list;
    } catch (err) {
      console.warn('Failed to load conversations:', err);
      return [];
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  // Fetch single active conversation details
  const fetchConversationDetails = useCallback(async (chatId) => {
    if (!chatId) {
      setActiveConversation(null);
      return;
    }
    setIsLoadingConversation(true);
    setError(null);
    try {
      const data = await apiGet(DESIGN_ENDPOINTS.AI_STUDIO.CHAT_DETAIL(chatId));
      setActiveConversation(data);
    } catch (err) {
      setError(err.message || 'Failed to load design conversation.');
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConversations().then((list) => {
      if (initialChatId) {
        setActiveChatId(initialChatId);
      } else if (list.length > 0 && !activeChatId) {
        setActiveChatId(list[0].id);
      }
    });
    fetchTokenBalance();
  }, [fetchConversations, fetchTokenBalance, initialChatId]); // eslint-disable-line react-hooks/exhaustive-deps

  // When activeChatId changes, fetch details
  useEffect(() => {
    if (activeChatId) {
      fetchConversationDetails(activeChatId);
    }
  }, [activeChatId, fetchConversationDetails]);

  // Create new conversation thread
  const createNewChat = async (title = 'New Design Chat') => {
    setError(null);
    try {
      const newChat = await apiPost(DESIGN_ENDPOINTS.AI_STUDIO.CHATS, { title });
      if (newChat?.id) {
        setConversations((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setActiveConversation(newChat);
        return newChat;
      }
    } catch (err) {
      setError(err.message || 'Failed to create new design chat.');
      throw err;
    }
  };

  // Delete conversation thread
  const deleteChat = async (chatId) => {
    try {
      await apiDelete(DESIGN_ENDPOINTS.AI_STUDIO.CHAT_DETAIL(chatId));
      setConversations((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) {
        const remaining = conversations.filter((c) => c.id !== chatId);
        if (remaining.length > 0) {
          setActiveChatId(remaining[0].id);
        } else {
          setActiveChatId(null);
          setActiveConversation(null);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to delete chat.');
      throw err;
    }
  };

  // Delete a specific artwork
  const deleteArtwork = async (artworkId) => {
    try {
      await apiDelete(DESIGN_ENDPOINTS.AI_STUDIO.ARTWORK_DELETE(artworkId));
      if (activeConversation?.artworks) {
        setActiveConversation((prev) => ({
          ...prev,
          artworks: prev.artworks.filter((a) => a.id !== artworkId),
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to delete artwork.');
      throw err;
    }
  };

  // Send message and trigger AI artwork generation
  const sendMessage = async (prompt, referenceFile = null, referenceUrl = '') => {
    if (!prompt?.trim()) return;

    let targetChatId = activeChatId;
    // Auto-create chat if none active
    if (!targetChatId) {
      const newChat = await createNewChat(prompt.slice(0, 30));
      targetChatId = newChat.id;
    }

    setIsGenerating(true);
    setError(null);

    // Optimistic user message preview
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: prompt,
      reference_image_url: referenceFile ? URL.createObjectURL(referenceFile) : referenceUrl || '',
      created_at: new Date().toISOString(),
    };

    setActiveConversation((prev) => {
      if (!prev) return { id: targetChatId, messages: [tempUserMsg], artworks: [] };
      return {
        ...prev,
        messages: [...(prev.messages || []), tempUserMsg],
      };
    });

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      if (referenceFile) {
        formData.append('reference_file', referenceFile);
      }
      if (referenceUrl) {
        formData.append('reference_url', referenceUrl);
      }

      const res = await apiPost(DESIGN_ENDPOINTS.AI_STUDIO.SEND_MESSAGE(targetChatId), formData);

      // Replace optimistic message and append assistant message & artwork
      setActiveConversation((prev) => {
        const filteredMsgs = (prev?.messages || []).filter((m) => m.id !== tempUserMsg.id);
        return {
          ...prev,
          messages: [...filteredMsgs, res.user_message, res.assistant_message],
          artworks: [res.artwork, ...(prev?.artworks || [])],
        };
      });

      // Update token balance
      if (typeof res.tokens_remaining === 'number') {
        setTokenBalance((prev) => ({
          ...prev,
          available_tokens: res.tokens_remaining,
        }));
      } else {
        fetchTokenBalance();
      }

      // Refresh chat list to update titles/previews
      fetchConversations();

      return res;
    } catch (err) {
      setError(err.message || 'AI generation failed. Please try again.');
      // Re-fetch conversation to clean up any optimistic inconsistency
      fetchConversationDetails(targetChatId);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    conversations,
    activeChatId,
    setActiveChatId,
    activeConversation,
    tokenBalance,
    isLoadingChats,
    isLoadingConversation,
    isGenerating,
    error,
    createNewChat,
    selectChat: setActiveChatId,
    deleteChat,
    deleteArtwork,
    sendMessage,
    refreshTokenBalance: fetchTokenBalance,
    reloadActiveChat: () => fetchConversationDetails(activeChatId),
  };
}
