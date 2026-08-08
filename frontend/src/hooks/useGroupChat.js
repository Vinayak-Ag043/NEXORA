import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";

export function useGroupChat(groupId, groupName, isOpen, isMember) {
  const { account } = useWallet();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // When chat is closed, clear the conversation.
  // This intentionally makes the demo chat temporary.
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setError(null);
      setLoading(false);
      setSending(false);
    }
  }, [isOpen]);

  const fetchMessages = useCallback(async () => {
    if (!isOpen || !isMember || !account) {
      setMessages([]);
      return;
    }

    // Temporary demo chat:
    // Messages live only in React state.
    // There is intentionally no blockchain or Push history.
    setLoading(false);
    setError(null);
  }, [isOpen, isMember, account]);

  const sendMessage = useCallback(
    async (text) => {
      const cleanText = text?.trim();

      if (!cleanText) return false;

      if (!account) {
        setError("Connect your wallet to send messages.");
        return false;
      }

      if (!isMember) {
        setError("Join this group to access the chat.");
        return false;
      }

      setSending(true);
      setError(null);

      try {
        const newMessage = {
          id: `${Date.now()}-${Math.random()}`,
          sender: account,
          content: cleanText,
          timestamp: Date.now(),
        };

        setMessages((current) => [...current, newMessage]);

        return true;
      } catch (err) {
        console.error("Chat error:", err);
        setError("Failed to send message.");
        return false;
      } finally {
        setSending(false);
      }
    },
    [account, isMember]
  );

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    fetchMessages,
    groupAddress: null,
  };
}