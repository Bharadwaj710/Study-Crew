import React from "react";

export default function Footer() {
  return (
    <footer className="border-t mt-12 py-8 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
        <div className="font-bold">StudyCrew</div>
        <div className="text-sm text-gray-500">© 2025 StudyCrew</div>
        <div className="flex gap-3 text-gray-500">
          <a href="#">Twitter</a>
          <a href="#">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
