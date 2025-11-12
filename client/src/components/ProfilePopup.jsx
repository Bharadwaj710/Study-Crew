import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaEnvelope, FaLink, FaPhone, FaLock } from "react-icons/fa";
import { userAPI } from "../services/api";
import { toast } from "react-toastify";

// Simple in-memory cache for fetched profiles
const profileCache = new Map();

const ProfilePopup = ({
  userId,
  onClose,
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
  // modal mode
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

    // trap scroll
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
      try {
        triggerRef.current?.focus?.();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

  const renderContent = () => (
    <div
      ref={containerRef}
      onMouseDown={(e) => e.stopPropagation()}
      className={`bg-white rounded-2xl shadow-2xl w-[80vw] max-w-5xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-out ${
        visible && !closing ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      {/* Close button top-right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleClose}
          aria-label="Close profile"
          className="p-2 rounded-md text-white bg-black/10 hover:bg-black/20"
        >
          <FaTimes />
        </button>
      </div>

      {/* Header: gradient banner with avatar on left and name/bio on right */}
      <div className="rounded-t-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <img
              src={
                user?.avatar ||
                "https://ui-avatars.com/api/?background=random&size=256"
              }
              alt={user?.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
          </div>

          <div className="flex-1 text-white text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              {user?.name || "Unnamed"}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/90">
              {user?.about || "No bio available."}
            </p>
          </div>
        </div>
      </div>

      {/* Body: white content area */}
      <div className="p-6 sm:p-8 bg-white">
        {loading ? (
          <div className="py-12 text-center">
            <div className="text-gray-600">Loading profile…</div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : (
          <>
            {/* Education */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Education
              </h3>
              <div className="text-sm text-gray-700">
                {user?.education ? (
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium">Degree: </span>
                      <span className="text-gray-600">
                        {user.education.degree || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Institution: </span>
                      <span className="text-gray-600">
                        {user.education.college || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Year: </span>
                      <span className="text-gray-600">
                        {user.education.year || "N/A"}
                      </span>
                    </div>
                    {user.education.major && (
                      <div>
                        <span className="font-medium">Specialization: </span>
                        <span className="text-gray-600">
                          {user.education.major}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Not provided</p>
                )}
              </div>
            </section>

            <hr className="my-4" />

            {/* Skills */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(user?.skills || []).length > 0 ? (
                  (user.skills || []).map((s, i) => (
                    <span
                      key={`skill-${i}`}
                      className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills added</p>
                )}
              </div>
            </section>

            <hr className="my-4" />

            {/* Interests */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {(user?.interests || []).length > 0 ? (
                  (user.interests || []).map((it, i) => (
                    <span
                      key={`int-${i}`}
                      className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full"
                    >
                      {it}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No interests listed</p>
                )}
              </div>
            </section>

            <hr className="my-4" />

            {/* Links */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Links
              </h3>
              <div className="flex flex-wrap gap-2">
                {(user?.links || []).length > 0 ? (
                  (user.links || []).map((l, idx) => (
                    <a
                      key={`link-${idx}`}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-indigo-50 text-gray-800 text-sm font-medium transition"
                    >
                      <FaLink className="text-gray-500" />
                      {l.name || l.url}
                    </a>
                  ))
                ) : (
                  <p className="text-gray-500">No links provided.</p>
                )}
              </div>
            </section>

            <hr className="my-4" />

            {/* Joined Groups */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Joined Groups
              </h3>
              <div className="flex flex-wrap gap-2">
                {(user?.joinedGroups || []).length > 0 ? (
                  (user.joinedGroups || []).map((g) => {
                    const isPrivate = g.privacy === "private";
                    return (
                      <a
                        key={g._id}
                        href={!isPrivate ? `/groups/${g._id}` : undefined}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPrivate) e.preventDefault();
                        }}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition ${
                          isPrivate
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-indigo-50"
                        }`}
                        aria-disabled={isPrivate}
                      >
                        {isPrivate && <FaLock className="text-gray-400" />}
                        {g.name}
                      </a>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No groups yet.</p>
                )}
              </div>
            </section>

            <hr className="my-4" />

            {/* Contact Info */}
            <section className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Contact Information
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                {user?.contact || user?.email ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span className="text-gray-600">
                        {(user.contact && user.contact.email) ||
                          user.email ||
                          "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-500" />
                      <span className="font-medium">Phone:</span>
                      <span className="text-gray-600">
                        {(user.contact && user.contact.phone) || "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Address:</span>
                      <span className="text-gray-600">
                        {(user.contact &&
                          (user.contact.address || user.contact.location)) ||
                          (user.contact &&
                          (user.contact.city ||
                            user.contact.state ||
                            user.contact.country)
                            ? `${user.contact.city || ""}${
                                user.contact.state
                                  ? ", " + user.contact.state
                                  : ""
                              }${
                                user.contact.country
                                  ? ", " + user.contact.country
                                  : ""
                              }`
                            : "Not provided")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No contact information provided.
                  </p>
                )}
              </div>
            </section>

            {/* Footer actions */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              {/* Invite button for search context */}
              {context === "search" && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    toast.success("Invite sent (placeholder)");
                  }}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  Invite to Group
                </button>
              )}

              {/* Contact / mailto button */}
              {(() => {
                const contactEmail =
                  (user?.contact && user.contact.email) || user?.email;
                return (
                  <a
                    href={contactEmail ? `mailto:${contactEmail}` : undefined}
                    onClick={(e) => {
                      if (!contactEmail) e.preventDefault();
                    }}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition ${
                      contactEmail
                        ? "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    }`}
                    aria-disabled={!contactEmail}
                  >
                    <FaEnvelope />
                    Contact
                  </a>
                );
              })()}

              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

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
      {!isPopover && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      )}

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
