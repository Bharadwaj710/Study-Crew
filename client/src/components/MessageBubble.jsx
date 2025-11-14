import React, { useState } from "react";
import {
  FaTrash,
  FaEdit,
  FaFile,
  FaFilePdf,
  FaDownload,
  FaTimes,
} from "react-icons/fa";
import FilePreviewModal from "./FilePreviewModal";

const MessageBubble = ({
  message,
  isCurrentUser,
  isAdmin,
  onDelete,
  onEdit,
  onReply,
  replyingTo,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text || "");
  const [showActions, setShowActions] = useState(false);

  if (message.deleted) {
    return (
      <div className="flex justify-center py-2">
        <p className="text-xs text-gray-400 italic">This message was deleted</p>
      </div>
    );
  }

  const handleSaveEdit = () => {
    if (editedText.trim()) {
      onEdit(editedText);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedText(message.text || "");
    setIsEditing(false);
  };

  const handleDownloadFile = (e) => {
    e.stopPropagation();
    const downloadHref = message.fileDownloadUrl || message.fileUrl;
    const link = document.createElement("a");
    link.href = downloadHref;
    link.download = message.fileName || "download";
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFileContent = () => {
    const isImage =
      message.type === "image" || message.fileMime?.startsWith("image/");
    const isPdf =
      message.type === "pdf" || message.fileMime === "application/pdf";

    if (isImage) {
      return (
        <button
          onClick={() => setShowPreview(true)}
          className="relative group rounded-lg overflow-hidden"
        >
          <img
            src={message.fileUrl}
            alt="message"
            className="w-40 h-28 object-cover rounded-lg shadow-sm border border-gray-100 cursor-pointer transition-transform transform-gpu hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/0 group-hover:bg-black/20 rounded-lg px-3 py-1 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View
            </div>
          </div>
        </button>
      );
    }

    if (isPdf) {
      return (
        <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          <FaFilePdf className="text-red-600 text-2xl flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {message.fileName}
            </p>
            <p className="text-xs text-gray-500">
              {message.fileSize
                ? `${(message.fileSize / 1024).toFixed(2)} KB`
                : "PDF"}
            </p>
          </div>
          <button
            onClick={handleDownloadFile}
            className="ml-auto px-3 py-1 bg-indigo-600 text-white rounded-md hover:scale-105 transition-transform"
          >
            Download
          </button>
        </div>
      );
    }

    // Generic file
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
        <FaFile className="text-gray-600 text-2xl flex-shrink-0" />
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {message.fileName}
          </p>
          <p className="text-xs text-gray-500">
            {message.fileSize
              ? `${(message.fileSize / 1024).toFixed(2)} KB`
              : "File"}
          </p>
        </div>
        <button
          onClick={handleDownloadFile}
          className="ml-auto px-3 py-1 bg-indigo-600 text-white rounded-md hover:scale-105 transition-transform"
        >
          Download
        </button>
      </div>
    );
  };

  const bubbleClass = isCurrentUser
    ? "bg-indigo-500 text-white"
    : "bg-white text-gray-900 border border-gray-200";

  const alignmentClass = isCurrentUser ? "justify-end" : "justify-start";

  return (
    <>
      <div className={`flex ${alignmentClass} gap-2 group mb-3 px-2`}>
        {/* Actions (hidden on hover, left side for other users) */}
        {!isCurrentUser && (
          <div className="flex items-end gap-2 opacity-0 group-hover:opacity-100 transition">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={message.sender?.avatar}
                alt={message.sender?.name}
                className="w-8 h-8 object-cover"
              />
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div className="flex flex-col max-w-[70vw] sm:max-w-xs">
          {/* Sender info if not current user */}
          {!isCurrentUser && (
            <p className="text-xs font-semibold text-gray-600 mb-1">
              {message.sender?.name || "Unknown"}
            </p>
          )}

          {/* Reply preview if exists */}
          {message.replyTo && (
            <div className="mb-2 px-3 py-2 bg-gray-200 rounded-lg text-xs border-l-2 border-indigo-500">
              <p className="font-semibold text-gray-700">
                {message.replyTo.sender?.name}
              </p>
              <p className="text-gray-600 truncate">
                {message.replyTo.text || "[file]"}
              </p>
            </div>
          )}

          {/* Main content */}
          <div
            className={`rounded-xl px-4 py-2 ${bubbleClass} ${
              isCurrentUser ? "rounded-br-sm" : "rounded-bl-sm"
            } shadow-sm transition-opacity duration-300 opacity-100`}
          >
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="px-2 py-1 rounded bg-white text-gray-900 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                />
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="px-2 py-1 text-xs rounded bg-gray-500 hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-2 py-1 text-xs rounded bg-indigo-700 hover:bg-indigo-800 transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {message.text && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                )}
                {message.fileUrl && (
                  <div className="mt-2">{renderFileContent()}</div>
                )}
                {message.edited && (
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? "text-indigo-200" : "text-gray-500"
                    }`}
                  >
                    (edited)
                  </p>
                )}
              </>
            )}
          </div>

          {/* Timestamp */}
          <p
            className={`text-xs mt-1 ${
              isCurrentUser ? "text-right text-gray-500" : "text-gray-500"
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Actions (hidden on hover, right side for current user) */}
        {isCurrentUser && (
          <div className="flex items-end gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-xs rounded bg-indigo-700 text-white hover:bg-indigo-800 transition"
              title="Edit message"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(message._id)}
              className="p-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition"
              title="Delete message"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={
          showPreview
            ? {
                fileUrl: message.fileUrl,
                downloadUrl: message.fileDownloadUrl,
                fileName: message.fileName,
                fileMime: message.fileMime,
                type: message.type,
              }
            : null
        }
        onClose={() => setShowPreview(false)}
      />
    </>
  );
};

export default MessageBubble;
