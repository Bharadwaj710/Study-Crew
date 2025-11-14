import React, { useState, useRef, useEffect } from "react";
import { FaPaperclip, FaPaperPlane, FaTimes } from "react-icons/fa";
import { uploadAPI } from "../services/api";
import { toast } from "react-toastify";

const MessageInput = ({ onSendMessage, groupId, onTyping, isUploading }) => {
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Emit typing indicator (throttled)
    if (onTyping) {
      onTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = file.type.startsWith("image/")
      ? 10 * 1024 * 1024
      : 25 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `File too large. Max size: ${Math.floor(maxSize / 1024 / 1024)}MB`
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadAndSend = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("groupId", groupId);

      const response = await uploadAPI.uploadFile(formData);
      const { url, downloadUrl, name, size, mime, type } = response.data;

      // Send message with file (await ack)
      setSending(true);
      try {
        await onSendMessage({
          text: text || "",
          type: type || "file",
          fileUrl: url,
          fileDownloadUrl: downloadUrl || url,
          fileName: name,
          fileSize: size,
          fileMime: mime,
        });
      } finally {
        setSending(false);
      }

      setText("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSendText = () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      toast.error("Message cannot be empty");
      return;
    }

    setSending(true);
    Promise.resolve(onSendMessage({ text: trimmedText, type: "text" }))
      .then(() => setText(""))
      .catch((err) => {
        console.error("Send text error:", err);
      })
      .finally(() => setSending(false));
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onTyping) {
      onTyping(false);
    }
  };

  const handleSend = () => {
    if (selectedFile) {
      handleUploadAndSend();
    } else {
      handleSendText();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (text.trim() || selectedFile) && !uploading && !isUploading;

  return (
    <div className="border-t bg-transparent p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-3 flex flex-col gap-3">
        {/* File preview */}
        {selectedFile && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-2 text-red-600 hover:bg-red-100 rounded transition"
              disabled={uploading}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-3 items-end">
          {/* File input button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isUploading}
            className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
            title="Attach file"
          >
            <FaPaperclip />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
          />

          {/* Text input */}
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Ctrl+Enter to send)"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none shadow-sm"
            rows="2"
            disabled={uploading || isUploading}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend || sending}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2"
            title="Send message"
          >
            {uploading || isUploading || sending ? (
              <span className="animate-spin">
                <FaPaperPlane />
              </span>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>

        {/* Upload progress */}
        {uploading && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
