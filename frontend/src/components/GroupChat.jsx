import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Users,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Lock
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useGroupChat } from "../hooks/useGroupChat";
import NexoraMark from "./NexoraMark";

function GroupChat({ isOpen, onClose, group }) {
  const { account } = useWallet();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const isMember = Boolean(group?.isMember);

  const {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    fetchMessages,
  } = useGroupChat(group?.id, group?.name, isOpen, isMember);

  const shortenAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const success = await sendMessage(text);
    if (success) {
      setText("");
    }
  };

  if (!isOpen || !group) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Chat Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative flex h-[620px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-400/20">
                <NexoraMark size={24} showGlow />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    Group #{group.id}: {group.name}
                  </h3>
                  <span className="rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300 border border-violet-400/20">
                    Group Chat
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users size={13} className="text-emerald-400" />
                    {group.memberCount} Member{group.memberCount === 1 ? "" : "s"}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-cyan-300">
                    {account ? shortenAddress(account) : "Not Connected"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Error Alert Banner */}
          {error && (
            <div className="flex items-center gap-2 border-b border-red-400/20 bg-red-400/10 px-6 py-2.5 text-xs text-red-200">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Chat Body (Message History) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/40">
            {!isMember ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-400/20 text-amber-400">
                  <Lock size={28} />
                </div>
                <h4 className="font-bold text-white text-base">Membership Required</h4>
                <p className="mt-2 max-w-sm text-xs leading-5 text-amber-300 font-medium">
                  Join this group to access the chat.
                </p>
              </div>
            ) : loading ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500 gap-2">
                <RefreshCw size={24} className="animate-spin text-violet-400" />
                <span className="text-sm">Loading group chat...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-400/20 text-violet-400">
                  <MessageSquare size={28} />
                </div>
                <h4 className="font-semibold text-slate-300 text-base">No messages yet</h4>
                <p className="mt-1 max-w-sm text-xs leading-5">
                  Be the first member of Group #{group.id} to start the conversation!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = account && msg.sender.toLowerCase() === account.toLowerCase();

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[10px] text-slate-500 px-1">
                      <span className="font-mono text-cyan-400">
                        {isMe ? "You" : shortenAddress(msg.sender)}
                      </span>
                      <span>•</span>
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                        isMe
                          ? "bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-600/20"
                          : "bg-slate-800 text-slate-100 border border-white/10 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="border-t border-white/10 bg-slate-950/80 p-4">
            {!isMember ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-300">
                <Lock size={15} />
                <span>Join this group to access the chat.</span>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message Group #${group.id}...`}
                  disabled={sending}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} />
                  <span>{sending ? "Sending..." : "Send"}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default GroupChat;
