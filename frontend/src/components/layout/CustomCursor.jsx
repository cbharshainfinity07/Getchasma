import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Glasses } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // Strict touch / mobile device detection
  const isTouchDevice = 
    typeof window !== 'undefined' && 
    (('ontouchstart' in window) || 
     (navigator.maxTouchPoints > 0) || 
     (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // If in admin dashboard or on touch device, disable all custom cursor listeners and keep natural cursor
    if (isAdmin || isTouchDevice) {
      document.body.style.cursor = 'auto';
      return;
    }

    // Hide default body cursor for desktop luxury storefront
    document.body.style.cursor = 'none';

    const moveCursor = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a');

      setIsHovering(Boolean(isInteractive));
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto';
    };
  }, [cursorX, cursorY, isVisible, isAdmin, isTouchDevice]);

  if (isAdmin || isTouchDevice || !isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] items-center justify-center mix-blend-difference text-white hidden md:flex"
      style={{
        x: smoothX,
        y: smoothY,
        scale: isHovering ? 1.4 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Glasses strokeWidth={isHovering ? 1.5 : 1} size={isHovering ? 30 : 22} />
    </motion.div>
  );
}
