'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { 
  Play, 
  FileText, 
  Clock, 
  Briefcase,
  Star,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const EnhancedInterviewItemCard = ({ interview }) => {
  const router = useRouter();

  const onStart = () => {
    router.push("/dashboard/interview/" + interview?.mockId);
  };

  const onFeedback = () => {
    router.push("/dashboard/interview/" + interview?.mockId + "/feedback");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getExperienceLevel = (years) => {
    const exp = parseInt(years);
    if (exp <= 2) return { level: 'Junior', color: 'bg-green-100 text-green-800' };
    if (exp <= 5) return { level: 'Mid-level', color: 'bg-blue-100 text-blue-800' };
    if (exp <= 10) return { level: 'Senior', color: 'bg-purple-100 text-purple-800' };
    return { level: 'Expert', color: 'bg-orange-100 text-orange-800' };
  };

  const expLevel = getExperienceLevel(interview?.jobExperience);

  return (
    <motion.div
      className="group relative bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header Section */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                {interview?.jobPosition}
              </h3>
            </div>
          </div>
          
          {/* Status Badge */}
          <motion.div
            className="flex items-center space-x-1 text-xs text-gray-500"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-3 h-3" />
            <span>Active</span>
          </motion.div>
        </div>

        {/* Experience and Date */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${expLevel.color} border-0`}>
            {expLevel.level} • {interview?.jobExperience}y
          </Badge>
          
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(interview?.createdAt)}
          </div>
        </div>

        {/* Job Description Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {interview?.jobDesc}
          </p>
        </div>

        {/* Features/Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {interview?.resumeFileName && (
            <motion.div
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"
              whileHover={{ scale: 1.05 }}
            >
              <FileText className="w-3 h-3 mr-1" />
              Resume-based
            </motion.div>
          )}
          
          <motion.div
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200"
            whileHover={{ scale: 1.05 }}
          >
            <Clock className="w-3 h-3 mr-1" />
            ~30 min
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={onStart}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 group/btn"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            Start Interview
          </Button>
          
          <Button
            onClick={onFeedback}
            variant="outline"
            className="flex-1 border-gray-300 hover:border-blue-400 hover:bg-blue-50 group/btn"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            Feedback
          </Button>
        </div>

        {/* Hover Effect Arrow */}
        <motion.div
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowRight className="w-4 h-4 text-blue-600" />
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export default EnhancedInterviewItemCard;