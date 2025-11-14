import React, { useState } from "react";
import { FaTimes, FaDownload, FaExternalLinkAlt, FaFile } from "react-icons/fa";

const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const { fileUrl, fileName, fileMime, type } = file;
  const isImage = type === "image" || fileMime?.startsWith("image/");
  const isPdf = type === "pdf" || fileMime === "application/pdf";

  const handleDownload = () => {
    const downloadHref = file.downloadUrl || fileUrl;
    const link = document.createElement("a");
    link.href = downloadHref;
    link.download = fileName || "download";
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-auto w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{fileName}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Download"
            >
              <FaDownload className="text-gray-600" />
            </button>
            <button
              onClick={() => window.open(fileUrl, "_blank")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Open in new tab"
            >
              <FaExternalLinkAlt className="text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex items-center justify-center bg-gray-50 min-h-96">
          {isImage ? (
            <img src={fileUrl} alt={fileName} className="max-w-full max-h-96" />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-96"
              frameBorder="0"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <FaFile className="text-4xl text-gray-400" />
              <p className="text-gray-600 text-center max-w-xs">{fileName}</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <FaDownload /> Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
