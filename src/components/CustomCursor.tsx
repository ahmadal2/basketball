import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.interactive')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePos.x,
          y: mousePos.y,
          scale: isHovering ? 4 : 1,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.5 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9998] mix-blend-difference"
        animate={{
          x: mousePos.x - 12,
          y: mousePos.y - 12,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.5 : 0.8,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 150, mass: 0.8 }}
      />
    </>
  );
}
