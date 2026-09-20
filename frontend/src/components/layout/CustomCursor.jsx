import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Glasses } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const CustomCursor = () => {
  const [isPointerDevice, setIsPointerDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hardware hover detection to completely bypass touchscreens
    const hasFinePointer = 
      typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    setIsPointerDevice(hasFinePointer);

    if (!hasFinePointer || isAdmin) {
      document.body.style.cursor = 'auto';
      return;
    }

    // Hide default body cursor on verified fine-pointer desktop hardware
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
  }, [cursorX, cursorY, isVisible, isAdmin]);

  if (!isPointerDevice || isAdmin || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference text-white"
        style={{
          x: smoothX,
          y: smoothY,
          scale: isHovering ? 1.4 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Glasses strokeWidth={isHovering ? 1.5 : 1} size={isHovering ? 30 : 22} />
      </motion.div>
    </div>
  );
};

export default CustomCursor;
