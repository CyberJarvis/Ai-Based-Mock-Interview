'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { 
  Plus,
  LoaderCircle, 
  FileText, 
  Briefcase,
  Sparkles,
  CheckCircle,
  ArrowRight
} from "lucide-react";
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

const EnhancedAddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const steps = [
    { id: 1, name: "Job Details", icon: Briefcase },
    { id: 2, name: "Resume Upload", icon: FileText },
    { id: 3, name: "Review", icon: CheckCircle }
  ];

  const resetForm = () => {
    setCurrentStep(1);
    setJobPosition("");
    setJobDesc("");
    setJobExperience("");
    setResumeData(null);
    setResumeAnalysis(null);
  };

  const onSubmit = async () => {
    setLoading(true);

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
        resetForm();
        
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

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return jobPosition && jobDesc && jobExperience;
      case 2:
        return true; // Resume is optional
      case 3:
        return jobPosition && jobDesc && jobExperience;
      default:
        return false;
    }
  };

  return (
    <div className="w-full">
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <motion.div
            className="group cursor-pointer"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-100/50 hover:to-purple-100/50 transition-all duration-300 overflow-hidden">
              {/* Background Animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatDelay: 2
                }}
              />
              
              <div className="relative z-10 text-center">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <Plus className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  Create New Interview
                </h3>
                <p className="text-gray-600 mb-4">
                  Set up your personalized AI interview session
                </p>
                
                <motion.div
                  className="inline-flex items-center text-blue-600 font-medium"
                  whileHover={{ x: 4 }}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Your AI Interview
            </DialogTitle>
            <DialogDescription>
              Follow the steps below to create a personalized interview experience
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white'
                      : currentStep === step.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-gray-300 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: currentStep === step.id ? 1.05 : 1,
                  }}
                >
                  <step.icon className="w-5 h-5" />
                </motion.div>
                
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Job Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* AI Suggestions from Resume */}
                  {resumeAnalysis?.recommendations?.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-900">AI Suggestions Based on Your Resume</h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {resumeAnalysis.recommendations.slice(0, 4).map((rec, index) => (
                          <motion.button
                            key={index}
                            onClick={() => setJobPosition(rec.title)}
                            className={`text-left p-3 rounded-lg border transition-all ${
                              jobPosition === rec.title 
                                ? 'border-blue-500 bg-blue-100 text-blue-900' 
                                : 'border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{rec.title}</span>
                              <span className="text-xs text-green-600 font-medium">{rec.match}% match</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1">{rec.reasoning}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <JobRoleSelector 
                        selectedRole={jobPosition}
                        onRoleSelect={setJobPosition}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience *
                      </label>
                      <Input
                        placeholder="Ex. 5"
                        value={jobExperience}
                        onChange={(e) => setJobExperience(e.target.value)}
                        type="number"
                        min="0"
                        max="50"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description / Tech Stack *
                    </label>
                    <Textarea
                      placeholder="Ex. React, Angular, NodeJS, MySql etc"
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      rows={4}
                      className="w-full resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Resume Upload */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Enhance with Your Resume (Optional)
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Upload your resume to get personalized questions based on your experience and background
                    </p>
                  </div>
                  
                  <ResumeUpload
                    onResumeUpload={(data) => setResumeData(data)}
                    onAnalysisComplete={(analysis) => setResumeAnalysis(analysis)}
                  />
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Review Your Interview Setup
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Job Position</div>
                        <div className="text-gray-900 font-semibold">{jobPosition}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Experience</div>
                        <div className="text-gray-900 font-semibold">{jobExperience} years</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-1">Job Description</div>
                      <div className="text-gray-900 bg-white rounded-lg p-3 border">
                        {jobDesc}
                      </div>
                    </div>

                    {resumeData && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">
                            Resume uploaded: {resumeData.fileName}
                          </span>
                        </div>
                        
                        {resumeAnalysis?.analysis && (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">Resume Analysis</h4>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                resumeAnalysis.analysis.score >= 80 ? 'bg-green-100 text-green-800' :
                                resumeAnalysis.analysis.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {resumeAnalysis.analysis.score}% Score
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                              {resumeAnalysis.analysis.summary?.title && (
                                <div>
                                  <span className="text-gray-600">Current Role:</span>
                                  <span className="ml-2 font-medium">{resumeAnalysis.analysis.summary.title}</span>
                                </div>
                              )}
                              {resumeAnalysis.analysis.summary?.experience && (
                                <div>
                                  <span className="text-gray-600">Experience:</span>
                                  <span className="ml-2 font-medium">{resumeAnalysis.analysis.summary.experience}</span>
                                </div>
                              )}
                            </div>
                            
                            {resumeAnalysis.analysis.skills?.technical?.length > 0 && (
                              <div className="mt-3">
                                <span className="text-xs font-medium text-gray-700 block mb-2">Key Skills:</span>
                                <div className="flex flex-wrap gap-1">
                                  {resumeAnalysis.analysis.skills.technical.slice(0, 5).map((skill, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              ← Previous
            </Button>

            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepComplete(currentStep)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  onClick={onSubmit}
                  disabled={loading || !isStepComplete(3)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center px-6"
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin w-4 h-4 mr-2" />
                      Creating Interview...
                    </>
                  ) : (
                    <>
                      Create Interview
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedAddNewInterview;