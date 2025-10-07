'use client';

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { desc, eq } from "drizzle-orm";
import EnhancedInterviewItemCard from "@/components/EnhancedInterviewItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  Trophy, 
  BarChart3,
  Sparkles,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EnhancedInterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (user) {
      GetInterviewList();
    }
  }, [user]);

  useEffect(() => {
    filterInterviews();
  }, [interviewList, searchTerm, filterStatus]);

  const GetInterviewList = async () => {
    try {
      setLoading(true);
      const result = await db
        .select()
        .from(MockInterview)
        .where(
          eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
        .orderBy(desc(MockInterview.id));

      console.log(result);
      setInterviewList(result);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterInterviews = () => {
    let filtered = [...interviewList];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(interview => 
        interview.jobPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.jobDesc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status (this would need to be added to your schema)
    // For now, we'll simulate different statuses
    if (filterStatus !== "all") {
      // You can add logic here based on your interview completion tracking
    }

    setFilteredList(filtered);
  };

  const getStats = () => {
    const total = interviewList.length;
    const completed = interviewList.filter(i => i.mockId).length; // Assuming all have mockId means completed
    const avgExperience = interviewList.length > 0 
      ? Math.round(interviewList.reduce((acc, i) => acc + parseInt(i.jobExperience || 0), 0) / interviewList.length)
      : 0;

    return { total, completed, avgExperience };
  };

  const stats = getStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Interview Journey
          </h2>
          <p className="text-gray-600">
            Track your progress and revisit past interviews
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-600">
            {stats.total} Interviews Created
          </span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Interviews</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">{stats.avgExperience}y</div>
              <div className="text-sm text-purple-700">Avg Experience</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      {interviewList.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-gray-50 rounded-xl"
        >
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by job position or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md bg-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              All
            </Button>
            <Button
              variant={filterStatus === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("recent")}
            >
              Recent
            </Button>
          </div>
        </motion.div>
      )}

      {/* Interview Grid */}
      {filteredList.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredList.map((interview, index) => (
              <motion.div
                key={interview.id || index}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -4 }}
                className="h-fit"
              >
                <EnhancedInterviewItemCard interview={interview} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {interviewList.length === 0 ? "No interviews yet" : "No interviews found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {interviewList.length === 0 
              ? "Create your first AI interview to get started with your practice journey"
              : "Try adjusting your search or filter criteria"
            }
          </p>
          {interviewList.length === 0 && (
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Create Your First Interview
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedInterviewList;