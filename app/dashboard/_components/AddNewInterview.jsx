"use client";
import React, { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle, FileText, Briefcase } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
import { generateInterviewQuestions } from "@/utils/interviewGenerator";
import ResumeUpload from "@/components/ResumeUpload";
import JobRoleSelector from "@/components/JobRoleSelector";
import { toast } from "sonner";

const AddNewInterview = () => {
  const [openDailog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    // Validation
    if (!jobPosition || !jobDesc || !jobExperience) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      console.log("Generating interview with:", {
        jobPosition,
        jobDesc,
        jobExperience,
        hasResume: !!resumeData
      });

      // Generate questions using the new utility function
      const questionResult = await generateInterviewQuestions({
        jobPosition,
        jobDesc,
        jobExperience,
        resumeContent: resumeData?.content
      });

      if (!questionResult.success) {
        throw new Error(questionResult.error || "Failed to generate questions");
      }

      const MockJsonResp = questionResult.questions;
      setJsonResponse(MockJsonResp);

      // Save to database with resume information
      const resp = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: MockJsonResp,
          jobPosition: jobPosition,
          jobDesc: jobDesc,
          jobExperience: jobExperience,
          resumeContent: resumeData?.content || null,
          resumeFileName: resumeData?.fileName || null,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("YYYY-MM-DD"),
        })
        .returning({ mockId: MockInterview.mockId });

      console.log("Inserted ID:", resp);

      if (resp && resp[0]?.mockId) {
        setOpenDialog(false);
        // Reset form
        setJobPosition("");
        setJobDesc("");
        setJobExperience("");
        setResumeData(null);
        
        toast.success("Interview created successfully!");
        router.push("/dashboard/interview/" + resp[0].mockId);
      } else {
        throw new Error("Failed to save interview to database");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error(error.message || "Failed to create interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = (uploadedResume) => {
    setResumeData(uploadedResume);
  };

  const handleRoleSelect = (selectedRole) => {
    setJobPosition(selectedRole);
  };

  return (
    <div>
      <div
        className="p-10 rounded-lg border bg-secondary hover:scale-105 hover:shadow-sm transition-all cursor-pointer"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className=" text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDailog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Create Your AI Mock Interview
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Set up your personalized interview experience with AI-generated questions
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Job Role Selection */}
            <div className="space-y-4">
              <JobRoleSelector
                selectedRole={jobPosition}
                onRoleSelect={handleRoleSelect}
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Job Description / Tech Stack *
              </label>
              <Textarea
                className="min-h-[100px]"
                placeholder="Ex. React, Node.js, Python, AWS, MongoDB, RESTful APIs, Microservices, Docker..."
                value={jobDesc}
                required
                onChange={(e) => setJobDesc(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Include technologies, frameworks, and skills relevant to the role
              </p>
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Years of Experience *
              </label>
              <Input
                placeholder="Ex. 5"
                max="50"
                type="number"
                value={jobExperience}
                required
                onChange={(e) => setJobExperience(e.target.value)}
              />
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Resume Upload (Optional)
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Upload your resume to get more personalized interview questions based on your experience and skills.
              </p>
              
              <ResumeUpload onResumeUpload={handleResumeUpload} />
              
              {resumeData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Resume processed successfully!
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    AI will generate personalized questions based on your resume and job requirements.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  // Reset form when cancelled
                  setJobPosition("");
                  setJobDesc("");
                  setJobExperience("");
                  setResumeData(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !jobPosition || !jobDesc || !jobExperience}>
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin mr-2 h-4 w-4" />
                    Generating AI Questions...
                  </>
                ) : (
                  <>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Start Interview
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
