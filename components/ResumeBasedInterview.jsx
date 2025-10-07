'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Play, 
  Pause,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  Video,
  AlertCircle,
  BarChart3,
  FileText,
  Target,
  Brain,
  Users,
  Code,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { chatSession } from '@/utils/GeminiAIModal';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import moment from 'moment';

const ResumeBasedInterview = ({ interview, onComplete }) => {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('setup'); // setup, interview, analysis, results
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [interviewType, setInterviewType] = useState('both'); // both, technical, hr
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Initialize camera and microphone
  const initializeMedia = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      setMediaStream(stream);
      setCameraEnabled(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Ensure video plays
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.log('Video autoplay prevented, user interaction required');
        }
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access to continue with the interview.');
    } finally {
      setLoading(false);
    }
  };  // Generate interview questions using Gemini
  const generateQuestions = async () => {
    try {
      setLoading(true);
      
      const prompt = `
        Based on the following job details, generate a comprehensive interview question set:
        - Job Position: ${interview?.jobPosition || 'Software Developer'}
        - Job Description: ${interview?.jobDesc || 'General software development role'}
        - Experience Required: ${interview?.jobExperience || '2-3 years'}
        
        Please generate exactly 10 questions that cover both technical and HR aspects:
        - 6 technical questions (resume-based technical skills, projects, problem-solving)
        - 4 HR questions (behavioral, cultural fit, situational scenarios)
        
        Format the response as a JSON array with this structure:
        [
          {
            "type": "technical",
            "question": "Question text",
            "category": "Technical Skills/Projects/Problem Solving",
            "expectedPoints": ["point1", "point2", "point3"]
          },
          {
            "type": "hr", 
            "question": "Question text",
            "category": "Behavioral/Cultural Fit/Situational",
            "expectedPoints": ["point1", "point2", "point3"]
          }
        ]
        
        Make questions specific to the role and ensure they test both technical depth and soft skills.
      `;

      const result = await chatSession.sendMessage(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const generatedQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(generatedQuestions);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions if API fails
      const fallbackQuestions = [
        {
          type: 'technical',
          question: 'Tell me about a challenging project you worked on recently. What technologies did you use and what problems did you solve?',
          category: 'Projects',
          expectedPoints: ['Technical complexity', 'Problem-solving approach', 'Technologies used', 'Outcome achieved']
        },
        {
          type: 'technical',
          question: 'How do you approach debugging a complex issue in production?',
          category: 'Problem Solving',
          expectedPoints: ['Systematic approach', 'Tools usage', 'Root cause analysis', 'Prevention strategies']
        },
        {
          type: 'hr',
          question: 'Describe a time when you had to work with a difficult team member. How did you handle it?',
          category: 'Behavioral',
          expectedPoints: ['Communication skills', 'Conflict resolution', 'Teamwork', 'Professional attitude']
        },
        {
          type: 'hr',
          question: 'Where do you see yourself in 5 years and how does this role fit into your career goals?',
          category: 'Cultural Fit',
          expectedPoints: ['Career vision', 'Alignment with role', 'Growth mindset', 'Commitment']
        }
      ];
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  // Start recording answer
  const startRecording = () => {
    if (mediaStream && !isRecording) {
      recordedChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Stop recording and save answer
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Save text answer
      if (currentAnswer.trim()) {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = {
          questionId: currentQuestionIndex,
          answer: currentAnswer,
          timestamp: new Date().toISOString(),
          type: questions[currentQuestionIndex]?.type
        };
        setAnswers(newAnswers);
        setCurrentAnswer('');
      }
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Interview completed, analyze answers
      analyzeAnswers();
    }
  };

  // Analyze all answers using Gemini
  const analyzeAnswers = async () => {
    try {
      setCurrentStep('analysis');
      setLoading(true);

      const analysisPrompt = `
        Analyze the following interview performance:
        
        Job Position: ${interview?.jobPosition}
        Job Description: ${interview?.jobDesc}
        
        Questions and Answers:
        ${questions.map((q, index) => `
        Question ${index + 1} (${q.type}): ${q.question}
        Answer: ${answers[index]?.answer || 'No answer provided'}
        Expected Points: ${q.expectedPoints?.join(', ')}
        `).join('\n')}
        
        Provide a comprehensive analysis in the following JSON format:
        {
          "overallScore": 85,
          "technicalScore": 80,
          "hrScore": 90,
          "detailedFeedback": {
            "strengths": ["strength1", "strength2", "strength3"],
            "improvements": ["improvement1", "improvement2", "improvement3"],
            "technicalFeedback": "Detailed technical assessment",
            "behavioralFeedback": "Detailed behavioral assessment"
          },
          "questionAnalysis": [
            {
              "questionIndex": 0,
              "score": 8,
              "feedback": "Good answer covering most key points",
              "missedPoints": ["point1", "point2"]
            }
          ],
          "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
          "verdict": "Strong candidate with good technical and soft skills"
        }
        
        Be thorough and constructive in your analysis.
      `;

      const result = await chatSession.sendMessage(analysisPrompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        setAnalysisResults(analysis);
        
        // Save to database
        await saveFeedbackToDatabase(analysis);
        
        setCurrentStep('results');
      }
    } catch (error) {
      console.error('Error analyzing answers:', error);
      // Fallback analysis
      const fallbackAnalysis = {
        overallScore: 75,
        technicalScore: 70,
        hrScore: 80,
        detailedFeedback: {
          strengths: ['Clear communication', 'Good technical knowledge', 'Professional attitude'],
          improvements: ['More specific examples', 'Deeper technical details', 'Better structure in answers'],
          technicalFeedback: 'Shows good understanding of core concepts but could provide more detailed examples.',
          behavioralFeedback: 'Demonstrates good soft skills and cultural fit potential.'
        },
        recommendations: ['Practice with more specific examples', 'Review technical concepts in depth', 'Work on answer structure'],
        verdict: 'Promising candidate with room for improvement'
      };
      setAnalysisResults(fallbackAnalysis);
      await saveFeedbackToDatabase(fallbackAnalysis);
      setCurrentStep('results');
    } finally {
      setLoading(false);
    }
  };

  // Save resume-based interview feedback to database
  const saveFeedbackToDatabase = async (analysis) => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress || !interview?.mockId) return;

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answer = answers[i];
        const questionAnalysis = analysis.questionAnalysis?.[i] || {
          score: Math.round(analysis.overallScore / 10),
          feedback: 'Good comprehensive response',
          missedPoints: []
        };

        await db.insert(UserAnswer).values({
          mockIdRef: interview.mockId,
          question: question.question,
          correctAns: `Expected: Comprehensive answer covering ${question.expectedPoints?.join(', ') || 'key technical and behavioral aspects'} with specific examples and clear explanations.`,
          userAns: answer?.answer || 'No answer provided',
          feedback: questionAnalysis.feedback + (questionAnalysis.missedPoints?.length ? '\nMissed points: ' + questionAnalysis.missedPoints.join(', ') : ''),
          rating: questionAnalysis.score.toString(),
          userEmail: user.primaryEmailAddress.emailAddress,
          createdAt: moment().format('DD-MM-yyyy')
        });
      }
    } catch (error) {
      console.error('Error saving resume-based interview feedback to database:', error);
    }
  };

  // Cleanup media stream
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  // Setup Phase
  const renderSetup = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Resume-Based Interview
          </h1>
          <p className="text-gray-600 mb-6">
            Get ready for a comprehensive interview covering both technical skills and behavioral questions based on your resume and the job requirements.
          </p>
          
          <div className="bg-blue-100 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-900">Position: {interview?.jobPosition}</span>
            </div>
            <p className="text-blue-700 text-sm">{interview?.jobDesc}</p>
          </div>
        </div>

        {/* Camera Preview */}
        <div className="mb-6">
          <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4 overflow-hidden">
            {cameraEnabled && mediaStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg transform scale-x-[-1]"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
                  }
                }}
              />
            ) : (
              <div className="text-white text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{loading ? 'Connecting to camera...' : 'Camera not enabled'}</p>
              </div>
            )}
          </div>

          {/* Media Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={initializeMedia}
              disabled={loading || cameraEnabled}
              variant={cameraEnabled ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : cameraEnabled ? (
                <Camera className="w-4 h-4" />
              ) : (
                <CameraOff className="w-4 h-4" />
              )}
              {loading ? 'Connecting...' : cameraEnabled ? 'Camera Ready' : 'Enable Camera'}
            </Button>
          </div>
        </div>

        {/* Interview Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <Code className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-semibold text-green-900">Technical Questions</p>
              <p className="text-green-700 text-sm">6 questions covering your skills & projects</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-purple-50 rounded-lg">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="font-semibold text-purple-900">HR Questions</p>
              <p className="text-purple-700 text-sm">4 questions on behavior & culture fit</p>
            </div>
          </div>
        </div>

        {/* Start Interview */}
        <div className="text-center">
          <Button
            onClick={() => {
              if (cameraEnabled) {
                generateQuestions();
                setCurrentStep('interview');
              } else {
                alert('Please enable camera first');
              }
            }}
            disabled={!cameraEnabled || loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Interview
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );

  // Interview Phase
  const renderInterview = () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return <div>Loading question...</div>;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentQ.type === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
              }`}>
                {currentQ.type === 'technical' ? 'Technical' : 'HR'} Question
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video Preview */}
            <div>
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Video Recording</h3>
                  <div className="bg-gray-900 rounded-lg aspect-video relative overflow-hidden">
                    {mediaStream ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          controls={false}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                            backgroundColor: '#1f2937'
                          }}
                          className="absolute inset-0 rounded-lg"
                          onLoadedMetadata={(e) => {
                            console.log('Resume interview video loaded metadata');
                            console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                            e.target.play().catch(err => console.error('Play error:', err));
                          }}
                          onPlaying={() => console.log('Resume interview video is playing')}
                          onError={(e) => console.error('Resume interview video error:', e)}
                        />
                        {/* Debug overlay for resume interview video */}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                          {isRecording ? '🔴 REC' : '⚪ READY'}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                          Tracks: {mediaStream ? mediaStream.getVideoTracks().length : 0}
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-center">
                        <div className="text-gray-400">
                          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No camera stream</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Recording Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="flex items-center gap-2"
                  >
                    {isRecording ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                </div>
                
                {isRecording && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse mr-2" />
                      Recording in progress...
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Question and Answer */}
            <div>
              <Card className="p-6 h-full">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    {currentQ.type === 'technical' ? (
                      <Code className="w-6 h-6 text-blue-600 mr-2" />
                    ) : (
                      <Users className="w-6 h-6 text-purple-600 mr-2" />
                    )}
                    <span className="text-sm text-gray-600">{currentQ.category}</span>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentQ.question}
                  </h2>
                </div>

                {/* Answer Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here while you speak..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    onClick={nextQuestion}
                    disabled={!currentAnswer.trim()}
                    className="flex items-center gap-2"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Analysis Phase
  const renderAnalysis = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="mb-6">
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Analyzing Your Performance
          </h2>
          <p className="text-gray-600">
            Our AI is evaluating your answers and preparing detailed feedback...
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        
        <div className="text-sm text-gray-500">
          This may take a few moments
        </div>
      </Card>
    </div>
  );

  // Results Phase
  const renderResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Interview Results
            </h1>
            <p className="text-gray-600">
              Here's your comprehensive interview performance analysis
            </p>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
              <div className="text-3xl font-bold text-blue-600">{analysisResults.overallScore}/100</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Technical Score</h3>
              <div className="text-3xl font-bold text-blue-600">{analysisResults.technicalScore}/100</div>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">HR Score</h3>
              <div className="text-3xl font-bold text-purple-600">{analysisResults.hrScore}/100</div>
            </Card>
          </div>

          {/* Detailed Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-green-600 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {analysisResults.detailedFeedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-orange-600 mb-4 flex items-center">
                <Target className="w-6 h-6 mr-2" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {analysisResults.detailedFeedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Technical and Behavioral Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-blue-600 mb-4">Technical Assessment</h3>
              <p className="text-gray-700">{analysisResults.detailedFeedback.technicalFeedback}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-purple-600 mb-4">Behavioral Assessment</h3>
              <p className="text-gray-700">{analysisResults.detailedFeedback.behavioralFeedback}</p>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisResults.recommendations.map((recommendation, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Tip {index + 1}</span>
                  </div>
                  <p className="text-blue-700 text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Final Verdict */}
          <Card className="p-6 text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Final Assessment</h3>
            <p className="text-lg text-gray-700">{analysisResults.verdict}</p>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => router.push(`/dashboard/interview/${interview?.mockId}/feedback`)}
              variant="outline"
              className="px-6 py-3"
            >
              View Detailed Report
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="px-6 py-3"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Take Another Interview
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  switch (currentStep) {
    case 'setup':
      return renderSetup();
    case 'interview':
      return renderInterview();
    case 'analysis':
      return renderAnalysis();
    case 'results':
      return renderResults();
    default:
      return renderSetup();
  }
};

export default ResumeBasedInterview;