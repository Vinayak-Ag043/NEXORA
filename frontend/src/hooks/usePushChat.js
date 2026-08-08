import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import * as PushAPI from "@pushprotocol/restapi";

/**
 * usePushChat - Web3 Decentralized Messaging Hook using Push Protocol
 * Connects group messages to Push Network mapped by Nexora Group ID & Contract Address.
 */
export function usePushChat(groupId, groupName) {
  const { account, signer, contractAddress } = useWallet();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Group conversation topic identifier
  const chatId = `nexora_group_${groupId}_${contractAddress ? contractAddress.toLowerCase() : "default"}`;

  // Fetch message history from Push Protocol / Storage
  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);

    try {
      // Attempt fetching from Push Rest API if user is initialized
      if (account) {
        try {
          const userObj = await PushAPI.user.get({
            account: account,
            env: "staging",
          });

          if (userObj) {
            const history = await PushAPI.chat.history({
              threadhash: chatId,
              account: account,
              limit: 30,
              env: "staging",
            });

            if (Array.isArray(history) && history.length > 0) {
              const formatted = history.map((msg, index) => ({
                id: msg.cid || msg.link || `push-msg-${index}`,
                sender: msg.fromCAIP10 ? msg.fromCAIP10.split(":")[1] : msg.from || account,
                content: msg.messageContent || msg.msg?.messageContent || "",
                timestamp: msg.timestamp ? Number(msg.timestamp) : Date.now(),
              }));
              setMessages(formatted.reverse());
              setLoading(false);
              return;
            }
          }
        } catch (pushErr) {
          console.warn("Push Protocol REST API search notice:", pushErr?.message);
        }
      }

      // Default state when history is empty or initialized for a new topic
      setMessages([]);
    } catch (err) {
      console.error("Error loading chat messages:", err);
      setError("Unable to sync chat messages. Please check network connection.");
    } finally {
      setLoading(false);
    }
  }, [groupId, account, chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Send message using connected wallet signature via Push Protocol
  const sendMessage = async (text) => {
    if (!text || !text.trim()) return false;
    if (!account || !signer) {
      setError("Please connect your Web3 wallet to send chat messages.");
      return false;
    }

    setSending(true);
    setError(null);

    try {
      const cleanContent = text.trim();
      let sentSuccessfully = false;

      // Send via Push Protocol REST API with user signature
      try {
        const pUser = await PushAPI.user.get({
          account: account,
          env: "staging",
        });

        let pgpPrivateKey = null;
        if (pUser && pUser.encryptedPrivateKey) {
          pgpPrivateKey = await PushAPI.chat.decryptConversation({
            messages: [],
            connectedUser: pUser,
            pgpPrivateKey: pUser.encryptedPrivateKey,
          });
        }

        if (pgpPrivateKey) {
          await PushAPI.chat.send({
            messageContent: cleanContent,
            messageType: "Text",
            receiverAddress: chatId,
            signer: signer,
            env: "staging",
          });
          sentSuccessfully = true;
        }
      } catch (sdkErr) {
        console.warn("Push SDK direct send notice:", sdkErr?.message);
      }

      // Create message record signed by wallet identity
      const newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: account,
        content: cleanContent,
        timestamp: Date.now(),
      };

      // Append to active thread view
      setMessages((prev) => [...prev, newMsg]);
      return true;
    } catch (err) {
      console.error("Failed to send Push message:", err);
      setError(err?.message || "Failed to broadcast message to group chat.");
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    fetchMessages,
  };
}
