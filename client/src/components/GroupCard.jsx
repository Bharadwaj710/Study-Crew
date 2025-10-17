import React from "react";

export default function GroupCard({ group = {} }) {
  return (
    <div className="p-4 border rounded shadow-sm">
      <h3 className="font-semibold">{group.title || "Group Title"}</h3>
      <p className="text-sm text-gray-600">
        {group.description || "Short description"}
      </p>
    </div>
  );
}
