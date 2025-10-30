import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaUsers,
  FaChartBar,
  FaStar,
  FaRocket,
} from "react-icons/fa";
import { MdGroup } from "react-icons/md";


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div
          className="absolute bottom-40 right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl opacity-40 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12 border-b border-white/10 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/50 transition-all">
            <span className="text-xl font-bold">SC</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            StudyCrew
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-6 py-2.5 text-gray-300 hover:text-white font-semibold transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-lg font-semibold transition-all hover:shadow-lg shadow-md"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-full mb-6 backdrop-blur-sm">
            <FaRocket className="mr-2 text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-200">
              Welcome to StudyCrew
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Study Together,
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Achieve More
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Form study groups, set collaborative goals, and track progress
            together. Connect with peers who share your learning passions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-lg font-bold transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg group"
            >
              Start Learning Today
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center justify-center px-8 py-4 border-2 border-cyan-500 hover:bg-cyan-500/10 rounded-lg font-bold transition-all"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Hero Image/Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          {[
            { icon: FaUsers, label: "Active Users", value: "10K+" },
            { icon: MdGroup, label: "Groups Created", value: "2K+" },
            { icon: FaChartBar, label: "Success Rate", value: "95%" },
          ].map(({ icon: Icon, label, value }, i) => (
            <div
              key={i}
              className="relative overflow-hidden p-6 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md hover:border-cyan-500/50 transition-all transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="text-xl" />
                </div>
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="text-gray-400">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to study{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              effectively
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful tools designed to help you collaborate, track progress, and
            achieve your learning goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FaUsers,
              title: "Create Study Groups",
              description:
                "Start a group for your class or study topic with just a few clicks.",
              color: "from-indigo-500 to-blue-500",
            },
            {
              icon: MdGroup,
              title: "Set & Track Goals",
              description:
                "Define group goals and monitor progress in real-time with visual charts.",
              color: "from-cyan-500 to-teal-500",
            },
            {
              icon: FaUsers,
              title: "Smart Recommendations",
              description:
                "AI-powered member suggestions based on skills and interests.",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: FaRocket,
              title: "Real-Time Chat",
              description:
                "Collaborate instantly with group members through integrated messaging.",
              color: "from-orange-500 to-red-500",
            },
            {
              icon: FaChartBar,
              title: "Progress Analytics",
              description:
                "Visualize group progress with detailed charts and leaderboards.",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: FaStar,
              title: "Gamification",
              description:
                "Earn badges, maintain streaks, and celebrate milestones together.",
              color: "from-yellow-500 to-orange-500",
            },
          ].map(({ icon: Icon, title, description, color }, i) => (
            <div
              key={i}
              className="group relative overflow-hidden p-6 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md hover:border-white/40 transition-all transform hover:scale-105 hover:shadow-2xl"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-all`}
              ></div>
              <div className="relative">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
                  {title}
                </h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 py-20">
        <div className="relative overflow-hidden rounded-2xl p-12 md:p-16 bg-gradient-to-r from-indigo-600/80 to-cyan-600/80 backdrop-blur-md border border-white/20">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 animate-pulse"></div>
          <div className="relative text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to transform your learning?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already collaborating, growing,
              and achieving their goals together.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Get Started Free
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full"></div>
                <span className="font-bold">StudyCrew</span>
              </div>
              <p className="text-gray-400">Study together, achieve more.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security"] },
              { title: "Company", links: ["About", "Blog", "Careers"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
            ].map(({ title, links }, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{title}</h4>
                <ul className="space-y-2 text-gray-400">
                  {links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StudyCrew. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
