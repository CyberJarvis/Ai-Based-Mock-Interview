"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewTypeSelector from "@/components/InterviewTypeSelector";

const Interview = ({ params }) => {
  const [interviewData, setInterviewData] = useState();
  
  useEffect(() => {
    GetInterviewDetails();
  }, []);
  
  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
      
    setInterviewData(result[0]);
  };
  
  return (
    <div>
      {interviewData ? (
        <InterviewTypeSelector interview={interviewData} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default Interview;
