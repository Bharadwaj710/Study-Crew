import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaTimes, FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import MembersList from "./MembersList";
import TypingIndicator from "./TypingIndicator";
import {
  initializeSocket,
  getSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  editMessage,
  deleteMessage,
  listenToMessages,
  listenToMessageUpdates,
  listenToMessageDeletes,
  listenToTyping,
  listenToRoomMembers,
  listenToErrors,
  sendTypingIndicator,
} from "../lib/socket";
import { messageAPI } from "../services/api";

const ChatBox = ({
  group,
  onClose,
  currentUserId,
  token,
  showMembersSidebar = false,
  isModal = false,
}) => {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState(group?.members || []);
  const membersRef = useRef(members);
  const [admins, setAdmins] = useState([group?.creator?._id]);
  const [typing, setTyping] = useState(new Map());
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const socketRef = useRef(null);
  const unsubscribeRef = useRef([]);

  // Initialize socket on mount
  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    if (!token) {
      toast.error("Authentication required for chat");
      onClose();
      return;
    }

    try {
      socketRef.current = initializeSocket(token);
      console.log("Socket initialized for ChatBox");
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      toast.error("Failed to connect to chat");
    }

    return () => {
      // Cleanup listeners
      unsubscribeRef.current.forEach((unsub) => {
        if (typeof unsub === "function") unsub();
      });
    };
  }, [token, onClose]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await messageAPI.getMessages(group._id, 50);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error("Fetch messages error:", error);
        toast.error("Failed to load messages");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [group._id]);

  // Join room and set up listeners
  useEffect(() => {
    if (!socketRef.current || !group?._id) return;

    const socket = socketRef.current;
    const joinedRef = { joined: false };
    const messageIdSetRef = { current: new Set() };

    // Join room once per mount
    if (!joinedRef.joined) {
      joinRoom(group._id);
      joinedRef.joined = true;
      console.log("Joined room:", group._id);
    }

    // Re-join on socket reconnect
    const handleConnect = () => {
      try {
        joinRoom(group._id);
      } catch (e) {}
    };
    socket.on("connect", handleConnect);

    // Message received - reconcile optimistic messages and dedupe
    const unsubMessage = listenToMessages((message) => {
      try {
        setMessages((prev) => {
          // Avoid duplicates by _id
          if (message._id && prev.some((m) => m._id === message._id)) {
            return prev;
          }

          // If server returns clientTempId, reconcile optimistic message
          if (message.clientTempId) {
            const idx = prev.findIndex(
              (m) => m.clientTempId === message.clientTempId
            );
            if (idx !== -1) {
              const next = [...prev];
              next[idx] = { ...message };
              // Update id set
              messageIdSetRef.current.add(message._id);
              return next;
            }
          }

          // Otherwise append
          messageIdSetRef.current.add(message._id);
          return [...prev, message];
        });
      } catch (err) {
        console.error("Message handler error:", err);
      }
    });

    // Message updated
    const unsubUpdate = listenToMessageUpdates((updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updatedMessage._id ? { ...m, ...updatedMessage } : m
        )
      );
    });

    // Message deleted
    const unsubDelete = listenToMessageDeletes((data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId
            ? { ...m, deleted: true, text: null, fileUrl: null }
            : m
        )
      );
    });

    // Typing indicator
    const unsubTyping = listenToTyping((data) => {
      const { userId, isTyping } = data;
      setTyping((prev) => {
        const updated = new Map(prev);
        if (isTyping) {
          const member = membersRef.current.find(
            (m) => m._id?.toString() === userId
          );
          if (member) {
            updated.set(userId, member.name);
          }
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    // Room members updated
    const unsubMembers = listenToRoomMembers((data) => {
      setMembers(data.members || []);
      setAdmins(data.admins || []);
    });

    // Socket errors
    const unsubErrors = listenToErrors((error) => {
      console.error("Socket error:", error);
      if (error.message?.includes("not a member")) {
        toast.error("You have been removed from this group");
        onClose();
      } else {
        toast.error(error.message || "Chat connection error");
      }
    });

    unsubscribeRef.current = [
      unsubMessage,
      unsubUpdate,
      unsubDelete,
      unsubTyping,
      unsubMembers,
      unsubErrors,
    ];

    return () => {
      try {
        leaveRoom(group._id);
      } catch (e) {}
      socket.off("connect", handleConnect);
      unsubscribeRef.current.forEach((unsub) => {
        if (typeof unsub === "function") unsub();
      });
    };
  }, [group._id, onClose]);

  // Handle send message
  const handleSendMessage = useCallback(
    async (messageData) => {
      const tempId = `tmp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      // Build optimistic message
      let currentUser = null;
      try {
        currentUser = JSON.parse(localStorage.getItem("user")) || {};
      } catch (e) {
        currentUser = {};
      }

      const optimistic = {
        _id: tempId,
        clientTempId: tempId,
        groupId: group._id,
        sender: {
          _id: currentUser._id || currentUser.id || currentUser._id,
          name: currentUser.name || currentUser?.displayName,
          avatar: currentUser.avatar || null,
        },
        text: messageData.text || null,
        type: messageData.type || "text",
        fileUrl: messageData.fileUrl || null,
        fileName: messageData.fileName || null,
        fileSize: messageData.fileSize || null,
        fileMime: messageData.fileMime || null,
        replyTo: messageData.replyTo || null,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      // Append optimistic message
      setMessages((prev) => [...prev, optimistic]);

      try {
        const saved = await sendMessage(group._id, {
          ...messageData,
          clientTempId: tempId,
        });

        // Reconcile: replace optimistic with saved message
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId || m.clientTempId === tempId ? saved : m
          )
        );
      } catch (err) {
        console.error("Send message error (ack):", err);
        // mark optimistic as failed
        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? { ...m, pending: false, failed: true } : m
          )
        );
        toast.error(err?.message || "Failed to send message");
      }
    },
    [group._id]
  );

  // Handle edit message
  const handleEditMessage = useCallback(
    (messageId, text) => {
      try {
        editMessage(messageId, text, group._id);
      } catch (error) {
        console.error("Edit message error:", error);
        toast.error("Failed to edit message");
      }
    },
    [group._id]
  );

  // Handle delete message
  const handleDeleteMessage = useCallback(
    (messageId) => {
      if (!window.confirm("Delete this message?")) return;
      try {
        deleteMessage(messageId, group._id);
      } catch (error) {
        console.error("Delete message error:", error);
        toast.error("Failed to delete message");
      }
    },
    [group._id]
  );

  // Handle typing indicator
  const handleTyping = useCallback(
    (isTyping) => {
      try {
        sendTypingIndicator(group._id, isTyping);
      } catch (error) {
        console.error("Typing indicator error:", error);
      }
    },
    [group._id]
  );

  // Load older messages
  const handleLoadOlderMessages = useCallback(
    async (beforeMessageId) => {
      try {
        setIsLoadingOlder(true);
        const response = await messageAPI.getMessages(
          group._id,
          50,
          beforeMessageId
        );
        const olderMessages = response.data.messages || [];
        if (olderMessages.length === 0) {
          setHasMoreMessages(false);
        } else {
          setMessages((prev) => [...olderMessages, ...prev]);
        }
      } catch (error) {
        console.error("Load older messages error:", error);
        toast.error("Failed to load older messages");
      } finally {
        setIsLoadingOlder(false);
      }
    },
    [group._id]
  );

  const isAdmin = group?.creator?._id?.toString() === currentUserId;
  const typingUserNames = Array.from(typing.values());

  const containerClass = isModal
    ? "relative flex flex-col w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden"
    : "fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 p-4 flex items-center justify-between flex-shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 flex items-center justify-center text-white font-semibold shadow-md">
            {group?.name?.[0] || "G"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{group?.name}</h2>
            <p className="text-xs text-white/80">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition text-white"
          title="Close chat"
        >
          <FaTimes />
        </button>
      </div>

      {/* Reconnecting indicator */}
      {reconnecting && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs text-yellow-700">
          Reconnecting to chat...
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              onLoadOlderMessages={handleLoadOlderMessages}
              isLoadingOlder={isLoadingOlder}
              hasMoreMessages={hasMoreMessages}
              typingUsers={typingUserNames}
            />

            {/* Members sidebar hint */}
            {!showMembersSidebar && members.length > 0 && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 text-xs text-blue-700 flex items-center gap-2">
                <FaInfoCircle /> {members.length} members online
              </div>
            )}

            {/* Message input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              groupId={group._id}
              onTyping={handleTyping}
              isUploading={isUploading}
            />
          </>
        )}
      </div>

      {/* Members sidebar (optional) */}
      {showMembersSidebar && (
        <div className="w-48 border-l bg-gray-50 p-4 overflow-y-auto max-h-96">
          <MembersList
            members={members}
            admins={admins}
            currentUserId={currentUserId}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBox;
