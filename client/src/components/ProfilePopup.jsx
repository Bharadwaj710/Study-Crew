import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaEnvelope, FaLink } from "react-icons/fa";
import { userAPI } from "../services/api";
import { toast } from "react-toastify";

// Simple in-memory cache for fetched profiles
const profileCache = new Map();

const ProfilePopup = ({
  userId,
  /* anchorElement removed */ onClose,
  mode = "auto",
  context = "default",
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const triggerRef = useRef(document.activeElement);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  // Always render as centered modal for now (popover/anchor removed)
  const isPopover = false;

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (profileCache.has(userId)) {
          setUser(profileCache.get(userId));
        } else {
          const { data } = await userAPI.getById(userId);
          if (!mounted) return;
          profileCache.set(userId, data.user);
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // focus trap simple: set body overflow hidden
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);

    // show animation
    setTimeout(() => setVisible(true), 10);

    return () => {
      mounted = false;
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      // return focus
      try {
        triggerRef.current?.focus?.();
      } catch (e) {}
    };
  }, [userId, onClose]);

  // anchor-based positioning removed — always center modal

  const renderContent = () => (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      className={`bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 relative transform transition-all duration-300 ease-out ${
        visible && !closing ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      <div className="flex justify-end">
        <button
          onClick={handleClose}
          aria-label="Close profile"
          className="p-2 rounded-md text-gray-600 hover:text-gray-900"
        >
          <FaTimes />
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <img
            src={
              user?.avatar ||
              "https://ui-avatars.com/api/?background=random&size=128"
            }
            alt={user?.name}
            className="w-32 h-32 rounded-full mx-auto border-4 border-indigo-100 shadow-md object-cover"
          />
          <h2 className="text-2xl font-bold text-gray-900 text-center mt-4">
            {user?.name}
          </h2>
          <p className="text-gray-700 text-center mt-2">
            {user?.about || "No bio available."}
          </p>
        </div>

        <hr className="my-6 border-gray-200" />

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Education
          </h3>
          {user?.education &&
          (user.education.degree || user.education.college) ? (
            <p className="text-gray-600">
              {user.education.degree ? `${user.education.degree}` : ""}
              {user.education.college ? ` • ${user.education.college}` : ""}
              {user.education.year ? ` • ${user.education.year}` : ""}
            </p>
          ) : (
            <p className="text-gray-500">No education information.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Skills & Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {(user?.skills || []).map((s, i) => (
              <span
                key={`s-${i}`}
                className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full"
              >
                {s}
              </span>
            ))}
            {(user?.interests || []).map((it, j) => (
              <span
                key={`i-${j}`}
                className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full"
              >
                {it}
              </span>
            ))}
            {!(user?.skills || []).length &&
              !(user?.interests || []).length && (
                <p className="text-gray-500">No skills or interests listed.</p>
              )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Links</h3>
          <div className="flex flex-wrap gap-2">
            {(user?.links || []).map((l, idx) => (
              <a
                key={idx}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 rounded-full bg-gray-100 hover:bg-indigo-100 text-gray-700 font-medium transition-all duration-200"
              >
                {l.name}
              </a>
            ))}
            {!(user?.links || []).length && (
              <p className="text-gray-500">No links provided.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Joined Groups
          </h3>
          <div className="flex flex-wrap gap-2">
            {(user?.joinedGroups || []).slice(0, 3).map((g) => (
              <a
                key={g._id}
                href={`/groups/${g._id}`}
                className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                {g.name}
              </a>
            ))}
            {!(user?.joinedGroups || []).length && (
              <p className="text-gray-500">No groups yet.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {context === "search" && (
            <button
              onClick={async () => {
                toast.success("Invite sent (placeholder)");
              }}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Invite to Group
            </button>
          )}

          {(context === "group" ||
            context === "default" ||
            context === "chat") && (
            <button
              onClick={() => {
                try {
                  window.location.href = `/chat/${user?._id}`;
                } catch (err) {
                  console.error(err);
                }
              }}
              className="flex-1 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition"
            >
              Message
            </button>
          )}

          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // handle close with animation before unmount
  function handleClose() {
    if (closing) return;
    setClosing(true);
    setVisible(false);
    setTimeout(() => {
      try {
        onClose();
      } catch (e) {
        onClose();
      }
    }, 280);
  }

  // Overlay wrapper: clicking outside closes
  const wrapper = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50"
      onMouseDown={(e) => {
        // if clicking the overlay area (not the popover content), close
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target)) handleClose();
      }}
    >
      {/* backdrop for modal mode */}
      {!isPopover && <div className="absolute inset-0 bg-black/40" />}

      <div
        className={`flex ${
          isPopover
            ? "items-start justify-start p-0"
            : "items-center justify-center p-4"
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );

  return createPortal(wrapper, document.body);
};

export { profileCache };
export default ProfilePopup;
