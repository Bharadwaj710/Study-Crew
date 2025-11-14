import React from "react";
import { FaCrown } from "react-icons/fa";
import { openProfilePopup } from "../hooks/useProfilePopup";

const MembersList = ({ members = [], admins = [], currentUserId }) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-bold text-gray-900">Members</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {members.length === 0 ? (
          <p className="text-xs text-gray-500">No members yet</p>
        ) : (
          members.map((member) => {
            const isAdmin = admins?.includes(member._id?.toString());
            return (
              <div
                key={member._id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 transition"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={(e) =>
                    openProfilePopup(member._id, e.currentTarget, {
                      context: "chat",
                    })
                  }
                  className="flex-1 text-left text-sm font-medium text-gray-900 hover:text-indigo-600 transition truncate"
                >
                  {member.name}
                  {currentUserId === member._id.toString() && (
                    <span className="text-xs text-gray-500 ml-1">(You)</span>
                  )}
                </button>
                {isAdmin && (
                  <FaCrown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MembersList;
