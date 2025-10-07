'use client';

import React from 'react';
import { motion } from 'framer-motion';

const SoundWaveAnimation = ({ type = 'user', isActive = true }) => {
  const waveVariants = {
    user: {
      animate: {
        height: [4, 20, 8, 24, 4, 16, 4, 28, 4],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    ai: {
      animate: {
        height: [6, 24, 12, 30, 6, 20, 6, 32, 6],
        transition: {
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  };

  const colors = {
    user: 'bg-blue-500',
    ai: 'bg-purple-500'
  };

  const bars = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center space-x-1 p-4">
      <div className="flex items-center space-x-1">
        {bars.map((bar, index) => (
          <motion.div
            key={bar}
            className={`w-1 rounded-full ${colors[type]} ${!isActive ? 'opacity-30' : ''}`}
            variants={waveVariants[type]}
            animate={isActive ? "animate" : ""}
            initial={{ height: 4 }}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          />
        ))}
      </div>
      <div className="ml-4">
        <div className={`flex items-center space-x-2 text-sm ${
          type === 'user' ? 'text-blue-600' : 'text-purple-600'
        }`}>
          <motion.div
            className={`w-2 h-2 rounded-full ${colors[type]}`}
            animate={isActive ? {
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            } : {}}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          />
          <span className="font-medium">
            {type === 'user' ? 'You are speaking...' : 'AI is speaking...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SoundWaveAnimation;