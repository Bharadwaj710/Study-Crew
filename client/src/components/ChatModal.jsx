import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";

const ChatModal = ({ group, onClose, currentUserId, token }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger animation
    const t = setTimeout(() => setVisible(true), 20);

    // lock background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    // animate out then call onClose
    setVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 220);
  };

  const overlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={overlayClick}
    >
      <div
        className={`transform transition-all duration-250 ease-out ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-6 scale-95"
        }`}
        style={{ maxHeight: "95vh" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="w-[min(900px,90vw)] h-[min(85vh,780px)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <ChatBox
            group={group}
            onClose={handleClose}
            currentUserId={currentUserId}
            token={token}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
