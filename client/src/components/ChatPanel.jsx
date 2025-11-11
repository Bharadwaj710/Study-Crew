import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import { toast } from "react-toastify";
import { messageAPI } from "../services/api";

const ChatPanel = ({ groupId, socket, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await messageAPI.getMessages(groupId, 50);
        setMessages(res.data.messages || []);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load messages");
        setLoading(false);
      }
    };

    fetchMessages();

    if (socket) {
      socket.on("message:new", (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      if (socket) {
        socket.off("message:new");
      }
    };
  }, [groupId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await messageAPI.sendMessage(groupId, text);
      setText("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-cyan-50">
        <h3 className="font-bold text-gray-900">Group Chat</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
          <FaX />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="flex gap-3">
              <img
                src={msg.user.avatar}
                alt={msg.user.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {msg.user.name}
                </p>
                <p className="text-sm text-gray-700 bg-gray-100 rounded-lg p-2">
                  {msg.text}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
