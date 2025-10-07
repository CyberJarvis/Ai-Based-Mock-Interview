'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  SkipForward,
  MessageSquare,
  Clock,
  User,
  Bot,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { toast } from 'sonner';
import SoundWaveAnimation from '@/components/SoundWaveAnimation';
import VoiceSystem from '@/utils/voiceSystem';

const EnhancedInterviewInterface = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [interviewData, setInterviewData] = useState(null);
  const [interviewType, setInterviewType] = useState(searchParams.get('type') || 'technical');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [isGreeting, setIsGreeting] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [interviewPhase, setInterviewPhase] = useState('greeting'); // greeting, questions, completed
  
  const textareaRef = useRef(null);
  const voiceSystemRef = useRef(null);

  useEffect(() => {
    GetInterviewDetails();
    initializeVoiceSystem();
    return () => {
      if (voiceSystemRef.current) {
        voiceSystemRef.current.cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (interviewData && questions.length > 0 && isGreeting) {
      startGreeting();
    }
  }, [interviewData, questions]);

  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));
      
    if (result[0]) {
      setInterviewData(result[0]);
      const parsedQuestions = JSON.parse(result[0].jsonMockResp);
      setQuestions(parsedQuestions || []);
    }
  };

  const initializeVoiceSystem = () => {
    voiceSystemRef.current = new VoiceSystem({
      onSpeechStart: () => {
        setIsSpeaking(true);
        setIsListening(false);
      },
      onSpeechEnd: () => {
        setIsSpeaking(false);
      },
      onListeningStart: () => {
        setIsListening(true);
        setIsRecording(true);
      },
      onListeningEnd: () => {
        setIsListening(false);
        setIsRecording(false);
      },
      onTranscript: (transcript) => {
        setUserAnswer(transcript);
      }
    });
  };

  const startGreeting = async () => {
    setInterviewPhase('greeting');
    const greetingText = `Hello! Welcome to your ${interviewType} interview for the ${interviewData.jobPosition} position. I'm your AI interviewer, and I'll be guiding you through this session. Are you ready to begin?`;
    
    if (voiceEnabled && voiceSystemRef.current) {
      await voiceSystemRef.current.speak(greetingText);
    }
    
    setTimeout(() => {
      setIsGreeting(false);
      setInterviewPhase('questions');
      setStartTime(new Date());
      askCurrentQuestion();
    }, 5000);
  };

  const askCurrentQuestion = async () => {
    if (currentQuestion < questions.length) {
      const questionText = questions[currentQuestion].Question || questions[currentQuestion].question;
      const questionIntro = `Question ${currentQuestion + 1}: ${questionText}`;
      
      if (voiceEnabled && voiceSystemRef.current) {
        await voiceSystemRef.current.speak(questionIntro);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please provide an answer before submitting');
      return;
    }

    const newAnswer = {
      question: questions[currentQuestion].Question || questions[currentQuestion].question,
      answer: userAnswer.trim(),
      timestamp: new Date().toISOString()
    };

    setAnswers(prev => [...prev, newAnswer]);
    setUserAnswer('');

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeout(() => {
        askCurrentQuestion();
      }, 1000);
    } else {
      completeInterview();
    }
  };

  const completeInterview = () => {
    setInterviewPhase('completed');
    const completionText = "Congratulations! You have completed your interview. Thank you for your time and responses.";
    
    if (voiceEnabled && voiceSystemRef.current) {
      voiceSystemRef.current.speak(completionText);
    }
    
    // Navigate to feedback page after a delay
    setTimeout(() => {
      router.push(`/dashboard/interview/${params.interviewId}/feedback`);
    }, 3000);
  };

  const toggleRecording = () => {
    if (isRecording) {
      voiceSystemRef.current?.stopListening();
    } else {
      voiceSystemRef.current?.startListening();
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      voiceSystemRef.current?.stopSpeaking();
    }
  };

  const skipToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
      setTimeout(() => {
        askCurrentQuestion();
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmitAnswer();
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {interviewType} Interview
              </h1>
              <p className="text-gray-600">{interviewData?.jobPosition}</p>
            </div>
            <div className="flex items-center space-x-4">
              {startTime && (
                <Badge variant="outline" className="text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {Math.floor((new Date() - startTime) / 1000 / 60)}m
                </Badge>
              )}
              <Badge className="bg-blue-100 text-blue-800">
                {currentQuestion + 1} / {questions.length}
              </Badge>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <AnimatePresence mode="wait">
              {interviewPhase === 'greeting' ? (
                <motion.div
                  key="greeting"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="p-8 text-center bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Bot className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Welcome to Your Interview!
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Get ready to showcase your skills. The interview will begin shortly...
                    </p>
                    {isSpeaking && (
                      <div className="mt-6">
                        <SoundWaveAnimation type="ai" />
                      </div>
                    )}
                  </Card>
                </motion.div>
              ) : interviewPhase === 'questions' && questions[currentQuestion] ? (
                <motion.div
                  key={`question-${currentQuestion}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Question {currentQuestion + 1}
                        </h3>
                        <p className="text-gray-700 text-lg leading-relaxed">
                          {questions[currentQuestion].Question || questions[currentQuestion].question}
                        </p>
                      </div>
                    </div>
                    
                    {isSpeaking && (
                      <div className="mb-4">
                        <SoundWaveAnimation type="ai" />
                      </div>
                    )}
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="p-8 text-center bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Interview Completed!
                    </h2>
                    <p className="text-gray-600 text-lg mb-6">
                      Thank you for your responses. Redirecting to feedback...
                    </p>
                    {isSpeaking && (
                      <SoundWaveAnimation type="ai" />
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer Area */}
            {interviewPhase === 'questions' && (
              <Card className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Your Answer</h3>
                </div>
                
                <Textarea
                  ref={textareaRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your answer here or use the microphone to speak..."
                  className="min-h-[150px] text-lg resize-none focus:ring-2 focus:ring-blue-500"
                />
                
                {isListening && (
                  <div className="mt-4">
                    <SoundWaveAnimation type="user" />
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleRecording}
                      className={`${isRecording ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleVoice}
                    >
                      {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={skipToNext}
                      disabled={currentQuestion >= questions.length - 1}
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Skip
                    </Button>
                    
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Answer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Press Cmd/Ctrl + Enter to submit quickly
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Interview Info */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Interview Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 capitalize font-medium">{interviewType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Position:</span>
                  <span className="ml-2 font-medium">{interviewData?.jobPosition}</span>
                </div>
                <div>
                  <span className="text-gray-600">Experience:</span>
                  <span className="ml-2 font-medium">{interviewData?.jobExperience} years</span>
                </div>
              </div>
            </Card>

            {/* Progress */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Progress</h3>
              <div className="space-y-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 text-sm ${
                      index < currentQuestion ? 'text-green-600' :
                      index === currentQuestion ? 'text-blue-600 font-medium' :
                      'text-gray-400'
                    }`}
                  >
                    {index < currentQuestion ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        index === currentQuestion ? 'border-blue-600' : 'border-gray-300'
                      }`} />
                    )}
                    <span>Question {index + 1}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedInterviewInterface;