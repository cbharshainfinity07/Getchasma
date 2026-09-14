import React from 'react';
import { motion } from 'framer-motion';

export default function PuffyButton({ 
  children, 
  onClick, 
  className = '', 
  fullWidth = false,
  type = "button",
  disabled = false
}) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        puffy-button font-semibold tracking-wide flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : 'px-8'} py-4 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
        transition-shadow duration-300
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
