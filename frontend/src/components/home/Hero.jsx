import React, { useRef } from 'react';
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-20px", "20px"]);
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], ["-20px", "20px"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen bg-black overflow-hidden flex flex-col justify-center items-center"
      style={{ perspective: "1000px" }}
    >
      {/* Background ambient glow matching the glasses */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-indigo-900 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      {/* 3D Floating Glasses Image */}
      <motion.div
        className="absolute z-10 w-full max-w-5xl pointer-events-none flex justify-center items-center"
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d"
        }}
      >
        <img
          src="/3d-glasses.png"
          alt="Floating 3D Glasses"
          className="w-full h-auto object-contain drop-shadow-2xl"
          style={{ transform: "translateZ(100px)" }}
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-20 text-center px-4 mt-16 flex flex-col items-center pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-gray-400 text-xs font-bold tracking-[0.3em] uppercase mb-6"
        >
          Up To 15% Off
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-white font-serif text-5xl md:text-7xl font-bold tracking-[-0.05em] leading-tight max-w-4xl mx-auto mb-10"
          style={{ textShadow: "0 10px 30px rgba(0,0,0,0.8)" }}
        >
          Perfect Glasses For Your<br />Unique Style
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="pointer-events-auto"
        >
          <Link to="/shop">
            <Button
              radius="none"
              className="bg-white text-black font-semibold text-xs tracking-widest uppercase px-8 py-6 rounded-sm hover:bg-gray-200 transition-colors cursor-pointer"
            >
              See More
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-12 z-30 flex items-center gap-6 text-white text-sm font-semibold tracking-widest">
        <button className="hover:text-gray-400 transition-colors pointer-events-auto cursor-pointer" aria-label="Previous slide">
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <span>01/02</span>
        <button className="hover:text-gray-400 transition-colors pointer-events-auto cursor-pointer" aria-label="Next slide">
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
