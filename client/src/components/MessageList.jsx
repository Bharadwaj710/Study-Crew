import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const MessageList = ({
  messages = [],
  currentUserId,
  isAdmin,
  onDeleteMessage,
  onEditMessage,
  onLoadOlderMessages,
  isLoadingOlder,
  hasMoreMessages,
  typingUsers = [],
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsers, shouldAutoScroll]);

  // Handle scroll to load older messages
  const handleScroll = (e) => {
    const container = e.target;
    if (
      container.scrollTop < 100 &&
      !isLoadingOlder &&
      hasMoreMessages &&
      messages.length > 0
    ) {
      onLoadOlderMessages(messages[0]._id);
    }

    // Check if user scrolled away from bottom
    const scrollThreshold = 100;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      scrollThreshold;
    setShouldAutoScroll(isNearBottom);
  };

  // Group messages by sender and time
  const groupedMessages = messages.reduce((acc, message, index) => {
    const previousMessage = messages[index - 1];
    const currentTime = new Date(message.createdAt);
    const previousTime = previousMessage
      ? new Date(previousMessage.createdAt)
      : null;

    // Check if we should start a new group
    const isSameSender = previousMessage?.sender?._id === message.sender?._id;
    const isWithinTimeWindow =
      previousTime && currentTime.getTime() - previousTime.getTime() < 60000; // 1 minute

    if (isSameSender && isWithinTimeWindow) {
      acc.push({
        type: "message",
        message,
        grouped: true,
      });
    } else {
      acc.push({
        type: "message",
        message,
        grouped: false,
      });
    }

    return acc;
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 scroll-smooth"
      style={{ scrollbarGutter: "stable" }}
    >
      {/* Loading indicator */}
      {isLoadingOlder && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Messages */}
      {groupedMessages.map((item, index) => {
        const message = item.message;
        const isCurrentUser = message.sender?._id?.toString() === currentUserId;

        return (
          <div key={message._id}>
            {/* Date separator */}
            {index === 0 ||
            new Date(message.createdAt).toDateString() !==
              new Date(messages[index - 1].createdAt).toDateString() ? (
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString()}
                </span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            ) : null}

            {/* Message bubble */}
            <MessageBubble
              message={message}
              isCurrentUser={isCurrentUser}
              isAdmin={isAdmin}
              onDelete={onDeleteMessage}
              onEdit={(editedText) => onEditMessage(message._id, editedText)}
              replyingTo={message.replyTo}
            />
          </div>
        );
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

      {/* Scroll to bottom marker */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
