import React from "react";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold">Welcome to StudyCrew</h1>
        <p className="mt-2 text-gray-600">
          This is the placeholder App component.
        </p>
      </main>
    </div>
  );
}
