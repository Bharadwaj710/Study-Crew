import React from "react";

export default function Testimonial({ name, text }) {
  return (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">Student</div>
        </div>
      </div>
      <p className="mt-4 text-gray-700">"{text}"</p>
    </div>
  );
}
