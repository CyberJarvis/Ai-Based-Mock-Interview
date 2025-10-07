'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const InteractiveDashboard = ({ children }) => {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    streak: 0,
    improvement: 0
  });
  
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      setTimeout(() => setStats({
        totalInterviews: 15,
        avgScore: 85,
        streak: 7,
        improvement: 12
      }), 500);
    };

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    animateStats();
  }, []);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const statCards = [
    {
      icon: DocumentTextIcon,
      title: 'Interviews Completed',
      value: stats.totalInterviews,
      suffix: '',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: TrophyIcon,
      title: 'Average Score',
      value: stats.avgScore,
      suffix: '%',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: ClockIcon,
      title: 'Current Streak',
      value: stats.streak,
      suffix: ' days',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Improvement',
      value: stats.improvement,
      suffix: '%',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    }
  ];

  const quickActions = [
    {
      icon: PlayIcon,
      title: 'Quick Practice',
      description: 'Start a 5-minute practice session',
      color: 'from-blue-600 to-purple-600',
      action: () => console.log('Quick practice')
    },
    {
      icon: ChartBarIcon,
      title: 'View Analytics',
      description: 'See your detailed progress',
      color: 'from-green-600 to-teal-600',
      action: () => console.log('View analytics')
    },
    {
      icon: DocumentTextIcon,
      title: 'Review Questions',
      description: 'Browse previous questions',
      color: 'from-purple-600 to-pink-600',
      action: () => console.log('Review questions')
    }
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="p-6 lg:p-10">
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-3"
                whileHover={{ scale: 1.05 }}
              >
                <SparklesIcon className="w-4 h-4 mr-2" />
                {greeting}! Ready to practice?
              </motion.div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Your Interview Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Track your progress and continue improving your interview skills
              </p>
            </div>

            {/* Quick Actions */}
            <motion.div
              className="mt-6 lg:mt-0 flex flex-wrap gap-3"
              variants={itemVariants}
            >
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.action}
                  className={`group relative px-4 py-2 bg-gradient-to-r ${action.color} text-white rounded-xl font-medium text-sm overflow-hidden`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center">
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.title}
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              className={`${stat.bgColor} rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300`}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-gray-600 text-sm font-medium mb-1">
                    {stat.title}
                  </div>
                  <motion.div
                    className="text-2xl lg:text-3xl font-bold text-gray-900"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={stat.value}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {stat.value}{stat.suffix}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                </div>
                
                <motion.div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                >
                  <stat.icon className="w-full h-full text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={itemVariants}
        >
          {/* Create Interview Section */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center mb-6">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-2.5 mr-4"
                whileHover={{ rotate: 10 }}
              >
                <PlusIcon className="w-full h-full text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Create New Interview
                </h3>
                <p className="text-gray-600 text-sm">
                  Set up your next practice session
                </p>
              </div>
            </div>
            
            {children}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            variants={itemVariants}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {[
                { title: 'Technical Interview', time: '2 hours ago', score: 92 },
                { title: 'Behavioral Questions', time: 'Yesterday', score: 88 },
                { title: 'System Design', time: '3 days ago', score: 75 }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {activity.title}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {activity.time}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    activity.score >= 90 ? 'text-green-600' :
                    activity.score >= 80 ? 'text-blue-600' :
                    'text-orange-600'
                  }`}>
                    {activity.score}%
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              className="w-full mt-4 py-3 text-blue-600 font-medium text-sm hover:bg-blue-50 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View All Activity
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InteractiveDashboard;