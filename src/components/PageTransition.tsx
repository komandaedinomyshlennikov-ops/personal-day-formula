import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down' | 'none';
}

const variants = {
  left: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-30%', opacity: 0 },
  },
  right: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '30%', opacity: 0 },
  },
  up: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-30%', opacity: 0 },
  },
  down: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '30%', opacity: 0 },
  },
  none: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

export function PageTransition({ children, direction = 'left' }: PageTransitionProps) {
  const selectedVariant = variants[direction];

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300,
        mass: 0.8,
      }}
      style={{ 
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
