import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, title, value, subtitle, gradient, delay = 0 }) {
  return (
    <motion.div
      
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      
      className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-5 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500`} />
      
      <div className="relative">
        <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}