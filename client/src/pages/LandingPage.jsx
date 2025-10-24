import React from 'react'
import { motion } from 'framer-motion'
import LandingNavbar from '../components/LandingNavbar'
import FeatureCard from '../components/FeatureCard'
import Testimonial from '../components/Testimonial'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="antialiased text-gray-900 bg-white">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">Study Together. Grow Faster.</h1>
            <p className="mt-4 text-lg text-gray-600">Form study groups, set goals, and achieve them together.</p>
            <div className="mt-8 flex items-center gap-4">
<Link
            to="/register"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Register
          </Link>              <a href="#features" className="text-sm text-gray-600 underline">See features</a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex justify-center">
            <div className="w-full max-w-md bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 shadow-xl">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop" alt="mockup" className="rounded-lg shadow" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Features</h2>
          <p className="text-center mt-2 text-gray-600">Everything you need to study together effectively.</p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard title="Group Progress Tracking" icon="📊" />
            <FeatureCard title="Chat & Collaboration" icon="💬" />
            <FeatureCard title="Goal Setting" icon="🎯" />
            <FeatureCard title="Compare Progress" icon="🤝" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">How it works</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -6 }} className="p-6 border rounded-lg text-center">
              <div className="text-4xl">1</div>
              <h3 className="mt-4 font-semibold">Create a group</h3>
              <p className="mt-2 text-gray-600">Start a group for your class or study topic.</p>
            </motion.div>
            <motion.div whileHover={{ y: -6 }} className="p-6 border rounded-lg text-center">
              <div className="text-4xl">2</div>
              <h3 className="mt-4 font-semibold">Invite friends</h3>
              <p className="mt-2 text-gray-600">Share the group and invite your classmates.</p>
            </motion.div>
            <motion.div whileHover={{ y: -6 }} className="p-6 border rounded-lg text-center">
              <div className="text-4xl">3</div>
              <h3 className="mt-4 font-semibold">Start learning</h3>
              <p className="mt-2 text-gray-600">Set goals and track progress together.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">What students say</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial name="Aisha" text="StudyCrew helped our group stay accountable. We improved our grades!" />
            <Testimonial name="Ben" text="The progress tracker is a lifesaver. Highly recommend." />
            <Testimonial name="Carlos" text="We finally have one place for planning, chatting and tracking." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Ready to start your study journey?</h2>
          <p className="mt-2">Join StudyCrew and boost your learning with friends.</p>
          <div className="mt-6">
            <a href="#signup" className="inline-block px-8 py-3 bg-white text-purple-700 rounded-lg font-semibold shadow hover:scale-105 transition-transform">Join Now</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
