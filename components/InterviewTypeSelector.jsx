'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Code, 
  Users, 
  Play, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  Target,
  Zap,
  Brain,
  Camera,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const ResumeBasedInterview = dynamic(() => import('./ResumeBasedInterview'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">Loading Interview...</div>
});

const TechnicalInterviewInterface = dynamic(() => import('./TechnicalInterviewInterface'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">Loading Technical Interview...</div>
});

const HRInterviewInterface = dynamic(() => import('./HRInterviewInterface'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">Loading HR Interview...</div>
});



const InterviewTypeSelector = ({ interview }) => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);
  const [showInterface, setShowInterface] = useState(false);
  const [currentInterviewType, setCurrentInterviewType] = useState(null);

  const interviewTypes = [
    {
      id: 'resume-based',
      title: 'AI Resume Interview',
      subtitle: 'Technical + HR with Camera',
      description: 'Comprehensive interview covering both technical skills and behavioral questions. AI generates questions based on your resume and job role with live camera recording.',
      icon: Sparkles,
      color: 'from-purple-600 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      duration: '60-75 min',
      difficulty: 'Comprehensive',
      features: [
        'AI-generated questions based on resume',
        'Live camera recording',
        'Technical + Behavioral questions',
        'Immediate detailed scoring',
        'Real-time answer analysis',
        'Personalized feedback & recommendations'
      ]
    },
    {
      id: 'technical',
      title: 'Technical Interview',
      subtitle: 'Resume-based + Camera Recording',
      description: 'Deep dive into your technical skills, projects, and problem-solving abilities with live camera recording during your responses.',
      icon: Code,
      color: 'from-blue-600 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50',
      duration: '45-60 min',
      difficulty: 'Medium-Hard',
      features: [
        'Live camera recording',
        'Resume-based questions',
        'Project deep dives', 
        'System design concepts',
        'Problem-solving scenarios'
      ]
    },
    {
      id: 'hr',
      title: 'HR Interview',
      subtitle: 'Behavioral + Camera Recording',
      description: 'Behavioral questions and situational scenarios with live camera recording to assess your communication and soft skills.',
      icon: Users,
      color: 'from-green-600 to-teal-600',
      bgColor: 'from-green-50 to-teal-50',
      duration: '30-45 min',
      difficulty: 'Medium',
      features: [
        'Live camera recording',
        'Behavioral questions',
        'Situational scenarios',
        'Cultural fit assessment',
        'Communication skills evaluation'
      ]
    }
  ];

  const handleStartInterview = () => {
    if (selectedType) {
      setCurrentInterviewType(selectedType);
      setShowInterface(true);
    }
  };

  const handleComplete = () => {
    setShowInterface(false);
    setCurrentInterviewType(null);
    setSelectedType(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Render the selected interview interface
  if (showInterface && currentInterviewType) {
    switch (currentInterviewType) {
      case 'resume-based':
        return <ResumeBasedInterview interview={interview} onComplete={handleComplete} />;
      case 'technical':
        return <TechnicalInterviewInterface interviewId={interview?.mockId} onComplete={handleComplete} />;
      case 'hr':
        return <HRInterviewInterface interviewId={interview?.mockId} onComplete={handleComplete} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Interview Type
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Select the type of interview you want to practice. Choose from our new AI-powered resume interview or traditional technical and HR interviews.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <Target className="w-4 h-4 mr-2" />
            Position: {interview?.jobPosition}
          </div>
        </motion.div>

        {/* Interview Type Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {interviewTypes.map((type) => (
            <motion.div
              key={type.id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              onHoverStart={() => setHoveredType(type.id)}
              onHoverEnd={() => setHoveredType(null)}
            >
              <Card 
                className={`relative h-full p-6 cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
                  selectedType === type.id
                    ? 'border-blue-500 shadow-xl bg-blue-50'
                    : hoveredType === type.id
                    ? 'border-gray-300 shadow-lg'
                    : 'border-gray-200 shadow-sm hover:shadow-md'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${type.bgColor} opacity-0 ${
                  selectedType === type.id ? 'opacity-100' : hoveredType === type.id ? 'opacity-50' : ''
                } transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon and Title */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${type.color} flex items-center justify-center transform ${
                      hoveredType === type.id ? 'scale-110 rotate-6' : ''
                    } transition-transform duration-300`}>
                      <type.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {type.id === 'resume-based' && (
                        <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                          NEW
                        </span>
                      )}
                      {selectedType === type.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-blue-600 font-medium text-sm mb-3">
                    {type.subtitle}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {type.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {type.duration}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                      type.difficulty === 'Medium-Hard' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {type.difficulty}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <Star className="w-3 h-3 mr-2 text-gray-400" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedType === type.id && (
                  <motion.div
                    layoutId="selectedBorder"
                    className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Section */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-2xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Ready to start your {interviewTypes.find(t => t.id === selectedType)?.title}?
                  </h3>
                  <p className="text-gray-600">
                    Make sure you're in a quiet environment with a stable internet connection.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedType(null)}
                    className="px-6 py-3"
                  >
                    Change Selection
                  </Button>
                  <Button
                    onClick={handleStartInterview}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium group"
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Start Interview
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewTypeSelector;