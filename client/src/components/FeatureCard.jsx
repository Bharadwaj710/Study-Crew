import React from "react";
import { motion } from "framer-motion";

export default function FeatureCard({ title, icon = "✨" }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="p-6 rounded-2xl shadow-md bg-gradient-to-br from-white to-indigo-50 border"
    >
      <div className="text-4xl">{icon}</div>
      <h4 className="mt-4 font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-gray-600">
        Short description about the feature to explain value.
      </p>
    </motion.div>
  );
}
