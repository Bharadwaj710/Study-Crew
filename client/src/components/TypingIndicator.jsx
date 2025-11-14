import React, { useState, useEffect } from "react";

const TypingIndicator = ({ typingUsers = [] }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (typingUsers.length === 0) {
      setDisplayText("");
      return;
    }

    if (typingUsers.length === 1) {
      setDisplayText(`${typingUsers[0]} is typing...`);
    } else if (typingUsers.length === 2) {
      setDisplayText(`${typingUsers.join(" and ")} are typing...`);
    } else {
      setDisplayText(`${typingUsers.length} people are typing...`);
    }
  }, [typingUsers]);

  if (!displayText) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
      <span>{displayText}</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></span>
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
