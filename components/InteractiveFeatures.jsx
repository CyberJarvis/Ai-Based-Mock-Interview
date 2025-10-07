'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  BoltIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  MicrophoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const InteractiveFeatures = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const features = [
    {
      icon: BoltIcon,
      title: "AI-Powered Interviews",
      description: "Experience realistic interview scenarios with our advanced AI that adapts to your responses",
      color: "from-blue-500 to-cyan-500",
      delay: 0
    },
    {
      icon: DocumentCheckIcon,
      title: "Instant Feedback",
      description: "Get detailed analysis of your answers with specific suggestions for improvement",
      color: "from-green-500 to-emerald-500",
      delay: 0.1
    },
    {
      icon: ChartBarIcon,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with comprehensive analytics and reports",
      color: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      icon: UserGroupIcon,
      title: "Multiple Interview Types",
      description: "Practice technical, behavioral, and industry-specific interview questions",
      color: "from-orange-500 to-red-500",
      delay: 0.3
    },
    {
      icon: MicrophoneIcon,
      title: "Voice Recognition",
      description: "Practice speaking with advanced voice recognition and pronunciation feedback",
      color: "from-indigo-500 to-blue-500",
      delay: 0.4
    },
    {
      icon: VideoCameraIcon,
      title: "Video Practice",
      description: "Record yourself and review your body language and presentation skills",
      color: "from-teal-500 to-green-500",
      delay: 0.5
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4"
            variants={itemVariants}
          >
            <TrophyIcon className="w-4 h-4 mr-2" />
            Powerful Features
          </motion.div>
          
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Our comprehensive platform provides all the tools and insights you need to master any interview
          </motion.p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="w-full h-full text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Arrow */}
                <motion.div
                  className="absolute bottom-6 right-6 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Statistics Section */}
        <motion.div
          className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12"
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="text-center text-white mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Trusted by Thousands of Job Seekers
            </h3>
            <p className="text-blue-100">
              Join our community and start your journey to interview success
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "10,000+", label: "Interviews Completed" },
              { number: "95%", label: "Success Rate" },
              { number: "500+", label: "Companies Covered" },
              { number: "24/7", label: "Available Support" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                <motion.div
                  className="text-2xl md:text-3xl font-bold text-white mb-1"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-blue-100 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default InteractiveFeatures;