"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Heart, 
  Target, 
  MessageSquare, 
  Clock, 
  Volume2, 
  VolumeX,
  CheckCircle,
  ArrowRight,
  User,
  Building,
  Trophy,
  AlertCircle,
  ThumbsUp,
  Mic,
  MicOff,
  Lightbulb,
  Camera,
  CameraOff,
  Video,
  Loader2,
  Send,
  Award,
  TrendingUp
} from 'lucide-react'
import SoundWaveAnimation from './SoundWaveAnimation'
import VoiceSystem from '../utils/voiceSystem'
import { chatSession } from '@/utils/GeminiAIModal'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import moment from 'moment'

const hrQuestions = [
  {
    id: 1,
    category: "Behavioral",
    type: "STAR",
    question: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
    scenario: "Conflict Resolution",
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Focus on your actions and decision-making process",
      "Highlight conflict resolution and communication skills",
      "Show empathy and understanding of different perspectives"
    ],
    followUps: [
      "What would you do differently if you faced a similar situation again?",
      "How do you typically approach workplace conflicts?",
      "What did you learn from this experience?"
    ],
    keySkills: ["Communication", "Conflict Resolution", "Teamwork", "Leadership"]
  },
  {
    id: 2,
    category: "Situational",
    type: "Hypothetical",
    question: "If you were assigned a project with a very tight deadline and limited resources, how would you approach it?",
    scenario: "Resource Management",
    tips: [
      "Discuss prioritization and time management strategies",
      "Show ability to work under pressure",
      "Mention delegation and team coordination",
      "Highlight problem-solving and adaptability"
    ],
    followUps: [
      "How would you communicate with stakeholders about potential delays?",
      "What if team members started showing signs of burnout?",
      "How would you ensure quality isn't compromised?"
    ],
    keySkills: ["Project Management", "Prioritization", "Leadership", "Adaptability"]
  },
  {
    id: 3,
    category: "Motivational",
    type: "Personal",
    question: "What motivates you in your work, and how do you stay engaged during challenging periods?",
    scenario: "Self-Motivation",
    tips: [
      "Be authentic about what drives you",
      "Connect motivation to the role and company",
      "Discuss strategies for maintaining productivity",
      "Show self-awareness and emotional intelligence"
    ],
    followUps: [
      "How do you handle feedback, both positive and constructive?",
      "What role does professional development play in your motivation?",
      "How do you maintain work-life balance?"
    ],
    keySkills: ["Self-Motivation", "Resilience", "Goal Setting", "Self-Awareness"]
  },
  {
    id: 4,
    category: "Leadership",
    type: "Experience",
    question: "Describe a time when you had to lead a team through a significant change or challenge.",
    scenario: "Change Management",
    tips: [
      "Showcase leadership style and approach",
      "Highlight communication during change",
      "Discuss how you motivated and supported the team",
      "Show results and lessons learned"
    ],
    followUps: [
      "How did you address team concerns and resistance?",
      "What strategies did you use to maintain morale?",
      "How do you measure the success of change initiatives?"
    ],
    keySkills: ["Leadership", "Change Management", "Communication", "Team Building"]
  },
  {
    id: 5,
    category: "Problem Solving",
    type: "STAR",
    question: "Tell me about a time when you identified and solved a significant problem at work.",
    scenario: "Innovation & Problem Solving",
    tips: [
      "Clearly define the problem you identified",
      "Explain your analytical approach",
      "Detail the solution implementation process",
      "Quantify the impact and results"
    ],
    followUps: [
      "How did you get buy-in from stakeholders for your solution?",
      "What obstacles did you encounter during implementation?",
      "How do you typically approach problem-solving?"
    ],
    keySkills: ["Problem Solving", "Innovation", "Analysis", "Implementation"]
  },
  {
    id: 6,
    category: "Cultural Fit",
    type: "Values",
    question: "How do you handle situations where you disagree with a decision made by upper management?",
    scenario: "Professional Disagreement",
    tips: [
      "Show respect for hierarchy while maintaining integrity",
      "Discuss constructive feedback approaches",
      "Highlight professional communication skills",
      "Show willingness to understand different perspectives"
    ],
    followUps: [
      "Can you give an example of when this actually happened?",
      "How do you balance personal values with company decisions?",
      "What would make you consider leaving a position?"
    ],
    keySkills: ["Professional Ethics", "Communication", "Adaptability", "Integrity"]
  }
]

export default function HRInterviewInterface({ interviewId, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [showFollowUps, setShowFollowUps] = useState(false)
  const [currentFollowUp, setCurrentFollowUp] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState([])
  const [interviewPhase, setInterviewPhase] = useState('greeting') // greeting, questions, submission, feedback
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [mediaStream, setMediaStream] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [userAnswers, setUserAnswers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackResults, setFeedbackResults] = useState(null)
  
  const { user } = useUser()
  const router = useRouter()
  const voiceSystem = useRef(null)
  const timerRef = useRef(null)
  const answerRef = useRef(null)
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])

  // Initialize camera and microphone
  const initializeMedia = async () => {
    try {
      console.log('HR: Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });
      
      console.log('HR: Camera stream obtained:', stream);
      console.log('HR: Video tracks:', stream.getVideoTracks());
      
      setMediaStream(stream);
      setCameraEnabled(true);
      
      // Wait a moment for state to update
      setTimeout(() => {
        if (videoRef.current) {
          console.log('HR: Setting video source...');
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            console.log('HR: Video metadata loaded');
            videoRef.current.play()
              .then(() => console.log('HR: Video playing successfully'))
              .catch(e => console.error('HR: Play failed:', e));
          };
        }
      }, 100);
      
    } catch (error) {
      console.error('HR: Error accessing media devices:', error);
      alert('Please allow camera and microphone access for the interview.');
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

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Initialize VoiceSystem only in the browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      voiceSystem.current = new VoiceSystem()
      
      const voiceSystemInstance = voiceSystem.current
      
      voiceSystemInstance.onStart = () => setIsListening(true)
      voiceSystemInstance.onEnd = () => setIsListening(false)
      voiceSystemInstance.onResult = (transcript) => {
        setAnswer(prev => prev + ' ' + transcript)
      }
      voiceSystemInstance.onSpeakStart = () => setIsSpeaking(true)
      voiceSystemInstance.onSpeakEnd = () => setIsSpeaking(false)

      return () => {
        if (voiceSystemInstance) {
          voiceSystemInstance.cleanup()
        }
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [])

  // Select random questions for the interview
  useEffect(() => {
    const shuffled = [...hrQuestions].sort(() => 0.5 - Math.random())
    setSelectedQuestions(shuffled.slice(0, 5)) // Select 5 random questions
  }, [])

  useEffect(() => {
    if (isStarted && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isStarted])

  // Ensure video stream is assigned when interview phase changes
  useEffect(() => {
    if (interviewPhase === 'questions' && mediaStream && videoRef.current) {
      console.log('HR: Reassigning video stream for questions phase');
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play()
            .then(() => console.log('HR: Questions phase video playing'))
            .catch(e => console.error('HR: Questions phase video error:', e));
        }
      }, 500); // Small delay to ensure DOM is ready
    }
  }, [interviewPhase, mediaStream])

  const handleStart = async () => {
    if (!cameraEnabled) {
      alert('Please enable camera access first');
      return;
    }
    
    setIsStarted(true)
    setQuestionStartTime(Date.now())
    
    // Ensure video stream is properly set up for interview phase
    if (mediaStream && videoRef.current) {
      console.log('HR: Setting up video for interview phase...');
      videoRef.current.srcObject = mediaStream;
      try {
        await videoRef.current.play();
        console.log('HR: Video playing in interview phase');
      } catch (e) {
        console.error('HR: Failed to play video in interview phase:', e);
      }
    }
    
    if (voiceEnabled && voiceSystem.current) {
      const greeting = `Hello! Welcome to your HR interview. I'll be asking you behavioral and situational questions to understand how you work with others and handle various workplace scenarios. Remember to use specific examples from your experience. Let's begin with our first question.`
      await voiceSystem.current.speak(greeting)
      
      setTimeout(async () => {
        setInterviewPhase('questions')
        // Re-assign video stream after phase change
        if (mediaStream && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => console.log('HR: Interview phase video play error:', e));
        }
        if (selectedQuestions.length > 0 && voiceSystem.current) {
          await voiceSystem.current.speak(selectedQuestions[0].question)
        }
      }, 3000)
    } else {
      setInterviewPhase('questions')
      // Re-assign video stream after phase change
      if (mediaStream && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.log('HR: Interview phase video play error:', e));
      }
    }
  }

  const handleNextQuestion = async () => {
    const questionTime = Math.floor((Date.now() - questionStartTime) / 1000)
    
    // Save current answer
    const currentAnswer = {
      question: selectedQuestions[currentQuestion].question,
      userAnswer: answer,
      category: selectedQuestions[currentQuestion].category,
      timeSpent: questionTime,
      followUpsAsked: showFollowUps ? currentFollowUp + 1 : 0,
      tips: selectedQuestions[currentQuestion].tips
    }
    
    setUserAnswers(prev => [...prev, currentAnswer])
    setCompletedQuestions(prev => [...prev, {
      ...selectedQuestions[currentQuestion],
      answer,
      timeSpent: questionTime,
      followUpsAsked: showFollowUps ? currentFollowUp + 1 : 0
    }])

    if (currentQuestion < selectedQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setAnswer('')
      setShowFollowUps(false)
      setShowTips(false)
      setCurrentFollowUp(0)
      setQuestionStartTime(Date.now())
      
      if (voiceEnabled && voiceSystem.current) {
        await voiceSystem.current.speak("Thank you for that response. Let's move to the next question.")
        setTimeout(async () => {
          if (voiceSystem.current) {
            await voiceSystem.current.speak(selectedQuestions[currentQuestion + 1].question)
          }
        }, 2000)
      }
    } else {
      // Save final answer and proceed to submission
      setInterviewPhase('submission')
      if (voiceEnabled && voiceSystem.current) {
        await voiceSystem.current.speak("Excellent! You have completed all questions. Let's analyze your responses and provide feedback.")
      }
    }
  }

  const handleFollowUp = async () => {
    if (!showFollowUps) {
      setShowFollowUps(true)
      setCurrentFollowUp(0)
    } else if (currentFollowUp < selectedQuestions[currentQuestion].followUps.length - 1) {
      setCurrentFollowUp(prev => prev + 1)
    }

    const followUpQuestion = selectedQuestions[currentQuestion].followUps[currentFollowUp]
    
    if (voiceEnabled && followUpQuestion && voiceSystem.current) {
      await voiceSystem.current.speak(`Follow up question: ${followUpQuestion}`)
    }
  }

  // Generate HR feedback using AI with STAR method analysis
  const generateFeedback = async () => {
    try {
      setIsSubmitting(true)
      
      const feedbackPrompt = `
        Analyze this HR/Behavioral interview performance using the STAR method (Situation, Task, Action, Result):
        
        Total Questions: ${userAnswers.length}
        
        Questions and Answers:
        ${userAnswers.map((qa, index) => `
        Question ${index + 1} (${qa.category}):
        Q: ${qa.question}
        A: ${qa.userAnswer}
        Time Spent: ${qa.timeSpent} seconds
        Follow-ups Asked: ${qa.followUpsAsked}
        Expected Focus: ${qa.tips?.join(', ')}
        `).join('\n')}
        
        Provide comprehensive HR interview feedback in JSON format:
        {
          "overallScore": 85,
          "categoryScores": {
            "communication": 90,
            "leadership": 80,
            "problemSolving": 85,
            "teamwork": 88
          },
          "detailedFeedback": {
            "strengths": ["Excellent storytelling", "Clear STAR structure", "Good examples", "Professional demeanor"],
            "improvements": ["More quantified results", "Deeper situation context", "Better time management", "More diverse examples"],
            "communicationSkills": "Clear and engaging communication with good structure",
            "behavioralAssessment": "Demonstrates strong soft skills and cultural alignment"
          },
          "starMethodAnalysis": {
            "situationClarity": 8,
            "taskDefinition": 7,
            "actionDetail": 9,
            "resultQuantification": 6
          },
          "questionAnalysis": [
            {
              "questionIndex": 0,
              "score": 8,
              "feedback": "Good STAR structure but could improve result quantification",
              "strengths": ["Clear situation", "Detailed actions"],
              "improvements": ["Quantify results", "Add impact metrics"]
            }
          ],
          "recommendations": ["Practice quantifying achievements", "Prepare more diverse examples", "Focus on leadership impact"],
          "verdict": "Strong behavioral candidate with excellent communication and experience"
        }
      `

      const result = await chatSession.sendMessage(feedbackPrompt)
      const response = result.response.text()
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const feedback = JSON.parse(jsonMatch[0])
        setFeedbackResults(feedback)
        
        // Save to database
        await saveFeedbackToDatabase(feedback)
        
        setInterviewPhase('feedback')
      }
    } catch (error) {
      console.error('Error generating HR feedback:', error)
      
      // Fallback feedback
      const fallbackFeedback = {
        overallScore: 75,
        categoryScores: {
          communication: 75,
          leadership: 70,
          problemSolving: 75,
          teamwork: 80
        },
        detailedFeedback: {
          strengths: ['Completed all questions', 'Good communication', 'Professional attitude', 'Relevant examples'],
          improvements: ['More structured responses', 'Better STAR method usage', 'Quantify achievements', 'Add more details'],
          communicationSkills: 'Clear communication with room for more structured storytelling',
          behavioralAssessment: 'Shows good potential with areas for development'
        },
        starMethodAnalysis: {
          situationClarity: 7,
          taskDefinition: 6,
          actionDetail: 7,
          resultQuantification: 5
        },
        recommendations: ['Practice STAR method', 'Prepare quantified examples', 'Focus on leadership stories'],
        verdict: 'Solid candidate with good potential for growth'
      }
      
      setFeedbackResults(fallbackFeedback)
      await saveFeedbackToDatabase(fallbackFeedback)
      setInterviewPhase('feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save HR feedback to database
  const saveFeedbackToDatabase = async (feedback) => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress || !interviewId) return

      for (let i = 0; i < userAnswers.length; i++) {
        const qa = userAnswers[i]
        const questionFeedback = feedback.questionAnalysis?.[i] || {
          score: Math.round(feedback.overallScore / 10),
          feedback: 'Good behavioral response',
          strengths: ['Professional communication'],
          improvements: ['More specific examples needed']
        }

        await db.insert(UserAnswer).values({
          mockIdRef: interviewId,
          question: qa.question,
          correctAns: `Expected: Well-structured STAR method response demonstrating ${qa.category} skills with specific examples and quantified results.`,
          userAns: qa.userAnswer,
          feedback: questionFeedback.feedback + '\nStrengths: ' + questionFeedback.strengths?.join(', ') + '\nImprovements: ' + questionFeedback.improvements?.join(', '),
          rating: questionFeedback.score.toString(),
          userEmail: user.primaryEmailAddress.emailAddress,
          createdAt: moment().format('DD-MM-yyyy')
        })
      }
    } catch (error) {
      console.error('Error saving HR feedback to database:', error)
    }
  }

  const toggleVoiceRecording = () => {
    if (voiceSystem.current) {
      if (isListening) {
        voiceSystem.current.stopListening()
      } else {
        voiceSystem.current.startListening()
      }
    }
  }

  const speakCurrentQuestion = async () => {
    if (selectedQuestions[currentQuestion] && voiceSystem.current) {
      await voiceSystem.current.speak(selectedQuestions[currentQuestion].question)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleNextQuestion()
    } else if (e.key === 'Tab' && e.ctrlKey) {
      e.preventDefault()
      handleFollowUp()
    }
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-8"
          >
            <Users className="w-20 h-20 mx-auto mb-4 text-rose-300" />
            <h1 className="text-4xl font-bold mb-4">HR Interview</h1>
            <p className="text-xl text-gray-300 mb-6">
              Behavioral and situational questions to understand your work style and experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <h3 className="font-semibold">Questions</h3>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-gray-400">Behavioral & Situational</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <h3 className="font-semibold">Duration</h3>
              <p className="text-sm">~30-40 minutes</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <h3 className="font-semibold">Focus Areas</h3>
              <p className="text-sm">Leadership, Teamwork, Problem Solving</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <h3 className="font-semibold">Method</h3>
              <p className="text-sm">STAR Framework</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-yellow-400" />
              Interview Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2 text-blue-300">STAR Method</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• <strong>Situation:</strong> Set the context</li>
                  <li>• <strong>Task:</strong> Explain your responsibility</li>
                  <li>• <strong>Action:</strong> Describe what you did</li>
                  <li>• <strong>Result:</strong> Share the outcome</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-rose-300">Best Practices</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>• Use specific, real examples</li>
                  <li>• Focus on your contributions</li>
                  <li>• Show learning and growth</li>
                  <li>• Be honest and authentic</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Camera Setup */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Camera Setup</h2>
            <div className="bg-gray-900 rounded-lg aspect-video mb-4 relative overflow-hidden">
              {cameraEnabled && mediaStream ? (
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
                      console.log('HR setup video loaded metadata');
                      console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                      e.target.play().catch(err => console.error('Play error:', err));
                    }}
                    onError={(e) => {
                      console.error('HR setup video error:', e);
                    }}
                    onPlaying={() => console.log('HR setup video is playing')}
                  />
                  {/* Debug overlay */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
                    Stream: {mediaStream ? 'Active' : 'None'}<br/>
                    Tracks: {mediaStream ? mediaStream.getVideoTracks().length : 0}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400">Camera not enabled</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Stream: {mediaStream ? 'Available' : 'None'} | 
                      Camera: {cameraEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={initializeMedia}
                disabled={cameraEnabled}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  cameraEnabled 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {cameraEnabled ? (
                  <>
                    <Camera className="w-5 h-5 inline mr-2" />
                    Camera Ready
                  </>
                ) : (
                  <>
                    <CameraOff className="w-5 h-5 inline mr-2" />
                    Enable Camera
                  </>
                )}
              </button>
              
              {cameraEnabled && (
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      console.log('HR: Manual play attempt');
                      videoRef.current.play()
                        .then(() => console.log('HR: Manual play success'))
                        .catch(e => console.error('HR: Manual play failed:', e));
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
                >
                  Test Video Play
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="rounded"
              />
              <span>Enable voice interactions</span>
            </label>
          </div>

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              disabled={!cameraEnabled}
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-purple-500 rounded-lg font-semibold text-white hover:from-rose-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start HR Interview
            </motion.button>
            {!cameraEnabled && (
              <p className="text-sm text-gray-400 mt-2">Please enable camera to start the interview</p>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  // Submission Phase
  if (interviewPhase === 'submission') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-purple-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white"
        >
          <Send className="w-20 h-20 mx-auto mb-4 text-pink-400" />
          <h1 className="text-4xl font-bold mb-4">HR Interview Complete!</h1>
          <p className="text-xl text-gray-300 mb-6">
            Ready to analyze your behavioral responses using the STAR method
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 rounded-lg p-4">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <h3 className="font-semibold">Total Time</h3>
              <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <h3 className="font-semibold">Questions</h3>
              <p className="text-2xl font-bold">{userAnswers.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <h3 className="font-semibold">Follow-ups</h3>
              <p className="text-2xl font-bold">
                {userAnswers.reduce((total, q) => total + (q.followUpsAsked || 0), 0)}
              </p>
            </div>
          </div>

          <button
            onClick={generateFeedback}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center mx-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Analyzing STAR Responses...
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 mr-2" />
                Generate Behavioral Feedback
              </>
            )}
          </button>
        </motion.div>
      </div>
    )
  }

  // Feedback Phase
  if (interviewPhase === 'feedback' && feedbackResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <Award className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-4xl font-bold mb-2">HR Interview Results</h1>
            <p className="text-xl text-gray-300">Your behavioral interview feedback using STAR method analysis</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white/20 rounded-xl p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Overall HR Score</h2>
            <div className="text-6xl font-bold mb-2" style={{color: feedbackResults.overallScore >= 80 ? '#10B981' : feedbackResults.overallScore >= 60 ? '#F59E0B' : '#EF4444'}}>
              {feedbackResults.overallScore}/100
            </div>
            <p className="text-lg text-gray-300">{feedbackResults.verdict}</p>
          </div>

          {/* STAR Method Analysis */}
          {feedbackResults.starMethodAnalysis && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                STAR Method Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(feedbackResults.starMethodAnalysis).map(([aspect, score]) => (
                  <div key={aspect} className="text-center">
                    <div className="text-sm text-gray-400 capitalize mb-1">{aspect.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                    <div className="text-xl font-bold" style={{color: score >= 8 ? '#10B981' : score >= 6 ? '#F59E0B' : '#EF4444'}}>
                      {score}/10
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Scores */}
          {feedbackResults.categoryScores && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(feedbackResults.categoryScores).map(([category, score]) => (
                <div key={category} className="bg-white/10 rounded-lg p-4 text-center">
                  <h3 className="font-semibold capitalize mb-2">{category}</h3>
                  <div className="text-2xl font-bold" style={{color: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'}}>
                    {score}/100
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {feedbackResults.detailedFeedback.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {feedbackResults.detailedFeedback.improvements?.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Communication & Behavioral Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-400 mb-3">Communication Skills</h3>
              <p className="text-gray-300">{feedbackResults.detailedFeedback.communicationSkills}</p>
            </div>
            <div className="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-teal-400 mb-3">Behavioral Assessment</h3>
              <p className="text-gray-300">{feedbackResults.detailedFeedback.behavioralAssessment}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {feedbackResults.recommendations?.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/interview/${interviewId}/feedback`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              View Detailed Report
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentQuestionData = selectedQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-900 text-white" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">HR Interview</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-rose-400" />
              <span className="text-sm">{currentQuestion + 1}/{selectedQuestions.length}</span>
            </div>
            
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {currentQuestionData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Panel */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-rose-900 text-rose-300 rounded-full text-sm">
                      {currentQuestionData.category}
                    </span>
                    <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-sm">
                      {currentQuestionData.type}
                    </span>
                    <button
                      onClick={speakCurrentQuestion}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                      title="Repeat question"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    Question {currentQuestion + 1} of {selectedQuestions.length}
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 text-gray-100">
                  {currentQuestionData.question}
                </h2>

                <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-400 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Scenario: {currentQuestionData.scenario}
                  </h3>
                </div>

                {/* Tips */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{showTips ? 'Hide' : 'Show'} Tips</span>
                  </button>
                  
                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4"
                    >
                      <ul className="space-y-2 text-sm">
                        {currentQuestionData.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-400 mr-2">•</span>
                            <span className="text-gray-200">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>

                {/* Key Skills */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Skills Being Assessed:</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestionData.keySkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Follow-up Questions */}
                {showFollowUps && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-900/20 border border-orange-600 rounded-lg p-4 mb-4"
                  >
                    <h3 className="font-semibold text-orange-400 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Follow-up Question:
                    </h3>
                    <p className="text-gray-200">{currentQuestionData.followUps[currentFollowUp]}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleFollowUp}
                    disabled={showFollowUps && currentFollowUp >= currentQuestionData.followUps.length - 1}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm transition-colors"
                  >
                    {showFollowUps ? 'Next Follow-up' : 'Ask Follow-up'} (Ctrl+Tab)
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors flex items-center space-x-2"
                  >
                    <span>Next Question (Ctrl+Enter)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Answer Area */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Your Response</h3>
                  
                  <div className="flex items-center space-x-2">
                    {voiceEnabled && (
                      <button
                        onClick={toggleVoiceRecording}
                        className={`p-3 rounded-lg transition-colors ${
                          isListening 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    )}
                    
                    <div className="text-sm text-gray-400">
                      Time: {formatTime(Math.floor((Date.now() - questionStartTime) / 1000))}
                    </div>
                  </div>
                </div>
                
                <textarea
                  ref={answerRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Use the STAR method to structure your response..."
                  className="w-full h-64 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                
                <div className="mt-4 text-sm text-gray-400">
                  <p>💡 Remember: Use specific examples and focus on your actions and results</p>
                </div>
              </div>
            </div>

            {/* Progress Panel */}
            <div className="space-y-4">
              {/* Video Recording Panel */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Video Recording</h3>
                <div className="bg-gray-900 rounded-lg aspect-video mb-4 relative overflow-hidden">
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
                          console.log('HR interview video loaded metadata');
                          console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                          e.target.play().catch(err => console.error('Play error:', err));
                        }}
                        onPlaying={() => console.log('HR interview video is playing')}
                        onError={(e) => console.error('HR interview video error:', e)}
                      />
                      {/* Debug overlay for HR interview video */}
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
                
                <div className="flex justify-center gap-2">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Video className="w-4 h-4 inline mr-1" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 inline mr-1" />
                        Start Recording
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (videoRef.current && mediaStream) {
                        console.log('HR: Manually fixing video stream...');
                        videoRef.current.srcObject = mediaStream;
                        videoRef.current.play()
                          .then(() => console.log('HR: Manual video fix successful'))
                          .catch(e => console.error('HR: Manual video fix failed:', e));
                      } else {
                        console.log('HR: No stream or video ref available');
                      }
                    }}
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs"
                  >
                    Fix Video
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Interview Progress</h3>
                <div className="space-y-2">
                  {selectedQuestions.map((q, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded text-sm ${
                        index === currentQuestion
                          ? 'bg-rose-900 text-rose-300 border border-rose-600'
                          : index < currentQuestion
                          ? 'bg-green-900 text-green-300'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{q.category}</span>
                        {index < currentQuestion && <CheckCircle className="w-4 h-4" />}
                        {index === currentQuestion && <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {q.scenario}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">STAR Framework</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div><strong className="text-blue-400">S</strong>ituation: Context & background</div>
                  <div><strong className="text-green-400">T</strong>ask: Your responsibility</div>
                  <div><strong className="text-yellow-400">A</strong>ction: What you did</div>
                  <div><strong className="text-purple-400">R</strong>esult: Outcomes & impact</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div>Ctrl + Enter: Next Question</div>
                  <div>Ctrl + Tab: Follow-up</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sound Wave Animation */}
      <AnimatePresence>
        {(isListening || isSpeaking) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4"
          >
            <SoundWaveAnimation isActive={isListening || isSpeaking} isUser={isListening} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}