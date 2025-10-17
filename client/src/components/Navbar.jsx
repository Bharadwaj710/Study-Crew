import React from "react";

export default function Navbar() {
  return (
    <nav className="p-4 bg-white shadow flex justify-between">
      <div className="font-bold">StudyCrew</div>
      <div className="space-x-4">
        <button className="text-sm text-blue-600">Login</button>
      </div>
    </nav>
  );
}
