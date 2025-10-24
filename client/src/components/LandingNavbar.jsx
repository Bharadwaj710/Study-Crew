import React from "react";
import { Link } from 'react-router-dom';

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/60 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              StudyCrew
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <a href="#home" className="hover:text-gray-900">
              Home
            </a>
            <a href="#features" className="hover:text-gray-900">
              Features
            </a>
            <a href="#about" className="hover:text-gray-900">
              About
            </a>
            <a href="#contact" className="hover:text-gray-900">
              Contact
            </a>
            <Link
            to="/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
