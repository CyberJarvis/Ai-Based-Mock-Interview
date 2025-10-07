'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const InteractiveHero = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: "AI-Powered Interviews",
      description: "Experience realistic conversations with our advanced AI interviewer"
    },
    {
      icon: DocumentTextIcon,
      title: "Instant Feedback",
      description: "Get detailed analysis and suggestions to improve your performance"
    },
    {
      icon: CheckCircleIcon,
      title: "Progress Tracking",
      description: "Monitor your improvement across multiple interview sessions"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div variants={itemVariants} className="text-center lg:text-left">
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              AI-Powered Interview Practice
            </motion.div>

            <motion.h1 
              className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6"
              variants={itemVariants}
            >
              Ace Your Next{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Interview
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl text-white/80 mb-8 max-w-lg mx-auto lg:mx-0"
              variants={itemVariants}
            >
              Practice with AI-powered mock interviews, get instant feedback, and build confidence for your dream job.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={itemVariants}
            >
              <motion.a
                href="/dashboard"
                className="group bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center hover:bg-blue-50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Practicing Now
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              
              <motion.a
                href="#features"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20"
              variants={itemVariants}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-white/60 text-sm">Interviews Practiced</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-white/60 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-white/60 text-sm">Available</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Interactive Feature Cards */}
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            <motion.div
              className="relative w-full max-w-md mx-auto"
              variants={floatingVariants}
              animate="animate"
            >
              {/* Main Feature Card */}
              <motion.div
                key={currentFeature}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-center">
                  {React.createElement(features[currentFeature].icon, {
                    className: "w-16 h-16 text-blue-300 mx-auto mb-4"
                  })}
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {features[currentFeature].title}
                  </h3>
                  <p className="text-white/70">
                    {features[currentFeature].description}
                  </p>
                </div>
              </motion.div>

              {/* Feature Indicators */}
              <div className="flex justify-center mt-6 space-x-3">
                {features.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentFeature 
                        ? 'bg-white' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-10 -right-10 w-20 h-20 bg-blue-400/20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <motion.div
              className="absolute -bottom-10 -left-10 w-16 h-16 bg-purple-400/20 rounded-full"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div 
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default InteractiveHero;