"use client";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { ChevronDown, Award, TrendingUp, CheckCircle, AlertCircle, Target, BarChart3 } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const Feedback = ({ params }) => {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    GetFeedback();
  }, []);

  const GetFeedback = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params.interviewId))
      .orderBy(UserAnswer.id);

    console.log(result);
    setFeedbackList(result);
  };

  const overallRating = useMemo(() => {
    if (feedbackList && feedbackList.length > 0) {
      const totalRating = feedbackList.reduce(
        (sum, item) => sum + Number(item.rating),
        0
      );
      return (totalRating / feedbackList.length).toFixed(1);
    }
    return 0;
  }, [feedbackList]);

  const performanceStats = useMemo(() => {
    if (feedbackList && feedbackList.length > 0) {
      const ratings = feedbackList.map(item => Number(item.rating));
      const excellent = ratings.filter(r => r >= 8).length;
      const good = ratings.filter(r => r >= 6 && r < 8).length;
      const needsImprovement = ratings.filter(r => r < 6).length;
      
      return { excellent, good, needsImprovement, total: ratings.length };
    }
    return { excellent: 0, good: 0, needsImprovement: 0, total: 0 };
  }, [feedbackList]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {feedbackList?.length == 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="font-bold text-2xl text-gray-500 mb-2">
              No Interview Feedback Found
            </h2>
            <p className="text-gray-400">Complete an interview to see your detailed feedback here.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Results</h1>
              <p className="text-gray-600">Comprehensive feedback and performance analysis</p>
            </div>

            {/* Overall Score Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Interview Performance</h2>
              <div className="flex items-center justify-center mb-6">
                <div className="text-6xl font-bold mr-4" style={{
                  color: overallRating >= 8 ? '#10B981' : overallRating >= 6 ? '#F59E0B' : '#EF4444'
                }}>
                  {overallRating}
                </div>
                <div className="text-left">
                  <div className="text-2xl font-semibold text-gray-600">/10</div>
                  <div className="text-lg text-gray-500">
                    {overallRating >= 8 ? 'Excellent' : overallRating >= 6 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Total Questions</h3>
                <div className="text-2xl font-bold text-blue-600">{performanceStats.total}</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Excellent (8-10)</h3>
                <div className="text-2xl font-bold text-green-600">{performanceStats.excellent}</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Good (6-7)</h3>
                <div className="text-2xl font-bold text-yellow-600">{performanceStats.good}</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Target className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Needs Work (&lt;6)</h3>
                <div className="text-2xl font-bold text-red-600">{performanceStats.needsImprovement}</div>
              </div>
            </div>

            {/* Questions and Feedback */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Question-by-Question Analysis</h2>
              <p className="text-gray-600 mb-6">
                Detailed feedback for each question with suggestions for improvement
              </p>
              <div className="space-y-6">
                {feedbackList.map((item, index) => (
                  <Collapsible key={index} className="border border-gray-200 rounded-lg">
                    <CollapsibleTrigger className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Question {index + 1}</h3>
                        <p className="text-gray-700 line-clamp-2">{item.question}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          Number(item.rating) >= 8 
                            ? 'bg-green-100 text-green-800' 
                            : Number(item.rating) >= 6 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.rating}/10
                        </div>
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">Your Answer</h4>
                          <p className="text-gray-700 text-sm">{item.userAns}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-2">Expected Answer</h4>
                          <p className="text-gray-700 text-sm">{item.correctAns}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-purple-900 mb-2">Detailed Feedback</h4>
                          <p className="text-gray-700 text-sm whitespace-pre-line">{item.feedback}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button 
                onClick={() => router.replace("/dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;
